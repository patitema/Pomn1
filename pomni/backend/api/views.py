from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Folder, Note
from .serializer import FolderSerializer, NoteSerializer

@api_view(['GET'])
def notes_list(request):
    notes = Note.objects.all()
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def folders_list(request):
    folders = Folder.objects.filter(parent=None)
    serializer = FolderSerializer(folders, many=True)
    return Response(serializer.data)
