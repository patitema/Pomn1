from datetime import datetime, timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .password_reset import encode_user_id


PASSWORD_RESET_TEST_SETTINGS = {
    'EMAIL_ENABLED': True,
    'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend',
    'DEFAULT_FROM_EMAIL': 'POMNI <no-reply@pomn1.ru>',
    'EMAIL_MESSAGE_ID_DOMAIN': 'pomn1.ru',
    'PUBLIC_APP_URL': 'https://pomn1.ru',
    'PASSWORD_RESET_TIMEOUT': 3600,
    'PASSWORD_RESET_IP_RATE': '10/15m',
    'PASSWORD_RESET_EMAIL_RATE': '3/15m',
    'PASSWORD_RESET_TRUSTED_PROXY_COUNT': 2,
    'CACHES': {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'password-reset-tests',
        },
    },
}


@override_settings(**PASSWORD_RESET_TEST_SETTINGS)
class PasswordResetApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            username='reset_user',
            email='reset@example.com',
            password='Password_1',
        )
        self.auth_token = Token.objects.create(user=self.user)

    def reset_credentials(self, password='NewPassword_2'):
        return {
            'uid': encode_user_id(self.user),
            'token': default_token_generator.make_token(self.user),
            'new_password': password,
            'confirm_password': password,
        }

    def test_known_and_unknown_email_return_same_public_response(self):
        known_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'RESET@example.com'},
            format='json',
        )
        unknown_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'unknown@example.com'},
            format='json',
        )

        self.assertEqual(known_response.status_code, 200)
        self.assertEqual(unknown_response.status_code, 200)
        self.assertEqual(known_response.data, unknown_response.data)
        self.assertEqual(len(mail.outbox), 1)

    def test_request_sends_branded_multipart_email_with_trusted_url(self):
        response = self.client.post(
            '/api/password-reset/request/',
            {'email': self.user.email},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.subject, 'Восстановление пароля POMNI')
        self.assertTrue(
            message.extra_headers['Message-ID'].endswith('@pomn1.ru>')
        )
        self.assertIn(
            'https://pomn1.ru/password-reset/',
            message.body,
        )
        self.assertEqual(len(message.alternatives), 1)
        self.assertEqual(message.alternatives[0].mimetype, 'text/html')
        self.assertIn(
            'reset_user BASE',
            message.alternatives[0].content,
        )

    def test_inactive_user_and_invalid_email_do_not_send_email(self):
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])

        inactive_response = self.client.post(
            '/api/password-reset/request/',
            {'email': self.user.email},
            format='json',
        )
        invalid_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'not-an-email'},
            format='json',
        )

        self.assertEqual(inactive_response.status_code, 200)
        self.assertEqual(invalid_response.status_code, 400)
        self.assertIn('email', invalid_response.data)
        self.assertEqual(len(mail.outbox), 0)

    @override_settings(PASSWORD_RESET_EMAIL_RATE='2/15m')
    def test_email_rate_limit_is_independent(self):
        for source_ip in ('198.51.100.1', '198.51.100.2'):
            response = self.client.post(
                '/api/password-reset/request/',
                {'email': 'limited@example.com'},
                format='json',
                REMOTE_ADDR=source_ip,
            )
            self.assertEqual(response.status_code, 200)

        limited_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'limited@example.com'},
            format='json',
            REMOTE_ADDR='198.51.100.3',
        )

        self.assertEqual(limited_response.status_code, 429)

    @override_settings(PASSWORD_RESET_IP_RATE='2/15m')
    def test_ip_rate_limit_is_independent(self):
        for index in range(2):
            response = self.client.post(
                '/api/password-reset/request/',
                {'email': f'unknown-{index}@example.com'},
                format='json',
                REMOTE_ADDR='198.51.100.10',
            )
            self.assertEqual(response.status_code, 200)

        limited_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'unknown-3@example.com'},
            format='json',
            REMOTE_ADDR='198.51.100.10',
        )

        self.assertEqual(limited_response.status_code, 429)

    @override_settings(
        PASSWORD_RESET_IP_RATE='2/15m',
        PASSWORD_RESET_TRUSTED_PROXY_COUNT=2,
    )
    def test_spoofed_short_forwarded_for_does_not_bypass_ip_limit(self):
        for index in range(2):
            response = self.client.post(
                '/api/password-reset/request/',
                {'email': f'spoofed-{index}@example.com'},
                format='json',
                REMOTE_ADDR='10.0.0.20',
                HTTP_X_FORWARDED_FOR=f'198.51.100.{index}',
            )
            self.assertEqual(response.status_code, 200)

        limited_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'spoofed-3@example.com'},
            format='json',
            REMOTE_ADDR='10.0.0.20',
            HTTP_X_FORWARDED_FOR='198.51.100.3',
        )

        self.assertEqual(limited_response.status_code, 429)

    @override_settings(
        PASSWORD_RESET_IP_RATE='2/15m',
        PASSWORD_RESET_TRUSTED_PROXY_COUNT=2,
    )
    def test_trusted_forwarded_chain_uses_forwarded_client_ip(self):
        forwarded_for = '198.51.100.77, 10.0.0.10, 10.0.0.11'
        for index in range(2):
            response = self.client.post(
                '/api/password-reset/request/',
                {'email': f'trusted-chain-{index}@example.com'},
                format='json',
                REMOTE_ADDR=f'10.0.0.{20 + index}',
                HTTP_X_FORWARDED_FOR=forwarded_for,
            )
            self.assertEqual(response.status_code, 200)

        limited_response = self.client.post(
            '/api/password-reset/request/',
            {'email': 'trusted-chain-3@example.com'},
            format='json',
            REMOTE_ADDR='10.0.0.30',
            HTTP_X_FORWARDED_FOR=forwarded_for,
        )

        self.assertEqual(limited_response.status_code, 429)

    @patch(
        'api.password_email_service.EmailMultiAlternatives.send',
        side_effect=OSError('SMTP unavailable'),
    )
    def test_request_keeps_generic_response_when_email_fails(self, _send):
        response = self.client.post(
            '/api/password-reset/request/',
            {'email': self.user.email},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('Если аккаунт', response.data['message'])

    def test_confirm_changes_password_revokes_token_and_notifies(self):
        old_token = self.auth_token.key

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                '/api/password-reset/confirm/',
                self.reset_credentials(),
                format='json',
            )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword_2'))
        self.assertFalse(Token.objects.filter(key=old_token).exists())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Пароль POMNI изменён')

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {old_token}')
        current_user_response = self.client.get('/api/current-user/')
        self.assertEqual(current_user_response.status_code, 401)

        self.client.credentials()
        old_login_response = self.client.post(
            '/api/login/',
            {'username': self.user.username, 'password': 'Password_1'},
            format='json',
        )
        new_login_response = self.client.post(
            '/api/login/',
            {'username': self.user.username, 'password': 'NewPassword_2'},
            format='json',
        )
        self.assertEqual(old_login_response.status_code, 401)
        self.assertEqual(new_login_response.status_code, 200)

    def test_reset_link_is_single_use(self):
        credentials = self.reset_credentials()

        with self.captureOnCommitCallbacks(execute=True):
            first_response = self.client.post(
                '/api/password-reset/confirm/',
                credentials,
                format='json',
            )
        reused_response = self.client.post(
            '/api/password-reset/confirm/',
            credentials,
            format='json',
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(reused_response.status_code, 400)
        self.assertEqual(
            reused_response.data['code'],
            'invalid_or_expired',
        )

    @override_settings(PASSWORD_RESET_TIMEOUT=1)
    def test_expired_token_is_rejected(self):
        generated_at = datetime.now()
        with patch.object(
            default_token_generator,
            '_now',
            return_value=generated_at,
        ):
            credentials = self.reset_credentials()

        with patch.object(
            default_token_generator,
            '_now',
            return_value=generated_at + timedelta(seconds=2),
        ):
            response = self.client.post(
                '/api/password-reset/confirm/',
                credentials,
                format='json',
            )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'invalid_or_expired')

    def test_invalid_link_and_password_errors_are_safe(self):
        invalid_response = self.client.post(
            '/api/password-reset/confirm/',
            {
                'uid': 'invalid',
                'token': 'invalid',
                'new_password': 'NewPassword_2',
                'confirm_password': 'NewPassword_2',
            },
            format='json',
        )
        mismatch_payload = self.reset_credentials()
        mismatch_payload['confirm_password'] = 'Different_3'
        mismatch_response = self.client.post(
            '/api/password-reset/confirm/',
            mismatch_payload,
            format='json',
        )
        weak_response = self.client.post(
            '/api/password-reset/confirm/',
            self.reset_credentials(password='short'),
            format='json',
        )

        self.assertEqual(invalid_response.status_code, 400)
        self.assertEqual(
            invalid_response.data['code'],
            'invalid_or_expired',
        )
        self.assertEqual(mismatch_response.status_code, 400)
        self.assertIn('confirm_password', mismatch_response.data)
        self.assertEqual(weak_response.status_code, 400)
        self.assertIn('new_password', weak_response.data)
