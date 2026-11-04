// CARDIO NRV : 7 JOURS — logique de la page challenge (inscription, km, classement).
// La clé "publishable" Supabase est publique par conception : elle ne donne accès qu'aux fonctions prévues.
(function () {
  "use strict";

  const SUPABASE_URL = "https://cgpqkeuxdhkydkheqmja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_RktySkz4hVgMCdM8EKS4Aw_o5-29vI3";
  // Lien d'invitation du groupe WhatsApp du challenge. Laisser vide tant qu'il n'existe pas : le bouton reste caché.
  const WHATSAPP_GROUP_URL = "";
  const ILAM_WHATSAPP = "https://wa.me/33601022268";
  const GOAL_KM = 50;
  const START = "2026-11-30";
  const DAYS = ["2026-11-30", "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06"];
  const TOKEN_KEY = "nrv_token";
  const NAME_KEY = "nrv_name";
  const KM_KEY = "nrv_km";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const params = new URLSearchParams(location.search);
  // ?test=1 ouvre la saisie avant le départ, pour tester la page.
  const TEST_MODE = params.get("test") === "1";

  const $ = (id) => document.getElementById(id);

  function store(key, value) { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ } }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function parisToday() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }

  function formatKm(n) {
    const v = Math.round(Number(n || 0) * 10) / 10;
    return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  function dayLabel(iso) {
    const d = new Date(iso + "T12:00:00");
    return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(d);
  }

  async function rpc(name, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body || {}),
        signal: controller.signal
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!res.ok) {
        const err = new Error((data && data.message) || ("Erreur " + res.status));
        err.status = res.status;
        err.code = data && data.code;
        throw err;
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  function setStatus(el, text, kind) {
    el.textContent = text;
    el.classList.remove("is-error", "is-ok");
    if (kind) el.classList.add(kind === "error" ? "is-error" : "is-ok");
  }

  function appendWhatsAppHelp(el, before) {
    el.append(document.createTextNode(before));
    const a = document.createElement("a");
    a.href = ILAM_WHATSAPP;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "écris à Ilam sur WhatsApp";
    el.append(a, document.createTextNode("."));
  }

  // Bouton du groupe WhatsApp, affiché seulement si le lien existe.
  if (WHATSAPP_GROUP_URL) {
    document.querySelectorAll(".ch-wa-group").forEach((a) => { a.href = WHATSAPP_GROUP_URL; a.hidden = false; });
  }

  // ---------- Kilomètres stockés sur l'appareil ----------
  function localKm() {
    try { const o = JSON.parse(read(KM_KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function saveLocalKm(obj) { store(KM_KEY, JSON.stringify(obj)); }

  function updateTotal() {
    const km = localKm();
    const total = DAYS.reduce((s, d) => s + (Number(km[d]) || 0), 0);
    $("my-total").textContent = formatKm(total);
    const pct = Math.min(100, (total / GOAL_KM) * 100);
    const bar = $("my-progress");
    $("my-progress-fill").style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(Math.min(GOAL_KM, Math.round(total * 10) / 10)));
    bar.classList.toggle("is-done", total >= GOAL_KM);
    const left = Math.max(0, GOAL_KM - total);
    $("my-progress-note").textContent = total >= GOAL_KM
      ? "50 KM. Tu l’as fait. Zone de confort : explosée."
      : (total === 0 ? "Chaque kilomètre compte. Premier pas, premier km." : "Encore " + formatKm(left) + " km. Ne lâche rien.");
  }

  function parseKm(raw) {
    const v = String(raw || "").trim().replace(",", ".");
    if (!/^[0-9]{1,3}([.][0-9])?$/.test(v)) return null;
    const n = Number(v);
    if (!(n >= 0 && n <= 100)) return null;
    return n;
  }

  function buildDays(token) {
    const list = $("km-days");
    list.textContent = "";
    const today = parisToday();
    const beforeStart = today < START;
    const locked = beforeStart && !TEST_MODE;
    $("km-lock").hidden = !locked;
    const km = localKm();

    DAYS.forEach((day, i) => {
      const li = document.createElement("li");
      li.className = "ch-day";
      const label = document.createElement("div");
      label.className = "ch-day-label";
      const strong = document.createElement("strong");
      strong.textContent = "J" + (i + 1);
      const span = document.createElement("span");
      span.textContent = dayLabel(day);
      label.append(strong, span);

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.placeholder = "0";
      input.maxLength = 5;
      input.id = "km-" + day;
      input.setAttribute("aria-label", "Kilomètres du jour " + (i + 1) + ", " + dayLabel(day));
      if (km[day] !== undefined) input.value = formatKm(km[day]);
      const future = !TEST_MODE && day > today;
      input.disabled = locked || future;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "button button-primary";
      btn.textContent = "Valider";
      btn.disabled = input.disabled;

      const msg = document.createElement("p");
      msg.className = "ch-day-msg";
      msg.setAttribute("role", "status");
      msg.setAttribute("aria-live", "polite");
      if (future && !locked) msg.textContent = "À venir.";

      const save = async () => {
        const n = parseKm(input.value);
        if (n === null) { setStatus(msg, "Entre un nombre entre 0 et 100 (ex. 7,5).", "error"); input.focus(); return; }
        btn.disabled = true;
        setStatus(msg, "Enregistrement…");
        try {
          await rpc("log_km", { p_token: token, p_day: day, p_km: n });
          const all = localKm();
          all[day] = n;
          saveLocalKm(all);
          input.value = formatKm(n);
          setStatus(msg, "Enregistré : " + formatKm(n) + " km.", "ok");
          updateTotal();
          loadBoard();
        } catch (e) {
          if (e.message && /inconnue/i.test(e.message)) {
            setStatus(msg, "", "error");
            appendWhatsAppHelp(msg, "Ton lien n’est pas reconnu. Inscris-toi à nouveau ou ");
          } else {
            setStatus(msg, "", "error");
            appendWhatsAppHelp(msg, "L’enregistrement n’a pas fonctionné. Réessaie dans un instant, ou ");
          }
        } finally {
          btn.disabled = false;
        }
      };
      btn.addEventListener("click", save);
      input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); save(); } });

      li.append(label, input, btn, msg);
      list.append(li);
    });
    updateTotal();
  }

  // Si la fonction optionnelle my_progress existe dans Supabase, on récupère les km déjà saisis (utile sur un nouvel appareil).
  async function syncFromServer(token) {
    try {
      const rows = await rpc("my_progress", { p_token: token });
      if (!Array.isArray(rows)) return;
      const km = {};
      let name = null;
      rows.forEach((r) => {
        if (r.first_name) name = r.first_name;
        if (r.day && DAYS.includes(r.day)) km[r.day] = Number(r.km) || 0;
      });
      saveLocalKm(km);
      if (name) { store(NAME_KEY, name); setHello(name); }
      buildDays(token);
    } catch (e) { /* fonction absente : on garde les km de cet appareil */ }
  }

  function setHello(name) {
    $("space-hello").textContent = name
      ? name + ", c’est ton terrain. Note tes km chaque jour, et regarde la barre se remplir."
      : "C’est ton terrain. Note tes km chaque jour, et regarde la barre se remplir.";
  }

  function showSpace(token) {
    const space = $("espace");
    space.hidden = false;
    setHello(read(NAME_KEY));
    const link = location.origin + location.pathname + "?t=" + token;
    $("my-link").value = link;
    document.getElementById("hero-cta").setAttribute("href", "#espace");
    document.getElementById("hero-cta").firstChild.textContent = "Mon espace perso ";
    buildDays(token);
    syncFromServer(token);
  }

  $("copy-link").addEventListener("click", async () => {
    const input = $("my-link");
    try {
      await navigator.clipboard.writeText(input.value);
      setStatus($("copy-status"), "Lien copié. Garde-le précieusement.", "ok");
    } catch (e) {
      input.select();
      setStatus($("copy-status"), "Sélectionne le lien et copie-le.", null);
    }
  });

  $("logout").addEventListener("click", () => {
    [TOKEN_KEY, NAME_KEY, KM_KEY].forEach((k) => store(k, null));
    location.href = location.pathname;
  });

  // ---------- Inscription ----------
  $("join-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const status = $("join-status");
    const name = $("j-name").value.trim();
    const email = $("j-email").value.trim();
    const wa = $("j-wa").value.trim();
    const consent = $("j-consent").checked;
    if (!name) { setStatus(status, "Indique ton prénom.", "error"); $("j-name").focus(); return; }
    if (!/^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(email)) { setStatus(status, "Indique un email valide.", "error"); $("j-email").focus(); return; }
    if (wa && !/^[+0-9 .()-]{6,20}$/.test(wa)) { setStatus(status, "Ton numéro WhatsApp ne semble pas valide.", "error"); $("j-wa").focus(); return; }
    if (!consent) { setStatus(status, "Coche la case d’accord pour t’inscrire.", "error"); $("j-consent").focus(); return; }

    const btn = form.querySelector(".ch-submit");
    btn.disabled = true;
    setStatus(status, "Inscription en cours…");
    try {
      const token = await rpc("join_challenge", { p_first_name: name, p_email: email, p_whatsapp: wa || null, p_consent: true });
      if (typeof token !== "string" || !UUID_RE.test(token)) throw new Error("Réponse inattendue");
      store(TOKEN_KEY, token);
      store(NAME_KEY, name);
      store(KM_KEY, "{}");
      form.reset();
      setStatus(status, "Bienvenue dans le challenge, " + name + ". Ton espace perso est juste en dessous.", "ok");
      showSpace(token);
      loadBoard();
      $("espace").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setStatus(status, "", "error");
      if (e.code === "23505") {
        appendWhatsAppHelp(status, "Cet email est déjà inscrit. Pour retrouver ton lien personnel, ");
      } else if (e.code === "23514") {
        status.textContent = "Vérifie ton prénom (40 caractères maximum) et ton email.";
      } else {
        appendWhatsAppHelp(status, "L’inscription n’a pas fonctionné. Réessaie dans un instant, ou ");
      }
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- Classement ----------
  async function loadBoard() {
    const list = $("board-list");
    const status = $("board-status");
    try {
      const rows = await rpc("leaderboard", {});
      list.textContent = "";
      setStatus(status, "");
      if (!Array.isArray(rows) || rows.length === 0) {
        const li = document.createElement("li");
        li.className = "ch-board-empty";
        li.textContent = "Personne encore. Sois la première.";
        list.append(li);
        return;
      }
      rows.forEach((r, i) => {
        const li = document.createElement("li");
        const total = Number(r.total_km) || 0;
        if (total >= GOAL_KM) li.classList.add("is-done");
        const rank = document.createElement("span");
        rank.className = "ch-rank";
        rank.textContent = String(i + 1).padStart(2, "0");
        const nm = document.createElement("span");
        nm.className = "ch-board-name";
        nm.textContent = String(r.first_name || "");
        const km = document.createElement("span");
        km.className = "ch-board-km";
        km.textContent = formatKm(total) + " KM";
        li.append(rank, nm, km);
        list.append(li);
      });
    } catch (e) {
      setStatus(status, "Le classement ne se charge pas pour l’instant. Recharge la page dans un moment.", "error");
    }
  }

  // ---------- Démarrage ----------
  const urlToken = params.get("t");
  if (urlToken && UUID_RE.test(urlToken)) {
    if (read(TOKEN_KEY) !== urlToken) { store(TOKEN_KEY, urlToken); store(KM_KEY, "{}"); store(NAME_KEY, null); }
  }
  const token = read(TOKEN_KEY);
  if (token && UUID_RE.test(token)) showSpace(token);
  loadBoard();
})();
