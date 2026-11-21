// Quiz « Quel programme pour toi ? » — lead magnet ILAM.NRV.
// La clé "publishable" Supabase est publique par conception : elle ne donne accès qu'à capture_lead.
(function () {
  "use strict";
  const SUPABASE_URL = "https://cgpqkeuxdhkydkheqmja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_RktySkz4hVgMCdM8EKS4Aw_o5-29vI3";
  const STORE = "https://find.ekklo.com/coachs/ilam-nrv";
  const $ = (id) => document.getElementById(id);

  // Programmes à 39 € (catalogue Ekklo). Correspondances à valider par Hugo.
  const P = {
    renfoMaison: { name: "Renfo Débutante — maison", step: "Étape 1 · Les bases", desc: "12 semaines, 3 séances par semaine, chez toi. Tu apprends les bons mouvements et tu construis ta force, sans salle." },
    renfoSalle: { name: "Renfo Débutante — salle", step: "Étape 1 · Les bases", desc: "12 semaines, 3 séances par semaine en salle. Tu arrives, tu sais exactement quoi faire, et tu n’as plus peur des machines." },
    fessiers12: { name: "Fessiers 12 semaines — salle", step: "Étape 1 · Les bases", desc: "12 semaines centrées sur les fessiers et les jambes, en salle. Un plan simple, qui progresse semaine après semaine." },
    runDeb: { name: "Run Débutante", step: "Étape 1 · Les bases", desc: "Tu pars de zéro et tu apprends à courir sans te dégoûter. Progressif, accessible, et tu vas enfin aimer ça." },
    renfoMaison2: { name: "Renforcement à la maison", step: "Étape 2 · Construction", desc: "Tu as déjà les bases : on passe au niveau supérieur, chez toi. Plus de charge, plus d’intensité, plus de résultats." },
    muscuSalle: { name: "Musculation en salle", step: "Étape 2 · Construction", desc: "Tu t’entraînes déjà, mais sans vraie méthode. Ici, chaque séance a un but et tes charges progressent." },
    fessiersSolides: { name: "Fessiers solides", step: "Étape 2 · Construction", desc: "Pour celles qui veulent des fessiers et des jambes vraiment forts. Un vrai plan de construction, pas des vidéos au hasard." },
    run10: { name: "Objectif 10 km", step: "Étape 2 · Construction", desc: "Tu cours déjà un peu : on t’emmène jusqu’à 10 km, avec une progression qui ne casse pas ton corps." },
    basCorps: { name: "Bas du corps puissant", step: "Étape 3 · Perfectionnement", desc: "Tu as de l’expérience et tu veux de la puissance : force, explosivité, jambes et fessiers solides." },
    signature: { name: "Signature Ilam NRV Hybride", step: "Étape 3 · Perfectionnement", desc: "Mon programme signature : force et cardio dans le même plan. Pour devenir une athlète complète." },
    runHyrox: { name: "Run hybride — prépa HYROX", step: "Étape 3 · Perfectionnement", desc: "Course et renfo combinés pour préparer un HYROX ou passer un cap en endurance. Du sérieux." }
  };

  const Q = [
    { key: "goal", q: "Ton objectif numéro 1 ?", opts: [
      ["tonif", "Perdre du poids et me tonifier", "Me sentir bien dans mon corps"],
      ["fess", "Muscler mes fessiers et mes jambes", "Du galbe, de la force"],
      ["run", "Courir, ou courir plus loin", "Enfin aimer la course"],
      ["hyb", "Devenir une athlète complète", "Force + cardio, HYROX"]
    ] },
    { key: "place", q: "Tu t’entraînes où ?", opts: [
      ["maison", "À la maison", "Pas de salle, ou pas envie"],
      ["salle", "En salle", "J’ai un abonnement ou je vais en prendre un"],
      ["any", "Peu importe", "Je m’adapte"]
    ] },
    { key: "level", q: "Ton niveau, honnêtement ?", opts: [
      ["1", "Je débute ou je reprends", "Après une longue pause, ou jamais vraiment commencé"],
      ["2", "Je m’entraîne depuis quelques mois", "Mais sans vraie méthode"],
      ["3", "Je m’entraîne depuis plus d’un an", "Régulièrement, et je veux passer un cap"]
    ] },
    { key: "block", q: "Qu’est-ce qui t’a fait lâcher jusqu’ici ?", opts: [
      ["plan", "Je ne savais pas quoi faire", "Trop d’infos, aucun plan clair"],
      ["motiv", "Je perds la motivation toute seule", "Au bout de 3 semaines, j’arrête"],
      ["time", "Je manque de temps", "Il me faut des séances efficaces"]
    ] },
    { key: "support", q: "Tu veux avancer comment ?", opts: [
      ["seule", "Avec un plan clair, j’avance seule", "Le programme dans l’appli, à mon rythme"],
      ["suivie", "Suivie chaque semaine, recadrée", "Quelqu’un derrière moi qui ne me lâche pas"]
    ] }
  ];

  const A = {};
  let i = 0;

  function pick() {
    const lvl = Number(A.level || 1) - 1;
    const home = A.place === "maison";
    const table = {
      tonif: home ? ["renfoMaison", "renfoMaison2", "renfoMaison2"] : ["renfoSalle", "muscuSalle", "muscuSalle"],
      fess: home ? ["renfoMaison", "renfoMaison2", "renfoMaison2"] : ["fessiers12", "fessiersSolides", "basCorps"],
      run: ["runDeb", "run10", "runHyrox"],
      hyb: home ? ["renfoMaison", "renfoMaison2", "renfoMaison2"] : ["renfoSalle", "signature", "signature"]
    };
    const prog = (table[A.goal] || table.tonif)[lvl];
    const coaching = A.support === "suivie";
    return { prog, coaching };
  }

  function renderQuestion() {
    const item = Q[i];
    $("qz-step").textContent = "QUESTION " + (i + 1) + " / " + Q.length;
    $("qz-q").textContent = item.q;
    $("qz-bar").style.width = Math.round((i / Q.length) * 100) + "%";
    const box = $("qz-options");
    box.textContent = "";
    item.opts.forEach(([val, label, hint]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "qz-opt";
      b.setAttribute("aria-pressed", A[item.key] === val ? "true" : "false");
      b.append(label);
      const s = document.createElement("small");
      s.textContent = hint;
      b.append(s);
      b.addEventListener("click", () => {
        A[item.key] = val;
        if (i < Q.length - 1) { i++; renderQuestion(); $("qz-q").focus(); }
        else showForm();
      });
      box.append(b);
    });
    $("qz-back").hidden = i === 0;
  }

  function showForm() {
    $("qz-bar").style.width = "100%";
    $("qz-questions").hidden = true;
    $("qz-form").hidden = false;
    $("qz-name").focus();
  }

  $("qz-back").addEventListener("click", () => { if (i > 0) { i--; renderQuestion(); } });

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function btn(href, label, primary, external) {
    const a = el("a", "button " + (primary ? "button-primary" : "button-outline"));
    a.href = href; a.append(label + " ");
    const s = el("span", "", "↗"); s.setAttribute("aria-hidden", "true"); a.append(s);
    if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return a;
  }

  function renderResult(name) {
    const { prog, coaching } = pick();
    const p = P[prog];
    const box = $("qz-result");
    box.textContent = "";
    const card = el("div", "qz-result");
    if (coaching) {
      card.append(el("p", "eyebrow", "TON RÉSULTAT, " + name.toUpperCase()));
      card.append(el("h2", "", "Le coaching à distance"));
      card.append(el("p", "", "Tu me l’as dit : seule, tu lâches. Ce n’est pas un problème de volonté, c’est un problème de cadre. Et le cadre, c’est mon métier."));
      const ul = el("ul", "qz-why");
      ["Un programme fait pour toi, pas pour tout le monde", "Ton bilan chaque semaine, et j’ajuste", "Moi derrière toi : avec moi, t’as pas le choix"].forEach((t) => ul.append(el("li", "", t)));
      card.append(ul);
      const pr = el("p", "qz-price", "150 à 180 € "); pr.append(el("small", "", "PAR MOIS · À DISTANCE")); card.append(pr);
      const act = el("div", "qz-actions"); act.append(btn("/#contact", "Je veux être coachée", true, false)); card.append(act);
      const alt = el("div", "qz-alt");
      alt.append(el("h3", "", "Pas prête pour le coaching ?"));
      alt.append(el("p", "", "Commence par « " + p.name + " » (" + p.step + ", 39 €). " + p.desc));
      alt.append(btn(STORE, "Voir ce programme", false, true));
      card.append(alt);
    } else {
      card.append(el("p", "eyebrow", "TON RÉSULTAT, " + name.toUpperCase() + " · " + p.step.toUpperCase()));
      card.append(el("h2", "", p.name));
      card.append(el("p", "", p.desc));
      const why = el("ul", "qz-why");
      const reasons = ["Un plan clair dans l’appli : tu ouvres, tu fais, c’est tout", "Une progression semaine après semaine"];
      if (A.block === "motiv") reasons.push("Et si tu lâches encore : le coaching existe pour ça");
      else if (A.block === "time") reasons.push("3 séances par semaine, pas une de trop");
      else reasons.push("Fini les vidéos au hasard");
      reasons.forEach((t) => why.append(el("li", "", t)));
      card.append(why);
      const pr = el("p", "qz-price", "39 € "); pr.append(el("small", "", "UNE SEULE FOIS")); card.append(pr);
      const act = el("div", "qz-actions"); act.append(btn(STORE, "Je commence ce programme", true, true)); card.append(act);
      const alt = el("div", "qz-alt");
      alt.append(el("h3", "", "Tu veux aller plus vite ?"));
      alt.append(el("p", "", "Avec le coaching à distance, je construis ton programme pour toi et je te suis chaque semaine. 150 à 180 € par mois."));
      alt.append(btn("/#contact", "Parler du coaching", false, false));
      card.append(alt);
    }
    const again = el("button", "qz-back qz-restart", "↺ Refaire le quiz");
    again.type = "button";
    again.addEventListener("click", () => { Object.keys(A).forEach((k) => delete A[k]); i = 0; box.hidden = true; $("qz-questions").hidden = false; renderQuestion(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    card.append(again);
    box.append(card);
    box.hidden = false;
    $("qz-form").hidden = true;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    return (coaching ? "coaching|" : "programme|") + prog;
  }

  async function save(name, email, result) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/capture_lead", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_first_name: name, p_email: email, p_source: "quiz", p_result: result, p_consent: true })
    });
    if (!res.ok) throw new Error("save " + res.status);
    try { fetch(SUPABASE_URL + "/functions/v1/systemeio-sync", { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY }, body: "{}", keepalive: true }).catch(() => {}); } catch (e) { /* rien */ }
  }

  $("qz-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const status = $("qz-status");
    const name = $("qz-name").value.trim();
    const email = $("qz-email").value.trim();
    status.className = "ch-status is-error";
    if (!name) { status.textContent = "Indique ton prénom."; $("qz-name").focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.textContent = "Indique un email valide."; $("qz-email").focus(); return; }
    if (!$("qz-consent").checked) { status.textContent = "Coche la case pour recevoir ton résultat."; $("qz-consent").focus(); return; }
    status.className = "ch-status"; status.textContent = "Je calcule ton résultat…";
    const { prog, coaching } = pick();
    const result = (coaching ? "coaching|" : "programme|") + prog;
    try { await save(name, email, result); } catch (e) { /* le résultat s'affiche quand même */ }
    status.textContent = "";
    renderResult(name);
  });

  renderQuestion();
})();
