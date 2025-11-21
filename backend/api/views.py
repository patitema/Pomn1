from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Folder, Note, Profile
from .serializer import FolderSerializer, NoteSerializer

@api_view(['GET', 'POST'])
def notes_list(request):
    if request.method == 'GET':
        notes = Note.objects.filter(user=request.user)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = NoteSerializer(data=data)
        if serializer.is_valid():
            note = serializer.save()
            return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def folders_list(request):
    if request.method == 'GET':
        folders = Folder.objects.filter(user=request.user, parent=None)
        serializer = FolderSerializer(folders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = FolderSerializer(data=data)
        if serializer.is_valid():
            folder = serializer.save()
            return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)
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
        serializer = NoteSerializer(note, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT', 'DELETE'])
def folder_detail(request, pk):
    try:
        folder = Folder.objects.get(pk=pk, user=request.user)
    except Folder.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FolderSerializer(folder, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FolderSerializer(folder, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    phone_number = request.data.get('phone_number')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_active=True,
        is_staff=False,
        is_superuser=False
    )
    user.save()

    # Create Profile
    profile = Profile.objects.create(user=user, phone_number=phone_number or '')
    profile.save()

    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'email': user.email, 'phone_number': profile.phone_number}}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        try:
            profile = Profile.objects.get(user=user)
            phone_number = profile.phone_number
        except Profile.DoesNotExist:
            phone_number = ''
        return Response({'token': token.key, 'user': {'id': user.id, 'username': user.username, 'email': user.email, 'phone_number': phone_number}}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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
        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'phone_number': phone_number})
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
def update_profile(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)

        phone_number = request.data.get('phone_number')
        if phone_number is not None:
            profile.phone_number = phone_number
        profile.save()

        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'phone_number': profile.phone_number})
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
