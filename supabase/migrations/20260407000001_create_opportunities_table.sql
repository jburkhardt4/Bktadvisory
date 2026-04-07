-- ============================================================================
-- Migration: Create opportunities table and opportunity_status enum
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'opportunity_status'
  ) THEN
    CREATE TYPE public.opportunity_status AS ENUM (
      'discovery',
      'solutioning',
      'proposal_prepared',
      'proposal_sent',
      'negotiation',
      'closed_won',
      'closed_lost'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text NOT NULL,
  status public.opportunity_status NOT NULL DEFAULT 'discovery',
  value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER set_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.opportunities TO authenticated;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _policy record;
BEGIN
  FOR _policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'opportunities'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.opportunities',
      _policy.policyname
    );
  END LOOP;
END
$$;

CREATE POLICY "Admins can manage all opportunities"
ON public.opportunities
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
