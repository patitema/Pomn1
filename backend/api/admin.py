from django.contrib import admin
from .models import Note, Link, Status, Task, Profile, FolderOld, NoteOld

admin.site.register(Note)
admin.site.register(Link)
admin.site.register(Status)
admin.site.register(Task)
admin.site.register(Profile)

# Старые модели (временно, для миграции)
admin.site.register(FolderOld)
admin.site.register(NoteOld)
