from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase


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
