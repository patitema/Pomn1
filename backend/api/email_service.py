import logging
from email.utils import make_msgid

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


logger = logging.getLogger(__name__)


def send_welcome_email(user):
    if not settings.EMAIL_ENABLED:
        return False

    try:
        context = {
            'username': user.username,
            'app_url': 'https://pomn1.ru/notes',
        }
        subject = render_to_string(
            'api/email/welcome_subject.txt',
            context,
        ).strip()
        text_body = render_to_string(
            'api/email/welcome.txt',
            context,
        )
        html_body = render_to_string(
            'api/email/welcome.html',
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
            'Welcome email delivery failed for user_id=%s',
            user.pk,
        )
        return False
