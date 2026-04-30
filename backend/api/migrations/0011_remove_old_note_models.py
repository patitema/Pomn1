from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_finalize_unified_note_tables'),
    ]

    operations = [
        migrations.DeleteModel(
            name='NoteOld',
        ),
        migrations.DeleteModel(
            name='FolderOld',
        ),
    ]
