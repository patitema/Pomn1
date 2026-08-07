from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Note, Task, TaskBoardColumn

LOGIN_THROTTLE_TEST_SETTINGS = {
    'LOGIN_IP_RATE': '2/15m',
    'LOGIN_USERNAME_RATE': '2/15m',
    'CACHES': {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'login-throttle-tests',
        },
    },
}


class NoteOwnershipApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='note-owner', password='test-password')
        self.other_user = User.objects.create_user(username='other-note-owner', password='test-password')
        self.client.force_authenticate(self.user)

    def test_create_note_ignores_payload_user(self):
        response = self.client.post(
            '/api/notes/',
            {
                'title': 'Owned note',
                'text': 'body',
                'user': self.other_user.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        note = Note.objects.get(pk=response.data['id'])
        self.assertEqual(note.user_id, self.user.id)
        self.assertEqual(response.data['user'], self.user.id)

    def test_create_folder_ignores_payload_user(self):
        response = self.client.post(
            '/api/folders/',
            {
                'title': 'Owned folder',
                'text': '',
                'user': self.other_user.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        folder = Note.objects.get(pk=response.data['id'])
        self.assertEqual(folder.user_id, self.user.id)
        self.assertTrue(folder.is_folder)

    def test_update_note_ignores_payload_user(self):
        note = Note.objects.create(user=self.user, title='Original', text='body')

        response = self.client.put(
            f'/api/notes/{note.id}/',
            {'title': 'Changed', 'user': self.other_user.id},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        note.refresh_from_db()
        self.assertEqual(note.user_id, self.user.id)
        self.assertEqual(note.title, 'Changed')


@override_settings(**LOGIN_THROTTLE_TEST_SETTINGS)
class LoginThrottleApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username='login-user', password='Password_1')

    def test_login_allows_success_before_limit(self):
        response = self.client.post(
            '/api/login/',
            {'username': self.user.username, 'password': 'Password_1'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)

    def test_login_rate_limit_blocks_after_failed_attempts(self):
        payload = {'username': self.user.username, 'password': 'wrong-password'}

        first_response = self.client.post('/api/login/', payload, format='json')
        second_response = self.client.post('/api/login/', payload, format='json')
        limited_response = self.client.post(
            '/api/login/',
            {'username': self.user.username, 'password': 'Password_1'},
            format='json',
        )

        self.assertEqual(first_response.status_code, 401)
        self.assertEqual(second_response.status_code, 401)
        self.assertEqual(limited_response.status_code, 429)


class ProfileUpdateApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='profile-user',
            email='profile@example.com',
            password='test-password',
        )
        self.other_user = User.objects.create_user(
            username='other-profile-user',
            email='taken@example.com',
            password='test-password',
        )
        self.client.force_authenticate(self.user)

    def test_profile_update_rejects_invalid_email(self):
        response = self.client.put(
            '/api/update-profile/',
            {'email': 'not-an-email'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'profile@example.com')

    def test_profile_update_rejects_duplicate_email_case_insensitive(self):
        response = self.client.put(
            '/api/update-profile/',
            {'email': 'TAKEN@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'profile@example.com')

    def test_profile_update_keeps_existing_profile_fields_working(self):
        response = self.client.put(
            '/api/update-profile/',
            {
                'username': 'profile-user-updated',
                'email': 'PROFILE@example.com',
                'phone_number': '79991234567',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'profile-user-updated')
        self.assertEqual(self.user.email, 'profile@example.com')
        self.assertEqual(response.data['phone_number'], '79991234567')


@override_settings(
    EMAIL_ENABLED=True,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='POMNI <no-reply@pomn1.ru>',
    EMAIL_MESSAGE_ID_DOMAIN='pomn1.ru',
)
class RegistrationEmailApiTests(APITestCase):
    def registration_payload(self, **overrides):
        return {
            'username': 'welcome_user',
            'email': 'welcome@example.com',
            'password': 'Password_1',
            'phone_number': '79991234567',
            **overrides,
        }

    def test_registration_sends_multipart_welcome_email(self):
        response = self.client.post(
            '/api/register/',
            self.registration_payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)

        message = mail.outbox[0]
        self.assertEqual(message.to, ['welcome@example.com'])
        self.assertTrue(
            message.extra_headers['Message-ID'].endswith('@pomn1.ru>')
        )
        self.assertEqual(message.subject, 'Добро пожаловать в POMNI')
        self.assertIn('welcome_user', message.body)
        self.assertEqual(len(message.alternatives), 1)
        self.assertEqual(message.alternatives[0].mimetype, 'text/html')
        self.assertIn('https://pomn1.ru/notes', message.alternatives[0].content)
        self.assertIn('welcome_user BASE', message.alternatives[0].content)

    @patch(
        'api.email_service.EmailMultiAlternatives.send',
        side_effect=OSError('SMTP is unavailable'),
    )
    def test_registration_succeeds_when_email_delivery_fails(self, _send):
        response = self.client.post(
            '/api/register/',
            self.registration_payload(
                username='mail_failure',
                email='mail-failure@example.com',
            ),
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='mail_failure').exists())


class TaskAllDayApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='all-day-user', password='test-password')
        self.client.force_authenticate(self.user)

    def test_all_day_task_can_use_earlier_time_on_current_day(self):
        earlier_current_day_time = timezone.now() - timedelta(hours=12)

        response = self.client.post('/api/tasks/', {
            'title': 'All day task',
            'due_date': earlier_current_day_time.isoformat(),
            'is_all_day': True,
            'priority': 'low',
            'status': 'planned',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['is_all_day'])

    def test_timed_task_still_rejects_past_time(self):
        response = self.client.post('/api/tasks/', {
            'title': 'Past timed task',
            'due_date': (timezone.now() - timedelta(minutes=5)).isoformat(),
            'is_all_day': False,
            'priority': 'low',
            'status': 'planned',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('due_date', response.data)

    def test_past_task_can_change_status_without_rescheduling(self):
        task = Task.objects.create(
            user=self.user,
            title='Past task',
            due_date=timezone.now() - timedelta(days=2),
            is_all_day=False,
            priority='low',
            status='planned',
        )

        complete_response = self.client.patch(
            f'/api/tasks/{task.id}/',
            {'status': 'done'},
            format='json',
        )

        self.assertEqual(complete_response.status_code, 200)
        self.assertEqual(complete_response.data['status'], 'done')
        self.assertIsNotNone(complete_response.data['completed_at'])

        restore_response = self.client.patch(
            f'/api/tasks/{task.id}/',
            {'status': 'planned'},
            format='json',
        )

        self.assertEqual(restore_response.status_code, 200)
        self.assertEqual(restore_response.data['status'], 'planned')
        self.assertIsNone(restore_response.data['completed_at'])


class TaskBoardApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='board-user', password='test-password')
        self.other_user = User.objects.create_user(username='other-board-user', password='test-password')
        self.client.force_authenticate(self.user)

    def create_column(self, title='Идеи'):
        response = self.client.post('/api/task-board/columns/', {'title': title}, format='json')
        self.assertEqual(response.status_code, 201)
        return response.data

    def create_task(self, **overrides):
        payload = {
            'title': 'Задача',
            'description': '',
            'due_date': None,
            'is_all_day': False,
            'priority': 'low',
            'status': 'planned',
            **overrides,
        }
        response = self.client.post('/api/tasks/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        return response.data

    def test_board_starts_without_columns(self):
        response = self.client.get('/api/task-board/columns/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_can_create_unscheduled_task_in_own_column(self):
        column = self.create_column()

        task = self.create_task(board_column_id=column['id'])

        self.assertIsNone(task['due_date'])
        self.assertFalse(task['is_all_day'])
        self.assertEqual(task['board_column']['id'], column['id'])
        self.assertEqual(task['board_position'], 0)

    def test_cannot_use_another_users_column(self):
        foreign_column = TaskBoardColumn.objects.create(user=self.other_user, title='Чужая')

        response = self.client.post(
            '/api/tasks/',
            {'title': 'Чужая задача', 'board_column_id': foreign_column.id},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('board_column_id', response.data)

    def test_regular_and_board_scopes_are_isolated(self):
        column = self.create_column()
        regular_task = self.create_task(title='Обычная')
        board_task = self.create_task(title='Доска', board_column_id=column['id'])

        regular_response = self.client.get('/api/tasks/?scope=regular')
        board_response = self.client.get('/api/tasks/?scope=board')

        self.assertEqual([task['id'] for task in regular_response.data], [regular_task['id']])
        self.assertEqual([task['id'] for task in board_response.data], [board_task['id']])

    def test_move_import_preserves_status(self):
        column = self.create_column()
        task = self.create_task(status='in-progress')

        response = self.client.post(
            f"/api/tasks/{task['id']}/move-to-board-column/",
            {'column_id': column['id']},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['board_column']['id'], column['id'])
        self.assertEqual(response.data['status'], 'in-progress')

    def test_delete_column_and_tasks(self):
        column = self.create_column()
        task = self.create_task(board_column_id=column['id'])

        response = self.client.delete(
            f"/api/task-board/columns/{column['id']}/?task_action=delete"
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Task.objects.filter(pk=task['id']).exists())

    def test_delete_column_and_detach_tasks(self):
        column = self.create_column()
        task = self.create_task(board_column_id=column['id'])

        response = self.client.delete(
            f"/api/task-board/columns/{column['id']}/?task_action=detach"
        )

        self.assertEqual(response.status_code, 204)
        saved_task = Task.objects.get(pk=task['id'])
        self.assertIsNone(saved_task.board_column_id)
        self.assertIsNone(saved_task.board_position)

    def test_non_empty_column_requires_delete_choice(self):
        column = self.create_column()
        self.create_task(board_column_id=column['id'])

        response = self.client.delete(f"/api/task-board/columns/{column['id']}/")

        self.assertEqual(response.status_code, 400)
        self.assertIn('task_action', response.data)
