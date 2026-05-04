import { useState } from 'react';
import { Calendar, Clock, User, MessageSquare, CreditCard as Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { Task, TaskStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateTaskModal from './CreateTaskModal';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-300', bg: 'bg-slate-700' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/15 border border-blue-500/20' },
  review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/15 border border-amber-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border border-emerald-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/15 border border-red-500/20' },
};

const priorityColor: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-red-400',
};

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TaskDetailModal({ task, onClose, onUpdated }: Props) {
  const { profile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const canEdit = profile?.role === 'admin' || profile?.id === task.assigned_by;
  const canUpdateStatus = canEdit || profile?.id === task.assigned_to;
  const canDelete = profile?.role === 'admin';

  const updateStatus = async (status: TaskStatus) => {
    setUpdating(true);
    const updates: Partial<Task> = { status };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    await supabase.from('tasks').update(updates).eq('id', task.id);
    setUpdating(false);
    onUpdated();
  };

  const deleteTask = async () => {
    await supabase.from('tasks').delete().eq('id', task.id);
    onUpdated();
  };

  const formatDate = (d: string | null) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not set';

  const isOverdue = task.due_date && task.status !== 'completed' && task.status !== 'cancelled'
    && new Date(task.due_date) < new Date();

  const sc = statusConfig[task.status];

  const statusFlow: TaskStatus[] = ['pending', 'in_progress', 'review', 'completed'];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title="Task Details" maxWidth="max-w-xl">
        <div className="space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-lg font-bold text-white leading-tight">{task.title}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${sc.bg} ${sc.color}`}>
                {sc.label}
              </span>
            </div>
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${priorityColor[task.priority]}`}>
              <AlertCircle size={12} />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </div>
          </div>

          {task.description && (
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <User size={11} /> Assigned to
              </div>
              <p className="text-sm font-medium text-slate-200">{task.assignee?.full_name || 'Unassigned'}</p>
              {task.assignee?.role && <p className="text-xs text-slate-500 capitalize">{task.assignee.role}</p>}
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <User size={11} /> Assigned by
              </div>
              <p className="text-sm font-medium text-slate-200">{task.assigner?.full_name || '—'}</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                <Calendar size={11} /> Due date
              </div>
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-slate-200'}`}>
                {formatDate(task.due_date)}
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock size={11} /> Created
              </div>
              <p className="text-sm font-medium text-slate-200">{formatDate(task.created_at)}</p>
            </div>
          </div>

          {task.notes && (
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <MessageSquare size={11} /> Notes
              </div>
              <p className="text-sm text-slate-400">{task.notes}</p>
            </div>
          )}

          {/* Status update */}
          {canUpdateStatus && task.status !== 'cancelled' && task.status !== 'completed' && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {statusFlow.filter(s => s !== task.status).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                      ${s === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      } disabled:opacity-50`}
                  >
                    {s === 'completed' && <CheckCircle size={11} />}
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {canEdit && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-all"
              >
                <Edit size={14} /> Edit
              </button>
            )}
            {canDelete && !deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
            {deleteConfirm && (
              <button
                onClick={deleteTask}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-all"
              >
                <Trash2 size={14} /> Confirm Delete
              </button>
            )}
          </div>
        </div>
      </Modal>

      {editOpen && (
        <CreateTaskModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onCreated={onUpdated}
          editTask={task}
        />
      )}
    </>
  );
}
