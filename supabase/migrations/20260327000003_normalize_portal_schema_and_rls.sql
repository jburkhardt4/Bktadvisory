-- ============================================================================
-- Migration: Normalize portal schema, ownership fields, auth profile sync, and RLS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'quote_status'
  ) THEN
    CREATE TYPE public.quote_status AS ENUM (
      'draft',
      'scoping',
      'quoted',
      'sent',
      'revision_requested',
      'accepted',
      'declined',
      'expired'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'project_status'
  ) THEN
    CREATE TYPE public.project_status AS ENUM (
      'intake',
      'discovery',
      'scoping',
      'design_in_progress',
      'build_in_progress',
      'awaiting_client',
      'blocked',
      'uat',
      'completed',
      'archived'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'activity_event_type'
  ) THEN
    CREATE TYPE public.activity_event_type AS ENUM (
      'quote_generated',
      'quote_sent',
      'quote_revised',
      'quote_accepted',
      'project_created',
      'discovery_completed',
      'scope_approved',
      'design_started',
      'build_started',
      'client_feedback_requested',
      'client_feedback_received',
      'blocked',
      'unblocked',
      'uat_started',
      'completed',
      'archived'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  company_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  status public.quote_status NOT NULL DEFAULT 'draft',
  estimated_budget_min numeric,
  estimated_budget_max numeric,
  form_data jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  description text,
  status public.project_status NOT NULL DEFAULT 'intake',
  owner text NOT NULL DEFAULT '',
  target_milestone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.activity_event_type NOT NULL,
  client_id uuid,
  record_id uuid NOT NULL,
  description text NOT NULL DEFAULT '',
  actor text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now());

ALTER TABLE IF EXISTS public.quotes
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS status public.quote_status,
  ADD COLUMN IF NOT EXISTS estimated_budget_min numeric,
  ADD COLUMN IF NOT EXISTS estimated_budget_max numeric,
  ADD COLUMN IF NOT EXISTS form_data jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now());

ALTER TABLE IF EXISTS public.projects
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS status public.project_status,
  ADD COLUMN IF NOT EXISTS owner text,
  ADD COLUMN IF NOT EXISTS target_milestone text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now());

ALTER TABLE IF EXISTS public.milestones
  ADD COLUMN IF NOT EXISTS project_id uuid,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now());

ALTER TABLE IF EXISTS public.activity_events
  ADD COLUMN IF NOT EXISTS type public.activity_event_type,
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS record_id uuid,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS actor text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT timezone('utc', now());

UPDATE public.profiles
SET role = 'client'
WHERE role IS NULL
   OR btrim(role) = ''
   OR role NOT IN ('admin', 'client');

UPDATE public.projects
SET name = COALESCE(name, ''),
    company_name = COALESCE(company_name, ''),
    owner = COALESCE(owner, ''),
    target_milestone = COALESCE(target_milestone, '')
WHERE name IS NULL
   OR company_name IS NULL
   OR owner IS NULL
   OR target_milestone IS NULL;

UPDATE public.milestones
SET description = COALESCE(description, '')
WHERE description IS NULL;

UPDATE public.activity_events
SET description = COALESCE(description, '')
WHERE description IS NULL;

UPDATE public.quotes
SET status = 'draft'
WHERE status IS NULL;

UPDATE public.projects
SET status = 'intake'
WHERE status IS NULL;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR btrim(p.email) = '');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id)
      REFERENCES auth.users (id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'client'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quotes_client_id_fkey'
      AND conrelid = 'public.quotes'::regclass
  ) THEN
    ALTER TABLE public.quotes
      ADD CONSTRAINT quotes_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES public.profiles (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_client_id_fkey'
      AND conrelid = 'public.projects'::regclass
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES public.profiles (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'milestones_project_id_fkey'
      AND conrelid = 'public.milestones'::regclass
  ) THEN
    ALTER TABLE public.milestones
      ADD CONSTRAINT milestones_project_id_fkey
      FOREIGN KEY (project_id)
      REFERENCES public.projects (id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_events_record_id_fkey'
      AND conrelid = 'public.activity_events'::regclass
  ) THEN
    ALTER TABLE public.activity_events
      ADD CONSTRAINT activity_events_record_id_fkey
      FOREIGN KEY (record_id)
      REFERENCES public.projects (id)
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_events_client_id_fkey'
      AND conrelid = 'public.activity_events'::regclass
  ) THEN
    ALTER TABLE public.activity_events
      ADD CONSTRAINT activity_events_client_id_fkey
      FOREIGN KEY (client_id)
      REFERENCES public.profiles (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'client',
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

ALTER TABLE public.quotes
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'intake',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN name SET DEFAULT '',
  ALTER COLUMN company_name SET DEFAULT '',
  ALTER COLUMN owner SET DEFAULT '',
  ALTER COLUMN target_milestone SET DEFAULT '',
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

ALTER TABLE public.milestones
  ALTER COLUMN description SET DEFAULT '',
  ALTER COLUMN completed SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now()),
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

ALTER TABLE public.activity_events
  ALTER COLUMN description SET DEFAULT '',
  ALTER COLUMN created_at SET DEFAULT timezone('utc', now());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE email IS NULL OR btrim(email) = ''
  ) THEN
    ALTER TABLE public.profiles
      ALTER COLUMN email SET NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE name IS NULL
       OR company_name IS NULL
       OR owner IS NULL
       OR target_milestone IS NULL
  ) THEN
    ALTER TABLE public.projects
      ALTER COLUMN name SET NOT NULL,
      ALTER COLUMN company_name SET NOT NULL,
      ALTER COLUMN owner SET NOT NULL,
      ALTER COLUMN target_milestone SET NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.milestones
    WHERE description IS NULL
  ) THEN
    ALTER TABLE public.milestones
      ALTER COLUMN description SET NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.activity_events
    WHERE description IS NULL
  ) THEN
    ALTER TABLE public.activity_events
      ALTER COLUMN description SET NOT NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS profiles_email_idx
  ON public.profiles (lower(email));

CREATE INDEX IF NOT EXISTS quotes_client_id_idx
  ON public.quotes (client_id);

CREATE INDEX IF NOT EXISTS projects_client_id_idx
  ON public.projects (client_id);

CREATE INDEX IF NOT EXISTS milestones_project_id_idx
  ON public.milestones (project_id);

CREATE INDEX IF NOT EXISTS activity_events_record_id_idx
  ON public.activity_events (record_id);

CREATE INDEX IF NOT EXISTS activity_events_client_id_idx
  ON public.activity_events (client_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_quotes_updated_at ON public.quotes;
CREATE TRIGGER set_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_milestones_updated_at ON public.milestones;
CREATE TRIGGER set_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT role
      FROM public.profiles
      WHERE id = auth.uid()
      LIMIT 1
    ),
    'client'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'admin';
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_sync_avatar ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_profile_sync ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_auth_user_profile_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _display_name text;
  _first_name text;
  _last_name text;
  _company_name text;
  _phone text;
  _avatar_url text;
  _default_role text;
BEGIN
  _display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name'
  );

  _first_name := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'given_name',
      split_part(COALESCE(_display_name, ''), ' ', 1)
    ),
    ''
  );

  _last_name := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.raw_user_meta_data ->> 'family_name',
      NULLIF(trim(regexp_replace(COALESCE(_display_name, ''), '^\S+\s*', '')), '')
    ),
    ''
  );

  _company_name := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data ->> 'company_name',
      NEW.raw_user_meta_data ->> 'company',
      NEW.raw_user_meta_data ->> 'organization'
    ),
    ''
  );

  _phone := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data ->> 'phone',
      NEW.phone
    ),
    ''
  );

  _avatar_url := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    ''
  );

  _default_role := CASE
    WHEN lower(COALESCE(NEW.email, '')) = 'john@bktadvisory.com' THEN 'admin'
    ELSE 'client'
  END;

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    company_name,
    phone,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    _first_name,
    _last_name,
    NEW.email,
    _company_name,
    _phone,
    _avatar_url,
    _default_role,
    timezone('utc', now()),
    timezone('utc', now())
  )
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, profiles.email),
      first_name = COALESCE(profiles.first_name, EXCLUDED.first_name),
      last_name = COALESCE(profiles.last_name, EXCLUDED.last_name),
      company_name = COALESCE(profiles.company_name, EXCLUDED.company_name),
      phone = COALESCE(profiles.phone, EXCLUDED.phone),
      avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
      role = COALESCE(NULLIF(profiles.role, ''), EXCLUDED.role, 'client'),
      updated_at = timezone('utc', now());

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_profile_sync
AFTER INSERT OR UPDATE OF email, raw_user_meta_data, phone ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_profile_sync();

INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  email,
  company_name,
  phone,
  avatar_url,
  role,
  created_at,
  updated_at
)
SELECT
  u.id,
  NULLIF(
    COALESCE(
      u.raw_user_meta_data ->> 'first_name',
      u.raw_user_meta_data ->> 'given_name',
      split_part(COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), ' ', 1)
    ),
    ''
  ) AS first_name,
  NULLIF(
    COALESCE(
      u.raw_user_meta_data ->> 'last_name',
      u.raw_user_meta_data ->> 'family_name',
      NULLIF(trim(regexp_replace(COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), '^\S+\s*', '')), '')
    ),
    ''
  ) AS last_name,
  u.email,
  NULLIF(
    COALESCE(
      u.raw_user_meta_data ->> 'company_name',
      u.raw_user_meta_data ->> 'company',
      u.raw_user_meta_data ->> 'organization'
    ),
    ''
  ) AS company_name,
  NULLIF(
    COALESCE(
      u.raw_user_meta_data ->> 'phone',
      u.phone
    ),
    ''
  ) AS phone,
  NULLIF(
    COALESCE(
      u.raw_user_meta_data ->> 'avatar_url',
      u.raw_user_meta_data ->> 'picture'
    ),
    ''
  ) AS avatar_url,
  CASE
    WHEN lower(COALESCE(u.email, '')) = 'john@bktadvisory.com' THEN 'admin'
    ELSE 'client'
  END AS role,
  timezone('utc', now()) AS created_at,
  timezone('utc', now()) AS updated_at
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET email = COALESCE(EXCLUDED.email, profiles.email),
    first_name = COALESCE(profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(profiles.last_name, EXCLUDED.last_name),
    company_name = COALESCE(profiles.company_name, EXCLUDED.company_name),
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    role = COALESCE(NULLIF(profiles.role, ''), EXCLUDED.role, 'client'),
    updated_at = timezone('utc', now());

DO $$
DECLARE
  _john_id uuid;
BEGIN
  SELECT id
  INTO _john_id
  FROM auth.users
  WHERE lower(email) = 'john@bktadvisory.com'
  LIMIT 1;

  IF _john_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      first_name,
      last_name,
      email,
      company_name,
      phone,
      role,
      created_at,
      updated_at
    )
    VALUES (
      _john_id,
      'John',
      'Burkhardt',
      'john@bktadvisory.com',
      'BKT Advisory',
      '9523346093',
      'admin',
      timezone('utc', now()),
      timezone('utc', now())
    )
    ON CONFLICT (id) DO UPDATE
    SET first_name = 'John',
        last_name = 'Burkhardt',
        email = 'john@bktadvisory.com',
        company_name = 'BKT Advisory',
        phone = '9523346093',
        role = 'admin',
        updated_at = timezone('utc', now());
  END IF;
END
$$;

UPDATE public.quotes q
SET client_id = p.id
FROM public.profiles p
WHERE q.client_id IS NULL
  AND lower(
    COALESCE(
      NULLIF(q.form_data ->> 'workEmail', ''),
      NULLIF(q.form_data ->> 'work_email', ''),
      NULLIF(q.form_data ->> 'email', ''),
      NULLIF(q.form_data ->> 'clientEmail', ''),
      NULLIF(q.form_data ->> 'client_email', '')
    )
  ) = lower(p.email);

UPDATE public.activity_events ae
SET client_id = p.client_id
FROM public.projects p
WHERE ae.record_id = p.id
  AND ae.client_id IS NULL
  AND p.client_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_activity_event_client_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.record_id IS NOT NULL THEN
    SELECT p.client_id
    INTO NEW.client_id
    FROM public.projects p
    WHERE p.id = NEW.record_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_activity_event_client_id ON public.activity_events;
CREATE TRIGGER set_activity_event_client_id
BEFORE INSERT OR UPDATE OF record_id ON public.activity_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_activity_event_client_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.activity_events TO authenticated;

DO $$
DECLARE
  _policy record;
BEGIN
  FOR _policy IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'quotes', 'projects', 'milestones', 'activity_events')
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      _policy.policyname,
      _policy.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND COALESCE(role, 'client') = public.current_user_role()
);

CREATE POLICY "Admins can manage all quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view their own quotes"
ON public.quotes
FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all milestones"
ON public.milestones
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view milestones for their projects"
ON public.milestones
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = milestones.project_id
      AND p.client_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all activity events"
ON public.activity_events
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view activity for their projects"
ON public.activity_events
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = activity_events.record_id
      AND p.client_id = auth.uid()
  )
);
