from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
  list_display = ('username',)
  search_fields = ('username',)
  fields = ('username',)

  def has_add_permission(self, request):
    return False