from rest_framework import serializers
from .models import Note, Link, Task, Status


class NoteSerializer(serializers.ModelSerializer):
    folder_id = serializers.PrimaryKeyRelatedField(
        source='folder',
        queryset=Note.objects.filter(is_folder=True),
        allow_null=True,
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self, 'context') and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated:
                self.fields['folder_id'].queryset = Note.objects.filter(
                    user=user,
                    is_folder=True,
                )

    class Meta:
        model = Note
        fields = (
            'id',
            'title',
            'text',
            'folder',
            'folder_id',
            'user',
            'is_folder',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        folder = attrs.get('folder')
        instance = self.instance

        if folder is None:
            return attrs

        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and folder.user_id != user.id:
            raise serializers.ValidationError({
                'folder_id': 'Parent folder does not exist.'
            })

        if not folder.is_folder:
            raise serializers.ValidationError({
                'folder_id': 'Parent must be a folder.'
            })

        if instance and folder.pk == instance.pk:
            raise serializers.ValidationError({
                'folder_id': 'Item cannot be placed inside itself.'
            })

        parent = folder
        while parent is not None:
            if instance and parent.pk == instance.pk:
                raise serializers.ValidationError({
                    'folder_id': 'Folder nesting cycle is not allowed.'
                })
            parent = parent.folder

        return attrs


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
        fields = (
            'id',
            'title',
            'description',
            'note',
            'user',
            'status',
            'priority',
            'due_date',
            'completed_at',
            'created_at',
        )
