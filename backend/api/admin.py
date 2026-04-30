from django.contrib import admin
from .models import Note, Link, Status, Task, Profile

admin.site.register(Note)
admin.site.register(Link)
admin.site.register(Status)
admin.site.register(Task)
admin.site.register(Profile)
