-- Migration: doctor dashboard queue + real patient/visit data
-- Run this after supabase_schema.sql and supabase_migration_auth.sql.

-- Patient demographics from the ABHA profile (previously fetched on login but discarded).
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS year_of_birth INT;

-- Queue status + persisted intake transcript + doctor-entered clinical data.
-- chat_history/chief_complaint were previously only ever kept in the patient's
-- own browser localStorage, so a doctor on a different device could never see them.
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'waiting',
  ADD COLUMN IF NOT EXISTS chat_history JSONB,
  ADD COLUMN IF NOT EXISTS is_finished BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vitals JSONB,
  ADD COLUMN IF NOT EXISTS diagnosis JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prescription JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
  ADD COLUMN IF NOT EXISTS private_memo TEXT;

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_status_check;
ALTER TABLE public.visits
  ADD CONSTRAINT visits_status_check CHECK (status IN ('waiting', 'in_consultation', 'completed'));

CREATE INDEX IF NOT EXISTS visits_status_created_at_idx ON public.visits (status, created_at);
