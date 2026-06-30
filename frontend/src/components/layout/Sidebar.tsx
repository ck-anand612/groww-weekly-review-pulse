import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  FileText, 
  Settings, 
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/runs', icon: History, label: 'Run History' },
  { to: '/report', icon: FileText, label: 'Latest Report' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-dark-850 border-r border-dark-700 flex flex-col transition-all duration-200 z-50',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-700">
        <div className="w-8 h-8 rounded-lg bg-pulse-primary flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-semibold text-dark-50 truncate">Pulse</h1>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Weekly Review</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-pulse-primary/10 text-pulse-primary'
                  : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700/50'
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-dark-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-pulse-primary/10 text-pulse-primary'
                : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700/50'
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:bg-dark-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
