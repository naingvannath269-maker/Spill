from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Comment, Confession

@admin.register(Confession)
class ConfessionAdmin(admin.ModelAdmin):
    list_display = ('id_link', 'clickable_content', 'created_at')
    search_fields = ('content',)
    list_filter = ('created_at',)
    list_per_page = 20
    actions = None

    def id_link(self, obj):
        url = reverse('admin:confessions_confession_change', args=[obj.pk])
        return format_html('<a href="{}"><b>{}</b></a>', url, obj.pk)
    id_link.short_description = 'ID'

    def clickable_content(self, obj):
        if not obj.content:
            return '-'
        snippet = obj.content[:120] + '...' if len(obj.content) > 120 else obj.content
        url = reverse('admin:confessions_confession_change', args=[obj.pk])
        return format_html('<a href="{}" style="color: #333; text-decoration: none;">{}</a>', url, snippet)
    clickable_content.short_description = 'Content Preview'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author_username', 'comment_snippet', 'confession_link', 'created_at')
    search_fields = ('author__username', 'text', 'confession__content')
    list_filter = ('created_at',)

    @admin.display(description='User')
    def author_username(self, obj):
        return obj.author.username if obj.author else 'Anonymous'

    @admin.display(description='Comment')
    def comment_snippet(self, obj):
        text = str(obj.content)
        return f'{text[:50]}...' if len(text) > 50 else text

    @admin.display(description='Confession')
    def confession_link(self, obj):
        if not obj.confession:
            return '-'
        url = reverse('admin:confessions_confession_change', args=[obj.confession_id])
        label = str(obj.confession)[:30] + '...'
        return format_html('<a href="{}">{}</a>', url, label)