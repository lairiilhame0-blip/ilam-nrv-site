// Add only consented, real testimonials here: {name, text, rating, program}.
const REVIEWS = [];

const CONFIG = {
  stripePaymentLinks: {
    musculation: "",
    hybride: "",
    hyrox: ""
  },
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

if (REVIEWS.length > 0) {
  const reviewSection = document.querySelector("#avis");
  const reviewGrid = document.querySelector("#review-grid");
  const contactNavLink = mainNav.querySelector('a[href="#contact"]');
  const reviewNavLink = document.createElement("a");
  reviewNavLink.href = "#avis";
  reviewNavLink.textContent = "Avis";
  mainNav.insertBefore(reviewNavLink, contactNavLink);

  REVIEWS.forEach((review) => {
    const card = document.createElement("figure");
    card.className = "review-card";
    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${review.rating} étoile${review.rating > 1 ? "s" : ""} sur 5`);
    stars.textContent = "★".repeat(review.rating);
    const quote = document.createElement("blockquote");
    quote.textContent = review.text;
    const caption = document.createElement("figcaption");
    const name = document.createElement("strong");
    name.textContent = review.name;
    const program = document.createElement("span");
    program.textContent = review.program;
    caption.append(name, program);
    card.append(stars, quote, caption);
    reviewGrid.append(card);
  });
  reviewSection.hidden = false;
}

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
  } else {
    link.addEventListener("click", () => {
      document.querySelector('select[name="goal"]').value = link.dataset.program;
    });
  }
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const submitButton = contactForm.querySelector("[type=submit]");
  submitButton.disabled = true;
  formStatus.textContent = "Envoi en cours…";
  try {
    const response = await fetch(CONFIG.formAction, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) throw new Error("Form submission failed");
    formStatus.textContent = "Merci pour ton message ! Je reviens vers toi très vite.";
    contactForm.reset();
  } catch {
    formStatus.textContent = "Oups, l’envoi n’a pas fonctionné. Écris-moi directement sur WhatsApp.";
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
    const response = await fetch(CONFIG.formAction, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(reviewForm))),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) throw new Error("Review submission failed");
    reviewStatus.textContent = "Merci ! Ton avis sera relu avant publication.";
    reviewForm.reset();
    delete ratingOptions.dataset.rating;
  } catch {
    reviewStatus.textContent = "Oups, l’envoi n’a pas fonctionné. Écris-moi directement sur ";
    const whatsappLink = document.createElement("a");
    whatsappLink.href = "https://wa.me/33601022268";
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "WhatsApp";
    reviewStatus.append(whatsappLink, document.createTextNode("."));
  } finally {
    submitButton.disabled = false;
  }
});
