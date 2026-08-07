import json
import logging
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from pywebpush import WebPushException, webpush
from rest_framework import serializers

from .models import (
    Profile,
    PushDeliveryAttempt,
    PushEvent,
    Task,
    WebPushSubscription,
)
from .push_serializers import validate_push_endpoint


logger = logging.getLogger(__name__)
DAILY_SUMMARY_HOUR = 9
MAX_DELIVERY_ATTEMPTS = 4
TERMINAL_SUBSCRIPTION_STATUSES = {404, 410}


def get_profile_timezone(profile):
    try:
        return ZoneInfo(profile.timezone)
    except (ValueError, ZoneInfoNotFoundError):
        return ZoneInfo('UTC')


def task_url(task, profile_timezone):
    target_datetime = task.due_date or task.deadline
    target_date = target_datetime.astimezone(profile_timezone).date()
    return f'/tasks?view=week&date={target_date.isoformat()}&task={task.id}'


def create_event_with_attempts(
    *,
    user,
    task,
    event_type,
    dedupe_key,
    payload,
):
    subscriptions = list(user.web_push_subscriptions.all())
    if not subscriptions:
        return None

    with transaction.atomic():
        event, created = PushEvent.objects.get_or_create(
            dedupe_key=dedupe_key,
            defaults={
                'user': user,
                'task': task,
                'event_type': event_type,
                'payload': payload,
            },
        )
        if not created:
            return event

        PushDeliveryAttempt.objects.bulk_create([
            PushDeliveryAttempt(
                event=event,
                subscription=subscription,
                subscription_hash=subscription.endpoint_hash,
            )
            for subscription in subscriptions
        ])
        return event


def create_daily_summary_event(profile, local_date, now):
    profile_timezone = get_profile_timezone(profile)
    day_start = datetime.combine(local_date, time.min, tzinfo=profile_timezone)
    day_end = day_start + timedelta(days=1)
    incomplete_tasks = Task.objects.filter(user=profile.user).exclude(
        status=Task.STATUS_DONE,
    )

    today_count = incomplete_tasks.filter(
        due_date__gte=day_start,
        due_date__lt=day_end,
    ).count()
    overdue_count = incomplete_tasks.filter(
        Q(due_date__lt=day_start) | Q(deadline__lt=now),
    ).distinct().count()

    if today_count == 0 and overdue_count == 0:
        return None

    date_value = local_date.isoformat()
    return create_event_with_attempts(
        user=profile.user,
        task=None,
        event_type=PushEvent.TYPE_DAILY_SUMMARY,
        dedupe_key=f'daily:{profile.user_id}:{date_value}',
        payload={
            'title': 'Задачи на сегодня',
            'body': f'Сегодня: {today_count} · Просрочено: {overdue_count}',
            'url': f'/tasks?view=week&date={date_value}',
            'tag': f'daily-{date_value}',
        },
    )


def create_deadline_events(now):
    event_ids = []
    tasks = (
        Task.objects
        .select_related('user', 'user__profile')
        .filter(
            deadline__gt=now,
            deadline__lte=now + timedelta(hours=24),
            user__profile__push_enabled=True,
        )
        .exclude(status=Task.STATUS_DONE)
    )

    for task in tasks:
        profile = task.user.profile
        profile_timezone = get_profile_timezone(profile)
        deadline_value = task.deadline.isoformat()
        event = create_event_with_attempts(
            user=task.user,
            task=task,
            event_type=PushEvent.TYPE_DEADLINE,
            dedupe_key=f'deadline:{task.id}:{deadline_value}',
            payload={
                'title': 'Дедлайн через день',
                'body': task.title,
                'url': task_url(task, profile_timezone),
                'tag': f'deadline-{task.id}-{int(task.deadline.timestamp())}',
                'deadline': deadline_value,
            },
        )
        if event:
            event_ids.append(event.id)

    return event_ids


def discover_due_push_events(now=None):
    if not settings.WEB_PUSH_ENABLED:
        return []

    now = now or timezone.now()
    event_ids = set(create_deadline_events(now))

    profiles = (
        Profile.objects
        .select_related('user')
        .filter(push_enabled=True, user__web_push_subscriptions__isnull=False)
        .distinct()
    )
    for profile in profiles:
        local_now = now.astimezone(get_profile_timezone(profile))
        if local_now.time() < time(hour=DAILY_SUMMARY_HOUR):
            continue

        event = create_daily_summary_event(profile, local_now.date(), now)
        if event:
            event_ids.add(event.id)

    event_ids.update(
        PushEvent.objects
        .filter(
            completed_at__isnull=True,
            delivery_attempts__status__in=(
                PushDeliveryAttempt.STATUS_PENDING,
                PushDeliveryAttempt.STATUS_RETRY,
            ),
        )
        .values_list('id', flat=True)
    )
    return sorted(event_ids)


def deadline_event_is_current(event):
    if event.event_type != PushEvent.TYPE_DEADLINE:
        return True
    if not event.task or event.task.status == Task.STATUS_DONE:
        return False
    return (
        event.task.deadline is not None
        and event.payload.get('deadline') == event.task.deadline.isoformat()
    )


def mark_event_stale(event):
    event.delivery_attempts.filter(
        status__in=(
            PushDeliveryAttempt.STATUS_PENDING,
            PushDeliveryAttempt.STATUS_RETRY,
        ),
    ).update(
        status=PushDeliveryAttempt.STATUS_FAILED,
        last_error_code='event_stale',
        updated_at=timezone.now(),
    )
    event.completed_at = timezone.now()
    event.save(update_fields=['completed_at'])


def send_attempt(attempt):
    subscription = attempt.subscription
    if not subscription or subscription.user_id != attempt.event.user_id:
        attempt.status = PushDeliveryAttempt.STATUS_FAILED
        attempt.last_error_code = 'subscription_missing'
        attempt.attempt_count += 1
        attempt.save(update_fields=[
            'status',
            'last_error_code',
            'attempt_count',
            'updated_at',
        ])
        return

    attempt.attempt_count += 1
    try:
        validate_push_endpoint(subscription.endpoint)
        webpush(
            subscription_info={
                'endpoint': subscription.endpoint,
                'keys': {
                    'p256dh': subscription.p256dh,
                    'auth': subscription.auth,
                },
            },
            data=json.dumps(attempt.event.payload, ensure_ascii=False),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={'sub': settings.VAPID_SUBJECT},
            ttl=86400,
            timeout=settings.WEB_PUSH_TIMEOUT,
        )
    except serializers.ValidationError:
        attempt.status = PushDeliveryAttempt.STATUS_FAILED
        attempt.last_error_code = 'unsafe_endpoint'
    except WebPushException as error:
        response = error.response
        http_status = response.status_code if response is not None else None
        attempt.last_http_status = http_status

        if http_status in TERMINAL_SUBSCRIPTION_STATUSES:
            attempt.status = PushDeliveryAttempt.STATUS_FAILED
            attempt.last_error_code = 'subscription_gone'
            subscription_user_id = subscription.user_id
            attempt.subscription = None
            subscription.delete()
            if not WebPushSubscription.objects.filter(
                user_id=subscription_user_id,
            ).exists():
                Profile.objects.filter(user_id=subscription_user_id).update(
                    push_enabled=False,
                )
        elif http_status is not None and 400 <= http_status < 500:
            attempt.status = PushDeliveryAttempt.STATUS_FAILED
            attempt.last_error_code = 'push_rejected'
        elif attempt.attempt_count >= MAX_DELIVERY_ATTEMPTS:
            attempt.status = PushDeliveryAttempt.STATUS_FAILED
            attempt.last_error_code = 'retry_exhausted'
        else:
            attempt.status = PushDeliveryAttempt.STATUS_RETRY
            attempt.last_error_code = 'temporary_failure'
    except Exception:
        logger.exception(
            'Unexpected push delivery error for event_id=%s attempt_id=%s',
            attempt.event_id,
            attempt.id,
        )
        if attempt.attempt_count >= MAX_DELIVERY_ATTEMPTS:
            attempt.status = PushDeliveryAttempt.STATUS_FAILED
            attempt.last_error_code = 'retry_exhausted'
        else:
            attempt.status = PushDeliveryAttempt.STATUS_RETRY
            attempt.last_error_code = 'temporary_failure'
    else:
        attempt.status = PushDeliveryAttempt.STATUS_SENT
        attempt.last_http_status = None
        attempt.last_error_code = ''
        attempt.sent_at = timezone.now()

    attempt.save(update_fields=[
        'subscription',
        'status',
        'attempt_count',
        'last_http_status',
        'last_error_code',
        'sent_at',
        'updated_at',
    ])


def deliver_push_event(event_id):
    event = (
        PushEvent.objects
        .select_related('task')
        .filter(id=event_id, completed_at__isnull=True)
        .first()
    )
    if not event:
        return False

    if not deadline_event_is_current(event):
        mark_event_stale(event)
        return False

    attempts = list(
        event.delivery_attempts
        .select_related('subscription', 'event')
        .filter(status__in=(
            PushDeliveryAttempt.STATUS_PENDING,
            PushDeliveryAttempt.STATUS_RETRY,
        ))
    )
    for attempt in attempts:
        send_attempt(attempt)

    should_retry = event.delivery_attempts.filter(
        status=PushDeliveryAttempt.STATUS_RETRY,
    ).exists()
    has_pending = event.delivery_attempts.filter(
        status=PushDeliveryAttempt.STATUS_PENDING,
    ).exists()
    if not should_retry and not has_pending:
        event.completed_at = timezone.now()
        event.save(update_fields=['completed_at'])

    return should_retry
