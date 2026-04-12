from rest_framework import serializers
from .models import Folder, Note


class NoteSerializer(serializers.ModelSerializer):
    folder_id = serializers.PrimaryKeyRelatedField(
        source='folder', queryset=Folder.objects.all(),
        allow_null=True, required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self, 'context') and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated:
                self.fields['folder_id'].queryset = Folder.objects.filter(user=user)

    class Meta:
        model = Note
        fields = ('id', 'title', 'text', 'folder', 'folder_id', 'user', 'created_at')


class FolderSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ('id', 'title', 'path', 'parent', 'user', 'notes', 'children', 'created_at')

    def get_children(self, obj):
        children = obj.children.all()
        return FolderSerializer(children, many=True, context=self.context).data

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
