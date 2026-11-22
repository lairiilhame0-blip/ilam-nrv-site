// Médailles digitales du Challenge Cardio NRV + accès au niveau 2.
// Les images sont dessinées dans le navigateur (aucun serveur, aucune donnée envoyée).
(function () {
  "use strict";
  const SUPABASE_URL = "https://cgpqkeuxdhkydkheqmja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_RktySkz4hVgMCdM8EKS4Aw_o5-29vI3";
  const $ = (id) => document.getElementById(id);
  const grid = $("medal-grid");
  const level2 = $("level2");
  if (!grid || !level2) return;

  const MEDALS = [
    { km: 10, name: "LANCÉE", line: "J’ai lancé le Challenge Cardio NRV." },
    { km: 25, name: "MI-PARCOURS", line: "25 km. Je ne lâche rien." },
    { km: 50, name: "FINISHER", line: "50 km en 7 jours. Fait." }
  ];
  const NEON = "#c8ff2e", VIOLET = "#b026ff", PAPER = "#f4f1e8", MUTED = "#b6b7a6";
  let lastKey = "";

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function fmt(n) { return (Math.round(n * 10) / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 }); }

  function draw(m, total, name) {
    const W = 1080, H = 1920, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W / 2, 860, 60, W / 2, 860, 760);
    glow.addColorStop(0, "rgba(176,38,255,.35)"); glow.addColorStop(1, "rgba(176,38,255,0)");
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    g.textAlign = "center";
    const D = "'Bebas Neue', Impact, sans-serif", M = "'Space Mono', monospace", S = "Inter, Arial, sans-serif";

    g.fillStyle = MUTED; g.font = "700 34px " + M; g.fillText("CHALLENGE CARDIO NRV", W / 2, 190);
    g.fillStyle = PAPER; g.font = "80px " + D; g.fillText("ILAM.NRV", W / 2, 290);

    // Rubans
    g.fillStyle = VIOLET;
    g.beginPath(); g.moveTo(400, 380); g.lineTo(500, 380); g.lineTo(560, 560); g.lineTo(470, 600); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(680, 380); g.lineTo(580, 380); g.lineTo(520, 560); g.lineTo(610, 600); g.closePath(); g.fill();
    // Médaille
    g.save(); g.shadowColor = NEON; g.shadowBlur = 60;
    g.beginPath(); g.arc(W / 2, 860, 330, 0, Math.PI * 2); g.fillStyle = NEON; g.fill(); g.restore();
    g.beginPath(); g.arc(W / 2, 860, 296, 0, Math.PI * 2); g.fillStyle = "#121212"; g.fill();
    g.beginPath(); g.arc(W / 2, 860, 270, 0, Math.PI * 2); g.lineWidth = 4; g.strokeStyle = "rgba(200,255,46,.5)"; g.stroke();
    g.fillStyle = PAPER; g.font = "300px " + D; g.fillText(String(m.km), W / 2, 930);
    g.fillStyle = NEON; g.font = "86px " + D; g.fillText("KM", W / 2, 1030);

    g.fillStyle = NEON; g.font = "150px " + D; g.fillText(m.name, W / 2, 1350);
    g.fillStyle = PAPER; g.font = "110px " + D; g.fillText((name || "GUERRIÈRE").toUpperCase().slice(0, 18), W / 2, 1480);
    g.fillStyle = "#e3e2d9"; g.font = "500 44px " + S; g.fillText(m.line, W / 2, 1570);
    g.fillStyle = MUTED; g.font = "700 30px " + M; g.fillText("TOTAL : " + fmt(total) + " KM · 30 NOV – 6 DÉC 2026", W / 2, 1640);

    g.fillStyle = VIOLET; g.fillRect(W / 2 - 220, 1700, 440, 4);
    g.fillStyle = MUTED; g.font = "700 28px " + M; g.fillText("MÉDAILLE DÉCERNÉE PAR", W / 2, 1760);
    g.fillStyle = NEON; g.font = "84px " + D; g.fillText("ILAM NRV", W / 2, 1840);
    g.fillStyle = PAPER; g.font = "700 34px " + M; g.fillText("@ilam.nrv · #CardioNRV", W / 2, 1890);
    return c;
  }

  function toBlob(c) { return new Promise((res) => c.toBlob(res, "image/png")); }

  async function share(m, total, name, status) {
    const c = draw(m, total, name);
    const blob = await toBlob(c);
    if (!blob) return;
    const file = new File([blob], "medaille-cardio-nrv-" + m.km + "km.png", { type: "image/png" });
    const text = m.line + " #CardioNRV @ilam.nrv";
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = file.name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    if (status) status.textContent = "Médaille téléchargée. Publie-la en story et mentionne @ilam.nrv !";
  }

  function render(total) {
    const name = read("nrv_name") || "";
    const key = MEDALS.filter((m) => total >= m.km).length + "|" + name + "|" + fmt(total);
    if (key === lastKey) return;
    lastKey = key;
    grid.textContent = "";
    MEDALS.forEach((m) => {
      const on = total >= m.km;
      const card = document.createElement("div");
      card.className = "ch-medal" + (on ? " is-on" : "");
      if (on) {
        const img = document.createElement("img");
        img.alt = "Médaille " + m.name + " " + m.km + " km";
        img.src = draw(m, total, name).toDataURL("image/png");
        card.append(img);
      } else {
        const box = document.createElement("div");
        box.className = "ch-medal-locked";
        box.textContent = "🔒 À " + m.km + " KM";
        card.append(box);
      }
      const t = document.createElement("p"); t.className = "ch-medal-name"; t.textContent = m.name; card.append(t);
      if (on) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "button button-primary";
        b.textContent = "Poste ta victoire";
        const st = document.createElement("p"); st.className = "ch-status"; st.setAttribute("role", "status");
        b.addEventListener("click", () => share(m, total, name, st));
        card.append(b, st);
      }
      grid.append(card);
    });
    renderLevel2(total);
  }

  function renderLevel2(total) {
    level2.textContent = "";
    const open = total >= 50;
    level2.className = "ch-level2" + (open ? " is-open" : "");
    const tag = document.createElement("p"); tag.className = "ch-link-title";
    tag.textContent = open ? "🔓 NIVEAU 2 DÉBLOQUÉ" : "🔒 NIVEAU 2";
    const h = document.createElement("h3"); h.textContent = "CARDIO NRV 100";
    const p = document.createElement("p");
    p.textContent = open
      ? "100 km en 14 jours. Réservé aux finisheuses du niveau 1. Les dates arrivent bientôt : réserve ta place maintenant."
      : "100 km en 14 jours, réservé aux finisheuses. Termine tes 50 km pour le débloquer.";
    level2.append(tag, h, p);
    if (open) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "button button-primary"; b.textContent = "Je réserve ma place";
      const st = document.createElement("p"); st.className = "ch-status"; st.setAttribute("role", "status");
      b.addEventListener("click", async () => {
        const token = read("nrv_token");
        if (!token) { st.textContent = "Ouvre ta page avec ton lien personnel pour réserver."; return; }
        b.disabled = true; st.textContent = "Réservation…";
        try {
          const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/join_niveau2", {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ p_token: token })
          });
          const out = await res.json();
          if (out === "ok") {
            st.className = "ch-status is-ok"; st.textContent = "C’est noté, guerrière. Tu seras la première prévenue. 🔥";
            fetch(SUPABASE_URL + "/functions/v1/systemeio-sync", { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY }, body: "{}", keepalive: true }).catch(() => {});
          } else {
            st.textContent = "Tes 50 km ne sont pas encore tous enregistrés. Vérifie tes jours, puis réessaie.";
            b.disabled = false;
          }
        } catch (e) { st.textContent = "Ça n’a pas marché. Réessaie dans un instant."; b.disabled = false; }
      });
      level2.append(b, st);
    }
  }

  // Premier affichage : le script peut se charger après le calcul du total.
  function initialTotal() {
    try { const o = JSON.parse(read("nrv_km") || "{}"); return Object.values(o).reduce((s, v) => s + (Number(v) || 0), 0); } catch (e) { return 0; }
  }
  if (read("nrv_token")) {
    const t0 = initialTotal();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(t0)); else render(t0);
  }

  document.addEventListener("nrv:total", (e) => {
    const total = Number(e.detail && e.detail.total) || 0;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(total)); else render(total);
  });
})();
