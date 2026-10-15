from django.contrib.auth import views as auth_views
from django.urls import path
from . import forms, views  # Import forms as well

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='accounts/login.html',
            authentication_form=forms.CustomAuthenticationForm,
        ),
        name='login',
    ),
    path(
        'logout/',
        auth_views.LogoutView.as_view(next_page='wall'),
        name='logout',
    ),
]