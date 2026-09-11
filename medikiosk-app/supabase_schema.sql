-- Supabase Schema for MediKiosk

-- 1. Patients Table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abha_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Visits Table
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    document_type TEXT,
    key_findings TEXT,
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
-- For prototyping, we will enable RLS but allow anonymous access to all tables.
-- In production, you would restrict this to authenticated users only.

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on patients" ON public.patients FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read access on visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on visits" ON public.visits FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous read access on documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on documents" ON public.documents FOR INSERT WITH CHECK (true);
