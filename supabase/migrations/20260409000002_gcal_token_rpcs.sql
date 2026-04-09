-- =============================================================================
-- Migration: pgcrypto helper RPCs for Google Calendar token encryption
-- Date: 2026-04-09
-- Description: SQL functions that encrypt/decrypt OAuth tokens via pgcrypto
--              pgp_sym_encrypt / pgp_sym_decrypt. Called from edge functions
--              using the service-role key.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- upsert_gcal_tokens — encrypt and store access + refresh tokens
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_gcal_tokens(
  p_user_id       uuid,
  p_access_token  text,
  p_refresh_token text,
  p_token_expiry  timestamptz,
  p_encryption_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.google_calendar_tokens (
    user_id, access_token_enc, refresh_token_enc, token_expiry
  ) VALUES (
    p_user_id,
    pgp_sym_encrypt(p_access_token, p_encryption_key),
    pgp_sym_encrypt(p_refresh_token, p_encryption_key),
    p_token_expiry
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_token_enc  = pgp_sym_encrypt(p_access_token, p_encryption_key),
    refresh_token_enc = pgp_sym_encrypt(p_refresh_token, p_encryption_key),
    token_expiry      = p_token_expiry,
    updated_at        = timezone('utc', now());
END;
$$;

-- ---------------------------------------------------------------------------
-- get_gcal_tokens — decrypt and return both tokens + metadata
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_gcal_tokens(
  p_user_id        uuid,
  p_encryption_key text
)
RETURNS TABLE (
  access_token  text,
  refresh_token text,
  token_expiry  timestamptz,
  sync_token    text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pgp_sym_decrypt(t.access_token_enc, p_encryption_key)  AS access_token,
    pgp_sym_decrypt(t.refresh_token_enc, p_encryption_key) AS refresh_token,
    t.token_expiry,
    t.sync_token
  FROM public.google_calendar_tokens t
  WHERE t.user_id = p_user_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_gcal_access_token — decrypt only the access token (for revocation)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_gcal_access_token(
  p_user_id        uuid,
  p_encryption_key text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  SELECT pgp_sym_decrypt(t.access_token_enc, p_encryption_key)
  INTO v_token
  FROM public.google_calendar_tokens t
  WHERE t.user_id = p_user_id;

  RETURN v_token;
END;
$$;

-- ---------------------------------------------------------------------------
-- update_gcal_access_token — re-encrypt access token after refresh
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_gcal_access_token(
  p_user_id        uuid,
  p_access_token   text,
  p_token_expiry   timestamptz,
  p_encryption_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.google_calendar_tokens
  SET
    access_token_enc = pgp_sym_encrypt(p_access_token, p_encryption_key),
    token_expiry     = p_token_expiry,
    updated_at       = timezone('utc', now())
  WHERE user_id = p_user_id;
END;
$$;
