from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.notes_list, name='notes-list'),
    path('notes/<int:pk>', views.note_detail, name='note-detail'),
    path('folders/', views.folders_list, name='folders-list'),
    path('folders/<int:pk>', views.folder_detail, name='folder-detail'),
]
