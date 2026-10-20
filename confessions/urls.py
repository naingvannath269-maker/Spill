from django.urls import path
from . import views

urlpatterns = [
    path('', views.wall_view, name='wall'),
    path('confession/', views.confession_view, name='confession'),
    path('confession/updates/', views.confession_updates, name='confession_updates'),
    path('profile/', views.profile_view, name='profile'),
    path('upvote/<int:pk>/', views.upvote_confession, name='upvote'),
    path('profile/update/', views.update_profile, name='update_profile'),
]