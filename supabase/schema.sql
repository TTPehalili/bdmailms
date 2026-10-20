-- ==============================================================================
-- Appointmentlyy SDR / AI LMS - Supabase PostgreSQL Schema & Migration
-- Target Supabase Project: uxxswbukdhdxmylrjoej
-- ==============================================================================

-- 1. Enable Vector Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Roles Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'sales_rep');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'sales_rep',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Campaigns Table (Target ICP & context metadata)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_icp TEXT NOT NULL,
  context_metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Framework Documents (.pdf, .docx, .md uploads)
CREATE TABLE IF NOT EXISTS public.framework_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'md')),
  raw_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rebuttal Entries with 1536-dim Embedding Vector
CREATE TABLE IF NOT EXISTS public.rebuttal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  objection_type TEXT NOT NULL,
  prospect_objection_patterns TEXT[] NOT NULL,
  acknowledge TEXT NOT NULL,
  respond TEXT NOT NULL,
  move TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW Vector Index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS rebuttal_entries_embedding_idx 
ON public.rebuttal_entries 
USING hnsw (embedding vector_cosine_ops);

-- 7. match_rebuttals RPC Function
CREATE OR REPLACE FUNCTION public.match_rebuttals (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.65,
  match_count int DEFAULT 5,
  filter_campaign_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  campaign_id uuid,
  objection_type text,
  prospect_objection_patterns text[],
  acknowledge text,
  respond text,
  move text,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    re.id,
    re.campaign_id,
    re.objection_type,
    re.prospect_objection_patterns,
    re.acknowledge,
    re.respond,
    re.move,
    (1 - (re.embedding <=> query_embedding))::float AS similarity
  FROM public.rebuttal_entries re
  WHERE re.embedding IS NOT NULL
    AND (filter_campaign_id IS NULL OR re.campaign_id = filter_campaign_id)
    AND (1 - (re.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 8. Sparring Sessions & Rep Certifications
CREATE TABLE IF NOT EXISTS public.sparring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  scenario TEXT NOT NULL,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  score NUMERIC(5,2),
  feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rep_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  certified BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  badge_level TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_rep_campaign_cert UNIQUE(rep_id, campaign_id)
);

-- 9. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebuttal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rep_certifications ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated & anon where appropriate
CREATE POLICY "Public read rebuttal_entries" ON public.rebuttal_entries FOR SELECT USING (true);
CREATE POLICY "Public read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- 10. Sample Seed Data for Rebuttal Entries
INSERT INTO public.rebuttal_entries (objection_type, prospect_objection_patterns, acknowledge, respond, move)
VALUES
(
  'Incumbent Vendor',
  ARRAY[
    'We already have someone doing this',
    'We already use an agency',
    'We already work with another vendor',
    'We have an internal team handling calls',
    'We are locked into an existing contract'
  ],
  'I completely understand—you already have an established rhythm with them.',
  'Most teams we work with kept their incumbent for tier-1 routine tasks while leveraging us to fix their high-value conversion bottlenecks.',
  'Would you be against a 10-minute diagnostic to benchmark your current SLA and acquisition costs?'
),
(
  'Price / Budget Friction',
  ARRAY[
    'We do not have the budget right now',
    'It sounds too expensive',
    'Cost is prohibitive',
    'We are cutting costs this quarter',
    'We cannot afford any new software'
  ],
  'Fair enough—every dollar on the P&L has to deliver 3x return in this market.',
  'Our model is strictly pay-per-qualified-discovery, so there is zero fixed seat burn until pipeline is actually hitting calendars.',
  'Would it make sense to review a simple model showing the break-even on just 2 extra booked calls next month?'
),
(
  'Timing / Send Info',
  ARRAY[
    'Send me an email first',
    'Call me back next quarter',
    'Now is not a good time',
    'Just send your deck over',
    'We will look at this in Q4'
  ],
  'Happy to send material your way so you have full documentation.',
  'Typically when leaders ask for a deck, it gets buried in 400 unread emails because it lacks your specific numbers.',
  'If you have your calendar open, what would Thursday morning look like for a 5-minute preview instead?'
),
(
  'Gatekeeper / Not the Decision Maker',
  ARRAY[
    'The VP handles that decision',
    'I am not the right person',
    'You need to speak to procurement',
    'They do not take unsolicited calls'
  ],
  'Appreciate you guiding me in the right direction.',
  'I want to make sure I do not waste their calendar time if your current outbound pipeline is already exceeding quota.',
  'Who currently owns the pipeline targets for your mid-market account executives?'
),
(
  'Not Interested / Skepticism',
  ARRAY[
    'We are not interested',
    'No thanks, we are all set',
    'We do not need cold outreach',
    'We get 20 calls like this every day'
  ],
  'Totally get it—your inbox is likely flooded with robotic SDR pitches.',
  'We specifically engineered Boris AI to handle conversational pushback and live booking with sub-second acoustic latency.',
  'Would you hate taking 30 seconds to hear how one team generated 38 enterprise demos last week?'
)
ON CONFLICT DO NOTHING;
