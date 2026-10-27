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
