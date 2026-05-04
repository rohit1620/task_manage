import { useEffect, useState, useMemo } from 'react';
import { Plus, Filter, Import as SortAsc } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

const statusTabs: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

interface Props { searchQuery: string; }

export default function Tasks({ searchQuery }: Props) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assigned_to_fkey(*), assigner:profiles!tasks_assigned_by_fkey(*)')
      .order('created_at', { ascending: false });

    if (profile?.role === 'manager') query = query.eq('assigned_by', profile.id);
    if (profile?.role === 'employee') query = query.eq('assigned_to', profile.id);

    const { data } = await query;
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [profile]);

  const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (activeTab !== 'all') result = result.filter(t => t.status === activeTab);
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignee?.full_name?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'priority') result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    else if (sortBy === 'due_date') result.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    return result;
  }, [tasks, activeTab, priorityFilter, searchQuery, sortBy]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, [tasks]);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-blue-500/50 transition-all"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-blue-500/50 transition-all"
            >
              <option value="created_at">Newest</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {(profile?.role === 'admin' || profile?.role === 'manager') && (
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          >
            <Plus size={15} />
            New Task
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin animate-slide-up stagger-1">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
          >
            {tab.label}
            {tabCounts[tab.id] !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>
                {tabCounts[tab.id] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-36 animate-pulse border border-slate-700/30">
              <div className="h-3 bg-slate-700 rounded w-2/3 mb-3" />
              <div className="h-2 bg-slate-800 rounded w-full mb-2" />
              <div className="h-2 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-700 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Filter size={20} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium text-sm">No tasks found</p>
          <p className="text-slate-600 text-xs mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
              index={i % 6}
            />
          ))}
        </div>
      )}

      <CreateTaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchTasks} />
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { fetchTasks(); setSelectedTask(null); }}
        />
      )}
    </div>
  );
}
