// Compteur de visites et de clics ILAM.NRV : anonyme, sans cookie, sans IP, sans identifiant.
// Il envoie seulement : la page, l'action (visite ou clic sur une offre) et la provenance (instagram, direct...).
(() => {
  const URL_ = "https://cgpqkeuxdhkydkheqmja.supabase.co/rest/v1/rpc/track_event";
  const KEY = "sb_publishable_RktySkz4hVgMCdM8EKS4Aw_o5-29vI3";

  const path = location.pathname.toLowerCase();
  const page = path.includes("challenge") ? "defi"
    : path.includes("quiz") ? "quiz"
    : path.includes("dix-erreurs") ? "checklist"
    : (path === "/" || path.endsWith("index.html")) ? "accueil" : "autre";

  function source() {
    try {
      const p = new URLSearchParams(location.search);
      const utm = p.get("utm_source") || p.get("src");
      if (utm) return utm;
      if (!document.referrer) return "direct";
      const h = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (h === location.hostname.replace(/^www\./, "")) return "site";
      if (/instagram|^l\.instagram/.test(h)) return "instagram";
      if (/facebook|fb\.com/.test(h)) return "facebook";
      if (/whatsapp|wa\.me/.test(h)) return "whatsapp";
      if (/google\./.test(h)) return "google";
      if (/systeme\.io|brevo|sendibt|mail/.test(h)) return "email";
      if (/tiktok/.test(h)) return "tiktok";
      return h.split(".").slice(-2).join(".");
    } catch (e) { return "direct"; }
  }
  const SRC = source().toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 30) || "direct";

  function send(event) {
    try {
      fetch(URL_, {
        method: "POST",
        keepalive: true,
        headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_page: page, p_event: event, p_source: SRC })
      }).catch(() => {});
    } catch (e) { /* le site continue normalement */ }
  }
  window.nrvTrack = send;

  send("visite");

  // Clics sur les offres et les contacts, reconnus automatiquement par leur lien
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (!a) return;
    const href = (a.getAttribute("href") || "").toLowerCase();
    let ev = "";
    if (href.includes("ekklo.com")) ev = "clic_programmes_39";
    else if (a.dataset.program) ev = "clic_coaching_" + a.dataset.program.toLowerCase();
    else if (a.classList.contains("ch-wa-group")) ev = "clic_groupe_whatsapp";
    else if (href.includes("wa.me")) ev = "clic_whatsapp";
    else if (href.includes("instagram.com")) ev = "clic_instagram";
    else if (href.endsWith("#contact")) ev = page === "accueil" ? "clic_contact" : "clic_coaching";
    else if (href === "#inscription") ev = "clic_je_releve_le_defi";
    else if (href.includes("challenge.html")) ev = "clic_vers_defi";
    else if (href.includes("quiz.html")) ev = "clic_vers_quiz";
    else if (href.endsWith(".pdf")) ev = "telechargement_checklist";
    if (ev) send(ev.replace(/[^a-z0-9_]/g, "_").slice(0, 40));
  }, true);

  // Demande envoyée via le formulaire de contact de l'accueil
  const cf = document.getElementById("contact-form");
  if (cf) cf.addEventListener("submit", () => send("demande_contact"), true);
})();
