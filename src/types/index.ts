export type UserRole = 'super_admin' | 'manager' | 'sales_rep';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  target_icp: string;
  context_metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FrameworkDocument {
  id: string;
  campaign_id?: string;
  title: string;
  file_path: string;
  file_type: 'pdf' | 'docx' | 'md';
  raw_content?: string;
  created_at: string;
}

export interface RebuttalEntry {
  id: string;
  campaign_id?: string;
  objection_type: string;
  prospect_objection_patterns: string[];
  acknowledge: string;
  respond: string;
  move: string;
  similarity?: number;
  created_at?: string;
}

export interface SparringSession {
  id: string;
  rep_id: string;
  campaign_id?: string;
  scenario: string;
  transcript: Array<{ role: 'prospect' | 'rep'; content: string; timestamp?: string }>;
  score?: number;
  feedback?: Record<string, unknown>;
  created_at: string;
}

export interface RepCertification {
  id: string;
  rep_id: string;
  campaign_id: string;
  certified: boolean;
  score: number;
  badge_level?: string;
  granted_at: string;
}

export interface ArmRebuttalResponse {
  has_objection: boolean;
  objection_type?: string;
  acknowledge?: string;
  respond?: string;
  move?: string;
  latency_ms?: number;
  source?: 'vector_db' | 'ai_inference' | 'rule_engine';
}

export interface TranscriptEntry {
  id: string;
  speaker: 'prospect' | 'rep' | 'system';
  text: string;
  timestamp: string;
  isInterim?: boolean;
}
