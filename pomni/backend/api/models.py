from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Folder(models.Model):
    title = models.CharField(max_length=255)
    path = models.CharField(max_length=500, default='/', help_text="Путь к папке, например: /folder1/subfolder/")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders', null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, help_text="Время создания папки")

    def save(self, *args, **kwargs):
        if self.parent:
            self.path = f"{self.parent.path}{self.title}/"
        else:
            self.path = f"/{self.title}/"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.path}{self.title}" if self.path != f"/{self.title}/" else self.title

class Note(models.Model):
    title = models.CharField(max_length=255)
    text = models.TextField()
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, help_text="Время создания заметки")

    def __str__(self):
        return self.title

class Profile(models.Model):
    # Эта строка создает жесткую связь с моделью User
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Здесь ваши дополнительные поля, которых нет в User
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f'Профиль {self.user.username}'
