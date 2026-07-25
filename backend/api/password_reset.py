import hashlib
import ipaddress
import re
import time

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


RATE_PATTERN = re.compile(r'^(\d+)/(?:(\d+))?([smhd])$')
RATE_SECONDS = {
    's': 1,
    'm': 60,
    'h': 60 * 60,
    'd': 24 * 60 * 60,
}


class PasswordResetRateLimitExceeded(Exception):
    pass


def normalize_email(value):
    return value.strip().lower()


def encode_user_id(user):
    return urlsafe_base64_encode(force_bytes(user.pk))


def decode_user_id(value):
    return force_str(urlsafe_base64_decode(value))


def create_reset_token(user):
    return default_token_generator.make_token(user)


def check_reset_token(user, token):
    return default_token_generator.check_token(user, token)


def build_reset_url(uid, token):
    return f'{settings.PUBLIC_APP_URL}/password-reset/{uid}/{token}'


def get_client_ip(request):
    remote_address = request.META.get('REMOTE_ADDR', '')
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')

    try:
        remote_is_private = ipaddress.ip_address(remote_address).is_private
    except ValueError:
        remote_is_private = False

    if forwarded_for and remote_is_private:
        addresses = [
            address.strip()
            for address in forwarded_for.split(',')
            if address.strip()
        ]
        if addresses:
            trusted_count = max(
                settings.PASSWORD_RESET_TRUSTED_PROXY_COUNT,
                1,
            )
            return addresses[max(len(addresses) - trusted_count, 0)]

    return remote_address or 'unknown'


def parse_rate(value):
    match = RATE_PATTERN.fullmatch(value.strip())
    if not match:
        raise ValueError(f'Invalid password reset rate: {value}')

    limit = int(match.group(1))
    quantity = int(match.group(2) or '1')
    window_seconds = quantity * RATE_SECONDS[match.group(3)]
    return limit, window_seconds


def _increment_rate(scope, identity, rate):
    limit, window_seconds = parse_rate(rate)
    bucket = int(time.time() // window_seconds)
    identity_hash = hashlib.sha256(identity.encode('utf-8')).hexdigest()
    cache_key = f'password-reset:{scope}:{bucket}:{identity_hash}'

    if cache.add(cache_key, 1, timeout=window_seconds + 1):
        count = 1
    else:
        try:
            count = cache.incr(cache_key)
        except ValueError:
            cache.set(cache_key, 1, timeout=window_seconds + 1)
            count = 1

    if count > limit:
        raise PasswordResetRateLimitExceeded


def enforce_request_rate_limits(request, email):
    _increment_rate(
        'ip',
        get_client_ip(request),
        settings.PASSWORD_RESET_IP_RATE,
    )
    _increment_rate(
        'email',
        normalize_email(email),
        settings.PASSWORD_RESET_EMAIL_RATE,
    )
