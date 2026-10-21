from django.test import TestCase
from django.urls import reverse

from .models import CustomUser


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
