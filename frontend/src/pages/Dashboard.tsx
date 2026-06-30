import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  XCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Mail,
  FileText
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';
import type { DashboardSummary, RunRecord } from '@/types';
import { formatDuration, formatDate } from '@/utils/format';

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentRuns, setRecentRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [summaryData, runsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRuns(),
      ]);
      setSummary(summaryData);
      setRecentRuns(runsData.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pulse-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
        <p className="text-sm text-dark-400 mt-1">
          Overview of the Weekly Review Pulse pipeline for Groww
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Runs"
          value={summary.total_runs}
          icon={Activity}
          subtitle={`${summary.successful_runs} successful`}
          trend={summary.total_runs > 0 ? {
            value: Math.round((summary.successful_runs / summary.total_runs) * 100),
            label: 'success rate',
          } : undefined}
        />
        <MetricCard
          title="Failed Runs"
          value={summary.failed_runs}
          icon={XCircle}
          subtitle={`Of ${summary.total_runs} total`}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(summary.avg_duration_ms)}
          icon={Clock}
          subtitle="End-to-end pipeline"
        />
        <MetricCard
          title="Reviews Processed"
          value={summary.total_reviews_processed.toLocaleString()}
          icon={TrendingUp}
          subtitle={`Across ${summary.total_runs} runs`}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent runs */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Runs"
            action={
              <Link to="/runs" className="text-xs text-pulse-primary hover:text-pulse-primary-hover flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <div className="space-y-3">
              {recentRuns.length === 0 ? (
                <p className="text-sm text-dark-500 py-6 text-center">No runs yet. Run the pipeline to see data.</p>
              ) : (
                recentRuns.map((run) => (
                <div
                  key={run.run_id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-dark-850/50 hover:bg-dark-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <StatusBadge status={run.status} />
                    <div>
                      <p className="text-sm font-medium text-dark-100">
                        {run.product.toUpperCase()} — Week {run.iso_week}
                      </p>
                      <p className="text-xs text-dark-500">
                        {formatDate(run.started_at)} · {run.run_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {run.ingest && (
                      <span className="text-xs text-dark-400">
                        {run.ingest.review_count.toLocaleString()} reviews
                      </span>
                    )}
                    <Link
                      to={`/report?week=${run.iso_week}`}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
              )}
            </div>
          </Card>
        </div>

        {/* Latest delivery status */}
        <div>
          <Card title="Latest Delivery">
            {recentRuns.length > 0 && recentRuns[0].delivery ? (
              <div className="space-y-4">
                {recentRuns[0].delivery.doc && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-850/50">
                    <div className="w-10 h-10 rounded-lg bg-pulse-success/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-pulse-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-100">Google Doc</p>
                      <p className="text-xs text-pulse-success">
                        {recentRuns[0].delivery.doc.appended ? 'Appended successfully' : 'Not appended'}
                      </p>
                    </div>
                  </div>
                )}

                {recentRuns[0].delivery.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-850/50">
                    <div className="w-10 h-10 rounded-lg bg-pulse-info/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-pulse-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-100">Email {recentRuns[0].delivery.email.mode}</p>
                      <p className="text-xs text-dark-400">{recentRuns[0].delivery.email.recipients.join(', ')}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-dark-700">
                  <p className="text-xs text-dark-500">
                    Last delivered: {formatDate(summary.last_run_at ?? '')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-dark-500">
                <Mail className="w-8 h-8 mb-2" />
                <p className="text-sm">No delivery data yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
