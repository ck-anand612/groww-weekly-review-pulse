import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const date = parseISO(isoString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}
