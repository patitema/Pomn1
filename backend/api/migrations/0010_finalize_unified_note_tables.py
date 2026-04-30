from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_migrate_data_to_unified_model'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='note',
            table='api_note',
        ),
        migrations.AlterModelTable(
            name='link',
            table='api_link',
        ),
    ]
