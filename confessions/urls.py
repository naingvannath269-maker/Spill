from django.urls import path
from . import views

urlpatterns = [
    path('', views.wall_view, name='wall'),
    path('confession/', views.confession_view, name='confession'),
    path('confession/updates/', views.confession_updates, name='confession_updates'),
    path('confession/reactions/', views.reaction_updates, name='reaction_updates'),
    path('confession/activity/', views.activity_updates, name='activity_updates'),
    path(
        'confession/<int:confession_id>/comments/',
        views.comment_list,
        name='comment_list',
    ),
    path('profile/', views.profile_view, name='profile'),
    path('upvote/<int:pk>/', views.upvote_confession, name='upvote'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('confession/<int:confession_id>/comment/', views.add_comment, name='add_comment'),
]