# Generated manually for unified note model refactoring

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0007_alter_link_folder'),
    ]

    operations = [
        # Шаг 1: Переименовать старые таблицы
        migrations.RenameModel(
            old_name='Folder',
            new_name='FolderOld',
        ),
        migrations.RenameModel(
            old_name='Note',
            new_name='NoteOld',
        ),
        migrations.AlterModelTable(
            name='folderold',
            table='api_folder_old',
        ),
        migrations.AlterModelTable(
            name='noteold',
            table='api_note_old',
        ),

        # Шаг 2: Удалить старую таблицу Link
        migrations.DeleteModel(
            name='Link',
        ),

        # Шаг 3: Создать новую модель Note (unified)
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('text', models.TextField(blank=True, default='')),
                ('is_folder', models.BooleanField(default=False, help_text='True если это папка')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('folder', models.ForeignKey(blank=True, help_text='Родительская заметка (папка)', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='api.note', db_constraint=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to=settings.AUTH_USER_MODEL, db_constraint=False)),
            ],
            options={
                'db_table': 'api_note_new',
                'ordering': ['-created_at'],
            },
        ),

        # Шаг 4: Создать новую модель Link (Note ↔ Note)
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('note_from', models.ForeignKey(help_text='Исходная заметка', on_delete=django.db.models.deletion.CASCADE, related_name='links_from', to='api.note', db_constraint=False)),
                ('note_to', models.ForeignKey(help_text='Целевая заметка', on_delete=django.db.models.deletion.CASCADE, related_name='links_to', to='api.note', db_constraint=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='links', to=settings.AUTH_USER_MODEL, db_constraint=False)),
            ],
            options={
                'db_table': 'api_link_new',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='link',
            unique_together={('note_from', 'note_to')},
        ),

        # Шаг 5: Создать модели Task и Status
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
            ],
            options={
                'db_table': 'api_status',
                'verbose_name_plural': 'Statuses',
            },
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('priority', models.IntegerField(default=0)),
                ('due_date', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='api.note')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='api.status')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'api_task',
                'ordering': ['-created_at'],
            },
        ),
    ]
