import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={clsx('card p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-dark-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-dark-50">{value}</p>
          {subtitle && <p className="text-xs text-dark-500">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-dark-300" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-dark-700">
          <span className={clsx('text-xs font-medium', trend.value >= 0 ? 'text-pulse-success' : 'text-pulse-error')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-dark-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
