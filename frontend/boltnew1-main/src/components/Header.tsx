import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  tasks: 'Task Management',
  users: 'User Management',
  profile: 'My Profile',
};

const pageDescriptions: Record<Page, string> = {
  dashboard: 'Overview of your workspace',
  tasks: 'Manage and track all tasks',
  users: 'Manage team members and roles',
  profile: 'Your account settings',
};

interface HeaderProps {
  currentPage: Page;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export default function Header({ currentPage, onSearch, searchQuery }: HeaderProps) {
  const { profile } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-6 gap-4 sticky top-0 z-10 animate-fade-in">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-white">{pageTitles[currentPage]}</h1>
            {currentPage === 'dashboard' && (
              <p className="text-xs text-slate-500">{greeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋</p>
            )}
            {currentPage !== 'dashboard' && (
              <p className="text-xs text-slate-500">{pageDescriptions[currentPage]}</p>
            )}
          </div>
        </div>
      </div>

      {(currentPage === 'tasks' || currentPage === 'users') && (
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:bg-slate-800 transition-all w-56"
          />
        </div>
      )}

      <button className="relative p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
      </button>

      <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all lg:hidden">
        <Menu size={16} />
      </button>
    </header>
  );
}
