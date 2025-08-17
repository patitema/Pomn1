from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.notes_list, name='notes-list'),
    path('folders/', views.folders_list, name='folders-list'),
]
