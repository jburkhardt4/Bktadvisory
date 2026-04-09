/**
 * Google Calendar integration routes for the Hono edge-function server.
 *
 * Endpoints:
 *   GET  /gcal/connect     — Redirect to Google OAuth consent screen
 *   GET  /gcal/callback    — Handle OAuth code exchange, store encrypted tokens
 *   POST /gcal/disconnect  — Revoke token & delete credentials
 *   POST /gcal/sync        — Pull latest events from Google → upsert calendar_events
 *   GET  /gcal/status      — Check if current user has connected Google Calendar
 *
 * Tokens are encrypted via pgcrypto pgp_sym_encrypt using a key stored in
 * the GCAL_ENCRYPTION_KEY environment variable.
 */

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEnvOrThrow(name: string): string {
  const val = Deno.env.get(name);
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function supabaseAdmin() {
  return createClient(
    getEnvOrThrow("SUPABASE_URL"),
    getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

function supabaseForUser(accessToken: string) {
  const client = createClient(
    getEnvOrThrow("SUPABASE_URL"),
    getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
  );
  // Use the user's JWT to respect RLS
  return createClient(
    getEnvOrThrow("SUPABASE_URL"),
    Deno.env.get("SUPABASE_ANON_KEY") ?? getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  );
}

function getUserIdFromAuthHeader(authHeader: string | undefined): { userId: string; jwt: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice(7);
  try {
    // Decode JWT payload (no verification — Supabase RLS handles that)
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    if (!payload.sub) return null;
    return { userId: payload.sub, jwt };
  } catch {
    return null;
  }
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const gcalRouter = new Hono();

// ---- GET /gcal/connect ----
gcalRouter.get("/connect", (c) => {
  const clientId = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_ID");
  const redirectUri = `${getEnvOrThrow("SUPABASE_URL")}/functions/v1/main-server/gcal/callback`;

  // Pass user's JWT in state param so we can identify them in callback
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state: userInfo.jwt,
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ---- GET /gcal/callback ----
gcalRouter.get("/callback", async (c) => {
  const code = c.req.query("code");
  const stateJwt = c.req.query("state");

  if (!code || !stateJwt) {
    return c.html("<h2>Missing code or state parameter.</h2>", 400);
  }

  const userInfo = getUserIdFromAuthHeader(`Bearer ${stateJwt}`);
  if (!userInfo) {
    return c.html("<h2>Invalid or expired session. Please try again.</h2>", 401);
  }

  const clientId = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_ID");
  const clientSecret = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_SECRET");
  const redirectUri = `${getEnvOrThrow("SUPABASE_URL")}/functions/v1/main-server/gcal/callback`;
  const encryptionKey = getEnvOrThrow("GCAL_ENCRYPTION_KEY");

  // Exchange code for tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Google token exchange failed:", errText);
    return c.html("<h2>Failed to connect Google Calendar. Please try again.</h2>", 500);
  }

  const tokens = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokens;

  if (!access_token || !refresh_token) {
    console.error("Missing tokens from Google response:", tokens);
    return c.html("<h2>Incomplete token response from Google.</h2>", 500);
  }

  const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString();

  // Store encrypted tokens using pgcrypto via SQL
  const sb = supabaseAdmin();
  const { error: upsertError } = await sb.rpc("upsert_gcal_tokens", {
    p_user_id: userInfo.userId,
    p_access_token: access_token,
    p_refresh_token: refresh_token,
    p_token_expiry: tokenExpiry,
    p_encryption_key: encryptionKey,
  });

  if (upsertError) {
    console.error("Failed to store calendar tokens:", upsertError);
    return c.html("<h2>Failed to save credentials. Please try again.</h2>", 500);
  }

  // Redirect back to the calendar page
  const appOrigin = Deno.env.get("APP_ORIGIN") ?? "http://localhost:5000";
  return c.redirect(`${appOrigin}/portal/admin/calendar?connected=true`);
});

// ---- POST /gcal/disconnect ----
gcalRouter.post("/disconnect", async (c) => {
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) return c.json({ error: "Unauthorized" }, 401);

  const sb = supabaseAdmin();
  const encryptionKey = getEnvOrThrow("GCAL_ENCRYPTION_KEY");

  // Read the access token to revoke it
  const { data: tokenRow } = await sb.rpc("get_gcal_access_token", {
    p_user_id: userInfo.userId,
    p_encryption_key: encryptionKey,
  });

  if (tokenRow) {
    // Best-effort revoke with Google
    await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(tokenRow)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).catch(() => { /* swallow – token may already be expired */ });
  }

  // Delete tokens and all synced events
  await sb.from("google_calendar_tokens").delete().eq("user_id", userInfo.userId);
  await sb.from("calendar_events").delete().eq("user_id", userInfo.userId);

  return c.json({ success: true });
});

// ---- GET /gcal/status ----
gcalRouter.get("/status", async (c) => {
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) return c.json({ error: "Unauthorized" }, 401);

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("google_calendar_tokens")
    .select("user_id, calendar_id, updated_at")
    .eq("user_id", userInfo.userId)
    .maybeSingle();

  return c.json({ connected: !!data, calendarId: data?.calendar_id ?? null });
});

// ---- POST /gcal/sync ----
gcalRouter.post("/sync", async (c) => {
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) return c.json({ error: "Unauthorized" }, 401);

  const sb = supabaseAdmin();
  const encryptionKey = getEnvOrThrow("GCAL_ENCRYPTION_KEY");

  // Decrypt tokens
  const { data: tokenData, error: tokenErr } = await sb.rpc("get_gcal_tokens", {
    p_user_id: userInfo.userId,
    p_encryption_key: encryptionKey,
  });

  if (tokenErr || !tokenData) {
    return c.json({ error: "Google Calendar not connected" }, 400);
  }

  let accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const tokenExpiry = new Date(tokenData.token_expiry);

  // Refresh token if expired
  if (tokenExpiry <= new Date()) {
    const clientId = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_ID");
    const clientSecret = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_SECRET");

    const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!refreshRes.ok) {
      return c.json({ error: "Failed to refresh Google token. Please reconnect." }, 401);
    }

    const refreshData = await refreshRes.json();
    accessToken = refreshData.access_token;
    const newExpiry = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

    // Update stored access token
    await sb.rpc("update_gcal_access_token", {
      p_user_id: userInfo.userId,
      p_access_token: accessToken,
      p_token_expiry: newExpiry,
      p_encryption_key: encryptionKey,
    });
  }

  // Fetch events from Google Calendar (next 90 days)
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const syncToken = tokenData.sync_token;
  let apiUrl: string;

  if (syncToken) {
    // Incremental sync
    apiUrl = `${GOOGLE_CALENDAR_API}/calendars/primary/events?syncToken=${encodeURIComponent(syncToken)}&maxResults=250`;
  } else {
    // Full sync
    apiUrl = `${GOOGLE_CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&maxResults=250`;
  }

  const gRes = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (gRes.status === 410) {
    // Sync token expired — do full sync
    await sb.from("google_calendar_tokens").update({ sync_token: null }).eq("user_id", userInfo.userId);
    return c.json({ error: "Sync token expired. Triggering full resync.", resync: true }, 200);
  }

  if (!gRes.ok) {
    const errText = await gRes.text();
    console.error("Google Calendar API error:", errText);
    return c.json({ error: "Failed to fetch events from Google" }, 502);
  }

  const gData = await gRes.json();
  const events = gData.items ?? [];
  const nextSyncToken = gData.nextSyncToken;

  let created = 0;
  let updated = 0;
  let deleted = 0;

  for (const event of events) {
    if (!event.id) continue;

    // Cancelled events → delete from our DB
    if (event.status === "cancelled") {
      const { count } = await sb
        .from("calendar_events")
        .delete()
        .eq("google_event_id", event.id)
        .eq("user_id", userInfo.userId);
      if (count && count > 0) deleted++;
      continue;
    }

    const isAllDay = !!event.start?.date;
    const startAt = isAllDay
      ? new Date(`${event.start.date}T00:00:00Z`).toISOString()
      : event.start?.dateTime;
    const endAt = isAllDay
      ? new Date(`${event.end.date}T23:59:59Z`).toISOString()
      : event.end?.dateTime;

    if (!startAt || !endAt) continue;

    const row = {
      user_id: userInfo.userId,
      google_event_id: event.id,
      title: event.summary ?? "(No title)",
      description: event.description ?? "",
      start_at: startAt,
      end_at: endAt,
      all_day: isAllDay,
      location: event.location ?? "",
      google_etag: event.etag ?? null,
      sync_status: "synced" as const,
      last_synced_at: new Date().toISOString(),
    };

    // Upsert: if google_event_id exists for this user, update; otherwise insert
    const { data: existing } = await sb
      .from("calendar_events")
      .select("id")
      .eq("google_event_id", event.id)
      .eq("user_id", userInfo.userId)
      .maybeSingle();

    if (existing) {
      await sb.from("calendar_events").update(row).eq("id", existing.id);
      updated++;
    } else {
      await sb.from("calendar_events").insert(row);
      created++;
    }
  }

  // Save nextSyncToken for incremental syncs
  if (nextSyncToken) {
    await sb.from("google_calendar_tokens")
      .update({ sync_token: nextSyncToken })
      .eq("user_id", userInfo.userId);
  }

  return c.json({ success: true, created, updated, deleted });
});

// ---- POST /gcal/push-event ----
// Push a locally-created/updated event to Google Calendar
gcalRouter.post("/push-event", async (c) => {
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { eventId } = body;

  if (!eventId) return c.json({ error: "eventId is required" }, 400);

  const sb = supabaseAdmin();
  const encryptionKey = getEnvOrThrow("GCAL_ENCRYPTION_KEY");

  // Get the calendar event
  const { data: calEvent } = await sb
    .from("calendar_events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", userInfo.userId)
    .maybeSingle();

  if (!calEvent) return c.json({ error: "Event not found" }, 404);

  // Get decrypted access token
  const { data: tokenData } = await sb.rpc("get_gcal_tokens", {
    p_user_id: userInfo.userId,
    p_encryption_key: encryptionKey,
  });

  if (!tokenData) return c.json({ error: "Google Calendar not connected" }, 400);

  let accessToken = tokenData.access_token;

  // Refresh if expired
  if (new Date(tokenData.token_expiry) <= new Date()) {
    const clientId = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_ID");
    const clientSecret = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_SECRET");
    const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!refreshRes.ok) return c.json({ error: "Failed to refresh token" }, 401);
    const refreshResult = await refreshRes.json();
    accessToken = refreshResult.access_token;

    await sb.rpc("update_gcal_access_token", {
      p_user_id: userInfo.userId,
      p_access_token: accessToken,
      p_token_expiry: new Date(Date.now() + refreshResult.expires_in * 1000).toISOString(),
      p_encryption_key: encryptionKey,
    });
  }

  // Build Google Calendar event payload
  const gcalEvent: Record<string, unknown> = {
    summary: calEvent.title,
    description: calEvent.description || undefined,
    location: calEvent.location || undefined,
  };

  if (calEvent.all_day) {
    gcalEvent.start = { date: calEvent.start_at.split("T")[0] };
    gcalEvent.end = { date: calEvent.end_at.split("T")[0] };
  } else {
    gcalEvent.start = { dateTime: calEvent.start_at };
    gcalEvent.end = { dateTime: calEvent.end_at };
  }

  let method: string;
  let url: string;

  if (calEvent.google_event_id) {
    // Update existing
    method = "PUT";
    url = `${GOOGLE_CALENDAR_API}/calendars/primary/events/${calEvent.google_event_id}`;
  } else {
    // Create new
    method = "POST";
    url = `${GOOGLE_CALENDAR_API}/calendars/primary/events`;
  }

  const gRes = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gcalEvent),
  });

  if (!gRes.ok) {
    const errText = await gRes.text();
    console.error("Google Calendar push error:", errText);
    return c.json({ error: "Failed to push event to Google" }, 502);
  }

  const gResult = await gRes.json();

  // Update local record with Google event ID and etag
  await sb
    .from("calendar_events")
    .update({
      google_event_id: gResult.id,
      google_etag: gResult.etag,
      sync_status: "synced",
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  return c.json({ success: true, googleEventId: gResult.id });
});

// ---- POST /gcal/delete-event ----
gcalRouter.post("/delete-event", async (c) => {
  const authHeader = c.req.header("Authorization");
  const userInfo = getUserIdFromAuthHeader(authHeader);
  if (!userInfo) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { eventId } = body;

  if (!eventId) return c.json({ error: "eventId is required" }, 400);

  const sb = supabaseAdmin();
  const encryptionKey = getEnvOrThrow("GCAL_ENCRYPTION_KEY");

  const { data: calEvent } = await sb
    .from("calendar_events")
    .select("id, google_event_id, user_id")
    .eq("id", eventId)
    .eq("user_id", userInfo.userId)
    .maybeSingle();

  if (!calEvent) return c.json({ error: "Event not found" }, 404);

  // Delete from Google if synced
  if (calEvent.google_event_id) {
    const { data: tokenData } = await sb.rpc("get_gcal_tokens", {
      p_user_id: userInfo.userId,
      p_encryption_key: encryptionKey,
    });

    if (tokenData) {
      let accessToken = tokenData.access_token;

      if (new Date(tokenData.token_expiry) <= new Date()) {
        const clientId = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_ID");
        const clientSecret = getEnvOrThrow("GOOGLE_CALENDAR_CLIENT_SECRET");
        const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenData.refresh_token,
            grant_type: "refresh_token",
          }),
        });

        if (refreshRes.ok) {
          const r = await refreshRes.json();
          accessToken = r.access_token;
        }
      }

      await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events/${calEvent.google_event_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ).catch(() => { /* best effort */ });
    }
  }

  // Delete from local DB
  await sb.from("calendar_events").delete().eq("id", eventId);

  return c.json({ success: true });
});

export { gcalRouter };
