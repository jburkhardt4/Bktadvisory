-- =============================================================
-- Migration: Sync SSO avatar_url into profiles on auth sign-in
-- =============================================================
-- Google:        raw_user_meta_data->>'avatar_url'  (also ->>'picture')
-- LinkedIn OIDC: raw_user_meta_data->>'avatar_url'  (also ->>'picture')
-- Azure/MS:      raw_user_meta_data->>'avatar_url'  (or ->>'picture')
--
-- Strategy: on INSERT or UPDATE of auth.users, if the provider
-- supplies a picture URL and the profiles row has no avatar yet,
-- seed it. This preserves manually-uploaded avatars.
-- =============================================================

CREATE OR REPLACE FUNCTION public.sync_sso_avatar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _avatar text;
BEGIN
  -- Try the fields different providers use
  _avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  -- Only update if a URL was provided AND the user hasn't set a custom avatar
  IF _avatar IS NOT NULL AND _avatar <> '' THEN
    UPDATE public.profiles
    SET avatar_url = _avatar
    WHERE id = NEW.id
      AND avatar_url IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running migration
DROP TRIGGER IF EXISTS on_auth_user_sync_avatar ON auth.users;

CREATE TRIGGER on_auth_user_sync_avatar
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_sso_avatar();
