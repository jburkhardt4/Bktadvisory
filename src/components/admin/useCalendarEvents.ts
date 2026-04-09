import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseUrl } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  user_id: string;
  google_event_id: string | null;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location: string;
  deal_id: string | null;
  project_id: string | null;
  contact_id: string | null;
  sync_status: 'synced' | 'pending_push' | 'pending_pull' | 'conflict';
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  location?: string;
  deal_id?: string | null;
  project_id?: string | null;
  contact_id?: string | null;
}

interface GcalStatus {
  connected: boolean;
  calendarId: string | null;
}

// ---------------------------------------------------------------------------
// Edge function caller
// ---------------------------------------------------------------------------

const EDGE_FN_BASE = `${supabaseUrl}/functions/v1/main-server`;

async function callEdgeFn<T = unknown>(
  path: string,
  method: 'GET' | 'POST',
  jwt: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${EDGE_FN_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Edge function error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCalendarEvents() {
  const { session } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jwt = session?.access_token ?? '';
  const userId = session?.user?.id ?? '';

  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error: fetchErr } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_at', { ascending: true });

      if (fetchErr) throw fetchErr;
      setEvents((data as CalendarEvent[]) ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Check Google Calendar connection status
  const checkGcalStatus = useCallback(async () => {
    if (!jwt) return;
    try {
      const status = await callEdgeFn<GcalStatus>('/gcal/status', 'GET', jwt);
      setGcalConnected(status.connected);
    } catch {
      setGcalConnected(false);
    }
  }, [jwt]);

  useEffect(() => {
    void fetchEvents();
    void checkGcalStatus();
  }, [fetchEvents, checkGcalStatus]);

  // Create event locally + push to Google
  const createEvent = useCallback(
    async (input: CalendarEventInput) => {
      if (!userId) return;

      const { data, error: insertErr } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? '',
          start_at: input.start_at,
          end_at: input.end_at,
          all_day: input.all_day ?? false,
          location: input.location ?? '',
          deal_id: input.deal_id ?? null,
          project_id: input.project_id ?? null,
          contact_id: input.contact_id ?? null,
          sync_status: gcalConnected ? 'pending_push' : 'synced',
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      const newEvent = data as CalendarEvent;

      // Push to Google if connected
      if (gcalConnected && jwt) {
        try {
          await callEdgeFn('/gcal/push-event', 'POST', jwt, { eventId: newEvent.id });
        } catch (pushErr) {
          console.warn('Failed to push event to Google Calendar:', pushErr);
        }
      }

      await fetchEvents();
      return newEvent;
    },
    [userId, jwt, gcalConnected, fetchEvents],
  );

  // Update event locally + push to Google
  const updateEvent = useCallback(
    async (eventId: string, input: Partial<CalendarEventInput>) => {
      if (!userId) return;

      const { error: updateErr } = await supabase
        .from('calendar_events')
        .update({
          ...input,
          sync_status: gcalConnected ? 'pending_push' : 'synced',
        })
        .eq('id', eventId)
        .eq('user_id', userId);

      if (updateErr) throw updateErr;

      // Push to Google if connected
      if (gcalConnected && jwt) {
        try {
          await callEdgeFn('/gcal/push-event', 'POST', jwt, { eventId });
        } catch (pushErr) {
          console.warn('Failed to push update to Google Calendar:', pushErr);
        }
      }

      await fetchEvents();
    },
    [userId, jwt, gcalConnected, fetchEvents],
  );

  // Delete event locally + from Google
  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!userId || !jwt) return;

      if (gcalConnected) {
        try {
          await callEdgeFn('/gcal/delete-event', 'POST', jwt, { eventId });
          await fetchEvents();
          return;
        } catch (pushErr) {
          console.warn('Failed to delete from Google Calendar:', pushErr);
        }
      }

      // Fallback: local delete only
      await supabase.from('calendar_events').delete().eq('id', eventId).eq('user_id', userId);
      await fetchEvents();
    },
    [userId, jwt, gcalConnected, fetchEvents],
  );

  // Sync from Google Calendar
  const syncFromGoogle = useCallback(async () => {
    if (!jwt) return;
    setSyncing(true);
    try {
      const result = await callEdgeFn<{ success: boolean; resync?: boolean }>(
        '/gcal/sync',
        'POST',
        jwt,
      );

      // Handle sync token expiry — retry once as full sync
      if (result.resync) {
        await callEdgeFn('/gcal/sync', 'POST', jwt);
      }

      await fetchEvents();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [jwt, fetchEvents]);

  // Connect Google Calendar (redirect to OAuth)
  const connectGoogleCalendar = useCallback(() => {
    if (!jwt) return;
    window.location.href = `${EDGE_FN_BASE}/gcal/connect?state=${encodeURIComponent(jwt)}`;
  }, [jwt]);

  // Disconnect Google Calendar
  const disconnectGoogleCalendar = useCallback(async () => {
    if (!jwt) return;
    await callEdgeFn('/gcal/disconnect', 'POST', jwt);
    setGcalConnected(false);
    await fetchEvents();
  }, [jwt, fetchEvents]);

  return {
    events,
    loading,
    syncing,
    error,
    gcalConnected,
    createEvent,
    updateEvent,
    deleteEvent,
    syncFromGoogle,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    refreshEvents: fetchEvents,
  };
}
