from django.contrib import admin
<<<<<<< Updated upstream
from .models import Confession

admin.site.register(Confession)
=======
from .models import Confession, Comment
from django.utils.html import format_html


# @admin.register(Confession)
# class ConfessionAdmin(admin.ModelAdmin):
#   list_display = ('__str__', 'content')


# admin.site.register(Comment)

@admin.register(Confession)
class ConfessionAdmin(admin.ModelAdmin):
    list_display = ('id_link', 'clickable_content', 'created_at')
    search_fields = ('content',)
    list_filter = ('created_at',)
    list_per_page = 20
    
    # This removes the "Delete selected" dropdown to prevent the "No action selected" warning
    actions = None 

    def id_link(self, obj):
        return format_html('<a href="/admin/confessions/confession/{}/change/"><b>{}</b></a>', obj.id, obj.id)
    id_link.short_description = 'ID'

    def clickable_content(self, obj):
        if obj.content:
            snippet = obj.content[:120] + "..." if len(obj.content) > 120 else obj.content
            # Wrap the text in an <a> tag so it's a clickable link
            return format_html('<a href="/admin/confessions/confession/{}/change/" style="color: #333; text-decoration: none;">{}</a>', obj.id, snippet)
        return "-"
    clickable_content.short_description = 'Content Preview'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # 1. Columns to show
    list_display = ('author_username', 'comment_snippet', 'confession_link', 'created_at')
    
    # 2. Search fields (IMPORTANT: Change 'author' to your actual user field name)
    # I changed 'text' to 'content' assuming your comment text field is called 'content'
    search_fields = ('author__username', 'content', 'confession__content')
    
    # 3. Filters
    list_filter = ('created_at',)

    # 4. Show the author's username
    def author_username(self, obj):
        # CHANGE 'author' to your actual ForeignKey field name (e.g., 'user', 'created_by')
        if obj.author: 
            return obj.author.username
        return "Anonymous"
    author_username.short_description = 'User'

    # 5. Show a truncated version of the comment text
    def comment_snippet(self, obj):
        # CHANGE 'content' to whatever your actual comment text field is named
        text_content = str(obj.content) 
        if len(text_content) > 50:
            return f"{text_content[:50]}..."
        return text_content
    comment_snippet.short_description = 'Comment'

    # 6. Show a clickable link to the Confession
    def confession_link(self, obj):
        if obj.confession:
            return format_html('<a href="/admin/confessions/confession/{}/change/">{}</a>', 
                               obj.confession.id, 
                               str(obj.confession)[:30] + "...")
        return "-"
    confession_link.short_description = 'Confession'
>>>>>>> Stashed changes
