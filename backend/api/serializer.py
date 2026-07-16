from rest_framework import serializers
from datetime import timedelta

from django.db.models import Max
from django.utils import timezone
from .models import Note, Link, Task, TaskBoardColumn, TaskChecklistItem, Status


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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            self.fields['note_from'].queryset = Note.objects.filter(user=user)
            self.fields['note_to'].queryset = Note.objects.filter(user=user)

    class Meta:
        model = Link
        fields = ('id', 'note_from', 'note_to', 'user', 'created_at')

    def validate(self, attrs):
        note_from = attrs.get('note_from')
        note_to = attrs.get('note_to')

        if not note_from or not note_to:
            return attrs

        if note_from.pk == note_to.pk:
            raise serializers.ValidationError({
                'note_to': 'Item cannot be linked to itself.'
            })

        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if note_from.user_id != user.id or note_to.user_id != user.id:
                raise serializers.ValidationError({
                    'note_to': 'Target item does not exist.'
                })

            duplicate_exists = Link.objects.filter(
                user=user,
                note_from=note_from,
                note_to=note_to,
            ).exists() or Link.objects.filter(
                user=user,
                note_from=note_to,
                note_to=note_from,
            ).exists()

            if duplicate_exists:
                raise serializers.ValidationError({
                    'note_to': 'This link already exists.'
                })

        return attrs


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ('id', 'name')


class TaskChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskChecklistItem
        fields = ('id', 'title', 'is_completed', 'position', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_title(self, value):
        title = value.strip()
        if not title:
            raise serializers.ValidationError('Checklist item title cannot be blank.')
        return title


class TaskBoardColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskBoardColumn
        fields = ('id', 'title', 'position', 'created_at', 'updated_at')
        read_only_fields = ('id', 'position', 'created_at', 'updated_at')

    def validate_title(self, value):
        title = value.strip()
        if not title:
            raise serializers.ValidationError('Column title cannot be blank.')
        return title


class TaskSerializer(serializers.ModelSerializer):
    checklist_items = TaskChecklistItemSerializer(many=True, required=False)
    board_column = TaskBoardColumnSerializer(read_only=True)
    board_column_id = serializers.PrimaryKeyRelatedField(
        source='board_column',
        queryset=TaskBoardColumn.objects.none(),
        allow_null=True,
        required=False,
        write_only=True,
    )
    note_id = serializers.PrimaryKeyRelatedField(
        source='note',
        queryset=Note.objects.filter(is_folder=False),
        allow_null=True,
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            self.fields['board_column_id'].queryset = TaskBoardColumn.objects.filter(user=user)
            self.fields['note_id'].queryset = Note.objects.filter(
                user=user,
                is_folder=False,
            )

    class Meta:
        model = Task
        fields = (
            'id',
            'title',
            'description',
            'note',
            'note_id',
            'user',
            'board_column',
            'board_column_id',
            'board_position',
            'status',
            'priority',
            'due_date',
            'is_all_day',
            'deadline',
            'checklist_items',
            'completed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'note',
            'user',
            'board_position',
            'completed_at',
            'created_at',
            'updated_at',
        )

    def validate_deadline(self, value):
        current_minute = timezone.now().replace(second=0, microsecond=0)
        if value and value < current_minute:
            raise serializers.ValidationError('Deadline cannot be in the past.')
        return value

    def validate(self, attrs):
        note = attrs.get('note')
        due_date = attrs.get('due_date', getattr(self.instance, 'due_date', None))
        is_all_day = attrs.get('is_all_day', getattr(self.instance, 'is_all_day', False))
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)

        if due_date:
            current_minute = timezone.now().replace(second=0, microsecond=0)
            if is_all_day:
                if due_date < current_minute - timedelta(hours=24):
                    raise serializers.ValidationError({
                        'due_date': 'Due date cannot be in the past.'
                    })
            elif due_date < current_minute:
                raise serializers.ValidationError({
                    'due_date': 'Due date cannot be in the past.'
                })
        else:
            attrs['is_all_day'] = False

        if note and user and user.is_authenticated:
            if note.user_id != user.id or note.is_folder:
                raise serializers.ValidationError({
                    'note_id': 'Linked note does not exist.'
                })

        return attrs

    def _get_next_board_position(self, board_column):
        current_max = board_column.board_tasks.aggregate(max_position=Max('board_position'))['max_position']
        return (current_max if current_max is not None else -1) + 1

    def _sync_completed_at(self, instance):
        if instance.status == Task.STATUS_DONE and instance.completed_at is None:
            instance.completed_at = timezone.now()
            instance.save(update_fields=['completed_at', 'updated_at'])
        elif instance.status != Task.STATUS_DONE and instance.completed_at is not None:
            instance.completed_at = None
            instance.save(update_fields=['completed_at', 'updated_at'])

    def _sync_checklist_items(self, task, checklist_items):
        if checklist_items is None:
            return

        task.checklist_items.all().delete()
        TaskChecklistItem.objects.bulk_create([
            TaskChecklistItem(
                task=task,
                title=item['title'],
                is_completed=item.get('is_completed', False),
                position=index,
            )
            for index, item in enumerate(checklist_items)
        ])

    def create(self, validated_data):
        checklist_items = validated_data.pop('checklist_items', None)
        board_column = validated_data.get('board_column')
        validated_data['board_position'] = (
            self._get_next_board_position(board_column) if board_column else None
        )
        task = super().create(validated_data)
        self._sync_checklist_items(task, checklist_items)
        self._sync_completed_at(task)
        return task

    def update(self, instance, validated_data):
        checklist_items = validated_data.pop('checklist_items', None)
        if 'board_column' in validated_data:
            board_column = validated_data.get('board_column')
            if board_column is None:
                validated_data['board_position'] = None
            elif instance.board_column_id != board_column.id:
                validated_data['board_position'] = self._get_next_board_position(board_column)
        task = super().update(instance, validated_data)
        self._sync_checklist_items(task, checklist_items)
        self._sync_completed_at(task)
        return task
