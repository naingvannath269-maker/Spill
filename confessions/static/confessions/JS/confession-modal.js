document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confession-modal");
  if (!(modal instanceof HTMLDialogElement)) {
    return;
  }

  const form = modal.querySelector("form");
  const textarea = modal.querySelector("textarea");
  const submitButton = form?.querySelector('button[type="submit"]');
  let submitting = false;

  document.querySelectorAll("[data-open-confession]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (!modal.open) {
        modal.showModal();
        textarea?.focus();
      }
    });
  });

  modal.querySelector("[data-close-confession]")?.addEventListener("click", () => {
    if (!submitting) {
      modal.close();
    }
  });

  modal.addEventListener("cancel", (event) => {
    if (submitting) {
      event.preventDefault();
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal && !submitting) {
      modal.close();
    }
  });

  form?.addEventListener("submit", () => {
    submitting = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-disabled", "true");
      submitButton.textContent = "Sharing…";
    }
  });

  if (modal.dataset.autoOpen === "true") {
    modal.showModal();
    textarea?.focus();
  }
});
