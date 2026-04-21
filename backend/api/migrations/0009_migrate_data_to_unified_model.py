# Data migration: migrate old Folder and Note data to unified Note model

from django.db import migrations


def migrate_folders_and_notes(apps, schema_editor):
    """
    Мигрирует данные из старых моделей FolderOld и NoteOld в новую модель Note
    """
    FolderOld = apps.get_model('api', 'FolderOld')
    NoteOld = apps.get_model('api', 'NoteOld')
    Note = apps.get_model('api', 'Note')

    # Маппинг старых folder_id на новые note_id
    folder_mapping = {}

    # 1. Мигрировать папки как заметки с is_folder=True
    print("Migrating folders...")
    for old_folder in FolderOld.objects.all():
        new_note = Note.objects.create(
            title=old_folder.title,
            text='',  # Папки без текста
            is_folder=True,
            user=old_folder.user,
            created_at=old_folder.created_at,
            folder=None  # Установим позже для иерархии
        )
        folder_mapping[old_folder.id] = new_note.id
        print(f"  Migrated folder: {old_folder.title} -> Note #{new_note.id}")

    # 2. Установить иерархию папок (parent -> folder)
    print("Setting up folder hierarchy...")
    for old_folder in FolderOld.objects.all():
        if old_folder.parent_id:
            new_note = Note.objects.get(id=folder_mapping[old_folder.id])
            new_note.folder_id = folder_mapping[old_folder.parent_id]
            new_note.save()
            print(f"  Set parent for {new_note.title}: folder_id={new_note.folder_id}")

    # 3. Мигрировать заметки
    print("Migrating notes...")
    for old_note in NoteOld.objects.all():
        folder_id = folder_mapping.get(old_note.folder_id) if old_note.folder_id else None
        new_note = Note.objects.create(
            title=old_note.title,
            text=old_note.text,
            is_folder=False,
            user=old_note.user,
            created_at=old_note.created_at,
            folder_id=folder_id
        )
        print(f"  Migrated note: {old_note.title} -> Note #{new_note.id}")

    print(f"Migration complete: {len(folder_mapping)} folders, {NoteOld.objects.count()} notes")


def reverse_migration(apps, schema_editor):
    """
    Откат миграции - удаляет все данные из новой модели Note
    """
    Note = apps.get_model('api', 'Note')
    count = Note.objects.count()
    Note.objects.all().delete()
    print(f"Reverse migration: deleted {count} notes")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_create_unified_note_model'),
    ]

    operations = [
        migrations.RunPython(migrate_folders_and_notes, reverse_migration),
    ]
