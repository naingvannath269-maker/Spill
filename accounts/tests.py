from django.test import TestCase
from django.urls import reverse

from .forms import CustomUserCreationForm
from .models import CustomUser


class CustomUserUsernameGenerationTests(TestCase):
  def test_signup_help_text_has_translation_keys(self):
    form = CustomUserCreationForm()

    self.assertIn(
        'data-i18n="signup_username_optional"',
        str(form.fields['username'].help_text),
    )
    for key in (
        'signup_password_similarity',
        'signup_password_min_length',
        'signup_password_common',
        'signup_password_numeric',
    ):
      with self.subTest(key=key):
        self.assertIn(key, str(form.fields['password1'].help_text))
    self.assertIn(
        'data-i18n="signup_password_confirmation_hint"',
        str(form.fields['password2'].help_text),
    )

  def test_manager_generates_numeric_anonymous_username(self):
    user = CustomUser.objects.create_user(
        email='numeric@example.com',
        password='test-password',
    )

    self.assertEqual(user.username, 'anonymous_1')

  def test_manager_increments_numeric_username_when_suffix_is_taken(self):
    CustomUser.objects.create_user(
        email='first@example.com',
        password='test-password',
        username='anonymous_1',
    )

    user = CustomUser.objects.create_user(
        email='second@example.com',
        password='test-password',
    )

    self.assertEqual(user.username, 'anonymous_2')

  def test_signup_form_uses_numeric_anonymous_username_generation(self):
    form = CustomUserCreationForm(data={
        'email': 'signup@example.com',
        'username': '',
        'password1': 'test-password',
        'password2': 'test-password',
    })
    self.assertTrue(form.is_valid(), form.errors)

    user = form.save()

    self.assertEqual(user.username, 'anonymous_1')


class CustomUserAdminPrivacyTests(TestCase):
  def setUp(self):
    self.admin_user = CustomUser.objects.create_user(
        email='admin@example.com',
        password='test-password',
        username='adminuser',
        is_staff=True,
        is_superuser=True,
    )
    self.user = CustomUser.objects.create_user(
        email='private@example.com',
        password='test-password',
        username='privateuser',
    )
    self.client.force_login(self.admin_user)

  def test_user_admin_list_shows_username_without_email(self):
    response = self.client.get(reverse('admin:accounts_customuser_changelist'))

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, self.user.username)
    self.assertNotContains(response, self.user.email)

  def test_user_admin_detail_shows_only_username(self):
    response = self.client.get(
        reverse('admin:accounts_customuser_change', args=(self.user.pk,))
    )

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, self.user.username)
    self.assertNotContains(response, self.user.email)

  def test_user_admin_does_not_allow_adding_users(self):
    response = self.client.get(reverse('admin:accounts_customuser_add'))

    self.assertEqual(response.status_code, 403)
