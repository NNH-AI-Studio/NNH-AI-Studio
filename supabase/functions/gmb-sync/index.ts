import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://www.nnh.ae",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Internal-Run",
  "Access-Control-Max-Age": "86400",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'",
} as const;

// helpers
const ok = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: corsHeaders });
const err = (b: unknown, s: number) => new Response(JSON.stringify(b), { status: s, headers: corsHeaders });
const chunks = <T>(a: T[], n = 100) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

async function fetchRetry(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string | URLSearchParams; timeout?: number; retries?: number } = {},
) {
  const { method = "GET", headers, body, timeout = 60_000, retries = 2 } = opts;
  for (let i = 0; i <= retries; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeout);
    try {
      const r = await fetch(url, { method, headers, body, signal: c.signal });
      clearTimeout(t);
      if (r.ok) return r;
      if (r.status >= 500 && i < retries) { await new Promise(r => setTimeout(r, 300 * (i + 1))); continue; }
      return r;
    } catch {
      clearTimeout(t);
      if (i === retries) throw new Error("network_error");
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw new Error("retry_exhausted");
}

// Google Business Profile constants
const GBP_SCOPE = "https://www.googleapis.com/auth/business.manage";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const GBP_LOC_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_V4_BASE = "https://mybusiness.googleapis.com/v4";

// Service Account JWT (RS256)
const b64u = (a: Uint8Array | ArrayBuffer) => {
  const u = a instanceof Uint8Array ? a : new Uint8Array(a);
  let s = ""; for (let i = 0; i < u.byteLength; i++) s += String.fromCharCode(u[i]);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
const s2u8 = (s: string) => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
const pemToBuf = (p: string) => { const b64 = p.trim().split("\n").filter(l => !l.includes("BEGIN") && !l.includes("END")).join(""); const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
async function importRS256(pem: string) { return crypto.subtle.importKey("pkcs8", pemToBuf(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]); }
async function saToken(scope: string) {
  const raw = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON"); if (!raw) throw new Error("sa_missing");
  let j: { client_email: string; private_key: string; token_uri?: string }; try { j = JSON.parse(raw); } catch { throw new Error("sa_invalid"); }
  const aud = j.token_uri || TOKEN_URI, iat = Math.floor(Date.now()/1000), exp = iat + 3600;
  const head = b64u(s2u8(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const pay = b64u(s2u8(JSON.stringify({ iss: j.client_email, scope, aud, iat, exp })));
  const key = await importRS256(j.private_key);
  const sig = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key, s2u8(`${head}.${pay}`));
  const form = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${pay}.${b64u(sig)}` });
  const r = await fetchRetry(aud, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
  if (!r.ok) throw new Error("sa_token_error"); const t = await r.text().catch(() => ""); const o = t ? JSON.parse(t) : {}; if (!o.access_token) throw new Error("sa_token_missing");
  return o.access_token as string;
}

async function getAccessToken() {
  return saToken(GBP_SCOPE);
}

// Types
type Listing = { name: string; title?: string; storefrontAddress?: unknown; websiteUri?: string | null };
type Review = { name: string; starRating?: number; comment?: string; createTime?: string; updateTime?: string; reviewer?: unknown };
type Media = { name: string; mediaFormat?: string; googleUrl?: string; createTime?: string; updateTime?: string };

// GBP fetchers
async function fetchListings(tok: string, accountRes: string, page?: string) {
  const u = new URL(`${GBP_LOC_BASE}/${accountRes}/locations`);
  u.searchParams.set("readMask", "name,title,storefrontAddress,phoneNumbers,websiteUri,categories");
  u.searchParams.set("pageSize", "100"); if (page) u.searchParams.set("pageToken", page);
  const r = await fetchRetry(u.toString(), { headers: { Authorization: `Bearer ${tok}` } }); const t = await r.text().catch(() => "");
  if (!r.ok) throw new Error("locations_api_error"); const j = t ? JSON.parse(t) : {}; return { items: (j.locations || []) as Listing[], next: j.nextPageToken as string | undefined };
}
async function fetchReviews(tok: string, locRes: string, page?: string) {
  const u = new URL(`${GBP_V4_BASE}/${locRes}/reviews`); u.searchParams.set("pageSize", "50"); if (page) u.searchParams.set("pageToken", page);
  const r = await fetchRetry(u.toString(), { headers: { Authorization: `Bearer ${tok}` } }); const t = await r.text().catch(() => "");
  if (!r.ok) throw new Error("reviews_api_error"); const j = t ? JSON.parse(t) : {}; return { items: (j.reviews || []) as Review[], next: j.nextPageToken as string | undefined };
}
async function fetchMedia(tok: string, locRes: string, page?: string) {
  const u = new URL(`${GBP_V4_BASE}/${locRes}/media`); u.searchParams.set("pageSize", "50"); if (page) u.searchParams.set("pageToken", page);
  const r = await fetchRetry(u.toString(), { headers: { Authorization: `Bearer ${tok}` } }); const t = await r.text().catch(() => "");
  if (!r.ok) throw new Error("media_api_error"); const j = t ? JSON.parse(t) : {}; return { items: (j.mediaItems || []) as Media[], next: j.nextPageToken as string | undefined };
}

// Upserts
async function upsertLocations(db: SupabaseClient, accountId: string, list: Listing[]) {
  const rows = list.map(l => {
    const addr: any = (l as any).storefrontAddress;
    const addressStr = addr
      ? `${(addr.addressLines || []).join(", ")}${addr.locality ? `, ${addr.locality}` : ""}${addr.administrativeArea ? `, ${addr.administrativeArea}` : ""}${addr.postalCode ? ` ${addr.postalCode}` : ""}`
      : null;
    const phone = (l as any)?.phoneNumbers?.primaryPhone || null;
    const category = (l as any)?.categories?.primaryCategory?.displayName || null;
    return {
      gmb_account_id: accountId,
      location_id: l.name,
      location_name: l.title ?? l.name,
      address: addressStr,
      phone,
      category,
      website: l.websiteUri ?? null,
      is_active: true,
      metadata: l,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>;
  });
  for (const b of chunks(rows)) {
    const { error } = await db
      .from("gmb_locations")
      .upsert(b, { onConflict: "gmb_account_id,location_id" });
    if (error) throw error;
  }
}
async function upsertReviews(db: SupabaseClient, accountId: string, list: Review[]) {
  const rows = list.map(r => ({ id: r.name, account_id: accountId, author: r.reviewer ?? null, rating: r.starRating ?? null, comment: r.comment ?? null, create_time: r.createTime ?? null, update_time: r.updateTime ?? null }));
  for (const b of chunks(rows)) { const { error } = await db.from("gmb_reviews").upsert(b, { onConflict: "id" }); if (error) throw error; }
}
async function upsertMedia(db: SupabaseClient, accountId: string, list: Media[]) {
  const rows = list.map(m => ({ id: m.name, account_id: accountId, type: m.mediaFormat ?? null, url: m.googleUrl ?? null, create_time: m.createTime ?? null, update_time: m.updateTime ?? null }));
  for (const b of chunks(rows)) { const { error } = await db.from("gmb_media").upsert(b, { onConflict: "id" }); if (error) throw error; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }
  const started = Date.now();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TRIGGER = Deno.env.get("TRIGGER_SECRET") || "";
  const admin = createClient(SUPABASE_URL, SERVICE);

  let body: any;
  try { body = await req.json(); } catch { return err({ ok: false, error: "invalid_json" }, 400); }
  const accountId = String(body?.accountId || "").trim();
  const syncType = (body?.syncType === "incremental" ? "incremental" : "full") as "incremental" | "full";
  if (!accountId) return err({ ok: false, error: "missing_account_id" }, 400);

  const isInternal = TRIGGER && (req.headers.get("X-Internal-Run") || "") === TRIGGER;
  let db: SupabaseClient, mode: "internal" | "external";
  if (isInternal) { db = admin; mode = "internal"; }
  else {
    const ah = req.headers.get("Authorization") || "";
    if (!ah.startsWith("Bearer ")) return err({ ok: false, error: "missing_bearer_token" }, 401);
    db = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: ah } } });
    mode = "external";
  }

  try {
    const sel = "id,user_id,is_active,account_id";
    const { data: acc, error: accErr } = isInternal
      ? await admin.from("gmb_accounts").select(sel).eq("id", accountId).maybeSingle()
      : await db.from("gmb_accounts").select(sel).eq("id", accountId).maybeSingle();
    if (accErr || !acc) return err({ ok: false, error: "account_not_found" }, 404);
    if (!acc.is_active) return err({ ok: false, error: "account_inactive" }, 400);
    const accountRes = acc.account_id as string | undefined; if (!accountRes) return err({ ok: false, error: "missing_google_account_id" }, 400);

    const token = await getAccessToken();

    let counts = { locations: 0, reviews: 0, media: 0 };
    let next: string | undefined = undefined;
    do {
      const { items, next: n } = await fetchListings(token, accountRes, next);
      if (items.length) {
        await upsertLocations(db, accountId, items);
        counts.locations += items.length;
      }
      next = n; if (syncType === "incremental") break;
    } while (next);

    const took = Date.now() - started;
    const upd = isInternal ? admin : db;
    await upd.from("gmb_accounts").update({ last_sync: new Date().toISOString() }).eq("id", accountId);
    await admin.from("jobs_log").insert({
      started_at: new Date(started).toISOString(),
      finished_at: new Date().toISOString(),
      status: "success",
      source: "gmb-sync",
      meta: { accountId, syncType, counts, mode },
      error: null,
    });

    return ok({ ok: true, mode, accountId, syncType, counts, took_ms: took }, 200);
  } catch (e) {
    const m = (e as Error)?.message || "sync_failed";
    const took = Date.now() - started;
    const mode: "internal" | "external" = (TRIGGER && (req.headers.get("X-Internal-Run") || "") === TRIGGER) ? "internal" : "external";
    await admin.from("jobs_log").insert({
      started_at: new Date(started).toISOString(),
      finished_at: new Date().toISOString(),
      status: "error",
      source: "gmb-sync",
      meta: { accountId, syncType, counts: { locations: 0, reviews: 0, media: 0 }, mode },
      error: m.slice(0, 300),
    });
    if (m === "sa_missing" || m === "sa_invalid" || m === "sa_token_error" || m === "sa_token_missing") return err({ ok: false, error: "google_auth_error", mode, accountId, syncType, took_ms: took }, 500);
    if (m === "network_error") return err({ ok: false, error: "network_error", mode, accountId, syncType, took_ms: took }, 504);
    if (m.endsWith("_api_error")) return err({ ok: false, error: m, mode, accountId, syncType, took_ms: took }, 502);
    return err({ ok: false, error: "sync_failed", mode, accountId, syncType, took_ms: took }, 500);
  }
});