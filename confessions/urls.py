from django.urls import path
from . import views

urlpatterns = [
    path('', views.wall_view, name='wall'),
    path('confession/', views.confession_view, name='confession'),
    path('profile/', views.profile_view, name='profile'),
    path('upvote/<int:pk>/', views.upvote_confession, name='upvote'),
]