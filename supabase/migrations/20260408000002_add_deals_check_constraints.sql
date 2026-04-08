-- Add CHECK constraints for deals.value and deals.probability,
-- and a partial unique index to enforce a single default pipeline.

ALTER TABLE public.deals
  ADD CONSTRAINT deals_value_non_negative CHECK (value >= 0),
  ADD CONSTRAINT deals_probability_range CHECK (probability BETWEEN 0 AND 100);

CREATE UNIQUE INDEX IF NOT EXISTS pipelines_single_default_idx
  ON public.pipelines (is_default)
  WHERE is_default = true;
