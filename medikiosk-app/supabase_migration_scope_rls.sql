-- Migration: scope RLS policies to the owning kiosk session instead of
-- allowing any anonymous caller to read/write every row.
--
-- Run this against a project that already has the original
-- supabase_schema.sql applied (patients/visits/documents tables with the
-- old "USING (true)" policies). Safe to run once; re-running the
-- CREATE POLICY statements will fail on the second run because the
-- policies already exist (drop them first if you need to re-apply).
--
-- Before running: enable "Allow anonymous sign-ins" under
-- Supabase Dashboard -> Authentication -> Sign In / Providers. Without it,
-- auth.uid() is always null for these clients and every insert below will
-- fail its NOT NULL constraint.

ALTER TABLE public.patients ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.visits ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON public.visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_visit_id ON public.documents(visit_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

DROP POLICY IF EXISTS "Allow anonymous read access on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow anonymous insert access on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow anonymous read access on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow anonymous insert access on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow anonymous update access on visits" ON public.visits;
DROP POLICY IF EXISTS "Allow anonymous read access on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow anonymous insert access on documents" ON public.documents;

CREATE POLICY "Owner can read own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own visits" ON public.visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own visits" ON public.visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own visits" ON public.visits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
