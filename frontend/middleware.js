// Veltix Desk: payment-link guard (runs on Vercel before /pay, part of the main site)
//
// A payment link is accepted only when it pays a UPI ID you saved in the admin
// panel (Settings → UPI ID, current or previous). Change your UPI ID in the
// panel and new links work straight away. No Vercel changes needed.
//
// One-time Vercel → Settings → Environment Variables:
//   DESK_SUPABASE_URL   same as supabaseUrl in public/desk/config.js
//   DESK_SUPABASE_KEY   same publishable key as in public/desk/config.js
//   DESK_UPI            optional extra UPI IDs, comma separated

export const config = { runtime: "nodejs", matcher: ["/pay", "/desk/pay.html"] };

let cache = { at: 0, list: null };
const CACHE_MS = 60 * 1000;

function upiFromLink(d) {
  try {
    const text = Buffer.from(d.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    if (text.startsWith("{")) return String(JSON.parse(text).upi || "");
    return String(text.split("|")[10] || "");
  } catch {
    return "";
  }
}

const norm = (s) => String(s || "").trim().toLowerCase();

// UPI IDs saved in the admin panel, from Supabase. null = couldn't check.
async function savedUpiIds() {
  const url = (process.env.DESK_SUPABASE_URL || "").trim().replace(/\/$/, "");
  const key = (process.env.DESK_SUPABASE_KEY || "").trim();
  if (!url || !key) return null;
  if (cache.list && Date.now() - cache.at < CACHE_MS) return cache.list;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 2500);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/desk_allowed_upi`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: "{}",
      signal: ctl.signal,
    });
    if (!res.ok) return cache.list; // keep last good list if any
    const rows = await res.json();
    const list = (Array.isArray(rows) ? rows : [])
      .map((r) => norm(typeof r === "string" ? r : r && Object.values(r)[0]))
      .filter(Boolean);
    cache = { at: Date.now(), list };
    return list;
  } catch {
    return cache.list;
  } finally {
    clearTimeout(timer);
  }
}

function invalidPage() {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invalid payment link</title><body style="margin:0;background:#0c0d0f;color:#ebe8e1;font:16px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:16px">
<div style="background:#F1EDE5;color:#151515;border-radius:16px;padding:28px 24px;max-width:420px">
<div style="font-family:monospace;letter-spacing:.08em;border-bottom:1px dashed #c8c1b4;padding-bottom:12px;margin-bottom:16px">VELTIX</div>
<b style="font-size:20px">This payment link isn't valid</b><p style="color:#66625b">It wasn't created by Veltix. Please don't pay through it, and contact Veltix on WhatsApp for the correct link.</p></div></body>`;
  return new Response(html, { status: 403, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export default async function middleware(request) {
  const d = new URL(request.url).searchParams.get("d") || "";
  if (!d) return; // no link data: the page shows its own message
  const upi = norm(upiFromLink(d));

  const extra = (process.env.DESK_UPI || "").split(",").map(norm).filter(Boolean);
  if (upi && extra.includes(upi)) return;

  const saved = await savedUpiIds();
  if (saved === null) {
    // Guard not configured or Supabase unreachable: only block if DESK_UPI says so,
    // never stop a genuine client from paying because of an outage.
    if (extra.length && upi && !extra.includes(upi)) return invalidPage();
    return;
  }
  if (upi && saved.includes(upi)) return;
  return invalidPage();
}
