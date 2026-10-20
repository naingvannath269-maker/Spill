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
        `${linkBounds.left - navBounds.left}px`
      );
      primaryNav.style.setProperty(
        "--active-link-y",
        `${linkBounds.top - navBounds.top}px`
      );
      primaryNav.style.setProperty("--active-link-width", `${linkBounds.width}px`);
      primaryNav.style.setProperty("--active-link-height", `${linkBounds.height}px`);
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
      setIndicatorPosition(activeLink)
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
      ]
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
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
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
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeToggle.setAttribute("aria-pressed", String(isDark));
  };

  updateThemeToggle();
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("whisper-theme", nextTheme);
    } catch {}
    updateThemeToggle();
    changeLanguage(document.documentElement.lang);
  });
}
