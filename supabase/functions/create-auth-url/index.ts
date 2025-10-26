import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new Error("Missing access token");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") ||
      "https://rrarhekwhgpgkakqrlyn.supabase.co/functions/v1/google-oauth-callback";

    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Missing Google OAuth configuration");
    }

    const state = crypto.randomUUID();

    const { error: stateError } = await supabase
      .from("oauth_states")
      .insert({
        state,
        user_id: user.id,
      });

    if (stateError) {
      console.error("Error saving state:", stateError);
      throw new Error("Failed to save OAuth state");
    }

    const scopes = [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": authUrl.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating auth URL:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to create auth URL";
    const errorUrl = Deno.env.get("FRONTEND_REDIRECT_ERROR") || "https://www.nnh.ae/accounts";

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": `${errorUrl}#error=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});