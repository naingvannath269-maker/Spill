import re
import unicodedata

from django import forms
from django.conf import settings

from .models import Confession

from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

class ConfessionForm(forms.ModelForm):
  class Meta:
    model = Confession
    fields = ['content']
    widgets = {
        'content': forms.Textarea(
            attrs={
                'class': 'form-control',
                'rows': 3,
                'maxlength': 500,
                'placeholder': 'Type your confession here... (keep it kind)',
                'id': 'confession-content',
            }
        ),
    }

  def clean_content(self):
    content = self.cleaned_data['content']
    normalized_content = unicodedata.normalize('NFKC', content).casefold()

    for blocked_word in settings.INAPPROPRIATE_WORDS:
      normalized_word = unicodedata.normalize('NFKC', blocked_word).casefold()
      if not normalized_word:
        continue
      word_pattern = r'[^\w\s]*'.join(
          re.escape(character) for character in normalized_word
      )
      if re.search(rf'(?<!\w){word_pattern}(?!\w)', normalized_content):
        raise forms.ValidationError(
            'Please remove inappropriate language before posting.'
        )

    return content

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