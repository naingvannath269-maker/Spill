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
  if (modal.dataset.openerId) {
    document.getElementById(modal.dataset.openerId)?.focus();
  }
}

const commentRefreshRequests = new WeakMap();

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

    commentList.innerHTML = await response.text();
    changeLanguage(document.documentElement.lang, false);
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
    }
  }
}
