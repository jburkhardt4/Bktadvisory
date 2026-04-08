-- Add named CHECK constraints for deals.value and deals.probability
-- (safe to run even if inline column-level checks already exist),
-- and a partial unique index to enforce a single default pipeline.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_value_non_negative'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_value_non_negative CHECK (value >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_probability_range'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_probability_range CHECK (probability BETWEEN 0 AND 100);
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS pipelines_single_default_idx
  ON public.pipelines (is_default)
  WHERE is_default = true;
