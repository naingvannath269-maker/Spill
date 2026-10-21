from django.contrib import admin
from .models import Confession, Comment


@admin.register(Confession)
class ConfessionAdmin(admin.ModelAdmin):
  list_display = ('__str__', 'content')


admin.site.register(Comment)