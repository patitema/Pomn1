import socket
from datetime import UTC, datetime, timedelta
from unittest.mock import Mock, patch
from zoneinfo import ZoneInfo

from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from pywebpush import WebPushException
from rest_framework.test import APITestCase

from .models import (
    Profile,
    PushDeliveryAttempt,
    PushEvent,
    Task,
    WebPushSubscription,
)
from .push_service import deliver_push_event, discover_due_push_events
from .push_views import endpoint_hash


PUSH_TEST_SETTINGS = {
    'WEB_PUSH_ENABLED': True,
    'WEB_PUSH_VALIDATE_DNS': False,
    'VAPID_PUBLIC_KEY': 'public-key',
    'VAPID_PRIVATE_KEY': 'private-key',
    'VAPID_SUBJECT': 'mailto:support@pomni.ru',
}


@override_settings(**PUSH_TEST_SETTINGS)
class PushSettingsApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='push-user',
            password='test-password',
        )
        self.client.force_authenticate(self.user)

    def subscription_payload(self, endpoint='https://push.example/subscription'):
        return {
            'endpoint': endpoint,
            'keys': {
                'p256dh': 'p256dh-value',
                'auth': 'auth-value',
            },
        }

    def test_settings_require_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get('/api/push/settings/')

        self.assertEqual(response.status_code, 401)

    def test_subscription_enables_push_and_can_be_removed(self):
        create_response = self.client.post(
            '/api/push/subscriptions/',
            self.subscription_payload(),
            format='json',
        )

        self.assertEqual(create_response.status_code, 201)
        profile = Profile.objects.get(user=self.user)
        self.assertTrue(profile.push_enabled)
        self.assertEqual(self.user.web_push_subscriptions.count(), 1)

        settings_response = self.client.put(
            '/api/push/settings/',
            {
                'push_enabled': True,
                'timezone': 'Asia/Barnaul',
            },
            format='json',
        )
        self.assertEqual(settings_response.status_code, 200)
        profile.refresh_from_db()
        self.assertEqual(profile.timezone, 'Asia/Barnaul')

        remove_response = self.client.post(
            '/api/push/unsubscribe/',
            {'endpoint': self.subscription_payload()['endpoint']},
            format='json',
        )
        self.assertEqual(remove_response.status_code, 204)
        profile.refresh_from_db()
        self.assertFalse(profile.push_enabled)

    def test_invalid_timezone_and_endpoint_are_rejected(self):
        timezone_response = self.client.put(
            '/api/push/settings/',
            {
                'push_enabled': True,
                'timezone': 'Mars/Olympus',
            },
            format='json',
        )
        endpoint_response = self.client.post(
            '/api/push/subscriptions/',
            self.subscription_payload(endpoint='http://push.example/test'),
            format='json',
        )

        self.assertEqual(timezone_response.status_code, 400)
        self.assertIn('timezone', timezone_response.data)
        self.assertEqual(endpoint_response.status_code, 400)
        self.assertIn('endpoint', endpoint_response.data)


@override_settings(**{**PUSH_TEST_SETTINGS, 'WEB_PUSH_VALIDATE_DNS': True})
class PushEndpointValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='push-validation-user',
            password='test-password',
        )
        self.client.force_authenticate(self.user)

    def subscription_payload(self, endpoint):
        return {
            'endpoint': endpoint,
            'keys': {
                'p256dh': 'p256dh-value',
                'auth': 'auth-value',
            },
        }

    def test_subscription_rejects_localhost_literal_endpoint(self):
        response = self.client.post(
            '/api/push/subscriptions/',
            self.subscription_payload('https://127.0.0.1/push'),
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('endpoint', response.data)

    @patch('api.push_serializers.socket.getaddrinfo')
    def test_subscription_rejects_private_dns_result(self, getaddrinfo_mock):
        getaddrinfo_mock.return_value = [
            (socket.AF_INET, socket.SOCK_STREAM, 6, '', ('10.0.0.10', 443)),
        ]

        response = self.client.post(
            '/api/push/subscriptions/',
            self.subscription_payload('https://push.example/subscription'),
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('endpoint', response.data)


@override_settings(**PUSH_TEST_SETTINGS)
class PushEventServiceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reminder-user',
            password='test-password',
        )
        self.profile = Profile.objects.create(
            user=self.user,
            timezone='Asia/Barnaul',
            push_enabled=True,
        )
        endpoint = 'https://push.example/reminder'
        self.subscription = WebPushSubscription.objects.create(
            user=self.user,
            endpoint=endpoint,
            endpoint_hash=endpoint_hash(endpoint),
            p256dh='p256dh-value',
            auth='auth-value',
        )

    def test_daily_summary_uses_user_timezone_and_is_deduplicated(self):
        local_timezone = ZoneInfo('Asia/Barnaul')
        now = datetime(2026, 7, 26, 2, 5, tzinfo=UTC)
        Task.objects.create(
            user=self.user,
            title='Сегодня',
            due_date=datetime(2026, 7, 26, 12, 0, tzinfo=local_timezone),
        )
        Task.objects.create(
            user=self.user,
            title='Просрочено',
            due_date=datetime(2026, 7, 25, 12, 0, tzinfo=local_timezone),
        )

        first_event_ids = discover_due_push_events(now)
        second_event_ids = discover_due_push_events(now + timedelta(minutes=1))

        self.assertEqual(len(first_event_ids), 1)
        self.assertEqual(second_event_ids, first_event_ids)
        event = PushEvent.objects.get()
        self.assertEqual(event.dedupe_key, f'daily:{self.user.id}:2026-07-26')
        self.assertIn('Сегодня: 1', event.payload['body'])
        self.assertIn('Просрочено: 1', event.payload['body'])
        self.assertEqual(event.delivery_attempts.count(), 1)

    def test_daily_summary_waits_until_nine_in_user_timezone(self):
        before_nine = datetime(2026, 7, 26, 1, 59, tzinfo=UTC)
        Task.objects.create(
            user=self.user,
            title='Сегодня',
            due_date=before_nine + timedelta(hours=4),
        )

        event_ids = discover_due_push_events(before_nine)

        self.assertEqual(event_ids, [])
        self.assertFalse(PushEvent.objects.exists())

    def test_deadline_event_is_replaced_when_deadline_changes(self):
        now = timezone.now()
        task = Task.objects.create(
            user=self.user,
            title='Дедлайн',
            deadline=now + timedelta(hours=23),
        )

        first_event_ids = discover_due_push_events(now)
        task.deadline = now + timedelta(hours=20)
        task.save(update_fields=['deadline'])
        second_event_ids = discover_due_push_events(now + timedelta(minutes=1))

        self.assertEqual(len(first_event_ids), 1)
        self.assertEqual(len(PushEvent.objects.filter(task=task)), 2)
        self.assertEqual(len(second_event_ids), 2)

        old_event = PushEvent.objects.order_by('created_at').first()
        delivered = deliver_push_event(old_event.id)
        old_event.refresh_from_db()
        old_attempt = old_event.delivery_attempts.get()
        self.assertFalse(delivered)
        self.assertIsNotNone(old_event.completed_at)
        self.assertEqual(old_attempt.last_error_code, 'event_stale')

    @patch('api.push_service.webpush')
    def test_successful_delivery_completes_event(self, webpush_mock):
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Дедлайн',
            deadline=now + timedelta(hours=23),
        )
        event_id = discover_due_push_events(now)[0]

        should_retry = deliver_push_event(event_id)

        self.assertFalse(should_retry)
        webpush_mock.assert_called_once()
        event = PushEvent.objects.get(id=event_id)
        attempt = event.delivery_attempts.get()
        self.assertEqual(attempt.status, PushDeliveryAttempt.STATUS_SENT)
        self.assertIsNotNone(event.completed_at)

    @override_settings(WEB_PUSH_VALIDATE_DNS=True)
    @patch('api.push_service.webpush')
    def test_delivery_rejects_stored_unsafe_endpoint(self, webpush_mock):
        self.subscription.endpoint = 'https://127.0.0.1/push'
        self.subscription.endpoint_hash = endpoint_hash(self.subscription.endpoint)
        self.subscription.save(update_fields=['endpoint', 'endpoint_hash'])
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Unsafe push endpoint',
            deadline=now + timedelta(hours=23),
        )
        event_id = discover_due_push_events(now)[0]

        should_retry = deliver_push_event(event_id)

        self.assertFalse(should_retry)
        webpush_mock.assert_not_called()
        attempt = PushDeliveryAttempt.objects.get(event_id=event_id)
        self.assertEqual(attempt.status, PushDeliveryAttempt.STATUS_FAILED)
        self.assertEqual(attempt.last_error_code, 'unsafe_endpoint')

    @patch('api.push_service.webpush')
    def test_gone_subscription_is_removed(self, webpush_mock):
        response = Mock(status_code=410)
        webpush_mock.side_effect = WebPushException(
            'subscription gone',
            response=response,
        )
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Дедлайн',
            deadline=now + timedelta(hours=23),
        )
        event_id = discover_due_push_events(now)[0]

        should_retry = deliver_push_event(event_id)

        self.assertFalse(should_retry)
        self.assertFalse(WebPushSubscription.objects.exists())
        self.profile.refresh_from_db()
        self.assertFalse(self.profile.push_enabled)
        attempt = PushDeliveryAttempt.objects.get(event_id=event_id)
        self.assertEqual(attempt.status, PushDeliveryAttempt.STATUS_FAILED)
        self.assertEqual(attempt.last_http_status, 410)
