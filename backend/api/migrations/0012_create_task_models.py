from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


def drop_foreign_keys_for_column(schema_editor, table_name, column_name):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        constraints = connection.introspection.get_constraints(cursor, table_name)

    with connection.cursor() as cursor:
        for constraint_name, constraint in constraints.items():
            if constraint.get('foreign_key') and constraint.get('columns') == [column_name]:
                cursor.execute(
                    schema_editor.sql_delete_fk % {
                        'table': schema_editor.quote_name(table_name),
                        'name': schema_editor.quote_name(constraint_name),
                    }
                )


def column_exists(schema_editor, table_name, column_name):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        columns = connection.introspection.get_table_description(cursor, table_name)

    return any(column.name == column_name for column in columns)


def prepare_existing_task_tables(apps, schema_editor):
    if column_exists(schema_editor, 'api_task', 'status_id'):
        drop_foreign_keys_for_column(schema_editor, 'api_task', 'status_id')
        schema_editor.execute('ALTER TABLE api_task DROP COLUMN status_id')

    if not column_exists(schema_editor, 'api_task', 'status'):
        schema_editor.execute("ALTER TABLE api_task ADD COLUMN status varchar(20) NOT NULL DEFAULT 'planned'")

    if column_exists(schema_editor, 'api_task', 'priority'):
        schema_editor.execute("ALTER TABLE api_task MODIFY COLUMN priority varchar(10) NOT NULL DEFAULT 'low'")

    if column_exists(schema_editor, 'api_task', 'note_id'):
        drop_foreign_keys_for_column(schema_editor, 'api_task', 'note_id')
        schema_editor.execute('ALTER TABLE api_task MODIFY COLUMN note_id bigint NULL')

    if not column_exists(schema_editor, 'api_task', 'updated_at'):
        schema_editor.execute('ALTER TABLE api_task ADD COLUMN updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_remove_old_note_models'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(prepare_existing_task_tables, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='Status',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('name', models.CharField(max_length=20)),
                    ],
                    options={
                        'verbose_name_plural': 'Statuses',
                        'db_table': 'api_status',
                    },
                ),
                migrations.CreateModel(
                    name='Task',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('title', models.CharField(max_length=255)),
                        ('description', models.TextField(blank=True)),
                        ('status', models.CharField(choices=[('planned', 'Планирую'), ('in-progress', 'В процессе'), ('done', 'Завершено')], default='planned', max_length=20)),
                        ('priority', models.CharField(choices=[('high', 'Высокий'), ('medium', 'Средний'), ('low', 'Низкий')], default='low', max_length=10)),
                        ('due_date', models.DateTimeField(blank=True, null=True)),
                        ('completed_at', models.DateTimeField(blank=True, null=True)),
                        ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('note', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='api.note')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'ordering': ['-created_at'],
                        'db_table': 'api_task',
                    },
                ),
            ],
        ),
    ]
