from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from django.contrib.admin.models import LogEntry
from django.urls import reverse, NoReverseMatch
from django.utils.html import format_html


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('username',)
    readonly_fields = ('username', 'email', 'password', 'last_login', 'date_joined')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff or request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff or request.user.is_superuser

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(is_staff=False, is_superuser=False)
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = (
        'action_time', 'user', 'content_type', 'object_link',
        'action_flag_display', 'change_message_short',
    )
    list_filter = ('action_flag', 'content_type', 'user')
    search_fields = ('object_repr', 'change_message', 'user__username', 'user__email')
    date_hierarchy = 'action_time'
    list_per_page = 50

    # ---- Read-only: nobody can edit history ----
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    # ---- Nicer columns ----
    def action_flag_display(self, obj):
        labels = {1: '➕ Added', 2: '✏️ Changed', 3: '🗑️ Deleted'}
        colors = {1: '#28a745', 2: '#ffc107', 3: '#dc3545'}
        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            colors.get(obj.action_flag, '#000'),
            labels.get(obj.action_flag, str(obj.action_flag)),
        )
    action_flag_display.short_description = 'Action'
    action_flag_display.admin_order_field = 'action_flag'

    def object_link(self, obj):
        """Link directly to the object that was changed."""
        if not obj.object_id:
            return obj.object_repr or '-'
        try:
            url = reverse(
                f'admin:{obj.content_type.app_label}_{obj.content_type.model}_change',
                args=[obj.object_id],
            )
            return format_html('<a href="{}">{}</a>', url, obj.object_repr)
        except NoReverseMatch:
            return obj.object_repr
    object_link.short_description = 'Object'
    object_link.admin_order_field = 'object_repr'

    def change_message_short(self, obj):
        """Trim the JSON so the table stays readable."""
        if not obj.change_message:
            return '-'
        msg = obj.change_message
        return (msg[:80] + '…') if len(msg) > 80 else msg
    change_message_short.short_description = 'Changes' 
admin.site.register(CustomUser)