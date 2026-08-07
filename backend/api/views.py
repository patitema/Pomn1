from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Max
from django.db.models import Q
from .models import Note, Link, Profile, Task, TaskBoardColumn
from .email_service import send_welcome_email
from .auth_throttling import (
    LoginRateLimitExceeded,
    enforce_login_rate_limit,
    record_failed_login,
)
from .password_email_service import (
    send_password_changed_email,
    send_password_reset_email,
)
from .password_reset import (
    PasswordResetRateLimitExceeded,
    build_reset_url,
    check_reset_token,
    create_reset_token,
    decode_user_id,
    encode_user_id,
    enforce_request_rate_limits,
    normalize_email,
)
from .serializer import (
    NoteSerializer,
    LinkSerializer,
    TaskSerializer,
    TaskBoardColumnSerializer,
)
from .validators import (
    validate_username, validate_password,
    validate_phone, validate_email_unique,
)


def sync_parent_link(child, parent, user, previous_parent=None):
    old_parent = previous_parent if previous_parent is not None else child.folder

    if getattr(old_parent, 'id', None) != getattr(parent, 'id', None):
        Link.objects.filter(
            Q(note_from=child, note_to__is_folder=True) |
            Q(note_to=child, note_from__is_folder=True),
            user=user,
        ).exclude(
            note_from=child,
            note_to=parent,
        ).delete()

    if getattr(child.folder, 'id', None) != getattr(parent, 'id', None):
        child.folder = parent
        child.save(update_fields=['folder', 'updated_at'])

    if parent:
        Link.objects.get_or_create(
            note_from=child,
            note_to=parent,
            user=user,
        )


@api_view(['GET', 'POST'])
def notes_list(request):
    """
    GET: Получить все заметки пользователя (включая папки)
    Параметры: ?is_folder=true/false для фильтрации
    POST: Создать новую заметку или папку
    """
    if request.method == 'GET':
        notes = Note.objects.filter(user=request.user)

        # Фильтрация по типу (папка/заметка)
        is_folder = request.query_params.get('is_folder')
        if is_folder is not None:
            notes = notes.filter(is_folder=is_folder.lower() == 'true')

        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        serializer = NoteSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            note = serializer.save(user=request.user)

            return Response(
                NoteSerializer(note).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def folders_list(request):
    """
    Временный endpoint для обратной совместимости.
    Возвращает только заметки с is_folder=True
    """
    if request.method == 'GET':
        folders = Note.objects.filter(user=request.user, is_folder=True, folder=None)
        serializer = NoteSerializer(folders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['is_folder'] = True  # Принудительно устанавливаем как папку
        serializer = NoteSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            folder = serializer.save(user=request.user)
            return Response(
                NoteSerializer(folder).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def note_detail(request, pk):
    try:
        note = Note.objects.get(pk=pk, user=request.user)
    except Note.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NoteSerializer(note)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NoteSerializer(
            note, data=request.data,
            context={'request': request}, partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'DELETE'])
def folder_detail(request, pk):
    """
    Временный endpoint для обратной совместимости.
    Работает с заметками где is_folder=True
    """
    try:
        folder = Note.objects.get(pk=pk, user=request.user, is_folder=True)
    except Note.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NoteSerializer(folder, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NoteSerializer(
            folder, data=request.data,
            context={'request': request}, partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def links_list(request):
    """
    GET: Получить все связи между заметками пользователя
    POST: Создать новую связь между заметками
    """
    if request.method == 'GET':
        links = Link.objects.filter(user=request.user)
        serializer = LinkSerializer(links, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id

        # Валидация: нельзя связать заметку с самой собой
        if data.get('note_from') == data.get('note_to'):
            return Response(
                {'error': 'Нельзя связать заметку с самой собой'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = LinkSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            link = serializer.save()
            return Response(
                LinkSerializer(link).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def link_detail(request, pk):
    """
    DELETE: Удалить связь между заметками
    """
    try:
        link = Link.objects.get(pk=pk, user=request.user)
    except Link.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def tasks_list(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)

        task_scope = request.query_params.get('scope')
        if task_scope == 'regular':
            tasks = tasks.filter(board_column__isnull=True)
        elif task_scope == 'board':
            tasks = tasks.filter(board_column__isnull=False)

        search = request.query_params.get('search')
        if search:
            tasks = tasks.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        task_status = request.query_params.get('status')
        if task_status:
            tasks = tasks.filter(status=task_status)

        priority = request.query_params.get('priority')
        if priority:
            tasks = tasks.filter(priority=priority)

        date_from = request.query_params.get('date_from')
        if date_from:
            tasks = tasks.filter(due_date__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            tasks = tasks.filter(due_date__date__lte=date_to)

        note_id = request.query_params.get('note_id')
        if note_id:
            tasks = tasks.filter(note_id=note_id, note__user=request.user)

        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    data = request.data.copy()
    serializer = TaskSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        task = serializer.save(user=request.user)
        return Response(
            TaskSerializer(task, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def task_board_columns_list(request):
    if request.method == 'GET':
        columns = TaskBoardColumn.objects.filter(user=request.user)
        return Response(TaskBoardColumnSerializer(columns, many=True).data)

    serializer = TaskBoardColumnSerializer(data=request.data)
    if serializer.is_valid():
        current_max = TaskBoardColumn.objects.filter(user=request.user).aggregate(
            max_position=Max('position')
        )['max_position']
        column = serializer.save(
            user=request.user,
            position=(current_max if current_max is not None else -1) + 1,
        )
        return Response(
            TaskBoardColumnSerializer(column).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
def task_board_column_detail(request, pk):
    try:
        column = TaskBoardColumn.objects.get(pk=pk, user=request.user)
    except TaskBoardColumn.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = TaskBoardColumnSerializer(column, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    tasks = column.board_tasks.filter(user=request.user)
    task_action = request.query_params.get('task_action')
    if tasks.exists() and task_action not in ('delete', 'detach'):
        return Response(
            {'task_action': ['Choose delete or detach for tasks in this column.']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        if task_action == 'delete':
            tasks.delete()
        else:
            tasks.update(board_column=None, board_position=None)
        column.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def move_task_to_board_column(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    column_id = request.data.get('column_id')
    try:
        column = TaskBoardColumn.objects.get(pk=column_id, user=request.user)
    except (TaskBoardColumn.DoesNotExist, TypeError, ValueError):
        return Response(
            {'column_id': ['Board column does not exist.']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if task.board_column_id == column.id:
        return Response(TaskSerializer(task, context={'request': request}).data)

    with transaction.atomic():
        current_max = column.board_tasks.aggregate(max_position=Max('board_position'))['max_position']
        task.board_column = column
        task.board_position = (current_max if current_max is not None else -1) + 1
        task.save(update_fields=['board_column', 'board_position', 'updated_at'])

    return Response(TaskSerializer(task, context={'request': request}).data)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TaskSerializer(task, context={'request': request})
        return Response(serializer.data)

    if request.method in ('PUT', 'PATCH'):
        serializer = TaskSerializer(
            task,
            data=request.data,
            context={'request': request},
            partial=request.method == 'PATCH',
        )
        if serializer.is_valid():
            task = serializer.save()
            return Response(TaskSerializer(task, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    task.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    phone_number = request.data.get('phone_number')

    errors = {}

    # Валидация логина
    if not username:
        errors['username'] = ['Логин обязателен']
    else:
        try:
            validate_username(username)
        except ValidationError as e:
            errors['username'] = e.messages

    # Валидация пароля
    if not password:
        errors['password'] = ['Пароль обязателен']
    else:
        try:
            validate_password(password)
        except ValidationError as e:
            errors['password'] = e.messages

    # Валидация email
    if not email:
        errors['email'] = ['Email обязателен']
    else:
        try:
            validate_email_unique(email)
        except ValidationError as e:
            errors['email'] = e.messages

    # Валидация телефона
    if not phone_number:
        errors['phone_number'] = ['Телефон обязателен']
    else:
        try:
            validate_phone(phone_number)
        except ValidationError as e:
            errors['phone_number'] = e.messages

    # Если есть ошибки, возвращаем их
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    # Создание пользователя
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_active=True,
        is_staff=False,
        is_superuser=False,
    )
    user.save()

    # Create Profile
    profile = Profile.objects.create(user=user, phone_number=phone_number)
    profile.save()

    token, created = Token.objects.get_or_create(user=user)
    send_welcome_email(user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_number': profile.phone_number,
        },
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not isinstance(email, str) or not email.strip():
        return Response(
            {'email': ['Email обязателен']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = normalize_email(email)
    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {'email': ['Неверный формат email']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        enforce_request_rate_limits(request, email)
    except PasswordResetRateLimitExceeded:
        return Response(
            {'message': 'Слишком много запросов. Попробуйте позже.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    user = User.objects.filter(
        email__iexact=email,
        is_active=True,
    ).first()
    if user and user.has_usable_password():
        uid = encode_user_id(user)
        token = create_reset_token(user)
        send_password_reset_email(
            user,
            build_reset_url(uid, token),
        )

    return Response({
        'message': (
            'Если аккаунт с таким email существует, '
            'мы отправили ссылку для восстановления пароля.'
        ),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not all(isinstance(value, str) and value for value in (uid, token)):
        return Response(
            {
                'code': 'invalid_or_expired',
                'message': 'Ссылка недействительна или устарела.',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = decode_user_id(uid)
        user = User.objects.get(pk=user_id, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is None or not check_reset_token(user, token):
        return Response(
            {
                'code': 'invalid_or_expired',
                'message': 'Ссылка недействительна или устарела.',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    errors = {}
    if not isinstance(new_password, str) or not new_password:
        errors['new_password'] = ['Новый пароль обязателен']
    if new_password != confirm_password:
        errors['confirm_password'] = ['Пароли не совпадают']
    if not errors:
        try:
            validate_password(new_password)
        except ValidationError as error:
            errors['new_password'] = error.messages
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user.set_password(new_password)
        user.save(update_fields=['password'])
        Token.objects.filter(user=user).delete()
        transaction.on_commit(
            lambda: send_password_changed_email(user)
        )

    return Response({
        'message': 'Пароль изменён. Войдите с новым паролем.',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        enforce_login_rate_limit(request, username)
    except LoginRateLimitExceeded:
        return Response(
            {'error': 'Too many login attempts. Try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        try:
            profile = Profile.objects.get(user=user)
            phone_number = profile.phone_number
        except Profile.DoesNotExist:
            phone_number = ''
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone_number': phone_number,
            },
        }, status=status.HTTP_200_OK)
    else:
        record_failed_login(request, username)
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(['POST'])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def current_user(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=user)
            phone_number = profile.phone_number
        except Profile.DoesNotExist:
            phone_number = ''
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_number': phone_number,
        })
    return Response(
        {'error': 'Not authenticated'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(['PUT'])
def update_profile(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)

        # Обновляем поля User
        username = request.data.get('username')
        email = request.data.get('email')
        if username:
            user.username = username
        if email:
            user.email = email
        user.save()

        # Обновляем поля Profile
        phone_number = request.data.get('phone_number')
        if phone_number is not None:
            profile.phone_number = phone_number
        profile.save()

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_number': profile.phone_number,
        })
    return Response(
        {'error': 'Not authenticated'},
        status=status.HTTP_401_UNAUTHORIZED,
    )
