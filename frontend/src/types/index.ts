// Core data types for the Pulse frontend

export type RunStatus = 'completed' | 'failed' | 'running' | 'pending' | 'ingesting' | 'analyzing' | 'summarizing' | 'rendering' | 'delivering';

export type EmailMode = 'draft' | 'send' | 'skip';

export interface StageRecord {
  status: 'completed' | 'failed' | 'running' | 'pending' | 'skipped';
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
}

export interface IngestRecord {
  review_count: number;
  mcp_fetch_at: string;
}

export interface AnalysisRecord {
  model: string;
  embedding_model: string;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface DocDeliveryInfo {
  document_id: string;
  heading_text: string;
  heading_anchor: string;
  revision_id: string;
  appended: boolean;
}

export interface EmailDeliveryInfo {
  mode: EmailMode;
  message_id: string;
  recipients: string[];
  sent_at: string;
}

export interface DeliveryRecord {
  doc: DocDeliveryInfo | null;
  email: EmailDeliveryInfo | null;
}

export interface RunRecord {
  run_id: string;
  product: string;
  iso_week: string;
  status: RunStatus;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
  stages: Record<string, StageRecord>;
  delivery: DeliveryRecord | null;
  ingest: IngestRecord | null;
  analysis: AnalysisRecord | null;
  error: {
    stage: string;
    message: string;
    type: string;
  } | null;
}

export interface ActionIdea {
  title: string;
  rationale: string;
}

export interface Theme {
  rank: number;
  name: string;
  summary: string;
  cluster_size: number;
  avg_rating: number;
  quotes: string[];
  action_ideas: ActionIdea[];
}

export interface PulseReportStats {
  total_reviews_fetched: number;
  reviews_after_dedupe: number;
  reviews_clustered: number;
  clusters_found: number;
  top_themes_selected: number;
}

export interface PulseReportPeriod {
  start_date: string;
  end_date: string;
  window_weeks: number;
}

export interface AudienceNotes {
  product: string;
  support: string;
  leadership: string;
}

export interface PulseReport {
  product: string;
  iso_week: string;
  period: PulseReportPeriod;
  stats: PulseReportStats;
  themes: Theme[];
  audience_notes: AudienceNotes;
  generated_at: string;
}

// Dashboard summary types
export interface DashboardSummary {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_duration_ms: number;
  total_reviews_processed: number;
  last_run_at: string | null;
  current_week: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
