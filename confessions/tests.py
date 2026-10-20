import re

from django.test import TestCase
from django.test import override_settings
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.db import connection
from django.test.utils import CaptureQueriesContext

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

    self.assertRedirects(response, reverse('confession'))
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
        follow=True,
    )

    self.assertRedirects(response, reverse('confession'))
    self.assertContains(response, 'Your confession was shared successfully.')
    confession = Confession.objects.get()
    self.assertEqual(confession.author, self.user)
    self.assertEqual(confession.content, 'I am glad I shared this.')
    self.assertContains(response, confession.content)

  @override_settings(INAPPROPRIATE_WORDS=('badword',))
  def test_invalid_confession_reopens_modal_and_preserves_submitted_text(self):
    response = self.client.post(
        reverse('confession'),
        {'content': 'This is a BADWORD confession.'},
    )

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, 'data-auto-open="true"')
    self.assertContains(response, 'Please remove inappropriate language')
    self.assertContains(response, 'This is a BADWORD confession.')
    self.assertEqual(response.content.decode().count('id="confession-content"'), 1)

  def test_confession_page_uses_one_modal_form_for_both_entry_points(self):
    Confession.objects.create(
        author=self.user,
        content='Keep the empty-state link out of this modal test.',
    )
    response = self.client.get(reverse('confession'))

    self.assertContains(response, 'class="confession-modal"')
    self.assertContains(response, 'data-open-confession', count=2)
    self.assertContains(response, 'Write a confession')
    self.assertContains(response, 'class="floating-confess"')
    self.assertEqual(response.content.decode().count('id="confession-content"'), 1)
    self.assertContains(response, 'confessions/JS/confession-modal.js')
    self.assertContains(response, 'confessions/CSS/confession-modal.css')

  def test_confession_card_colors_are_individual_and_stable_on_all_card_pages(self):
    for index in range(13):
      Confession.objects.create(
          author=self.user,
          content=f'Color palette test confession {index}.',
      )

    def card_tones(response):
      card_classes = re.findall(
          r'class="(confession-bubble[^"]*)"',
          response.content.decode(),
      )
      return [
          tone
          for card_class in card_classes
          for tone in re.findall(r'\btone-[a-z]+\b', card_class)
      ]

    confession_response = self.client.get(reverse('confession'))
    profile_response = self.client.get(reverse('profile'))
    expected_tones = card_tones(confession_response)

    self.assertEqual(len(expected_tones), 13)
    self.assertEqual(len(set(expected_tones)), 11)
    self.assertTrue(
        all(first != second for first, second in zip(expected_tones, expected_tones[1:]))
    )
    self.assertEqual(card_tones(profile_response), expected_tones)
    self.assertEqual(
        card_tones(self.client.get(reverse('confession'))),
        expected_tones,
    )

    Confession.objects.create(
        author=self.user,
        content='A newly created confession gets its own tone.',
    )
    updated_tones = card_tones(self.client.get(reverse('confession')))
    self.assertEqual(len(updated_tones), 14)
    self.assertEqual(len(set(updated_tones)), 11)
    self.assertTrue(
        all(first != second for first, second in zip(updated_tones, updated_tones[1:]))
    )
    self.assertEqual(
        card_tones(self.client.get(reverse('confession'))),
        updated_tones,
    )

  def test_legacy_wall_submission_still_uses_existing_submission_flow(self):
    response = self.client.post(
        reverse('wall'),
        {'content': 'A whisper from the old form route.'},
    )

    self.assertRedirects(response, reverse('confession'))
    self.assertEqual(Confession.objects.get().author, self.user)

  def test_confession_page_is_public_but_only_authenticated_users_get_form(self):
    Confession.objects.create(
        author=self.user,
        content='A public whisper.',
    )
    self.client.logout()

    response = self.client.get(reverse('confession'))

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, 'A public whisper.')
    self.assertContains(response, f'href="{reverse("login")}?next=')
    self.assertNotContains(response, 'id="confession-content"')

    self.client.force_login(self.user)
    response = self.client.get(reverse('confession'))

    self.assertContains(response, 'id="confession-content"')


class ConfessionUpdatesTests(TestCase):
  def setUp(self):
    self.user = CustomUser.objects.create_user(
        email='updates@example.com',
        password='test-password',
    )

  def test_confession_page_polls_with_htmx_every_three_seconds(self):
    response = self.client.get(reverse('confession'))

    self.assertContains(response, 'hx-trigger="every 3s"')
    self.assertContains(response, 'hx-swap="afterbegin"')
    self.assertContains(response, 'https://unpkg.com/htmx.org@1.9.12')

  def test_updates_return_only_new_approved_confessions_and_advance_cursor(self):
    previous = Confession.objects.create(
        author=self.user,
        content='Already on the page.',
    )
    new_confession = Confession.objects.create(
        author=self.user,
        content='A new confession.',
    )
    Confession.objects.create(
        author=self.user,
        content='Waiting for approval.',
        is_approved=False,
    )

    response = self.client.get(
        reverse('confession_updates'),
        {'after': previous.pk},
    )

    self.assertEqual(response.status_code, 200)
    self.assertContains(response, 'A new confession.')
    self.assertNotContains(response, 'Already on the page.')
    self.assertNotContains(response, 'Waiting for approval.')
    self.assertContains(
        response,
        f'value="{new_confession.pk}"',
    )
    self.assertContains(response, 'hx-swap-oob="delete"')

  def test_updates_return_no_content_when_there_are_no_new_confessions(self):
    confession = Confession.objects.create(
        author=self.user,
        content='Already on the page.',
    )

    response = self.client.get(
        reverse('confession_updates'),
        {'after': confession.pk},
    )

    self.assertEqual(response.status_code, 204)

  def test_updates_reject_an_invalid_cursor(self):
    response = self.client.get(
        reverse('confession_updates'),
        {'after': 'not-a-number'},
    )

    self.assertEqual(response.status_code, 400)


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

    response = self.client.get(reverse('confession'))

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

  def test_authentication_pages_use_spill_branding(self):
    for route in ('login', 'signup'):
      with self.subTest(route=route):
        response = self.client.get(reverse(route))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'SPILL')
        self.assertContains(response, 'LET IT OUT, LEAVE YOUR NAME OUT.')
        self.assertContains(response, '<meta property="og:site_name" content="Spill"')

  def test_home_shows_empty_state_and_navigation(self):
    confession = Confession.objects.create(
        author=self.user,
        content='This must only appear on the confession page.',
    )

    with CaptureQueriesContext(connection) as queries:
      response = self.client.get(reverse('wall'))

    self.assertContains(response, 'Welcome to Spill')
    self.assertContains(response, 'Let it out, leave your name out.')
    self.assertContains(response, '<title>Spill — Let it out, leave your name out.</title>')
    self.assertContains(response, 'og:site_name" content="Spill')
    self.assertContains(response, 'spill.')
    self.assertContains(response, 'share your thoughts, feelings, and experiences')
    self.assertNotContains(response, confession.content)
    self.assertNotContains(response, 'Latest whispers')
    self.assertNotContains(response, 'Community activity')
    self.assertNotContains(response, 'confession-content')
    self.assertContains(response, reverse('confession'))
    self.assertContains(response, reverse('profile'))
    self.assertContains(response, reverse('login'))
    self.assertContains(response, reverse('signup'))
    self.assertFalse(
        any(Confession._meta.db_table.lower() in query['sql'].lower() for query in queries),
        'Home page should not query confession records.',
    )

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

  def test_confession_page_displays_each_confession_author_username(self):
    own_confession = Confession.objects.create(
        author=self.user,
        content='First author confession.',
    )
    other_confession = Confession.objects.create(
        author=self.other_user,
        content='Second author confession.',
    )

    response = self.client.get(reverse('confession'))
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
