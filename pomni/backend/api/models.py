from django.db import models
from django.utils import timezone

class Folder(models.Model):
    title = models.CharField(max_length=255)
    path = models.CharField(max_length=500, default='/', help_text="Путь к папке, например: /folder1/subfolder/")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(default=timezone.now, help_text="Время создания папки")

    def save(self, *args, **kwargs):
        # Автоматически генерируем путь на основе родительской папки
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
    created_at = models.DateTimeField(default=timezone.now, help_text="Время создания заметки")

    def __str__(self):
        return self.title
