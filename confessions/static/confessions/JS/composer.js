document.addEventListener('DOMContentLoaded', function () {
  const avatarColors = [
    '#2563eb',
    '#7c3aed',
    '#c026d3',
    '#db2777',
    '#dc2626',
    '#ea580c',
    '#059669',
    '#0d9488',
  ];

  document.querySelectorAll('.avatar-placeholder[data-username]').forEach(
      function (avatar) {
        const username = avatar.dataset.username.toLowerCase();
        const colorIndex = Array.from(username).reduce(
            (hash, character) => (hash * 31 + character.codePointAt(0)) >>> 0,
            0,
        ) % avatarColors.length;
        avatar.style.setProperty(
            '--avatar-background',
            avatarColors[colorIndex],
        );
      },
  );

  const simpleTrigger = document.getElementById('simple-trigger');
  const expandedComposer = document.getElementById('expanded-composer');
  const textarea = document.getElementById('confession-content');
  const submitPanel = document.getElementById('submit-whisper');

  if (simpleTrigger && expandedComposer && textarea) {

    // 1. Click the simple view -> show the form
    simpleTrigger.addEventListener('click', function () {
      simpleTrigger.style.display = 'none';
      expandedComposer.style.display = 'block';
      textarea.focus();
    });

    // 2. Click away from textarea -> hide form if empty
    textarea.addEventListener('blur', function () {
      setTimeout(() => {
        if (textarea.value.trim() === "") {
          expandedComposer.style.display = 'none';
          simpleTrigger.style.display = 'flex';
        }
      }, 200);
    });

    // 3. Click outside the whole panel -> hide form if empty
    document.addEventListener('click', function (event) {
      if (!submitPanel.contains(event.target) && textarea.value.trim() === "") {
        expandedComposer.style.display = 'none';
        simpleTrigger.style.display = 'flex';
      }
    });
  }
});