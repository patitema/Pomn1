from django.urls import path
from . import push_views, views

urlpatterns = [
    path('notes/', views.notes_list, name='notes-list'),
    path('notes/<int:pk>/', views.note_detail, name='note-detail'),
    path('folders/', views.folders_list, name='folders-list'),
    path('folders/<int:pk>/', views.folder_detail, name='folder-detail'),
    path('links/', views.links_list, name='links-list'),
    path('links/<int:pk>/', views.link_detail, name='link-detail'),
    path('tasks/', views.tasks_list, name='tasks-list'),
    path('tasks/<int:pk>/', views.task_detail, name='task-detail'),
    path(
        'tasks/<int:pk>/move-to-board-column/',
        views.move_task_to_board_column,
        name='task-move-to-board-column',
    ),
    path(
        'task-board/columns/',
        views.task_board_columns_list,
        name='task-board-columns-list',
    ),
    path(
        'task-board/columns/<int:pk>/',
        views.task_board_column_detail,
        name='task-board-column-detail',
    ),
    path('register/', views.register, name='register'),
    path(
        'password-reset/request/',
        views.password_reset_request,
        name='password-reset-request',
    ),
    path(
        'password-reset/confirm/',
        views.password_reset_confirm,
        name='password-reset-confirm',
    ),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('current-user/', views.current_user, name='current-user'),
    path('update-profile/', views.update_profile, name='update-profile'),
    path(
        'push/settings/',
        push_views.push_settings,
        name='push-settings',
    ),
    path(
        'push/subscriptions/',
        push_views.push_subscriptions,
        name='push-subscriptions',
    ),
    path(
        'push/unsubscribe/',
        push_views.push_unsubscribe,
        name='push-unsubscribe',
    ),
]
