import re
import unicodedata

from django import forms
from django.conf import settings

from .models import Confession


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