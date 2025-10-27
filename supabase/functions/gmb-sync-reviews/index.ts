import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type GoogleReview = {
  name: string; // accounts/{a}/locations/{l}/reviews/{r}
  reviewId?: string;
  createTime?: string;
  updateTime?: string;
  comment?: string;
  starRating?: string | number;
  reviewer?: { displayName?: string };
  reviewReply?: { comment?: string; updateTime?: string };
};

function mapStarRating(r: GoogleReview["starRating"]): number {
  if (typeof r === "number") return r;
  switch (r) {
    case "ONE": return 1;
    case "TWO": return 2;
    case "THREE": return 3;
    case "FOUR": return 4;
    case "FIVE": return 5;
    default: return 0;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const bearer = req.headers.get("Authorization")?.startsWith("Bearer ")
      ? req.headers.get("Authorization")!.slice(7)
      : null;
    const token = bearer || url.searchParams.get("token");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authentication token (Authorization header or token query param)", message: "Missing authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    const { accountId, pageSize = 100 } = await req.json();
    if (!accountId) {
      return new Response(
        JSON.stringify({ error: "Missing accountId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: account, error: accountError } = await supabase
      .from("gmb_accounts")
      .select("id, account_id, access_token, refresh_token, token_expires_at")
      .eq("id", accountId)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: "Account not found or not owned by user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = account.access_token as string;
    const expiresAt = account.token_expires_at ? new Date(account.token_expires_at as string) : null;
    const now = new Date();

    if (!expiresAt || isNaN(expiresAt.getTime()) || expiresAt <= now) {
      if (!account.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Token expired and no refresh token available", message: "Token expired and no refresh token available" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
      const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: account.refresh_token as string,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        const t = await refreshResponse.text();
        try {
          const j = JSON.parse(t);
          if (j.error === "invalid_grant") {
            return new Response(
              JSON.stringify({ error: "invalid_grant", message: "Reconnect required" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (_) {}
        return new Response(
          JSON.stringify({ error: `Failed to refresh token: ${t}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (refreshData.expires_in || 3600));

      const updateData: any = { access_token: accessToken, token_expires_at: newExpiresAt.toISOString() };
      if (refreshData.refresh_token) updateData.refresh_token = refreshData.refresh_token as string;
      await supabase
        .from("gmb_accounts")
        .update(updateData)
        .eq("id", accountId);
    }

    let gmbAccountId = account.account_id as string;
    if (!gmbAccountId) {
      const endpoints = [
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        "https://businessprofile.googleapis.com/v1/accounts",
      ];
      for (const ep of endpoints) {
        try {
          const r = await fetch(ep, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (!r.ok) continue;
          const j = await r.json();
          const arr = (j as any).accounts || (j as any).items || [];
          if (Array.isArray(arr) && arr.length > 0) {
            const name = arr[0]?.name;
            if (typeof name === "string" && name) {
              await supabase
                .from("gmb_accounts")
                .update({ account_id: name })
                .eq("id", accountId);
              gmbAccountId = name;
              break;
            }
          }
        } catch (_) {}
      }
    }

    // Fetch DB locations for this account
    const { data: locations, error: locError } = await supabase
      .from("gmb_locations")
      .select("id, location_id, location_name")
      .eq("gmb_account_id", accountId);

    if (locError) throw locError;

    let totalReviews = 0;

    for (const loc of locations || []) {
      // Compose reviews URL using v4 API
      // account.account_id looks like "accounts/123" and loc.location_id looks like "locations/456"
      const locIdPart = String(loc.location_id || '').split('/').pop();
      const url = new URL(`https://mybusiness.googleapis.com/v4/${gmbAccountId}/locations/${locIdPart}/reviews`);
      url.searchParams.set("pageSize", String(pageSize));

      let pageToken: string | undefined = undefined;
      do {
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const resp = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.warn("Failed to fetch reviews for", loc.location_id, txt);
          break; // continue to next location
        }
        const json = await resp.json();
        const reviews: GoogleReview[] = json.reviews || [];
        pageToken = json.nextPageToken;

        if (reviews.length === 0) continue;

        const rows = reviews.map((rv) => {
          const extId = rv.reviewId || (rv.name?.split("/").pop() ?? "");
          return {
            location_id: loc.id,
            external_review_id: extId || null,
            review_name: rv.name || null,
            author_name: rv.reviewer?.displayName || "Anonymous",
            rating: mapStarRating(rv.starRating),
            review_text: rv.comment || null,
            review_date: rv.createTime || new Date().toISOString(),
            reply_text: rv.reviewReply?.comment || null,
            reply_date: rv.reviewReply?.updateTime || null,
            has_reply: !!(rv.reviewReply?.comment),
          };
        });

        const { error: upErr } = await supabase
          .from("gmb_reviews")
          .upsert(rows, { onConflict: "external_review_id" });
        if (upErr) throw upErr;
        totalReviews += rows.length;
      } while (pageToken);
    }

    await supabase
      .from("gmb_accounts")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", accountId);

    return new Response(
      JSON.stringify({ success: true, reviewsUpserted: totalReviews }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("gmb-sync-reviews error:", e);
    const isInvalidGrant = msg.toLowerCase().includes("invalid_grant");
    return new Response(
      JSON.stringify({ error: isInvalidGrant ? "invalid_grant" : msg, message: isInvalidGrant ? "Reconnect required" : msg }),
      { status: isInvalidGrant ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
