-- ============================================================================
-- Migration: Drop opportunities table
-- The opportunities entity has been superseded by the deals table in the
-- Sales CRM module (migration 20260408000001).
-- ============================================================================

DROP TABLE IF EXISTS public.opportunities;
DROP TYPE IF EXISTS public.opportunity_status;
