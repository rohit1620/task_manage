import { Calendar, User, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';

const statusConfig: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-slate-700 text-slate-300', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20', dot: 'bg-blue-400' },
  review: { label: 'Review', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', dot: 'bg-amber-400' },
  completed: { label: 'Completed', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/15 text-red-400 border border-red-500/20', dot: 'bg-red-400' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; border: string }> = {
  low: { label: 'Low', color: 'text-slate-400', border: 'border-l-slate-600' },
  medium: { label: 'Medium', color: 'text-blue-400', border: 'border-l-blue-500' },
  high: { label: 'High', color: 'text-amber-400', border: 'border-l-amber-500' },
  urgent: { label: 'Urgent', color: 'text-red-400', border: 'border-l-red-500' },
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  index?: number;
}

export default function TaskCard({ task, onClick, index = 0 }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const isOverdue = task.due_date && task.status !== 'completed' && task.status !== 'cancelled'
    && new Date(task.due_date) < new Date();

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const initials = task.assignee?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <div
      onClick={onClick}
      className={`task-card-hover glass-card rounded-2xl p-4 cursor-pointer border-l-4 ${priority.border} animate-slide-up ${staggerClass}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 flex-1">{task.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0 flex items-center gap-1.5 ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
          {status.label}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[9px] font-bold">
                {initials}
              </div>
              <span className="text-xs text-slate-500 hidden sm:block">{task.assignee.full_name}</span>
            </div>
          )}

          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              {isOverdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1 text-xs font-medium ${priority.color}`}>
          <Clock size={11} />
          <span>{priority.label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="text-xs text-slate-600 hover:text-blue-400 transition-colors flex items-center gap-1 group">
          View details <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
