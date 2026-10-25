document.addEventListener("submit", async (event) => {
  const form = event.target;

  if (
    !(form instanceof HTMLFormElement) ||
    !form.matches(".bubble-actions .reaction-form")
  ) {
    return;
  }

  event.preventDefault();

  const buttons = [...form.querySelectorAll(".reaction-button")];
  const submitter = event.submitter;
  const reaction = submitter?.value;
  const formData = new FormData(form);
  if (reaction) {
    formData.set("reaction", reaction);
  }
  buttons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
      credentials: "same-origin",
    });

    if (response.redirected) {
      window.location.assign(response.url);
      return;
    }

    if (!response.ok) {
      throw new Error("Vote request failed");
    }

    const result = await response.json();
    form.querySelector(".like-count").textContent = result.like_count;
    form.querySelector(".unlike-count").textContent = result.unlike_count;
    form.querySelector(".like-button").classList.toggle("selected", result.liked);
    form.querySelector(".unlike-button").classList.toggle("selected", result.unliked);
    form.querySelector(".like-button").setAttribute("aria-pressed", String(result.liked));
    form.querySelector(".unlike-button").setAttribute("aria-pressed", String(result.unliked));
    window.htmx?.trigger("#community-activity", "refresh");
  } catch {
    const status = form.querySelector(".like-status");
    if (status) {
      status.textContent = "Could not record your vote. Please try again.";
    }
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
});
