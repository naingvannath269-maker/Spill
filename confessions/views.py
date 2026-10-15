from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError, transaction
from django.db.models import BooleanField, Count, Exists, OuterRef, Q, Value
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST
from accounts.forms import CustomUserCreationForm
from .forms import ConfessionForm
from .models import Confession, Reaction


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
  activity = approved_confessions.aggregate(
      whisper_count=Count('pk', distinct=True),
      reaction_count=Count('reactions__pk', distinct=True),
  )
  context = {
      'confessions': _annotate_reactions(
          approved_confessions.order_by('-created_at'),
          request.user,
      ),
      'confession_count': activity['whisper_count'],
      'reaction_count': activity['reaction_count'],
  }
  if request.user.is_authenticated:
    context['form'] = form if form is not None else ConfessionForm()
  return context


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


@login_required
def profile_view(request):
  confessions = _annotate_reactions(
      Confession.objects.filter(author=request.user).order_by('-created_at'),
      request.user,
  )
  return render(
      request,
      'confessions/profile.html',
      {
          'confessions': confessions,
          'confession_count': confessions.count(),
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