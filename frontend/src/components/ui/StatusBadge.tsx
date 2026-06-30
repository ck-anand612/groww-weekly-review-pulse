import { clsx } from 'clsx';
import type { RunStatus } from '@/types';

interface StatusBadgeProps {
  status: RunStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<RunStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'badge-success' },
  failed: { label: 'Failed', className: 'badge-error' },
  running: { label: 'Running', className: 'badge-info' },
  pending: { label: 'Pending', className: 'badge-neutral' },
  ingesting: { label: 'Ingesting', className: 'badge-info' },
  analyzing: { label: 'Analyzing', className: 'badge-info' },
  summarizing: { label: 'Summarizing', className: 'badge-warning' },
  rendering: { label: 'Rendering', className: 'badge-warning' },
  delivering: { label: 'Delivering', className: 'badge-warning' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'badge-neutral' };

  return (
    <span
      className={clsx(
        config.className,
        size === 'md' && 'px-3 py-1 text-sm'
      )}
    >
      {status === 'running' || status === 'ingesting' || status === 'analyzing' || status === 'summarizing' || status === 'rendering' || status === 'delivering' ? (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {config.label}
        </span>
      ) : (
        config.label
      )}
    </span>
  );
}
