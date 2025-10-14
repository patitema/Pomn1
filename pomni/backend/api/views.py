from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
# Предполагаем, что .models и .serializer находятся в той же директории
from .models import Folder, Note
from .serializer import FolderSerializer, NoteSerializer

# ====================================================================
# API для Списка заметок (GET) и Создания заметки (POST)
# URL-адрес: /notes/ (например)
# ====================================================================
@api_view(['GET', 'POST'])
def notes_list(request):
    if request.method == 'GET':
        # Получение всех заметок
        notes = Note.objects.all()
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Создание новой заметки
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            note = serializer.save()
            # Возвращаем созданную заметку с кодом 201 Created
            return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)
        # Возвращаем ошибки валидации с кодом 400 Bad Request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ====================================================================
# API для Списка папок (GET) и Создания папки (POST)
# URL-адрес: /folders/ (например)
# ====================================================================
@api_view(['GET', 'POST'])
def folders_list(request):
    if request.method == 'GET':
        # Получение только корневых папок
        folders = Folder.objects.filter(parent=None)
        serializer = FolderSerializer(folders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Создание новой папки
        serializer = FolderSerializer(data=request.data)
        if serializer.is_valid():
            folder = serializer.save()
            return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ====================================================================
# API для Деталей заметки (GET), Обновления (PUT) и Удаления (DELETE)
# URL-адрес: /notes/<pk>/ (например)
# ====================================================================
@api_view(['GET', 'PUT', 'DELETE'])
def note_detail(request, pk):
    # 1. Поиск заметки
    try:
        note = Note.objects.get(pk=pk)
    except Note.DoesNotExist:
        # Если не найдена, возвращаем 404 Not Found
        return Response(status=status.HTTP_404_NOT_FOUND)

    # 2. Обработка методов
    if request.method == 'GET':
        # Получение (Retrieve)
        serializer = NoteSerializer(note)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Обновление (Update)
        # Передаем существующий объект 'note' для обновления
        serializer = NoteSerializer(note, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Удаление (Destroy)
        note.delete()
        # Возвращаем 204 No Content - успешное удаление без тела ответа
        return Response(status=status.HTTP_204_NO_CONTENT)