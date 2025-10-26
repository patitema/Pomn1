from rest_framework import serializers
from .models import Folder, Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('id', 'title', 'text', 'folder', 'user', 'created_at')

class FolderSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ('id', 'title', 'path', 'parent', 'user', 'notes', 'children', 'created_at')

    def get_children(self, obj):
        # Возвращаем дочерние папки
        children = obj.children.all()
        return FolderSerializer(children, many=True, context=self.context).data
