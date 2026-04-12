import re
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


def validate_username(value):
    """
    Валидация имени пользователя:
    - Длина: 3-20 символов
    - Разрешённые символы: буквы (латиница + кириллица), цифры, подчёркивание
    - Уникальность
    """
    # Проверка длины
    if len(value) < 3:
        raise ValidationError('Логин должен содержать минимум 3 символа')

    if len(value) > 20:
        raise ValidationError('Логин не должен превышать 20 символов')

    # Проверка допустимых символов
    pattern = r'^[a-zA-Zа-яА-ЯёЁ0-9_]+$'
    if not re.match(pattern, value):
        raise ValidationError('Логин может содержать только буквы, цифры и подчёркивание')

    # Проверка на уникальность
    if User.objects.filter(username=value).exists():
        raise ValidationError('Этот логин уже занят')


def validate_password(value):
    """
    Валидация пароля:
    - Минимум 8 символов
    - Минимум 1 цифра
    - Минимум 1 спецсимвол (!, _, -)
    """
    # Проверка длины
    if len(value) < 8:
        raise ValidationError('Пароль должен содержать минимум 8 символов')

    # Проверка на наличие цифры
    if not re.search(r'\d', value):
        raise ValidationError('Пароль должен содержать минимум одну цифру')

    # Проверка на наличие спецсимвола
    if not re.search(r'[!_-]', value):
        raise ValidationError('Пароль должен содержать минимум один спецсимвол (!, _ или -)')


def validate_phone(value):
    """
    Валидация телефона:
    - Только цифры
    - Ровно 11 цифр (7 + 10-значный номер)
    """
    digits = re.sub(r'[^\d]', '', value)
    if len(digits) != 11:
        raise ValidationError('Номер телефона должен содержать 11 цифр')
    if digits[0] != '7':
        raise ValidationError('Номер должен начинаться с 7')


def validate_email_unique(value):
    """
    Валидация email:
    - Формат email
    - Уникальность
    """
    # Проверка формата
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(pattern, value):
        raise ValidationError('Неверный формат email')

    # Проверка на уникальность
    if User.objects.filter(email=value).exists():
        raise ValidationError('Этот email уже зарегистрирован')
