import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Star, 
  Quote, 
  Lightbulb, 
  Users, 
  HeadphonesIcon, 
  TrendingUp,
  BarChart3,
  Calendar,
  Hash
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';
import type { PulseReport, Theme } from '@/types';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-600'
          }`}
        />
      ))}
      <span className="text-xs text-dark-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pulse-primary/10 flex items-center justify-center text-pulse-primary font-bold text-sm">
            #{theme.rank}
          </div>
          <div>
            <h3 className="text-base font-semibold text-dark-50">{theme.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-dark-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> {theme.cluster_size} reviews
              </span>
              <RatingStars rating={theme.avg_rating} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-dark-300 leading-relaxed">{theme.summary}</p>

      {/* Quotes */}
      <div>
        <p className="text-xs text-dark-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Quote className="w-3 h-3" /> Representative Quotes
        </p>
        <div className="space-y-2">
          {theme.quotes.map((quote, i) => (
            <div
              key={i}
              className="pl-3 py-2 border-l-2 border-dark-600 text-sm text-dark-300 italic"
            >
              "{quote}"
            </div>
          ))}
        </div>
      </div>

      {/* Action Ideas */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-pulse-primary hover:text-pulse-primary-hover font-medium flex items-center gap-1.5"
        >
          <Lightbulb className="w-3 h-3" />
          {expanded ? 'Hide' : 'Show'} Action Ideas ({theme.action_ideas.length})
        </button>
        {expanded && (
          <div className="mt-2 space-y-2">
            {theme.action_ideas.map((idea, i) => (
              <div key={i} className="p-3 rounded-lg bg-dark-850/50">
                <p className="text-sm font-medium text-dark-100">{idea.title}</p>
                <p className="text-xs text-dark-400 mt-1">{idea.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportViewer() {
  const [searchParams] = useSearchParams();
  const weekParam = searchParams.get('week');
  const [report, setReport] = useState<PulseReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(weekParam ?? '');

  useEffect(() => {
    setLoading(true);

    if (weekParam) {
      // Explicit week from URL
      setWeek(weekParam);
      api.getReport(weekParam).then((data) => {
        setReport(data);
        setLoading(false);
      });
    } else {
      // Default: load the latest available report
      api.getRuns().then((runs) => {
        const completedRun = runs.find((r) => r.status === 'completed');
        if (completedRun) {
          setWeek(completedRun.iso_week);
          api.getReport(completedRun.iso_week).then((data) => {
            setReport(data);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [weekParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pulse-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-dark-500">
        <BarChart3 className="w-12 h-12 mb-3" />
        <p className="text-lg font-medium">No report available</p>
        <p className="text-sm">No report found{week ? ` for week ${week}` : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">
            {report.product.charAt(0).toUpperCase() + report.product.slice(1)} — Week {report.iso_week}
          </h1>
          <p className="text-sm text-dark-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {report.period.start_date} → {report.period.end_date}
            <span className="text-dark-600">·</span>
            {report.period.window_weeks}-week window
          </p>
        </div>
        <div className="text-xs text-dark-500">
          Generated: {new Date(report.generated_at).toLocaleString('en-IN')}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Fetched', value: report.stats.total_reviews_fetched, icon: Hash },
          { label: 'After Dedup', value: report.stats.reviews_after_dedupe, icon: Hash },
          { label: 'Clustered', value: report.stats.reviews_clustered, icon: Hash },
          { label: 'Clusters', value: report.stats.clusters_found, icon: BarChart3 },
          { label: 'Themes', value: report.stats.top_themes_selected, icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-3 text-center">
            <Icon className="w-4 h-4 text-dark-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-dark-50">{value.toLocaleString()}</p>
            <p className="text-xs text-dark-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Audience Notes */}
      <Card title="Audience Notes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-dark-850/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pulse-primary" />
              <span className="text-sm font-medium text-dark-100">Product</span>
            </div>
            <p className="text-sm text-dark-300">{report.audience_notes.product}</p>
          </div>
          <div className="p-3 rounded-lg bg-dark-850/50">
            <div className="flex items-center gap-2 mb-2">
              <HeadphonesIcon className="w-4 h-4 text-pulse-info" />
              <span className="text-sm font-medium text-dark-100">Support</span>
            </div>
            <p className="text-sm text-dark-300">{report.audience_notes.support}</p>
          </div>
          <div className="p-3 rounded-lg bg-dark-850/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-pulse-warning" />
              <span className="text-sm font-medium text-dark-100">Leadership</span>
            </div>
            <p className="text-sm text-dark-300">{report.audience_notes.leadership}</p>
          </div>
        </div>
      </Card>

      {/* Theme clusters */}
      <div>
        <h2 className="text-lg font-semibold text-dark-50 mb-4">
          Cluster Insights ({report.themes.length} themes)
        </h2>
        <div className="space-y-4">
          {report.themes.map((theme) => (
            <ThemeCard key={theme.rank} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}
