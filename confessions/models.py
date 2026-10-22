from accounts.models import CustomUser
from django.db import models


class Confession(models.Model):
  author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
  content = models.TextField(max_length=1000)
  created_at = models.DateTimeField(auto_now_add=True)
  is_approved = models.BooleanField(
      default=True
  )  # Set to False if you want manual moderation

  @property
  def main_comments(self):
    return (
        self.comments.filter(parent__isnull=True)
        .select_related('author')
        .prefetch_related('replies__author')
    )

  def __str__(self):
    return f'Confession by @{self.author.username} at {self.created_at}'


class Reaction(models.Model):
  user = models.ForeignKey(
      CustomUser,
      on_delete=models.CASCADE,
      related_name='confession_reactions',
  )
  confession = models.ForeignKey(
      Confession,
      on_delete=models.CASCADE,
      related_name='reactions',
  )
  is_like = models.BooleanField(default=True)

  class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=('user', 'confession'),
            name='unique_user_confession_reaction',
        ),
    ]

class Comment(models.Model):
    author = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='confession_comments',
    )
    confession = models.ForeignKey(
        Confession, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    # If parent is Null, it's a main comment. If parent is set, it's a reply!
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='replies'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    @property
    def is_reply(self):
        return self.parent is not None