import { LayoutDashboard, CheckSquare, Users, LogOut, ChevronRight, Briefcase, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks' as Page, label: 'Tasks', icon: CheckSquare },
  { id: 'users' as Page, label: 'Users', icon: Users, adminOnly: true },
  { id: 'profile' as Page, label: 'Profile', icon: User },
];

const roleColors: Record<string, string> = {
  admin: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  manager: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  employee: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && profile?.role !== 'admin') return false;
    return true;
  });

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-20 animate-slide-in-left">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse-glow">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight">TaskFlow</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Menu</p>
        {visibleItems.map((item, i) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }
                animate-slide-up stagger-${i + 1}`}
            >
              <Icon size={17} className={active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={14} className="text-blue-500/60" />}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{profile?.full_name || 'User'}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${roleColors[profile?.role || 'employee']}`}>
              {profile?.role}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
