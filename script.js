// Only publish real testimonials provided by the coach.
const REVIEWS = [];
const CONFIG = {
  stripePaymentLinks: { musculation: "https://buy.stripe.com/5kQ9AVd2t2Gc4Az6QMawo02", hybride: "https://buy.stripe.com/7sYfZjbYpfsY5ED1wsawo01", hyrox: "https://buy.stripe.com/00w9AVaUl94AaYX3EAawo00" },
  formAction: "https://formsubmit.co/ajax/lairiilhame0@gmail.com"
};
const teamRoster = [
  "Linda", "Marjo", "Hind", "Rachida", "Sabrina", "Ekram", "Zineb", "Julie", "Sabrina 2",
  "Florange", "Ummu", "Aya", "Nafissa", "Nassima", "Khadija", "Diama", "Amina", "Émilie",
  "Myriam", "Ronie", "Nadia", "Hasnaa", "Fatou", "Eve", "Samira", "Nacéra", "Audrey", "Astou",
  "Blandine", "Joanna", "Sofia", "Fadma", "Soukaina", "Sylvie", "Coralie", "Léa", "Wafa", "Souadou", "Abla", "Sonia", "Clem"
];
const roster = document.querySelector("#team-roster");
teamRoster.forEach((name, index) => {
  const item = document.createElement("li");
  item.className = "roster-tag";
  const number = String(index + 1).padStart(3, "0");
  const matricule = document.createElement("span");
  matricule.textContent = `NRV-${number}`;
  const memberName = document.createElement("strong");
  memberName.textContent = name;
  item.append(matricule, memberName);
  roster.append(item);
});
const growthTag = document.createElement("li");
growthTag.className = "roster-tag roster-growth";
growthTag.textContent = "ET BIEN D'AUTRES…";
roster.append(growthTag);
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

// Load the approved reviews after the main deferred script.
const approvedReviewsScript = document.createElement('script');
approvedReviewsScript.src = 'reviews.js?v=1';
approvedReviewsScript.defer = true;
document.body.append(approvedReviewsScript);

// All three online programmes are cancellable without commitment.
document.querySelectorAll('.program-card .price').forEach((price) => {
  if (price.nextElementSibling?.classList.contains('no-commit')) return;
  const label = document.createElement('p');
  label.className = 'no-commit';
  label.textContent = 'SANS ENGAGEMENT';
  label.style.cssText = 'margin:-.5rem 0 1rem;color:#a9ab83;font:700 .7rem/1.5 "Space Mono",monospace;letter-spacing:.1em';
  price.insertAdjacentElement('afterend', label);
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
  mainNav.classList.toggle("is-open", !isOpen);
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    mainNav.classList.remove("is-open");
  });
});
document.querySelectorAll("[data-program]").forEach((link) => {
  const key = link.dataset.program.toLowerCase();
  const paymentUrl = CONFIG.stripePaymentLinks[key];
  if (paymentUrl) {
    link.href = paymentUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.addEventListener("click", () => {
      document.querySelector('select[name="goal"]').value = link.dataset.program;
    });
  }
});
// Stop waiting when the delivery service does not answer.
async function submitToFormSubmit(form) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetch(CONFIG.formAction, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
function showFormError(status) {
  status.textContent = "Oups, l’envoi n’a pas fonctionné. Écris-moi directement sur ";
  const whatsappLink = document.createElement("a");
  whatsappLink.href = "https://wa.me/33601022268";
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "WhatsApp";
  status.append(whatsappLink, document.createTextNode("."));
}
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const submitButton = contactForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  formStatus.textContent = "Envoi en cours…";
  try {
    const response = await submitToFormSubmit(contactForm);
    if (!response.ok) throw new Error("Form submission failed");
    formStatus.textContent = "Merci pour ton message ! Je reviens vers toi très vite.";
    contactForm.reset();
  } catch {
    showFormError(formStatus);
  } finally {
    submitButton.disabled = false;
  }
});
const reviewForm = document.querySelector("#avis-form-fields");
const reviewStatus = document.querySelector("#avis-form-status");
const ratingOptions = document.querySelector("#rating-options");
ratingOptions.addEventListener("change", (event) => {
  if (event.target.matches('input[name="rating"]')) {
    ratingOptions.dataset.rating = event.target.value;
  }
});
reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!reviewForm.reportValidity()) return;
  const submitButton = reviewForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  reviewStatus.textContent = "Envoi en cours…";
  try {
    const response = await submitToFormSubmit(reviewForm);
    if (!response.ok) throw new Error("Review submission failed");
    reviewStatus.textContent = "Merci ! Ton avis sera relu avant publication.";
    reviewForm.reset();
    delete ratingOptions.dataset.rating;
  } catch {
    showFormError(reviewStatus);
  } finally {
    submitButton.disabled = false;
  }
});
