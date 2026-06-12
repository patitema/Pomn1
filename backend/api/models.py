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

    class Meta:
        db_table = 'api_profile'

    def __str__(self):
        return f'Profile {self.user.username}'
