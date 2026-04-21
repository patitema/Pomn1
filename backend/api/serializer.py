from rest_framework import serializers
from .models import Note, Link, Task, Status, FolderOld, NoteOld


class NoteSerializer(serializers.ModelSerializer):
    folder_id = serializers.PrimaryKeyRelatedField(
        source='folder', queryset=Note.objects.all(),
        allow_null=True, required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self, 'context') and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated:
                self.fields['folder_id'].queryset = Note.objects.filter(user=user)

    class Meta:
        model = Note
        fields = ('id', 'title', 'text', 'folder', 'folder_id', 'user', 'is_folder',
                  'created_at', 'updated_at')


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ('id', 'note_from', 'note_to', 'user', 'created_at')


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ('id', 'name')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'note', 'user', 'status',
                  'priority', 'due_date', 'completed_at', 'created_at')


# Старые serializers для миграции (временно)
class FolderOldSerializer(serializers.ModelSerializer):
    notes = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = FolderOld
        fields = ('id', 'title', 'path', 'parent', 'user', 'notes', 'children', 'created_at')

    def get_children(self, obj):
        children = obj.children.all()
        return FolderOldSerializer(children, many=True, context=self.context).data

    def get_notes(self, obj):
        notes = obj.notes.all()
        return NoteOldSerializer(notes, many=True, context=self.context).data


class NoteOldSerializer(serializers.ModelSerializer):
    folder_id = serializers.PrimaryKeyRelatedField(
        source='folder', queryset=FolderOld.objects.all(),
        allow_null=True, required=False,
    )

    class Meta:
        model = NoteOld
        fields = ('id', 'title', 'text', 'folder', 'folder_id', 'user', 'created_at')
