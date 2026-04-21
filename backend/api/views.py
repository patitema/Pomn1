from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import Note, Link, Profile, FolderOld, NoteOld
from .serializer import NoteSerializer, LinkSerializer, FolderOldSerializer, NoteOldSerializer
from .validators import (
    validate_username, validate_password,
    validate_phone, validate_email_unique,
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
        data['user'] = request.user.id
        serializer = NoteSerializer(data=data)
        if serializer.is_valid():
            note = serializer.save()

            # Автоматически создать Link если заметка добавлена в папку
            if note.folder:
                Link.objects.get_or_create(
                    note_from=note,
                    note_to=note.folder,
                    user=request.user
                )

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
        data['user'] = request.user.id
        data['is_folder'] = True  # Принудительно устанавливаем как папку
        serializer = NoteSerializer(data=data)
        if serializer.is_valid():
            folder = serializer.save()
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
        old_folder = note.folder  # Сохраняем старую папку

        serializer = NoteSerializer(
            note, data=request.data,
            context={'request': request}, partial=True,
        )
        if serializer.is_valid():
            note = serializer.save()

            # Если папка изменилась, обновить Link
            if note.folder != old_folder:
                # Удалить старую связь с папкой
                if old_folder:
                    Link.objects.filter(
                        note_from=note,
                        note_to=old_folder,
                        user=request.user
                    ).delete()

                # Создать новую связь с папкой
                if note.folder:
                    Link.objects.get_or_create(
                        note_from=note,
                        note_to=note.folder,
                        user=request.user
                    )

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

        serializer = LinkSerializer(data=data)
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
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST,
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
