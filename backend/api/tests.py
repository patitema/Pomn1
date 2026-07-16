from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Task, TaskBoardColumn


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