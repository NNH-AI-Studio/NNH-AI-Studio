import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type DailyPoint = { date?: { year: number; month: number; day: number }; value?: { count?: string|number } };

type TimeSeriesResp = {
  timeSeries?: Array<{
    metric?: string;
    dailyMetrics?: DailyPoint[];
  }>;
} & {
  metrics?: Array<{
    metric?: string;
    dailyMetrics?: DailyPoint[];
  }>;
};

function toISO(d?: { year: number; month: number; day: number }): string | null {
  if (!d) return null;
  const mm = String(d.month).padStart(2, '0');
  const dd = String(d.day).padStart(2, '0');
  return `${d.year}-${mm}-${dd}`;
}

function num(v: any): number { const n = Number(v?.count ?? v); return Number.isFinite(n) ? n : 0; }

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

    const { accountId, days = 30 } = await req.json();

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

    // Get locations for account
    const { data: locations, error: locError } = await supabase
      .from("gmb_locations")
      .select("id, location_id")
      .eq("gmb_account_id", accountId);
    if (locError) throw locError;

    let upserted = 0;
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate() - Number(days));

    const startY = start.getUTCFullYear();
    const startM = start.getUTCMonth() + 1;
    const startD = start.getUTCDate();
    const endY = end.getUTCFullYear();
    const endM = end.getUTCMonth() + 1;
    const endD = end.getUTCDate();

    const metrics = [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'BUSINESS_QUERIES_DIRECT',
      'BUSINESS_QUERIES_INDIRECT',
      'BUSINESS_QUERIES_CHAIN',
      'CALL_CLICKS',
      'DIRECTION_REQUESTS',
      'WEBSITE_CLICKS',
      'MESSAGES',
    ];

    for (const loc of (locations || [])) {
      const url = `https://businessprofileperformance.googleapis.com/v1/${loc.location_id}/basicMetrics:searchDailyMetricsTimeSeries`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyMetrics: metrics.map(m => ({ metric: m })),
          dateRange: {
            startDate: { year: startY, month: startM, day: startD },
            endDate: { year: endY, month: endM, day: endD },
          },
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.warn('Insights API failed for', loc.location_id, t);
        continue;
      }

      const json = (await resp.json()) as TimeSeriesResp;
      const series = json.timeSeries || json.metrics || [];

      const rows: Array<{ location_id: string; date: string; metric_type: string; metric_value: number; source?: string }>= [];

      for (const s of series) {
        const metricName = s.metric || '';
        const pts = s.dailyMetrics || [];
        for (const pt of pts) {
          const dateIso = toISO(pt.date);
          if (!dateIso) continue;
          const val = num(pt.value);

          // Map to our simple metric types
          if (metricName.includes('IMPRESSIONS')) {
            // Aggregate to 'views' with source 'total' to satisfy CHECK constraint
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'views', metric_value: val, source: 'total' });
          } else if (metricName === 'BUSINESS_QUERIES_DIRECT') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'searches', metric_value: val, source: 'direct' });
          } else if (metricName === 'BUSINESS_QUERIES_INDIRECT') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'searches', metric_value: val, source: 'discovery' });
          } else if (metricName === 'BUSINESS_QUERIES_CHAIN') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'searches', metric_value: val, source: 'branded' });
          } else if (metricName === 'CALL_CLICKS') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'calls', metric_value: val });
          } else if (metricName === 'WEBSITE_CLICKS') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'website_clicks', metric_value: val });
          } else if (metricName === 'DIRECTION_REQUESTS') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'directions', metric_value: val });
          } else if (metricName === 'MESSAGES') {
            rows.push({ location_id: loc.id, date: dateIso, metric_type: 'messages', metric_value: val });
          }
        }
      }

      if (rows.length > 0) {
        const { error: upErr } = await supabase
          .from('gmb_insights')
          .upsert(rows, { onConflict: 'location_id,date,metric_type,source' });
        if (upErr) throw upErr;
        upserted += rows.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, insightsUpserted: upserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('gmb-sync-insights error:', e);
    const isInvalidGrant = msg.toLowerCase().includes('invalid_grant');
    return new Response(
      JSON.stringify({ error: isInvalidGrant ? 'invalid_grant' : msg, message: isInvalidGrant ? 'Reconnect required' : msg }),
      { status: isInvalidGrant ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
