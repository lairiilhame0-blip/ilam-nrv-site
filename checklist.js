// Checklist « 10 erreurs » — lead magnet ILAM.NRV.
// La clé "publishable" Supabase est publique par conception : elle ne donne accès qu'à capture_lead.
(function () {
  "use strict";
  const SUPABASE_URL = "https://cgpqkeuxdhkydkheqmja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_RktySkz4hVgMCdM8EKS4Aw_o5-29vI3";
  const $ = (id) => document.getElementById(id);

  $("ck-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const status = $("ck-status");
    const name = $("ck-name").value.trim();
    const email = $("ck-email").value.trim();
    status.className = "ch-status is-error";
    if (!name) { status.textContent = "Indique ton prénom."; $("ck-name").focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.textContent = "Indique un email valide."; $("ck-email").focus(); return; }
    if (!$("ck-consent").checked) { status.textContent = "Coche la case pour recevoir ta checklist."; $("ck-consent").focus(); return; }
    status.className = "ch-status"; status.textContent = "Envoi en cours…";
    try {
      await fetch(SUPABASE_URL + "/rest/v1/rpc/capture_lead", {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_first_name: name, p_email: email, p_source: "checklist", p_result: null, p_consent: true })
      });
      fetch(SUPABASE_URL + "/functions/v1/systemeio-sync", { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY }, body: "{}", keepalive: true }).catch(() => {});
    } catch (e) { /* la checklist reste téléchargeable */ }
    $("ck-hello").textContent = "Voilà ta checklist, " + name + ".";
    $("ck-form").hidden = true;
    $("ck-done").hidden = false;
    $("ck-done").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
