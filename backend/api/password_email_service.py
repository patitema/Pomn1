import logging
from email.utils import make_msgid

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


logger = logging.getLogger(__name__)


def _send_password_email(user, template_name, context):
    if not settings.EMAIL_ENABLED:
        return False

    try:
        subject = render_to_string(
            f'api/email/{template_name}_subject.txt',
            context,
        ).strip()
        text_body = render_to_string(
            f'api/email/{template_name}.txt',
            context,
        )
        html_body = render_to_string(
            f'api/email/{template_name}.html',
            context,
        )

        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
            headers={
                'Message-ID': make_msgid(
                    domain=settings.EMAIL_MESSAGE_ID_DOMAIN,
                ),
            },
        )
        message.attach_alternative(html_body, 'text/html')
        return message.send(fail_silently=False) == 1
    except Exception:
        logger.exception(
            '%s email delivery failed for user_id=%s',
            template_name,
            user.pk,
        )
        return False


def send_password_reset_email(user, reset_url):
    return _send_password_email(
        user,
        'password_reset',
        {
            'username': user.username,
            'reset_url': reset_url,
        },
    )


def send_password_changed_email(user):
    return _send_password_email(
        user,
        'password_changed',
        {
            'username': user.username,
            'login_url': f'{settings.PUBLIC_APP_URL}/auth',
            'support_email': 'support@pomni.ru',
        },
    )
