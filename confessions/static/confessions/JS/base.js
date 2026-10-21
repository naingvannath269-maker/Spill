const primaryNav = document.querySelector(".site-nav__links");
if (primaryNav) {
  const primaryLinks = Array.from(primaryNav.querySelectorAll("a"));
  const activeLink = primaryNav.querySelector('a[aria-current="page"]');
  const navigationStorageKey = "previousPrimaryNavIndex";
  let previousIndex = null;

  try {
    const storedIndex = sessionStorage.getItem(navigationStorageKey);
    if (storedIndex !== null) {
      previousIndex = Number(storedIndex);
    }
    sessionStorage.removeItem(navigationStorageKey);
  } catch (error) {
    console.warn("Unable to restore the previous navigation item.", error);
  }

  primaryLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      try {
        sessionStorage.setItem(navigationStorageKey, String(index));
      } catch (error) {
        console.warn("Unable to save the previous navigation item.", error);
      }
    });
  });

  if (activeLink) {
    const activeIndex = primaryLinks.indexOf(activeLink);
    const setIndicatorPosition = (link) => {
      const navBounds = primaryNav.getBoundingClientRect();
      const linkBounds = link.getBoundingClientRect();
      primaryNav.style.setProperty(
        "--active-link-x",
        `${linkBounds.left - navBounds.left}px`,
      );
      primaryNav.style.setProperty(
        "--active-link-y",
        `${linkBounds.top - navBounds.top}px`,
      );
      primaryNav.style.setProperty(
        "--active-link-width",
        `${linkBounds.width}px`,
      );
      primaryNav.style.setProperty(
        "--active-link-height",
        `${linkBounds.height}px`,
      );
    };

    const previousLink =
      Number.isInteger(previousIndex) &&
      previousIndex >= 0 &&
      previousIndex < primaryLinks.length &&
      previousIndex !== activeIndex
        ? primaryLinks[previousIndex]
        : null;

    if (previousLink) {
      setIndicatorPosition(previousLink);
      primaryNav.classList.add("has-active-link");
      primaryNav.getBoundingClientRect();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          primaryNav.classList.add("is-transitioning");
          setIndicatorPosition(activeLink);
        });
      });
    } else {
      setIndicatorPosition(activeLink);
      primaryNav.classList.add("has-active-link");
    }

    window.addEventListener("resize", () => setIndicatorPosition(activeLink));
    document.addEventListener("app:languagechange", () =>
      setIndicatorPosition(activeLink),
    );
  }
}

const navToggle = document.getElementById("site-nav-toggle");
const navMenu = document.getElementById("site-nav-menu");

if (navToggle && navMenu) {
  const setMenuOpen = (isOpen) => {
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      translations[document.documentElement.lang][
        isOpen ? "nav_close_menu" : "nav_open_menu"
      ],
    );
  };

  setMenuOpen(false);

  navToggle.addEventListener("click", () => {
    setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      navToggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  const desktopNavQuery = window.matchMedia("(min-width: 821px)");
  const closeMenuOnDesktop = (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  };
  if (desktopNavQuery.addEventListener) {
    desktopNavQuery.addEventListener("change", closeMenuOnDesktop);
  } else {
    desktopNavQuery.addListener(closeMenuOnDesktop);
  }
}

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const themeIcon = themeToggle.querySelector(".theme-toggle-icon");

  const updateThemeToggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${isDark ? "light" : "dark"} mode`,
    );
    themeToggle.setAttribute("aria-pressed", String(isDark));
  };

  updateThemeToggle();
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("whisper-theme", nextTheme);
    } catch {}
    updateThemeToggle();
    changeLanguage(document.documentElement.lang);
  });
}
function toggleSection(sectionId, inputId) {
  const section = document.getElementById(sectionId);
  const input = document.getElementById(inputId);

  if (section) {
    section.classList.toggle("d-none");
    if (!section.classList.contains("d-none") && input) {
      input.focus();
    }
  }
}

function openCommentsModal(modal, opener = null) {
  if (modal.parentElement !== document.body) {
    document.body.append(modal);
  }
  if (opener && !opener.id) {
    opener.id = `${modal.id}-button`;
  }
  if (opener) {
    modal.dataset.openerId = opener.id;
  }
  if (!modal.hasAttribute("data-previous-body-overflow")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const input = opener
    ? document.getElementById(opener.dataset.focusInput)
    : modal.querySelector(".comments-modal-compose input");
  input?.focus();
}

function closeCommentsModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = modal.dataset.previousBodyOverflow ?? "";
  delete modal.dataset.previousBodyOverflow;
  window.clearInterval(commentRefreshTimers.get(modal));
  commentRefreshTimers.delete(modal);
  commentRefreshRequests.get(modal)?.abort();
  commentRefreshRequests.delete(modal);
  if (modal.dataset.openerId) {
    document.getElementById(modal.dataset.openerId)?.focus();
  }
}

const commentRefreshRequests = new WeakMap();
const commentRefreshTimers = new WeakMap();
const commentAvatarColors = [
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#be185d",
  "#b91c1c",
  "#c2410c",
  "#a16207",
  "#4d7c0f",
  "#15803d",
  "#0f766e",
  "#0e7490",
  "#0369a1",
  "#4338ca",
  "#6d28d9",
  "#9d174d",
  "#4f46e5",
  "#047857",
  "#a21caf",
  "#9f1239",
  "#854d0e",
];

function applyCommentAvatarColors(container = document) {
  const avatars = [
    ...container.querySelectorAll(".fb-comment-avatar[data-username]"),
  ];
  avatars.forEach((avatar) => {
    const username = avatar.dataset.username.toLowerCase();
    const preferredIndex = Array.from(username).reduce(
      (value, character) => (value * 31 + character.codePointAt(0)) >>> 0,
      0,
    ) % commentAvatarColors.length;
    avatar.style.setProperty(
      "--avatar-background",
      commentAvatarColors[preferredIndex],
    );
  });
}

applyCommentAvatarColors();

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches(".fb-comment-form")) {
    return;
  }

  event.preventDefault();
  const modal = form.closest(".comments-modal-overlay");
  const status = modal?.querySelector("[data-comment-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  if (!modal || !status) {
    return;
  }

  status.textContent = "";
  status.classList.remove("is-error");
  status.removeAttribute("data-i18n");
  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "text/plain",
      },
      credentials: "same-origin",
    });

    if (response.redirected) {
      window.location.assign(response.url);
      return;
    }

    if (!response.ok) {
      status.textContent = await response.text();
      status.classList.add("is-error");
      if (response.headers.get("X-Comment-Error") === "inappropriate_language") {
        status.setAttribute("data-i18n", "error_inappropriate_language");
        changeLanguage(document.documentElement.lang, false);
      }
      return;
    }

    const commentList = modal.querySelector("[data-comment-list]");
    if (!commentList) {
      throw new Error("Comment list container is missing.");
    }

    const updatedComments = await response.text();
    commentRefreshRequests.get(modal)?.abort();
    commentRefreshRequests.delete(modal);
    form.reset();
    commentList.innerHTML = updatedComments;
    applyCommentAvatarColors(commentList);
    changeLanguage(document.documentElement.lang, false);
    const commentContent = modal.querySelector(".comments-modal-content");
    if (commentContent) {
      commentContent.scrollTop = commentContent.scrollHeight;
    }
  } catch (error) {
    console.error("Unable to post or display comment.", error);
    status.textContent =
      translations[document.documentElement.lang]?.comments_load_error ??
      "Could not refresh comments. Please try again.";
    status.classList.add("is-error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

async function refreshComments(modal) {
  const commentList = modal.querySelector("[data-comment-list]");
  const status = modal.querySelector("[data-comment-status]");
  const url = modal.dataset.commentsUrl;
  if (!commentList || !url) {
    return;
  }

  commentRefreshRequests.get(modal)?.abort();
  const controller = new AbortController();
  commentRefreshRequests.set(modal, controller);
  if (status) {
    status.textContent = "";
    status.classList.remove("is-error");
    status.removeAttribute("data-i18n");
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "text/html" },
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Comment refresh failed with status ${response.status}.`);
    }

    const updatedComments = await response.text();
    if (commentList.innerHTML !== updatedComments) {
      const formState = [...commentList.querySelectorAll(".fb-comment-form")].map(
        (form) => ({
          id: form.id,
          hidden: form.classList.contains("d-none"),
          values: [...form.querySelectorAll("input")].map((input) => [
            input.id,
            input.value,
          ]),
        }),
      );
      const focusedInputId =
        document.activeElement instanceof HTMLInputElement
          ? document.activeElement.id
          : null;
      const content = modal.querySelector(".comments-modal-content");
      const wasAtBottom = content
        ? content.scrollHeight - content.scrollTop - content.clientHeight < 24
        : false;

      commentList.innerHTML = updatedComments;
      applyCommentAvatarColors(commentList);
      for (const state of formState) {
        const form = document.getElementById(state.id);
        if (!form) {
          continue;
        }
        form.classList.toggle("d-none", state.hidden);
        for (const [inputId, value] of state.values) {
          const input = document.getElementById(inputId);
          if (input instanceof HTMLInputElement) {
            input.value = value;
          }
        }
      }
      if (focusedInputId) {
        document.getElementById(focusedInputId)?.focus();
      }
      if (wasAtBottom && content) {
        content.scrollTop = content.scrollHeight;
      }
      changeLanguage(document.documentElement.lang, false);
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    console.error("Unable to refresh comments.", error);
    if (status) {
      status.textContent =
        translations[document.documentElement.lang]?.comments_load_error ??
        "Could not refresh comments. Please try again.";
    }
  } finally {
    if (commentRefreshRequests.get(modal) === controller) {
      commentRefreshRequests.delete(modal);
    }
  }
}

function startCommentPolling(modal) {
  if (commentRefreshTimers.has(modal)) {
    return;
  }
  const timer = window.setInterval(() => {
    if (modal.classList.contains("is-open")) {
      refreshComments(modal);
    }
  }, 3000);
  commentRefreshTimers.set(modal, timer);
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const openCommentsButton = event.target.closest("[data-open-comments]");
  if (openCommentsButton) {
    const modal = document.getElementById(
      openCommentsButton.dataset.openComments,
    );
    if (modal) {
      openCommentsModal(modal, openCommentsButton);
      refreshComments(modal);
      startCommentPolling(modal);
    }
    return;
  }

  const closeCommentsButton = event.target.closest("[data-close-comments]");
  const commentsOverlay = event.target.closest(".comments-modal-overlay");
  if (
    closeCommentsButton ||
    (commentsOverlay && event.target === commentsOverlay)
  ) {
    const modal = closeCommentsButton
      ? closeCommentsButton.closest(".comments-modal-overlay")
      : commentsOverlay;
    if (modal) {
      closeCommentsModal(modal);
    }
    return;
  }

  const toggle = event.target.closest("[data-toggle-section]");
  if (toggle) {
    toggleSection(
      toggle.dataset.toggleSection,
      toggle.dataset.focusInput,
    );
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openModal = document.querySelector(
    ".comments-modal-overlay.is-open",
  );
  if (openModal) {
    closeCommentsModal(openModal);
  }
});

if (window.location.hash) {
  const target = document.getElementById(
    decodeURIComponent(window.location.hash.slice(1)),
  );
  if (target) {
    const commentsModal = target.matches(".comments-modal-overlay")
      ? target
      : target.closest(".comments-modal-overlay");
    if (commentsModal) {
      openCommentsModal(commentsModal);
      refreshComments(commentsModal);
      startCommentPolling(commentsModal);
    }
  }
}
