import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
        JSON.stringify({ error: "Missing authentication token (Authorization header or token query param)" }),
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

    const { accountId, syncType = "full" } = await req.json();

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: "Missing accountId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try strict select first, then fallback to * to tolerate schema drift
    let { data: account, error: accountError } = await supabase
      .from("gmb_accounts")
      .select("id, account_id, access_token, refresh_token, token_expires_at")
      .eq("id", accountId)
      .eq("user_id", userId)
      .maybeSingle();
    if (accountError) {
      const fb = await supabase
        .from("gmb_accounts")
        .select("*")
        .eq("id", accountId)
        .eq("user_id", userId)
        .maybeSingle();
      account = fb.data as any;
      accountError = fb.error as any;
    }

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: "Account not found or not owned by user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: if tokens are not in gmb_accounts, try oauth_tokens
    let accessToken = (account as any)?.access_token as string | null;
    let refreshToken = (account as any)?.refresh_token as string | null;
    let tokenExpiresAt: string | null = (account as any)?.token_expires_at ?? null;

    if (!accessToken || !tokenExpiresAt) {
      const { data: tok } = await supabase
        .from('oauth_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (tok) {
        accessToken = (accessToken || tok.access_token) as string;
        refreshToken = (refreshToken || tok.refresh_token) as string | null;
        tokenExpiresAt = (tokenExpiresAt || (tok.expires_at as string | null)) ?? null;
      }
    }

    const expiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
    const now = new Date();

    if (!expiresAt || isNaN(expiresAt.getTime()) || expiresAt <= now) {
      if (!refreshToken) {
        return new Response(
          JSON.stringify({ error: "Token expired and no refresh token available", message: "Token expired and no refresh token available" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // *** هنا تم الإصلاح ***
      // تم حذف البادئة VITE_
      const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
      const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);

      await supabase
        .from("gmb_accounts")
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", accountId);
    }

    const gmbAccountId = account.account_id as string;
    if (!gmbAccountId) {
      return new Response(
        JSON.stringify({ error: "Missing account_id on selected account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncedLocations = [] as string[];
    let totalCount = 0;
    let pageToken: string | undefined = undefined;
    do {
      const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${gmbAccountId}/locations`);
      url.searchParams.set('readMask', 'name,title,storefrontAddress,phoneNumbers,websiteUri,categories');
      url.searchParams.set('pageSize', '100');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Failed to fetch locations: ${t}`);
      }

      const json = await resp.json() as any;
      const locations = json.locations || [];

      for (const loc of locations) {
        const addr = loc.storefrontAddress;
        const addressStr = addr
          ? `${(addr.addressLines || []).join(', ')}${addr.locality ? `, ${addr.locality}` : ''}${addr.administrativeArea ? `, ${addr.administrativeArea}` : ''}${addr.postalCode ? ` ${addr.postalCode}` : ''}`
          : null;

        const baseData = {
          gmb_account_id: accountId,
          location_id: loc.name as string,
          location_name: (loc.title || loc.name) as string,
          address: addressStr,
          phone: loc.phoneNumbers?.primaryPhone || null,
          category: loc.categories?.primaryCategory?.displayName || null,
          website: loc.websiteUri || null,
          is_active: true,
          metadata: loc,
        } as Record<string, unknown>;

        const { data: existingLocation } = await supabase
          .from('gmb_locations')
          .select('id')
          .eq('gmb_account_id', accountId)
          .eq('location_id', loc.name as string)
          .maybeSingle();

        if (existingLocation?.id) {
          await supabase
            .from('gmb_locations')
            .update(baseData)
            .eq('id', existingLocation.id);
        } else {
          await supabase
            .from('gmb_locations')
            .insert(baseData);
        }

        syncedLocations.push((loc.title || loc.name) as string);
      }

      totalCount += locations.length;
      pageToken = json.nextPageToken;
    } while (pageToken);

    await supabase
      .from("gmb_accounts")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", accountId);

    return new Response(
      JSON.stringify({
        success: true,
        locationsCount: totalCount,
        syncedLocations,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GMB sync error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});