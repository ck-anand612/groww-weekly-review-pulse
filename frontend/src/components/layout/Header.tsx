import { Bell, RefreshCw } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-dark-700 bg-dark-850/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-dark-50">Groww Weekly Review Pulse</h2>
        <p className="text-xs text-dark-400">Automated product review intelligence</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        
        <button className="relative p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pulse-primary rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pulse-primary to-purple-500 flex items-center justify-center text-white text-sm font-medium">
          G
        </div>
      </div>
    </header>
  );
}
