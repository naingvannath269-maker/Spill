from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils.html import format_html
from .models import CustomUser, generate_anonymous_username


class CustomUserCreationForm(UserCreationForm):
  password_help_text = format_html(
      '<ul>'
      '<li data-i18n="signup_password_similarity">{}</li>'
      '<li data-i18n="signup_password_min_length">{}</li>'
      '<li data-i18n="signup_password_common">{}</li>'
      '<li data-i18n="signup_password_numeric">{}</li>'
      '</ul>',
      'Your password can’t be too similar to your other personal information.',
      'Your password must contain at least 8 characters.',
      'Your password can’t be a commonly used password.',
      'Your password can’t be entirely numeric.',
  )

  error_messages = {
      'password_mismatch': 'Passwords do not match.',
      'duplicate_email': 'This email is already registered.',
      'duplicate_username': 'This username is already taken.',
  }

  class Meta:
    model = CustomUser
    fields = ('email', 'username')

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.fields['username'].required = False
    self.fields['username'].widget.attrs['placeholder'] = 'Do not use your real name.'
    self.fields['username'].widget.attrs['data-i18n-placeholder'] = 'signup_username_placeholder'
    self.fields['username'].help_text = (
        format_html(
            '<span data-i18n="signup_username_optional">{}</span>',
            'Optional. Leave blank to auto-generate a username.',
        )
    )
    self.fields['email'].error_messages = {
        'required': 'Please enter your email.',
        'invalid': 'Invalid email address.',
    }
    self.fields['username'].error_messages = {
        'required': 'Please enter a username.',
    }
    self.fields['password1'].error_messages = {
        'required': 'Please enter a password.',
    }
    self.fields['password2'].error_messages = {
        'required': 'Please confirm your password.',
        'password_mismatch': 'Passwords do not match.',
    }
    self.fields['password1'].help_text = self.password_help_text
    self.fields['password2'].help_text = format_html(
        '<span data-i18n="signup_password_confirmation_hint">{}</span>',
        'Enter the same password as before, for verification.',
    )

    for field_name, field in self.fields.items():
      field.widget.attrs['class'] = 'form-control'

  def save(self, commit=True):
    user = super().save(commit=False)
    if not user.username:
      user.username = generate_anonymous_username()
    if commit:
      user.save()
    return user


class CustomAuthenticationForm(AuthenticationForm):
  username = forms.EmailField(
      label='Email',
      widget=forms.EmailInput(attrs={'class': 'form-control'}),
      error_messages={
          'required': 'Please enter your email.',
          'invalid': 'Invalid email address.',
      },
  )

  error_messages = {
      'invalid_login': 'Invalid email or password.',
      'inactive': 'This account is inactive.',
  }

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.fields['password'].widget.attrs['class'] = 'form-control'
    self.fields['password'].error_messages = {
        'required': 'Please enter your password.',
    }