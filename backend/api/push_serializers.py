import ipaddress
import socket
from urllib.parse import urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
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


def endpoint_host_is_safe(hostname):
    try:
        ip_address = ipaddress.ip_address(hostname)
    except ValueError:
        return True
    return not (
        ip_address.is_loopback
        or ip_address.is_private
        or ip_address.is_link_local
        or ip_address.is_multicast
        or ip_address.is_reserved
        or ip_address.is_unspecified
    )


def resolve_endpoint_addresses(hostname):
    try:
        return socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror:
        raise serializers.ValidationError('Push endpoint host could not be resolved.') from None


def validate_push_endpoint(value, *, resolve=None):
    endpoint = value.strip()
    if len(endpoint) > MAX_PUSH_ENDPOINT_LENGTH:
        raise serializers.ValidationError('Push endpoint is too long.')

    parsed = urlparse(endpoint)
    if parsed.scheme != 'https' or not parsed.netloc:
        raise serializers.ValidationError('Push endpoint must use HTTPS.')
    if parsed.username or parsed.password:
        raise serializers.ValidationError('Push endpoint must not contain credentials.')

    try:
        hostname = parsed.hostname
        parsed.port
    except ValueError:
        raise serializers.ValidationError('Push endpoint host is invalid.') from None

    if not hostname or not endpoint_host_is_safe(hostname):
        raise serializers.ValidationError('Push endpoint host is not allowed.')

    should_resolve = settings.WEB_PUSH_VALIDATE_DNS if resolve is None else resolve
    if should_resolve:
        for address in resolve_endpoint_addresses(hostname):
            if not endpoint_host_is_safe(address[4][0]):
                raise serializers.ValidationError('Push endpoint host is not allowed.')

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
        return validate_push_endpoint(value, resolve=False)
