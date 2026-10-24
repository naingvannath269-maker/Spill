(() => {
  const button = document.getElementById("about-team-jump");
  const team = document.getElementById("about-team");
  const pageTitle = document.getElementById("about-title");

  if (!button || !team || !pageTitle) {
    return;
  }

  const teamLabel = button.querySelector('[data-i18n="about_team_jump"]');
  const topLabel = button.querySelector('[data-i18n="about_back_top"]');
  const icon = button.querySelector(".about-team-jump__icon");
  if (!teamLabel || !topLabel || !icon) {
    return;
  }

  const teamMembers = team.querySelectorAll(".about-person");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    team.classList.add("about-team--rise-ready");
    const memberObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    teamMembers.forEach((member) => memberObserver.observe(member));
  } else {
    teamMembers.forEach((member) => member.classList.add("is-visible"));
  }

  let showingBackToTop = window.location.hash === "#about-team";

  function setButtonDirection(showBackToTop) {
    showingBackToTop = showBackToTop;
    button.dataset.direction = showBackToTop ? "up" : "down";
    button.setAttribute(
      "aria-controls",
      showBackToTop ? "about-title" : "about-team",
    );
    teamLabel.hidden = showBackToTop;
    topLabel.hidden = !showBackToTop;
    icon.textContent = showBackToTop ? "↑" : "↓";
  }

  button.addEventListener("click", () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    if (showingBackToTop) {
      window.scrollTo({ top: 0, behavior });
      pageTitle.focus({ preventScroll: true });
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }

    team.scrollIntoView({ behavior, block: "start" });
    team.focus({ preventScroll: true });
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#about-team`,
    );
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => setButtonDirection(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(team);
  } else {
    const updateButtonDirection = () => {
      setButtonDirection(team.getBoundingClientRect().top < window.innerHeight);
    };
    window.addEventListener("scroll", updateButtonDirection, {
      passive: true,
    });
    updateButtonDirection();
  }
})();