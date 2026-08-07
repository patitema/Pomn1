import hashlib
import re

from django.conf import settings
from django.core.cache import cache


RATE_PATTERN = re.compile(r'^(\d+)/(\d+)([smhd])$')
RATE_MULTIPLIERS = {
    's': 1,
    'm': 60,
    'h': 60 * 60,
    'd': 24 * 60 * 60,
}


class LoginRateLimitExceeded(Exception):
    pass


def parse_rate(value):
    match = RATE_PATTERN.fullmatch(value.strip())
    if not match:
        raise ValueError(f'Invalid login rate: {value}')

    limit = int(match.group(1))
    window = int(match.group(2)) * RATE_MULTIPLIERS[match.group(3)]
    return limit, window


def _hash_key(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def _client_ip(request):
    return request.META.get('REMOTE_ADDR') or 'unknown'


def _username_key(username):
    normalized = (username or '').strip().casefold() or 'unknown'
    return _hash_key(normalized)


def _rate_settings():
    ip_limit, ip_window = parse_rate(getattr(settings, 'LOGIN_IP_RATE', '10/15m'))
    username_limit, username_window = parse_rate(
        getattr(settings, 'LOGIN_USERNAME_RATE', '5/15m')
    )
    return ip_limit, ip_window, username_limit, username_window


def _keys(request, username):
    return (
        f'login:ip:{_hash_key(_client_ip(request))}',
        f'login:username:{_username_key(username)}',
    )


def _increment(key, timeout):
    if cache.add(key, 1, timeout=timeout):
        return 1
    try:
        return cache.incr(key)
    except ValueError:
        cache.set(key, 1, timeout=timeout)
        return 1


def enforce_login_rate_limit(request, username):
    ip_limit, _, username_limit, _ = _rate_settings()
    ip_key, username_key = _keys(request, username)
    if cache.get(ip_key, 0) >= ip_limit or cache.get(username_key, 0) >= username_limit:
        raise LoginRateLimitExceeded()


def record_failed_login(request, username):
    _, ip_window, _, username_window = _rate_settings()
    ip_key, username_key = _keys(request, username)
    _increment(ip_key, ip_window)
    _increment(username_key, username_window)
