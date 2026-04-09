-- ============================================================================
-- Migration: Add 'website' source enum value and website_url column to contacts
-- ============================================================================

-- 1. Add 'website' to the contact_source enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'contact_source'
      AND e.enumlabel = 'website'
  ) THEN
    ALTER TYPE public.contact_source ADD VALUE 'website';
  END IF;
END
$$;

-- 2. Add website_url column to contacts table
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS website_url text;
