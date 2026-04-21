from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Note(models.Model):
    """
    Универсальная модель для заметок и папок.
    folder_id ссылается на другую Note, создавая иерархию (дерево).
    """
    title = models.CharField(max_length=255)
    text = models.TextField(blank=True, default='')
    folder = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        help_text="Родительская заметка (папка)"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    is_folder = models.BooleanField(default=False, help_text="True если это папка")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'api_note'

    def __str__(self):
        return f"{'📁' if self.is_folder else '📄'} {self.title}"


class Link(models.Model):
    """
    Связи между заметками для построения графа знаний.
    """
    note_from = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='links_from',
        help_text="Исходная заметка"
    )
    note_to = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='links_to',
        help_text="Целевая заметка"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='links')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('note_from', 'note_to')
        ordering = ['-created_at']
        db_table = 'api_link'

    def __str__(self):
        return f"{self.note_from.title} → {self.note_to.title}"


class Status(models.Model):
    """Статусы задач"""
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'api_status'
        verbose_name_plural = 'Statuses'

    def __str__(self):
        return self.name


class Task(models.Model):
    """Задачи, привязанные к заметкам"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='tasks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    priority = models.IntegerField(default=0)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        db_table = 'api_task'

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'api_profile'

    def __str__(self):
        return f'Профиль {self.user.username}'
