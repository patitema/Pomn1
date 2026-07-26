from urllib.parse import urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from rest_framework import serializers


MAX_PUSH_ENDPOINT_LENGTH = 2048
MAX_PUSH_KEY_LENGTH = 512


def validate_timezone_name(value):
    timezone_name = value.strip()
    try:
        ZoneInfo(timezone_name)
    except (ValueError, ZoneInfoNotFoundError):
        raise serializers.ValidationError('Unknown timezone.') from None
    return timezone_name


def validate_push_endpoint(value):
    endpoint = value.strip()
    if len(endpoint) > MAX_PUSH_ENDPOINT_LENGTH:
        raise serializers.ValidationError('Push endpoint is too long.')

    parsed = urlparse(endpoint)
    if parsed.scheme != 'https' or not parsed.netloc:
        raise serializers.ValidationError('Push endpoint must use HTTPS.')
    return endpoint


class PushSettingsSerializer(serializers.Serializer):
    push_enabled = serializers.BooleanField()
    timezone = serializers.CharField(max_length=64)

    def validate_timezone(self, value):
        return validate_timezone_name(value)


class PushSubscriptionKeysSerializer(serializers.Serializer):
    p256dh = serializers.CharField(max_length=MAX_PUSH_KEY_LENGTH)
    auth = serializers.CharField(max_length=MAX_PUSH_KEY_LENGTH)

    def validate_p256dh(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('p256dh is required.')
        return value

    def validate_auth(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('auth is required.')
        return value


class PushSubscriptionSerializer(serializers.Serializer):
    endpoint = serializers.CharField(max_length=MAX_PUSH_ENDPOINT_LENGTH)
    keys = PushSubscriptionKeysSerializer()

    def validate_endpoint(self, value):
        return validate_push_endpoint(value)


class PushUnsubscribeSerializer(serializers.Serializer):
    endpoint = serializers.CharField(max_length=MAX_PUSH_ENDPOINT_LENGTH)

    def validate_endpoint(self, value):
        return validate_push_endpoint(value)
