-- Migration: ABHA authentication support
-- Run this after supabase_schema.sql.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS abha_address TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS public.patient_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    abha_number TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;

-- Matches the anonymous-access prototyping policy used on the other tables.
-- Restrict this to authenticated/service-role access before production use.
CREATE POLICY "Allow anonymous read access on patient_sessions" ON public.patient_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on patient_sessions" ON public.patient_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access on patient_sessions" ON public.patient_sessions FOR DELETE USING (true);
