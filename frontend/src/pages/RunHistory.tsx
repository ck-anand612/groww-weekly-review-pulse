import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';
import type { RunRecord } from '@/types';
import { formatDuration, formatDate, formatDateTime } from '@/utils/format';

export function RunHistory() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  useEffect(() => {
    api.getRuns().then((data) => {
      setRuns(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pulse-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Run History</h1>
        <p className="text-sm text-dark-400 mt-1">
          All pipeline runs with status, timing, and delivery details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run table */}
        <div className="lg:col-span-2">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Week</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Started</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Reviews</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {runs.map((run) => {
                    const totalDuration = Object.values(run.stages).reduce(
                      (sum, s) => sum + (s.duration_ms ?? 0),
                      0
                    );
                    return (
                      <tr
                        key={run.run_id}
                        className={`cursor-pointer transition-colors ${
                          selectedRun?.run_id === run.run_id
                            ? 'bg-pulse-primary/5'
                            : 'hover:bg-dark-700/30'
                        }`}
                        onClick={() => setSelectedRun(run)}
                      >
                        <td className="py-3 pr-4">
                          <span className="font-medium text-dark-100">{run.iso_week}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="py-3 pr-4 text-dark-400">
                          {formatDate(run.started_at)}
                        </td>
                        <td className="py-3 pr-4 text-dark-400">
                          {run.status === 'failed' ? '—' : formatDuration(totalDuration)}
                        </td>
                        <td className="py-3 pr-4 text-dark-400">
                          {run.ingest?.review_count.toLocaleString() ?? '—'}
                        </td>
                        <td className="py-3">
                          <Link
                            to={`/report?week=${run.iso_week}`}
                            className="p-1 rounded text-dark-400 hover:text-pulse-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Run detail panel */}
        <div>
          {selectedRun ? (
            <Card title={`Run Details — ${selectedRun.iso_week}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-dark-500 text-xs">Run ID</p>
                    <p className="text-dark-200 font-mono text-xs">{selectedRun.run_id}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 text-xs">Product</p>
                    <p className="text-dark-200">{selectedRun.product}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 text-xs">Started</p>
                    <p className="text-dark-200 text-xs">{formatDateTime(selectedRun.started_at)}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 text-xs">Completed</p>
                    <p className="text-dark-200 text-xs">
                      {selectedRun.completed_at ? formatDateTime(selectedRun.completed_at) : '—'}
                    </p>
                  </div>
                </div>

                {/* Stages */}
                <div className="pt-3 border-t border-dark-700">
                  <p className="text-xs text-dark-400 font-medium mb-2 uppercase tracking-wider">Stages</p>
                  <div className="space-y-2">
                    {Object.entries(selectedRun.stages).map(([name, stage]) => (
                      <div key={name} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            stage.status === 'completed' ? 'bg-pulse-success' :
                            stage.status === 'failed' ? 'bg-pulse-error' :
                            stage.status === 'skipped' ? 'bg-dark-500' :
                            'bg-pulse-info'
                          }`} />
                          <span className="text-sm text-dark-200 capitalize">{name}</span>
                        </div>
                        <span className="text-xs text-dark-500">
                          {stage.duration_ms != null ? formatDuration(stage.duration_ms) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {selectedRun.error && (
                  <div className="pt-3 border-t border-dark-700">
                    <div className="flex items-center gap-2 text-pulse-error text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Error at {selectedRun.error.stage}</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-1 ml-6">{selectedRun.error.message}</p>
                  </div>
                )}

                {/* Delivery */}
                {selectedRun.delivery && (
                  <div className="pt-3 border-t border-dark-700">
                    <p className="text-xs text-dark-400 font-medium mb-2 uppercase tracking-wider">Delivery</p>
                    <div className="space-y-1.5 text-sm">
                      {selectedRun.delivery.doc && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pulse-success" />
                          <span className="text-dark-300">Doc appended</span>
                        </div>
                      )}
                      {selectedRun.delivery.email && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pulse-info" />
                          <span className="text-dark-300">
                            Email {selectedRun.delivery.email.mode} → {selectedRun.delivery.email.recipients.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-dark-500">
                <ChevronRight className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a run to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
