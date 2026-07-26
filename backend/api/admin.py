from django.contrib import admin
from .models import (
    Link, Note, Profile, PushDeliveryAttempt, PushEvent, Status, Task,
    TaskBoardColumn, WebPushSubscription,
)

admin.site.register(Note)
admin.site.register(Link)
admin.site.register(Status)
admin.site.register(Task)
admin.site.register(TaskBoardColumn)
admin.site.register(Profile)


class ReadOnlyPushAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(WebPushSubscription)
class WebPushSubscriptionAdmin(ReadOnlyPushAdmin):
    list_display = (
        'id',
        'user',
        'created_at',
        'updated_at',
    )
    readonly_fields = list_display
    fields = readonly_fields
    search_fields = ('user__username',)


@admin.register(PushEvent)
class PushEventAdmin(ReadOnlyPushAdmin):
    list_display = (
        'id',
        'event_type',
        'user',
        'task',
        'created_at',
        'completed_at',
    )
    readonly_fields = list_display
    fields = readonly_fields
    list_filter = ('event_type',)
    search_fields = ('user__username', 'task__title')


@admin.register(PushDeliveryAttempt)
class PushDeliveryAttemptAdmin(ReadOnlyPushAdmin):
    list_display = (
        'id',
        'event',
        'status',
        'attempt_count',
        'last_http_status',
        'last_error_code',
        'sent_at',
        'updated_at',
    )
    readonly_fields = list_display
    fields = readonly_fields
    list_filter = ('status',)
