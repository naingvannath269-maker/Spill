import re
import unicodedata

from django import forms
from django.conf import settings

from .models import Confession

from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


def contains_inappropriate_language(content):
  normalized_content = unicodedata.normalize('NFKC', content).casefold()

  for blocked_word in settings.INAPPROPRIATE_WORDS:
    normalized_word = unicodedata.normalize('NFKC', blocked_word).casefold()
    if not normalized_word:
      continue
    word_pattern = r'[^\w\s]*'.join(
        re.escape(character) for character in normalized_word
    )
    is_khmer_word = any(
        unicodedata.name(character, '').startswith('KHMER ')
        for character in normalized_word
    )
    if is_khmer_word:
      matches = re.search(word_pattern, normalized_content)
    else:
      matches = re.search(
          rf'(?<!\w){word_pattern}(?!\w)',
          normalized_content,
      )
    if matches:
      return True

  return False


class ConfessionForm(forms.ModelForm):
  class Meta:
    model = Confession
    fields = ['content']
    widgets = {
        'content': forms.Textarea(
            attrs={
                'class': 'form-control',
                'rows': 3,
                'maxlength': 1000,
                'placeholder': 'Type your confession here... (keep it kind)',
                'data-i18n-placeholder': 'placeholder_confession',
                'id': 'confession-content',
            }
        ),
    }

  def clean_content(self):
    content = self.cleaned_data['content']
    if contains_inappropriate_language(content):
      raise forms.ValidationError(
          'Please remove inappropriate language before posting.',
          code='inappropriate_language',
      )

    return content

  @property
  def content_errors_with_codes(self):
    errors = self.errors.as_data().get('content', [])
    return [
        {'message': message, 'code': error.code}
        for message, error in zip(self.errors.get('content', []), errors)
    ]

class CustomUserChangeForm(forms.ModelForm):
    current_password = forms.CharField(widget=forms.PasswordInput, required=False)
    new_password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = get_user_model()
        fields = ('username', 'email')

    def clean_current_password(self):
        current_password = self.cleaned_data.get('current_password')
        if current_password and not self.instance.check_password(current_password):
            raise ValidationError("Your current password was entered incorrectly.")
        return current_password

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('new_password') and not cleaned_data.get('current_password'):
            self.add_error('current_password', 'You must enter your current password to set a new one.')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        new_password = self.cleaned_data.get('new_password')
        if new_password:
            user.set_password(new_password)
        if commit:
            user.save()
        return user