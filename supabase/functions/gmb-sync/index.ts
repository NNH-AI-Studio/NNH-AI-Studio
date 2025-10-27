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

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authentication token" }),
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

    const { data: account, error: accountError } = await supabase
      .from("gmb_accounts")
      .select("account_id, access_token, refresh_token, token_expires_at")
      .eq("id", accountId)
      .eq("user_id", userId)
      .maybeSingle();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: "Account not found or not owned by user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = account.access_token;
    const expiresAt = new Date(account.token_expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      if (!account.refresh_token) {
        return new Response(
          JSON.stringify({ error: "Token expired and no refresh token available" }),
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
          refresh_token: account.refresh_token,
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

    const locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${gmbAccountId}/locations`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!locationsResponse.ok) {
      throw new Error("Failed to fetch locations");
    }

    const locationsData = await locationsResponse.json();
    const locations = locationsData.locations || [];

    const syncedLocations = [];

    for (const location of locations) {
      const locationData = {
        gmb_account_id: accountId,
        location_id: location.name,
        location_name: location.title || location.name,
        address: location.storefrontAddress ? JSON.stringify(location.storefrontAddress) : null,
        phone: location.phoneNumbers?.primaryPhone || null,
        category: location.categories?.primaryCategory?.displayName || null,
        website: location.websiteUri || null,
      };

      const { error: locationError } = await supabase
        .from("gmb_locations")
        .upsert(locationData, { onConflict: "location_id" });

      if (!locationError) {
        syncedLocations.push(location.title || location.name);
      }
    }

    await supabase
      .from("gmb_accounts")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", accountId);

    return new Response(
      JSON.stringify({
        success: true,
        locationsCount: locations.length,
        syncedLocations,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GMB sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});