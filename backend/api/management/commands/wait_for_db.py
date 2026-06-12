import time

from django.core.management.base import BaseCommand
from django.db import DEFAULT_DB_ALIAS, OperationalError, connections


class Command(BaseCommand):
    help = 'Wait until the default database accepts Django connections.'

    def add_arguments(self, parser):
        parser.add_argument('--timeout', type=int, default=60)
        parser.add_argument('--interval', type=float, default=1.0)

    def handle(self, *args, **options):
        timeout = options['timeout']
        interval = options['interval']
        deadline = time.monotonic() + timeout
        connection = connections[DEFAULT_DB_ALIAS]

        self.stdout.write('Waiting for database...')

        while True:
            try:
                connection.ensure_connection()
                connection.close()
                self.stdout.write(self.style.SUCCESS('Database is ready.'))
                return
            except OperationalError as exc:
                if time.monotonic() >= deadline:
                    raise exc
                connection.close()
                time.sleep(interval)
