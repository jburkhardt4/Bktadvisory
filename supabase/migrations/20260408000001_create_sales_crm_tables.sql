-- ============================================================================
-- Migration: Phase 1 — Sales CRM Foundation
-- Creates contacts, accounts, deals, and pipelines tables with RLS policies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enum: deal_stage
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'deal_stage'
  ) THEN
    CREATE TYPE public.deal_stage AS ENUM (
      'identified',
      'contacted',
      'responded',
      'qualified',
      'proposal_sent',
      'negotiation',
      'won',
      'lost'
    );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. Enum: contact_source
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'contact_source'
  ) THEN
    CREATE TYPE public.contact_source AS ENUM (
      'upwork',
      'linkedin',
      'email',
      'referral',
      'estimator',
      'manual'
    );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. Table: accounts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  industry text,
  employee_count integer,
  annual_revenue numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_accounts_updated_at ON public.accounts;
CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS accounts_name_idx ON public.accounts (lower(name));

-- ---------------------------------------------------------------------------
-- 4. Table: contacts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  linkedin_url text,
  upwork_url text,
  source public.contact_source NOT NULL DEFAULT 'manual',
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_contacts_updated_at ON public.contacts;
CREATE TRIGGER set_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS contacts_account_id_idx ON public.contacts (account_id);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts (lower(email));

-- ---------------------------------------------------------------------------
-- 5. Table: pipelines
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stages jsonb NOT NULL DEFAULT '[
    {"key":"identified","label":"Identified"},
    {"key":"contacted","label":"Contacted"},
    {"key":"responded","label":"Responded"},
    {"key":"qualified","label":"Qualified"},
    {"key":"proposal_sent","label":"Proposal Sent"},
    {"key":"negotiation","label":"Negotiation"},
    {"key":"won","label":"Won"},
    {"key":"lost","label":"Lost"}
  ]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- 6. Table: deals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.pipelines (id) ON DELETE RESTRICT,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  quote_id uuid REFERENCES public.quotes (id) ON DELETE SET NULL,
  name text NOT NULL,
  stage public.deal_stage NOT NULL DEFAULT 'identified',
  value numeric NOT NULL DEFAULT 0 CHECK (value >= 0),
  probability integer NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close date,
  owner text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_deals_updated_at ON public.deals;
CREATE TRIGGER set_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS deals_pipeline_id_idx ON public.deals (pipeline_id);
CREATE INDEX IF NOT EXISTS deals_contact_id_idx ON public.deals (contact_id);
CREATE INDEX IF NOT EXISTS deals_account_id_idx ON public.deals (account_id);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON public.deals (stage);

-- ---------------------------------------------------------------------------
-- 7. Seed the default pipeline
-- ---------------------------------------------------------------------------
INSERT INTO public.pipelines (name, is_default)
SELECT 'Default Pipeline', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines WHERE is_default = true
);

-- ---------------------------------------------------------------------------
-- 8. Grant permissions to authenticated role
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pipelines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.deals TO authenticated;

-- ---------------------------------------------------------------------------
-- 9. Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 10. RLS Policies — admin-only for CRM tables
-- ---------------------------------------------------------------------------
CREATE POLICY "Admins can manage all accounts"
ON public.accounts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage all contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage all pipelines"
ON public.pipelines
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage all deals"
ON public.deals
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
