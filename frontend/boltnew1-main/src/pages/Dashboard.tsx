import { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp, Users, ArrowRight, Plus, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task, Profile } from '../types';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface DashboardProps {
  onNavigate: (page: 'tasks' | 'users') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);

    let query = supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assigned_to_fkey(*), assigner:profiles!tasks_assigned_by_fkey(*)')
      .order('created_at', { ascending: false });

    if (profile.role === 'manager') query = query.eq('assigned_by', profile.id);
    if (profile.role === 'employee') query = query.eq('assigned_to', profile.id);

    const { data: tasks } = await query;

    if (tasks) {
      const now = new Date();
      setStats({
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => t.due_date && t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.due_date) < now).length,
      });
      setRecentTasks((tasks as Task[]).slice(0, 6));
    }

    if (profile.role === 'admin') {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setTeamCount(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [profile]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'from-cyan-600 to-cyan-700', glow: 'shadow-cyan-500/20', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Completed', value: stats.completed, icon: TrendingUp, color: 'from-emerald-600 to-emerald-700', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'from-red-600 to-red-700', glow: 'shadow-red-500/20', bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`stat-card glass-card rounded-2xl p-5 border animate-slide-up stagger-${i + 1} ${s.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ${s.glow}`}>
                  <Icon size={18} className="text-white" />
                </div>
                {loading && <div className="w-8 h-4 bg-slate-700 rounded animate-pulse" />}
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 animate-slide-up stagger-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-400" />
            Task Completion
          </h3>
          <div className="text-center mb-4">
            <span className="text-5xl font-bold gradient-text">{completionRate}%</span>
            <p className="text-xs text-slate-500 mt-1">Overall completion rate</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Completed', value: stats.completed, total: stats.total, color: 'bg-emerald-500' },
              { label: 'In Progress', value: stats.inProgress, total: stats.total, color: 'bg-blue-500' },
              { label: 'Pending', value: stats.pending, total: stats.total, color: 'bg-slate-600' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 animate-slide-up stagger-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-amber-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {(profile?.role === 'admin' || profile?.role === 'manager') && (
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all text-sm font-medium group"
              >
                <Plus size={15} />
                <span>Create New Task</span>
                <ArrowRight size={13} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            <button
              onClick={() => onNavigate('tasks')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium group"
            >
              <CheckSquare size={15} className="text-slate-500" />
              <span>View All Tasks</span>
              <ArrowRight size={13} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
            </button>
            {profile?.role === 'admin' && (
              <button
                onClick={() => onNavigate('users')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium group"
              >
                <Users size={15} className="text-slate-500" />
                <span>Manage Users ({teamCount})</span>
                <ArrowRight size={13} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Role info */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 animate-slide-up stagger-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Users size={15} className="text-cyan-400" />
            Your Access Level
          </h3>
          <div className="space-y-3">
            {[
              { label: 'View all users', allowed: profile?.role === 'admin' },
              { label: 'Create tasks', allowed: profile?.role !== 'employee' },
              { label: 'Assign to employees', allowed: profile?.role !== 'employee' },
              { label: 'Manage user roles', allowed: profile?.role === 'admin' },
              { label: 'Update task status', allowed: true },
              { label: 'View own tasks', allowed: true },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${item.allowed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                  <span className="text-xs">{item.allowed ? '✓' : '✗'}</span>
                </div>
                <span className={`text-xs ${item.allowed ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="animate-slide-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Recent Tasks</h2>
          <button onClick={() => onNavigate('tasks')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 h-32 animate-pulse">
                <div className="h-3 bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-2 bg-slate-800 rounded w-full mb-2" />
                <div className="h-2 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-700">
            <CheckSquare size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No tasks yet</p>
            {profile?.role !== 'employee' && (
              <button onClick={() => setCreateOpen(true)} className="mt-3 text-xs text-blue-400 hover:text-blue-300">
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} index={i} />
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchData} />
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { fetchData(); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}
