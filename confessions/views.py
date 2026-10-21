import hashlib

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError, transaction
from django.db.models import BooleanField, Count, Exists, OuterRef, Q, Value
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST
from accounts.forms import CustomUserCreationForm
from .forms import ConfessionForm, contains_inappropriate_language
from .models import Confession, Reaction, Comment
# To this:
from .forms import ConfessionForm, CustomUserChangeForm

_CONFESSION_TONES = (
    'lime',
    'yellow',
    'blue',
    'pink',
    'lavender',
    'mint',
    'coral',
    'sky',
    'peach',
    'seafoam',
    'rose',
)


def _assign_confession_tones(confessions):
  used_tones = set()
  previous_tone = None

  for confession in confessions:
    tone_index = int.from_bytes(
        hashlib.sha256(str(confession.pk).encode('ascii')).digest()[:4],
        'big',
    ) % len(_CONFESSION_TONES)
    if len(used_tones) == len(_CONFESSION_TONES):
      used_tones.clear()

    for offset in range(len(_CONFESSION_TONES)):
      candidate = (tone_index + offset) % len(_CONFESSION_TONES)
      if candidate not in used_tones and candidate != previous_tone:
        tone_index = candidate
        break

    confession.tone_class = f'tone-{_CONFESSION_TONES[tone_index]}'
    used_tones.add(tone_index)
    previous_tone = tone_index

  return confessions


def signup_view(request):
  if request.method == 'POST':
    form = CustomUserCreationForm(request.POST)
    if form.is_valid():
      user = form.save()
      login(request, user)
      return redirect('wall')
  else:
    form = CustomUserCreationForm()
  return render(request, 'accounts/signup.html', {'form': form})


def _annotate_reactions(confessions, user):
  confessions = confessions.annotate(
      like_count=Count(
          'reactions',
          filter=Q(reactions__is_like=True),
          distinct=True,
      ),
      unlike_count=Count(
          'reactions',
          filter=Q(reactions__is_like=False),
          distinct=True,
      ),
  )
  if user.is_authenticated:
    confessions = confessions.annotate(
        has_liked=Exists(
            Reaction.objects.filter(
                confession_id=OuterRef('pk'),
                user=user,
                is_like=True,
            )
        ),
        has_unliked=Exists(
            Reaction.objects.filter(
                confession_id=OuterRef('pk'),
                user=user,
                is_like=False,
            )
        )
    )
  else:
    confessions = confessions.annotate(
        has_liked=Value(False, output_field=BooleanField()),
        has_unliked=Value(False, output_field=BooleanField()),
    )
  return confessions


def _create_confession(request):
  if not request.user.is_authenticated:
    return redirect('login')

  form = ConfessionForm(request.POST)
  if form.is_valid():
    confession = form.save(commit=False)
    confession.author = request.user
    confession.save()
    messages.success(request, 'Your confession was shared successfully.')
    return redirect('confession')

  return render(
      request,
      'confessions/confession.html',
      _confession_page_context(request, form),
  )


def _confession_page_context(request, form=None):
  approved_confessions = Confession.objects.filter(is_approved=True)
  activity = _community_activity_counts()
  confessions = list(
      _assign_confession_tones(
          _annotate_reactions(
              approved_confessions.order_by('-created_at'),
              request.user,
          )
      )
  )
  context = {
      'confessions': confessions,
      'latest_confession_id': max(
          (confession.pk for confession in confessions),
          default=0,
      ),
      'confession_count': activity['confession_count'],
      'reaction_count': activity['reaction_count'],
  }
  if request.user.is_authenticated:
    context['form'] = form if form is not None else ConfessionForm()
  return context


def _community_activity_counts():
  return Confession.objects.filter(is_approved=True).aggregate(
      confession_count=Count('pk', distinct=True),
      reaction_count=Count('reactions__pk', distinct=True),
  )


def wall_view(request):
  if request.method == 'POST':
    return _create_confession(request)

  return render(request, 'confessions/wall.html')


def confession_view(request):
  if request.method == 'POST':
    return _create_confession(request)

  return render(
      request,
      'confessions/confession.html',
      _confession_page_context(request),
  )


@require_GET
def confession_updates(request):
  try:
    after_id = int(request.GET.get('after', '0'))
  except ValueError:
    return HttpResponseBadRequest('Invalid confession cursor.')
  if after_id < 0:
    return HttpResponseBadRequest('Invalid confession cursor.')

  confessions = list(
      _assign_confession_tones(
          _annotate_reactions(
              Confession.objects.filter(
                  is_approved=True,
                  pk__gt=after_id,
              ).order_by('pk'),
              request.user,
          )
      )
  )
  if not confessions:
    return HttpResponse(status=204)

  return render(
      request,
      'confessions/includes/confession_updates.html',
      {
          'confessions': confessions,
          'latest_confession_id': confessions[-1].pk,
      },
  )


@require_GET
def activity_updates(request):
  return render(
      request,
      'confessions/includes/activity_updates.html',
      _community_activity_counts(),
  )


@require_GET
def reaction_updates(request):
  try:
    confession_ids = {
        int(value)
        for value in request.GET.getlist('confession_id')
    }
  except ValueError:
    return HttpResponseBadRequest('Invalid confession id.')

  if not confession_ids:
    return HttpResponse(status=204)

  visible_confessions = Confession.objects.filter(
      pk__in=confession_ids,
      is_approved=True,
  )
  if request.user.is_authenticated:
    visible_confessions = visible_confessions | Confession.objects.filter(
        pk__in=confession_ids,
        author=request.user,
    )

  confessions = list(
      _annotate_reactions(
          visible_confessions.order_by('pk'),
          request.user,
      )
  )
  if not confessions:
    return HttpResponse(status=204)

  return render(
      request,
      'confessions/includes/reaction_updates.html',
      {'confessions': confessions},
  )


@require_GET
def comment_list(request, confession_id):
  visible_confessions = Confession.objects.filter(is_approved=True)
  if request.user.is_authenticated:
    visible_confessions = visible_confessions | Confession.objects.filter(
        pk=confession_id,
        author=request.user,
    )
  confession = get_object_or_404(visible_confessions, pk=confession_id)
  return render(
      request,
      'confessions/includes/comment_list.html',
      {'confession': confession},
  )


@login_required
def profile_view(request):
  confessions = _assign_confession_tones(
      _annotate_reactions(
          Confession.objects.filter(author=request.user).order_by('-created_at'),
          request.user,
      )
  )
  return render(
      request,
      'accounts/profile.html',
      {
          'confessions': confessions,
          'confession_count': len(confessions),
      },
  )


@login_required
@require_POST
@transaction.atomic
def upvote_confession(request, pk):
  reaction_choice = request.POST.get('reaction')
  if reaction_choice not in ('like', 'unlike'):
    return JsonResponse({'error': 'Invalid reaction choice.'}, status=400)

  is_like = reaction_choice == 'like'
  confession = get_object_or_404(
      Confession.objects.select_for_update(),
      pk=pk,
  )
  reaction = Reaction.objects.filter(
      user=request.user,
      confession=confession,
  )
  current_reaction = reaction.first()

  if current_reaction and current_reaction.is_like == is_like:
    reaction.delete()
    current_choice = None
  else:
    try:
      with transaction.atomic():
        if current_reaction:
          current_reaction.is_like = is_like
          current_reaction.save(update_fields=('is_like',))
        else:
          Reaction.objects.create(
              user=request.user,
              confession=confession,
              is_like=is_like,
          )
      current_choice = reaction_choice
    except IntegrityError:
      current_reaction = reaction.first()
      if not current_reaction:
        raise
      current_reaction.is_like = is_like
      current_reaction.save(update_fields=('is_like',))
      current_choice = reaction_choice

  like_count = Reaction.objects.filter(
      confession=confession,
      is_like=True,
  ).count()
  unlike_count = Reaction.objects.filter(
      confession=confession,
      is_like=False,
  ).count()
  if request.headers.get('x-requested-with') == 'XMLHttpRequest':
    return JsonResponse({
        'upvotes': like_count,
        'like_count': like_count,
        'unlike_count': unlike_count,
        'reaction': current_choice,
        'liked': current_choice == 'like',
        'unliked': current_choice == 'unlike',
    })
  return redirect('confession')

@login_required
def update_profile(request):
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated successfully.')
            return redirect('profile')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
            return redirect('profile')
    return redirect('profile')

@require_POST
def add_comment(request, confession_id):
    confession = get_object_or_404(Confession, pk=confession_id)
    content = request.POST.get('content', '').strip()
    if not content:
        return HttpResponseBadRequest('Comment cannot be empty.')
    if contains_inappropriate_language(content):
        response = HttpResponseBadRequest(
            'Please remove inappropriate language before posting.'
        )
        response['X-Comment-Error'] = 'inappropriate_language'
        return response

    parent_id = request.POST.get('parent_id')
    parent_comment = None
    if parent_id:
        parent_comment = get_object_or_404(
            Comment,
            pk=parent_id,
            confession=confession,
            parent__isnull=True,
        )

    Comment.objects.create(
        author=request.user if request.user.is_authenticated else None,
        confession=confession,
        parent=parent_comment,
        content=content,
    )

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(
            request,
            'confessions/includes/comment_list.html',
            {'confession': confession},
        )

    target_id = f'comments-modal-{confession.pk}'
    return redirect(f'{reverse("confession")}#{target_id}')