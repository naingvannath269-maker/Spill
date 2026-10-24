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

  class Meta:
    model = CustomUser
    fields = ('email', 'username')  # Explicitly declare fields here

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    # Make username field optional so the system can auto-generate it if left blank
    self.fields['username'].required = False
    self.fields['username'].help_text = (
        format_html(
            '<span data-i18n="signup_username_optional">{}</span>',
            'Optional. Leave blank to auto-generate a username.',
        )
    )
    self.fields['password1'].help_text = self.password_help_text
    self.fields['password2'].help_text = format_html(
        '<span data-i18n="signup_password_confirmation_hint">{}</span>',
        'Enter the same password as before, for verification.',
    )

    # Add Bootstrap styling to form fields
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
      label='Email', widget=forms.EmailInput(attrs={'class': 'form-control'})
  )

  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.fields['password'].widget.attrs['class'] = 'form-control'