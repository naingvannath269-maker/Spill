
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

function updateRelativeCommentTimes(container = document) {
  container.querySelectorAll("[data-relative-time]").forEach((time) => {
    const createdAt = new Date(time.dateTime);
    if (Number.isNaN(createdAt.getTime())) {
      console.error("Unable to parse comment timestamp.", time.dateTime);
      return;
    }

    const elapsedMinutes = Math.floor(
      Math.max(0, Date.now() - createdAt.getTime()) / 60_000,
    );
    let value = elapsedMinutes;
    let unit = "minute";

    if (elapsedMinutes >= 60) {
      value = Math.floor(elapsedMinutes / 60);
      unit = "hour";
    }
    if (elapsedMinutes >= 60 * 24) {
      value = Math.floor(elapsedMinutes / (60 * 24));
      unit = "day";
    }
    if (elapsedMinutes >= 60 * 24 * 30) {
      value = Math.floor(elapsedMinutes / (60 * 24 * 30));
      unit = "month";
    }
    if (elapsedMinutes >= 60 * 24 * 365) {
      value = Math.floor(elapsedMinutes / (60 * 24 * 365));
      unit = "year";
    }

    time.textContent = `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  });
}

updateRelativeCommentTimes();
window.setInterval(() => updateRelativeCommentTimes(), 30_000);

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
  "#730d0d",
  "#731c0d",
  "#732b0d",
  "#733b0d",
  "#734a0d",
  "#73590d",
  "#73690d",
  "#6e730d",
  "#5e730d",
  "#4f730d",
  "#40730d",
  "#30730d",
  "#21730d",
  "#12730d",
  "#0d7317",
  "#0d7326",
  "#0d7336",
  "#0d7345",
  "#0d7354",
  "#0d7363",
  "#0d7373",
  "#0d6373",
  "#0d5473",
  "#0d4573",
  "#0d3673",
  "#0d2673",
  "#0d1773",
  "#120d73",
  "#210d73",
  "#300d73",
  "#400d73",
  "#4f0d73",
  "#5e0d73",
  "#6e0d73",
  "#730d69",
  "#730d59",
  "#730d4a",
  "#730d3b",
  "#730d2b",
  "#730d1c",
];

function applyCommentAvatarColors(container = document) {
  const avatars = [
    ...container.querySelectorAll(".fb-comment-avatar[data-username]"),
  ];
  const usernames = [...new Set(avatars.map((avatar) => avatar.dataset.username))];
  const colorsByUsername = new Map();
  const usedColors = new Set();

  usernames.sort().forEach((username) => {
    const preferredIndex = Array.from(username).reduce(
      (value, character) => (value * 31 + character.codePointAt(0)) >>> 0,
      0,
    ) % commentAvatarColors.length;
    let colorIndex = preferredIndex;

    for (let offset = 0; offset < commentAvatarColors.length; offset += 1) {
      const candidateIndex =
        (preferredIndex + offset) % commentAvatarColors.length;
      if (!usedColors.has(commentAvatarColors[candidateIndex])) {
        colorIndex = candidateIndex;
        break;
      }
    }

    const color = commentAvatarColors[colorIndex];
    usedColors.add(color);
    colorsByUsername.set(username, color);
  });

  avatars.forEach((avatar) => {
    avatar.style.setProperty(
      "--avatar-background",
      colorsByUsername.get(avatar.dataset.username),
    );
  });
}

applyCommentAvatarColors();

function ensureConfessionFeedEmptyState(feed) {
  if (
    !feed ||
    feed.querySelector(".confession-bubble") ||
    feed.querySelector(".empty-state")
  ) {
    return;
  }

  const wasInProfile = Boolean(feed.closest(".profile-page"));
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✳";
  emptyState.append(icon);

  const addTranslatedText = (tagName, key) => {
    const element = document.createElement(tagName);
    element.dataset.i18n = key;
    emptyState.append(element);
  };

  if (wasInProfile) {
    addTranslatedText("h2", "profile_empty_title");
    addTranslatedText("p", "profile_empty_desc");
  } else {
    addTranslatedText("h2", "empty_title");
    addTranslatedText("p", "empty_desc");
    emptyState.id = "confessions-empty-state";
  }
  const link = document.createElement("a");
  link.className = "page-text-link";
  link.href = feed.dataset.emptyLinkUrl;
  link.dataset.i18n = feed.dataset.emptyLinkI18n;
  if (!wasInProfile && document.querySelector(".floating-confess")) {
    link.dataset.openConfession = "";
  }
  emptyState.append(link);
  feed.append(emptyState);
  changeLanguage(document.documentElement.lang, false);
}

document.addEventListener("htmx:afterSettle", (event) => {
  const feed = document.getElementById("confessions-feed");
  if (feed && event.detail.target === feed) {
    ensureConfessionFeedEmptyState(feed);
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (
    !(form instanceof HTMLFormElement) ||
    !form.matches(".delete-confession-form")
  ) {
    return;
  }

  event.preventDefault();
  const button = form.querySelector(".delete-confession-button");
  const status = form.querySelector(".delete-confession-status");
  const card = form.closest(".confession-bubble");
  if (!button || !status || !card) {
    console.error("Unable to delete confession: required elements are missing.");
    return;
  }

  const confirmationMessage =
    translations[document.documentElement.lang]?.delete_confession_confirm ??
    "Are you sure you want to delete this confession?";
  if (!window.confirm(confirmationMessage)) {
    return;
  }

  status.textContent = "";
  button.disabled = true;
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
    if (response.status !== 204) {
      throw new Error(`Confession deletion failed with status ${response.status}.`);
    }

    const feed = card.closest(".confessions-feed");
    const wasInProfile = Boolean(card.closest(".profile-page"));
    card.remove();

    if (wasInProfile) {
      document.querySelectorAll("[data-profile-confession-count]").forEach((count) => {
        count.textContent = String(Math.max(0, Number(count.textContent) - 1));
      });
    } else {
      const total = document.getElementById("confession-total");
      if (total) {
        total.textContent = String(Math.max(0, Number(total.textContent) - 1));
      }
      window.htmx?.trigger("#community-activity", "refresh");
    }

    ensureConfessionFeedEmptyState(feed);
  } catch (error) {
    console.error("Unable to delete confession.", error);
    status.textContent =
      translations[document.documentElement.lang]?.delete_confession_error ??
      "Could not delete this confession. Please try again.";
    button.disabled = false;
  }
});

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
      updateRelativeCommentTimes(commentList);
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
