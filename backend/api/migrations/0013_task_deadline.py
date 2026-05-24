from django.db import migrations, models


def column_exists(schema_editor, table_name, column_name):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        columns = connection.introspection.get_table_description(cursor, table_name)

    return any(column.name == column_name for column in columns)


def add_deadline_column(apps, schema_editor):
    if not column_exists(schema_editor, 'api_task', 'deadline'):
        schema_editor.execute('ALTER TABLE api_task ADD COLUMN deadline datetime(6) NULL')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_create_task_models'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_deadline_column, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='task',
                    name='deadline',
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
        ),
    ]
