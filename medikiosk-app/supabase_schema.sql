-- Supabase Schema for MediKiosk

-- 1. Patients Table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    abha_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Visits Table
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    document_type TEXT,
    key_findings TEXT,
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_patient_id ON public.visits(patient_id);
CREATE INDEX idx_documents_visit_id ON public.documents(visit_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_visits_user_id ON public.visits(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);

-- Row Level Security (RLS)
--
-- MediKiosk has no login screen, so every browser session on the kiosk is
-- given a Supabase anonymous-auth identity (see src/lib/supabase.ts,
-- ensureAnonymousSession()). Each row is stamped with that session's
-- auth.uid() on insert, and every policy below scopes reads/writes to rows
-- owned by the caller's own session. This is what stops one kiosk session
-- (or anyone with the public anon key) from reading or altering another
-- patient's records via the Supabase REST API directly.
--
-- Requirement: "Allow anonymous sign-ins" must be enabled for this project
-- under Supabase Dashboard -> Authentication -> Sign In / Providers. This
-- cannot be turned on via SQL.

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own visits" ON public.visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own visits" ON public.visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own visits" ON public.visits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can read own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
