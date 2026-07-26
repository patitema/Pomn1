from celery import shared_task

from .push_service import deliver_push_event, discover_due_push_events


@shared_task
def discover_due_push_events_task():
    event_ids = discover_due_push_events()
    for event_id in event_ids:
        deliver_push_event_task.delay(event_id)
    return len(event_ids)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def deliver_push_event_task(self, event_id):
    should_retry = deliver_push_event(event_id)
    if should_retry:
        raise self.retry()
