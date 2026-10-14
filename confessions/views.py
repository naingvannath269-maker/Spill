from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
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


def wall_view(request):
  confessions = Confession.objects.filter(is_approved=True).order_by(
      '-created_at'
  ).annotate(
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
  if request.user.is_authenticated:
    confessions = confessions.annotate(
        has_liked=Exists(
            Reaction.objects.filter(
                confession_id=OuterRef('pk'),
                user=request.user,
                is_like=True,
            )
        ),
        has_unliked=Exists(
            Reaction.objects.filter(
                confession_id=OuterRef('pk'),
                user=request.user,
                is_like=False,
            )
        )
    )
  else:
    confessions = confessions.annotate(
        has_liked=Value(False, output_field=BooleanField()),
        has_unliked=Value(False, output_field=BooleanField()),
    )

  if request.method == 'POST':
    if not request.user.is_authenticated:
      return redirect('login')
    form = ConfessionForm(request.POST)
    if form.is_valid():
      confession = form.save(commit=False)
      confession.author = request.user
      confession.save()
      return redirect('wall')
  else:
    form = ConfessionForm()

  context = {'confessions': confessions, 'form': form}
  return render(request, 'confessions/wall.html', context)


@login_required
def upvote_view(request, confession_id):
    # If accessed via GET (e.g. after login redirect), send user back to the wall
    if request.method != 'POST':
        return redirect('wall')  # Replace 'wall' with your actual home/wall URL pattern name

    # Handle actual POST upvote logic here
    confession = get_object_or_404(Confession, id=confession_id)
    # ... your upvote logic ...
    
    return redirect('wall')
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
  return redirect('wall')