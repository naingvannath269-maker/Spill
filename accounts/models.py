import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
  """Custom manager for CustomUser where email is the unique identifier

  for login instead of usernames.
  """

  def create_user(self, email, password=None, **extra_fields):
    if not email:
      raise ValueError('The Email field must be set')
    email = self.normalize_email(email)

    # Auto generate username if not provided
    if not extra_fields.get('username'):
      email_prefix = email.split('@')[0]
      random_digits = random.randint(1000, 9999)
      base_username = f'{email_prefix}_{random_digits}'
      while CustomUser.objects.filter(username=base_username).exists():
        random_digits = random.randint(1000, 9999)
        base_username = f'{email_prefix}_{random_digits}'
      extra_fields['username'] = base_username

    user = self.model(email=email, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_superuser(self, email, password=None, **extra_fields):
    extra_fields.setdefault('is_staff', True)
    extra_fields.setdefault('is_superuser', True)
    extra_fields.setdefault('is_active', True)

    if extra_fields.get('is_staff') is not True:
      raise ValueError('Superuser must have is_staff=True.')
    if extra_fields.get('is_superuser') is not True:
      raise ValueError('Superuser must have is_superuser=True.')

    return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
  email = models.EmailField(unique=True)
  username = models.CharField(max_length=150, unique=True, blank=True)

  objects = CustomUserManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = []  # No extra fields required for createsuperuser besides email & password

  def __str__(self):
    return self.username