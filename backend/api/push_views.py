import hashlib

from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Profile, WebPushSubscription
from .push_serializers import (
    PushSettingsSerializer,
    PushSubscriptionSerializer,
    PushUnsubscribeSerializer,
)


def endpoint_hash(endpoint):
    return hashlib.sha256(endpoint.encode('utf-8')).hexdigest()


def serialize_push_settings(profile):
    return {
        'push_enabled': profile.push_enabled,
        'timezone': profile.timezone,
        'vapid_public_key': settings.VAPID_PUBLIC_KEY,
        'available': settings.WEB_PUSH_ENABLED,
        'subscription_count': profile.user.web_push_subscriptions.count(),
    }


@api_view(['GET', 'PUT'])
def push_settings(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(serialize_push_settings(profile))

    serializer = PushSettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    profile.push_enabled = serializer.validated_data['push_enabled']
    profile.timezone = serializer.validated_data['timezone']
    profile.save(update_fields=['push_enabled', 'timezone'])
    return Response(serialize_push_settings(profile))


@api_view(['POST'])
def push_subscriptions(request):
    serializer = PushSubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    endpoint = serializer.validated_data['endpoint']
    keys = serializer.validated_data['keys']
    hashed_endpoint = endpoint_hash(endpoint)

    with transaction.atomic():
        existing = (
            WebPushSubscription.objects
            .select_for_update()
            .filter(endpoint_hash=hashed_endpoint)
            .first()
        )
        if existing and existing.user_id != request.user.id:
            existing.delete()
            existing = None

        if existing:
            existing.endpoint = endpoint
            existing.p256dh = keys['p256dh']
            existing.auth = keys['auth']
            existing.save(update_fields=['endpoint', 'p256dh', 'auth', 'updated_at'])
            subscription = existing
            created = False
        else:
            subscription = WebPushSubscription.objects.create(
                user=request.user,
                endpoint=endpoint,
                endpoint_hash=hashed_endpoint,
                p256dh=keys['p256dh'],
                auth=keys['auth'],
            )
            created = True

        profile, _ = Profile.objects.get_or_create(user=request.user)
        if not profile.push_enabled:
            profile.push_enabled = True
            profile.save(update_fields=['push_enabled'])

    return Response(
        {
            'id': subscription.id,
            'push_enabled': True,
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['POST'])
def push_unsubscribe(request):
    serializer = PushUnsubscribeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    subscriptions = WebPushSubscription.objects.filter(
        user=request.user,
        endpoint_hash=endpoint_hash(serializer.validated_data['endpoint']),
    )
    subscriptions.delete()

    if not request.user.web_push_subscriptions.exists():
        Profile.objects.filter(user=request.user).update(push_enabled=False)

    return Response(status=status.HTTP_204_NO_CONTENT)
