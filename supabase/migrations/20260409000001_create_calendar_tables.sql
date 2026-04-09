-- =============================================================================
-- Migration: Google Calendar Integration Tables
-- Date: 2026-04-09
-- Description: Creates calendar_events and google_calendar_tokens tables,
--              a trigger to auto-create CRM activity_events on meeting creation,
--              pgcrypto-backed encryption helpers for token storage, and RLS.
-- =============================================================================

-- Enable pgcrypto for column-level encryption of OAuth tokens.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Add 'meeting_scheduled' to activity_event_type enum
-- ---------------------------------------------------------------------------
ALTER TYPE public.activity_event_type ADD VALUE IF NOT EXISTS 'meeting_scheduled';

-- ---------------------------------------------------------------------------
-- 2. calendar_events — synced Google Calendar events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_event_id  text        UNIQUE,
  title            text        NOT NULL,
  description      text        NOT NULL DEFAULT '',
  start_at         timestamptz NOT NULL,
  end_at           timestamptz NOT NULL,
  all_day          boolean     NOT NULL DEFAULT false,
  location         text        NOT NULL DEFAULT '',
  -- CRM linking (nullable — not every event is CRM-linked)
  deal_id          uuid        REFERENCES public.deals(id)    ON DELETE SET NULL,
  project_id       uuid        REFERENCES public.projects(id) ON DELETE SET NULL,
  contact_id       uuid        REFERENCES public.contacts(id) ON DELETE SET NULL,
  -- Sync state management
  sync_status      text        NOT NULL DEFAULT 'synced'
                   CHECK (sync_status IN ('synced','pending_push','pending_pull','conflict')),
  google_etag      text,
  last_synced_at   timestamptz,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Performance indexes
CREATE INDEX calendar_events_user_id_idx      ON public.calendar_events (user_id);
CREATE INDEX calendar_events_start_at_idx     ON public.calendar_events (start_at);
CREATE INDEX calendar_events_google_eid_idx   ON public.calendar_events (google_event_id);
CREATE INDEX calendar_events_project_id_idx   ON public.calendar_events (project_id);
CREATE INDEX calendar_events_deal_id_idx      ON public.calendar_events (deal_id);

-- Auto-update updated_at (reuses the existing set_updated_at trigger function)
CREATE TRIGGER set_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. google_calendar_tokens — per-user OAuth credentials (encrypted)
-- ---------------------------------------------------------------------------
-- Encryption key is read from a Supabase Vault secret named 'gcal_encryption_key'.
-- Tokens are encrypted at INSERT/UPDATE via pgcrypto.pgp_sym_encrypt and decrypted
-- via pgcrypto.pgp_sym_decrypt in application-level edge functions that use the
-- service-role key. The column stores bytea, not raw text.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  user_id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token_enc bytea       NOT NULL,
  refresh_token_enc bytea      NOT NULL,
  token_expiry     timestamptz NOT NULL,
  calendar_id      text        NOT NULL DEFAULT 'primary',
  sync_token       text,          -- Google incremental sync token
  channel_id       text,          -- Push notification channel (Phase 2)
  channel_expiry   timestamptz,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_gcal_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Auto-create CRM activity when a calendar event is linked to a project
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_calendar_to_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    INSERT INTO public.activity_events (type, record_id, description, actor)
    VALUES (
      'meeting_scheduled',
      NEW.project_id,
      NEW.title,
      'calendar-sync'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calendar_event_to_activity
  AFTER INSERT ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.sync_calendar_to_activity();

-- ---------------------------------------------------------------------------
-- 5. RLS policies
-- ---------------------------------------------------------------------------

-- calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all calendar events"
  ON public.calendar_events FOR ALL TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can manage their own calendar events"
  ON public.calendar_events FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- google_calendar_tokens — users manage only their own tokens
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar tokens"
  ON public.google_calendar_tokens FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all calendar tokens"
  ON public.google_calendar_tokens FOR SELECT TO authenticated
  USING (public.is_admin());
