// Mock data for development — replace with API calls later

import type { RunRecord, PulseReport, DashboardSummary } from '@/types';

export const mockRuns: RunRecord[] = [
  {
    run_id: 'run-001',
    product: 'groww',
    iso_week: '2026-W23',
    status: 'completed',
    started_at: '2026-06-08T06:00:00+05:30',
    completed_at: '2026-06-08T06:12:34+05:30',
    updated_at: '2026-06-08T06:12:34+05:30',
    stages: {
      ingest: { status: 'completed', started_at: '2026-06-08T06:00:00+05:30', completed_at: '2026-06-08T06:00:45+05:30', duration_ms: 45000, metadata: {} },
      analyze: { status: 'completed', started_at: '2026-06-08T06:00:45+05:30', completed_at: '2026-06-08T06:03:20+05:30', duration_ms: 155000, metadata: {} },
      summarize: { status: 'completed', started_at: '2026-06-08T06:03:20+05:30', completed_at: '2026-06-08T06:08:10+05:30', duration_ms: 290000, metadata: {} },
      render: { status: 'completed', started_at: '2026-06-08T06:08:10+05:30', completed_at: '2026-06-08T06:08:12+05:30', duration_ms: 2000, metadata: {} },
      deliver: { status: 'completed', started_at: '2026-06-08T06:08:12+05:30', completed_at: '2026-06-08T06:12:34+05:30', duration_ms: 262000, metadata: {} },
    },
    delivery: {
      doc: { document_id: '1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8', heading_text: 'Groww — Week 2026-W23', heading_anchor: 'h.groww-week-2026-w23', revision_id: 'rev-001', appended: true },
      email: { mode: 'draft', message_id: 'msg-001', recipients: ['ck.anand6@gmail.com'], sent_at: '2026-06-08T06:12:30+05:30' },
    },
    ingest: { review_count: 1240, mcp_fetch_at: '2026-06-08T06:00:45+05:30' },
    analysis: { model: 'llama-3.3-70b-versatile', embedding_model: 'BAAI/bge-small-en-v1.5', token_usage: { prompt_tokens: 12500, completion_tokens: 4200 } },
    error: null,
  },
  {
    run_id: 'run-002',
    product: 'groww',
    iso_week: '2026-W22',
    status: 'completed',
    started_at: '2026-06-01T06:00:00+05:30',
    completed_at: '2026-06-01T06:11:20+05:30',
    updated_at: '2026-06-01T06:11:20+05:30',
    stages: {
      ingest: { status: 'completed', started_at: '2026-06-01T06:00:00+05:30', completed_at: '2026-06-01T06:00:38+05:30', duration_ms: 38000, metadata: {} },
      analyze: { status: 'completed', started_at: '2026-06-01T06:00:38+05:30', completed_at: '2026-06-01T06:02:55+05:30', duration_ms: 137000, metadata: {} },
      summarize: { status: 'completed', started_at: '2026-06-01T06:02:55+05:30', completed_at: '2026-06-01T06:07:30+05:30', duration_ms: 275000, metadata: {} },
      render: { status: 'completed', started_at: '2026-06-01T06:07:30+05:30', completed_at: '2026-06-01T06:07:32+05:30', duration_ms: 2000, metadata: {} },
      deliver: { status: 'completed', started_at: '2026-06-01T06:07:32+05:30', completed_at: '2026-06-01T06:11:20+05:30', duration_ms: 228000, metadata: {} },
    },
    delivery: {
      doc: { document_id: '1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8', heading_text: 'Groww — Week 2026-W22', heading_anchor: 'h.groww-week-2026-w22', revision_id: 'rev-002', appended: true },
      email: { mode: 'draft', message_id: 'msg-002', recipients: ['ck.anand6@gmail.com'], sent_at: '2026-06-01T06:11:18+05:30' },
    },
    ingest: { review_count: 1180, mcp_fetch_at: '2026-06-01T06:00:38+05:30' },
    analysis: { model: 'llama-3.3-70b-versatile', embedding_model: 'BAAI/bge-small-en-v1.5', token_usage: { prompt_tokens: 11800, completion_tokens: 3900 } },
    error: null,
  },
  {
    run_id: 'run-003',
    product: 'groww',
    iso_week: '2026-W21',
    status: 'failed',
    started_at: '2026-05-25T06:00:00+05:30',
    completed_at: null,
    updated_at: '2026-05-25T06:05:12+05:30',
    stages: {
      ingest: { status: 'completed', started_at: '2026-05-25T06:00:00+05:30', completed_at: '2026-05-25T06:00:42+05:30', duration_ms: 42000, metadata: {} },
      analyze: { status: 'failed', started_at: '2026-05-25T06:00:42+05:30', completed_at: '2026-05-25T06:05:12+05:30', duration_ms: 270000, metadata: { error: 'UMAP convergence timeout' } },
      summarize: { status: 'pending', started_at: null, completed_at: null, duration_ms: null, metadata: {} },
      render: { status: 'pending', started_at: null, completed_at: null, duration_ms: null, metadata: {} },
      deliver: { status: 'pending', started_at: null, completed_at: null, duration_ms: null, metadata: {} },
    },
    delivery: null,
    ingest: { review_count: 1350, mcp_fetch_at: '2026-05-25T06:00:42+05:30' },
    analysis: null,
    error: { stage: 'analyze', message: 'UMAP convergence timeout after 270s', type: 'TimeoutError' },
  },
  {
    run_id: 'run-004',
    product: 'groww',
    iso_week: '2026-W20',
    status: 'completed',
    started_at: '2026-05-18T06:00:00+05:30',
    completed_at: '2026-05-18T06:10:45+05:30',
    updated_at: '2026-05-18T06:10:45+05:30',
    stages: {
      ingest: { status: 'completed', started_at: '2026-05-18T06:00:00+05:30', completed_at: '2026-05-18T06:00:35+05:30', duration_ms: 35000, metadata: {} },
      analyze: { status: 'completed', started_at: '2026-05-18T06:00:35+05:30', completed_at: '2026-05-18T06:02:40+05:30', duration_ms: 125000, metadata: {} },
      summarize: { status: 'completed', started_at: '2026-05-18T06:02:40+05:30', completed_at: '2026-05-18T06:07:00+05:30', duration_ms: 260000, metadata: {} },
      render: { status: 'completed', started_at: '2026-05-18T06:07:00+05:30', completed_at: '2026-05-18T06:07:02+05:30', duration_ms: 2000, metadata: {} },
      deliver: { status: 'completed', started_at: '2026-05-18T06:07:02+05:30', completed_at: '2026-05-18T06:10:45+05:30', duration_ms: 223000, metadata: {} },
    },
    delivery: {
      doc: { document_id: '1srRnz0TTVoNgSil62PsWU8Vl7hbXxxHf746f0V8YfF8', heading_text: 'Groww — Week 2026-W20', heading_anchor: 'h.groww-week-2026-w20', revision_id: 'rev-004', appended: true },
      email: { mode: 'draft', message_id: 'msg-004', recipients: ['ck.anand6@gmail.com'], sent_at: '2026-05-18T06:10:43+05:30' },
    },
    ingest: { review_count: 1100, mcp_fetch_at: '2026-05-18T06:00:35+05:30' },
    analysis: { model: 'llama-3.3-70b-versatile', embedding_model: 'BAAI/bge-small-en-v1.5', token_usage: { prompt_tokens: 10500, completion_tokens: 3600 } },
    error: null,
  },
];

export const mockReport: PulseReport = {
  product: 'groww',
  iso_week: '2026-W23',
  period: {
    start_date: '2026-03-31',
    end_date: '2026-06-08',
    window_weeks: 10,
  },
  stats: {
    total_reviews_fetched: 1240,
    reviews_after_dedupe: 1180,
    reviews_clustered: 1100,
    clusters_found: 18,
    top_themes_selected: 5,
  },
  themes: [
    {
      rank: 1,
      name: 'App Performance & Stability',
      summary: 'Users report frequent crashes during market hours, especially during peak trading times. The app freezes at critical moments causing missed opportunities.',
      cluster_size: 245,
      avg_rating: 1.8,
      quotes: [
        'App freezes at market open every single day. Lost a trade because of this.',
        'Crashes during F&O expiry when I need it most. Very frustrating experience.',
        'The app becomes unresponsive when charts are loading. Need better optimization.',
      ],
      action_ideas: [
        { title: 'Scale infrastructure for peak hours', rationale: '85% of crash reports mention market open (9:15 AM) and F&O expiry days' },
        { title: 'Optimize chart rendering engine', rationale: 'Multiple reports cite chart loading as the trigger for freezes' },
      ],
    },
    {
      rank: 2,
      name: 'Login & Authentication Issues',
      summary: 'Persistent login failures and OTP delivery delays. Users unable to access accounts during volatile market conditions.',
      cluster_size: 189,
      avg_rating: 2.1,
      quotes: [
        'OTP never arrives on time. By the time I get it, the opportunity is gone.',
        'Keeps logging me out every few hours. Have to re-verify repeatedly.',
        'Cannot login during market hours. Server says too many attempts.',
      ],
      action_ideas: [
        { title: 'Implement OTP fallback via WhatsApp', rationale: 'SMS delivery delays are the primary complaint during peak hours' },
        { title: 'Extend session timeout duration', rationale: 'Frequent logouts disrupt active trading sessions' },
      ],
    },
    {
      rank: 3,
      name: 'Fund Transfer Delays',
      summary: 'Withdrawals taking longer than expected. Users anxious about money movement timing, especially before market open.',
      cluster_size: 156,
      avg_rating: 2.4,
      quotes: [
        'Withdrawal showing pending for 3 days now. Where is my money?',
        'Fund transfer to bank takes too long. Other apps are instant.',
        'Added money but it took 2 hours to reflect. Missed my buy order.',
      ],
      action_ideas: [
        { title: 'Integrate UPI instant transfer', rationale: 'Users compare unfavorably with competitors offering instant transfers' },
        { title: 'Add real-time transfer status tracking', rationale: 'Anxiety stems from lack of visibility into transfer progress' },
      ],
    },
    {
      rank: 4,
      name: 'UI/UX Improvement Requests',
      summary: 'Users want cleaner interface, better navigation, and customizable watchlists. Portfolio view needs enhancement.',
      cluster_size: 134,
      avg_rating: 3.2,
      quotes: [
        'The new update made the interface cluttered. Where did my watchlist go?',
        'Need a simpler way to switch between demat and trading accounts.',
        'Portfolio page should show P&L more clearly. Hard to find my gains.',
      ],
      action_ideas: [
        { title: 'Redesign portfolio summary page', rationale: 'Multiple users struggle to find basic P&L information' },
        { title: 'Add customizable quick actions bar', rationale: 'Power users want faster access to frequent operations' },
      ],
    },
    {
      rank: 5,
      name: 'Customer Support Response',
      summary: 'Slow response times from support team. Users frustrated with automated replies and lack of resolution.',
      cluster_size: 98,
      avg_rating: 2.0,
      quotes: [
        'Raised a ticket 5 days ago. Still got only bot responses.',
        'Support chat keeps disconnecting. Cannot explain my issue properly.',
        'No one actually reads the issue. Just sends template replies.',
      ],
      action_ideas: [
        { title: 'Reduce first response time to under 2 hours', rationale: 'Current average is 24+ hours which is unacceptable for financial app' },
        { title: 'Implement ticket escalation for trading issues', rationale: 'Time-sensitive trading problems need priority handling' },
      ],
    },
  ],
  audience_notes: {
    product: 'Focus on performance optimization for peak market hours. Login reliability is critical for user retention.',
    support: 'Prepare FAQ responses for fund transfer delays. Train team on common crash scenarios and workarounds.',
    leadership: 'App stability during market hours is the #1 churn risk. Infrastructure investment needed before next fiscal year.',
  },
  generated_at: '2026-06-08T06:08:10+05:30',
};

export const mockDashboardSummary: DashboardSummary = {
  total_runs: 23,
  successful_runs: 21,
  failed_runs: 2,
  avg_duration_ms: 674000,
  total_reviews_processed: 28450,
  last_run_at: '2026-06-08T06:12:34+05:30',
  current_week: '2026-W23',
};

// API service stubs — replace with actual fetch calls
export const api = {
  async getRuns(): Promise<RunRecord[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRuns;
  },

  async getRun(isoWeek: string): Promise<RunRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockRuns.find(r => r.iso_week === isoWeek) ?? null;
  },

  async getReport(isoWeek: string): Promise<PulseReport | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (isoWeek === '2026-W23') return mockReport;
    return null;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockDashboardSummary;
  },
};
