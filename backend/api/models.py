from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=255)
    text = models.TextField(blank=True, default='')
    folder = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        help_text='Parent folder note',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    is_folder = models.BooleanField(default=False, help_text='True if this note is a folder')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'api_note'

    def __str__(self):
        prefix = '[folder]' if self.is_folder else '[note]'
        return f'{prefix} {self.title}'


class Link(models.Model):
    note_from = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='links_from',
        help_text='Source note',
    )
    note_to = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='links_to',
        help_text='Target note',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='links')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('note_from', 'note_to')
        ordering = ['-created_at']
        db_table = 'api_link'

    def __str__(self):
        return f'{self.note_from.title} -> {self.note_to.title}'


class Status(models.Model):
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'api_status'
        verbose_name_plural = 'Statuses'

    def __str__(self):
        return self.name


class TaskBoardColumn(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='task_board_columns',
    )
    title = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'id']
        db_table = 'api_task_board_column'

    def __str__(self):
        return self.title


class Task(models.Model):
    STATUS_PLANNED = 'planned'
    STATUS_IN_PROGRESS = 'in-progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = (
        (STATUS_PLANNED, 'Планирую'),
        (STATUS_IN_PROGRESS, 'В процессе'),
        (STATUS_DONE, 'Завершено'),
    )

    PRIORITY_HIGH = 'high'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_LOW = 'low'
    PRIORITY_CHOICES = (
        (PRIORITY_HIGH, 'Высокий'),
        (PRIORITY_MEDIUM, 'Средний'),
        (PRIORITY_LOW, 'Низкий'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    note = models.ForeignKey(
        Note,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    board_column = models.ForeignKey(
        TaskBoardColumn,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='board_tasks',
    )
    board_position = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PLANNED,
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_LOW,
    )
    due_date = models.DateTimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=False)
    deadline = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'api_task'

    def __str__(self):
        return self.title


class TaskChecklistItem(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='checklist_items',
    )
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']
        db_table = 'api_task_checklist_item'

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    timezone = models.CharField(max_length=64, default='UTC')
    push_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'api_profile'

    def __str__(self):
        return f'Profile {self.user.username}'


class WebPushSubscription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='web_push_subscriptions',
    )
    endpoint = models.TextField()
    endpoint_hash = models.CharField(max_length=64, unique=True)
    p256dh = models.CharField(max_length=512)
    auth = models.CharField(max_length=512)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        db_table = 'api_web_push_subscription'

    def __str__(self):
        return f'Push subscription {self.pk} for user {self.user_id}'


class PushEvent(models.Model):
    TYPE_DAILY_SUMMARY = 'daily_summary'
    TYPE_DEADLINE = 'deadline'
    TYPE_CHOICES = (
        (TYPE_DAILY_SUMMARY, 'Daily summary'),
        (TYPE_DEADLINE, 'Deadline'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='push_events',
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='push_events',
    )
    event_type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    dedupe_key = models.CharField(max_length=191, unique=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']
        db_table = 'api_push_event'

    def __str__(self):
        return f'{self.event_type} event {self.pk}'


class PushDeliveryAttempt(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SENT = 'sent'
    STATUS_RETRY = 'retry'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_SENT, 'Sent'),
        (STATUS_RETRY, 'Retry'),
        (STATUS_FAILED, 'Failed'),
    )

    event = models.ForeignKey(
        PushEvent,
        on_delete=models.CASCADE,
        related_name='delivery_attempts',
    )
    subscription = models.ForeignKey(
        WebPushSubscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_attempts',
    )
    subscription_hash = models.CharField(max_length=64)
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    attempt_count = models.PositiveSmallIntegerField(default=0)
    last_http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    last_error_code = models.CharField(max_length=64, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_push_delivery_attempt'
        constraints = [
            models.UniqueConstraint(
                fields=['event', 'subscription_hash'],
                name='unique_push_event_subscription',
            ),
        ]
        indexes = [
            models.Index(fields=['status', 'updated_at']),
        ]

    def __str__(self):
        return f'Push attempt {self.pk}: {self.status}'
