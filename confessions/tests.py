from django.test import TestCase
from django.test import override_settings
from django.db import IntegrityError, transaction
from django.urls import reverse

from accounts.models import CustomUser
from .models import Confession, Reaction


class ConfessionSubmissionTests(TestCase):
  def setUp(self):
    self.user = CustomUser.objects.create_user(
        email='submitter@example.com',
        password='test-password',
    )
    self.client.force_login(self.user)

  @override_settings(INAPPROPRIATE_WORDS=('badword',))
  def test_confession_with_blocked_word_is_rejected_without_saving(self):
    response = self.client.post(
        reverse('confession'),
        {'content': 'This is a BADWORD confession.'},
    )

    self.assertEqual(response.status_code, 200)
    self.assertEqual(Confession.objects.count(), 0)
    self.assertContains(
        response,
        'Please remove inappropriate language before posting.',
    )
    self.assertContains(response, 'This is a BADWORD confession.')
    self.assertContains(response, 'id="confession-content"')

  @override_settings(INAPPROPRIATE_WORDS=('badword',))
  def test_blocked_word_inside_another_word_is_allowed(self):
    response = self.client.post(
        reverse('confession'),
        {'content': 'This story is about a badworded name.'},
    )

    self.assertRedirects(response, reverse('wall'))
    self.assertEqual(
        Confession.objects.get().content,
        'This story is about a badworded name.',
    )

  @override_settings(INAPPROPRIATE_WORDS=('badword',))
  def test_punctuation_cannot_be_used_to_bypass_word_filter(self):
    response = self.client.post(
        reverse('confession'),
        {'content': 'This is a b.a.d.w.o.r.d confession.'},
    )

    self.assertEqual(response.status_code, 200)
    self.assertEqual(Confession.objects.count(), 0)

  def test_confession_page_saves_using_existing_form_and_author(self):
    response = self.client.post(
        reverse('confession'),
        {'content': 'I am glad I shared this.'},
    )

    self.assertRedirects(response, reverse('wall'))
    confession = Confession.objects.get()
    self.assertEqual(confession.author, self.user)
    self.assertEqual(confession.content, 'I am glad I shared this.')

  def test_legacy_wall_submission_still_uses_existing_submission_flow(self):
    response = self.client.post(
        reverse('wall'),
        {'content': 'A whisper from the old form route.'},
    )

    self.assertRedirects(response, reverse('wall'))
    self.assertEqual(Confession.objects.get().author, self.user)

  def test_confession_page_requires_login(self):
    self.client.logout()

    response = self.client.get(reverse('confession'))

    self.assertRedirects(
        response,
        f"{reverse('login')}?next={reverse('confession')}",
    )


class ReactionTests(TestCase):
  def setUp(self):
    self.user = CustomUser.objects.create_user(
        email='first@example.com',
        password='test-password',
    )
    self.confession = Confession.objects.create(
        author=self.user,
        content='A test confession',
    )
    self.client.force_login(self.user)

  def test_like_and_unlike_are_separate_mutually_exclusive_choices(self):
    url = reverse('upvote', args=[self.confession.pk])

    liked_response = self.client.post(
        url,
        {'reaction': 'like'},
        HTTP_X_REQUESTED_WITH='XMLHttpRequest',
    )
    self.assertEqual(liked_response.status_code, 200)
    self.assertEqual(
        liked_response.json(),
        {
            'upvotes': 1,
            'like_count': 1,
            'unlike_count': 0,
            'reaction': 'like',
            'liked': True,
            'unliked': False,
        },
    )
    self.assertEqual(Reaction.objects.filter(confession=self.confession).count(), 1)

    unlike_response = self.client.post(
        url,
        {'reaction': 'unlike'},
        HTTP_X_REQUESTED_WITH='XMLHttpRequest',
    )
    self.assertEqual(unlike_response.status_code, 200)
    self.assertEqual(
        unlike_response.json(),
        {
            'upvotes': 0,
            'like_count': 0,
            'unlike_count': 1,
            'reaction': 'unlike',
            'liked': False,
            'unliked': True,
        },
    )
    reaction = Reaction.objects.get(confession=self.confession)
    self.assertFalse(reaction.is_like)

    cleared_response = self.client.post(
        url,
        {'reaction': 'unlike'},
        HTTP_X_REQUESTED_WITH='XMLHttpRequest',
    )
    self.assertIsNone(cleared_response.json()['reaction'])
    self.assertFalse(Reaction.objects.filter(confession=self.confession).exists())

  def test_invalid_reaction_choice_is_rejected(self):
    response = self.client.post(
        reverse('upvote', args=[self.confession.pk]),
        {'reaction': 'heart'},
        HTTP_X_REQUESTED_WITH='XMLHttpRequest',
    )

    self.assertEqual(response.status_code, 400)

  def test_user_can_like_own_confession(self):
    response = self.client.post(
        reverse('upvote', args=[self.confession.pk]),
        {'reaction': 'like'},
        HTTP_X_REQUESTED_WITH='XMLHttpRequest',
    )

    self.assertEqual(response.json()['liked'], True)
    self.assertTrue(
        Reaction.objects.filter(
            user=self.user,
            confession=self.confession,
        ).exists()
    )

  def test_database_rejects_duplicate_user_confession_reaction(self):
    Reaction.objects.create(user=self.user, confession=self.confession)

    with self.assertRaises(IntegrityError), transaction.atomic():
      Reaction.objects.create(user=self.user, confession=self.confession)

  def test_wall_renders_user_like_state_and_unique_count(self):
    Reaction.objects.create(user=self.user, confession=self.confession)

    response = self.client.get(reverse('wall'))

    self.assertContains(
        response,
        f'@{self.user.username}</span',
    )
    self.assertContains(response, 'Community activity')
    self.assertContains(response, 'class="reaction-button like-button selected"')
    self.assertContains(
        response,
        '<span class="reaction-count like-count">1</span>',
    )
    self.assertContains(response, 'class="reaction-button unlike-button"')
    self.assertContains(
        response,
        '<span class="reaction-count unlike-count">0</span>',
    )
    self.assertContains(
        response,
        '<button type="button" class="comment-button">Comment and Reply</button>',
    )


class HomeAndProfileTests(TestCase):
  def setUp(self):
    self.user = CustomUser.objects.create_user(
        email='profile@example.com',
        password='test-password',
    )
    self.other_user = CustomUser.objects.create_user(
        email='other@example.com',
        password='test-password',
    )

  def test_home_shows_empty_state_and_navigation(self):
    response = self.client.get(reverse('wall'))

    self.assertContains(response, 'Welcome to Whisper')
    self.assertContains(response, 'The wall is quiet')
    self.assertContains(response, reverse('confession'))
    self.assertContains(response, reverse('profile'))
    self.assertContains(response, reverse('login'))
    self.assertContains(response, reverse('signup'))

  def test_profile_only_shows_signed_in_users_confessions_and_private_details(self):
    own_confession = Confession.objects.create(
        author=self.user,
        content='Only my own confession history.',
    )
    Confession.objects.create(
        author=self.other_user,
        content='Another account private history.',
    )
    self.client.force_login(self.user)

    response = self.client.get(reverse('profile'))

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, self.user.username)
    self.assertContains(response, self.user.email)
    self.assertContains(response, own_confession.content)
    self.assertNotContains(response, 'Another account private history.')
    self.assertContains(response, 'Logout')
    self.assertContains(response, 'Your confessions remain anonymous')

  def test_profile_requires_login(self):
    response = self.client.get(reverse('profile'))

    self.assertRedirects(
        response,
        f"{reverse('login')}?next={reverse('profile')}",
    )

  def test_home_displays_each_confession_author_username(self):
    own_confession = Confession.objects.create(
        author=self.user,
        content='First author confession.',
    )
    other_confession = Confession.objects.create(
        author=self.other_user,
        content='Second author confession.',
    )

    response = self.client.get(reverse('wall'))
    page = response.content.decode()

    for confession, author in (
        (own_confession, self.user),
        (other_confession, self.other_user),
    ):
      post_markup = next(
          part for part in page.split('<article') if confession.content in part
      )
      self.assertIn(
          f'@{author.username}</span',
          post_markup,
      )
