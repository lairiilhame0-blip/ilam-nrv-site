// Envoie à une inscrite son lien perso du Challenge Cardio NRV, par email (Brevo).
// Réponse toujours identique : la page ne révèle jamais si un email est inscrit.
// 1 envoi maximum toutes les 5 minutes par inscrite.
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_KEY = (Deno.env.get("BREVO_API_KEY") || "").trim();
const ALLOWED = ["https://ilamnrv.fr", "https://www.ilamnrv.fr"];
const esc = (s: string) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function cors(req: Request) {
  const o = req.headers.get("origin") || "";
  return { "Access-Control-Allow-Origin": ALLOWED.includes(o) ? o : ALLOWED[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type, apikey, authorization", "Vary": "Origin", "Content-Type": "application/json" };
}
const db = (path: string, init: RequestInit = {}) => fetch(SB_URL + "/rest/v1/" + path, { ...init, headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json", ...(init.headers || {}) } });

Deno.serve(async (req) => {
  const h = cors(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  if (req.method !== "POST") return new Response('{"ok":false}', { status: 405, headers: h });
  const done = () => new Response('{"ok":true}', { headers: h });
  let email = "";
  try { email = String((await req.json()).email || "").trim().toLowerCase(); } catch { return done(); }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120 || !BREVO_KEY) return done();

  // Réserve l'envoi : seulement si aucun lien n'est parti depuis 5 minutes.
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const claim = await db("participants?email=eq." + encodeURIComponent(email) + "&or=(access_link_sent_at.is.null,access_link_sent_at.lt." + since + ")&select=first_name,token", {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ access_link_sent_at: new Date().toISOString() }),
  });
  const rows = claim.ok ? await claim.json() : [];
  if (!Array.isArray(rows) || !rows.length) return done();
  const { first_name, token } = rows[0];
  const link = "https://ilamnrv.fr/challenge.html?t=" + token;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Ilam NRV", email: "contact@ilamnrv.fr" },
      to: [{ email, name: first_name || undefined }],
      subject: "Ton lien perso du Challenge Cardio NRV 🔥",
      htmlContent: `<div style="max-width:560px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1a1a1a;">
<p>Hello ${esc(first_name || "guerrière")},</p>
<p>Voici ton lien perso pour noter tes kilomètres :</p>
<p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">Ouvrir mon espace</a></p>
<p>Ce lien, c’est ta clé : ne le partage avec personne.</p>
<p>Tu n’as rien demandé ? Ignore ce mail, rien ne change.</p>
<p>Ilam NRV<br><span style="color:#555;">@ilam.nrv</span></p></div>`,
      tags: ["lien-perso-defi-cardio"],
    }),
  }).catch(() => {});
  return done();
});
