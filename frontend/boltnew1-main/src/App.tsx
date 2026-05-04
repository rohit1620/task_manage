import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Page } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function AppInner() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse-glow">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return <Login />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={p => handleNavigate(p)} />;
      case 'tasks': return <Tasks searchQuery={searchQuery} />;
      case 'users': return profile.role === 'admin' ? <Users searchQuery={searchQuery} /> : <Dashboard onNavigate={p => handleNavigate(p)} />;
      case 'profile': return <Profile />;
      default: return <Dashboard onNavigate={p => handleNavigate(p)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header currentPage={currentPage} onSearch={setSearchQuery} searchQuery={searchQuery} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
