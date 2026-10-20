-- ==============================================================================
-- Phase 3 Supabase Migration: Leads Table & Verification Cert Extensions
-- Target Project: uxxswbukdhdxmylrjoej
-- ==============================================================================

-- 1. Leads Table for CRM & Cadence Engine
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  assigned_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'booked', 'unqualified')),
  custom_variables JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_campaign_idx ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS leads_assigned_rep_idx ON public.leads(assigned_rep_id);

-- 2. Extend Rep Certifications with Phase 3 verification fields
ALTER TABLE public.rep_certifications 
ADD COLUMN IF NOT EXISTS certificate_id TEXT,
ADD COLUMN IF NOT EXISTS supervisor_name TEXT,
ADD COLUMN IF NOT EXISTS verification_hash TEXT,
ADD COLUMN IF NOT EXISTS endorsement_notes TEXT;

-- 3. Certification Attempts Log
CREATE TABLE IF NOT EXISTS public.certification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  breakdown JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Public manage leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Public read cert attempts" ON public.certification_attempts FOR SELECT USING (true);
CREATE POLICY "Public write cert attempts" ON public.certification_attempts FOR INSERT WITH CHECK (true);
