import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile, Task } from '../types';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  editTask?: Task | null;
}

export default function CreateTaskModal({ isOpen, onClose, onCreated, editTask }: Props) {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) fetchEmployees();
    if (editTask) {
      setForm({
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        assigned_to: editTask.assigned_to || '',
        due_date: editTask.due_date ? editTask.due_date.split('T')[0] : '',
        notes: editTask.notes,
      });
    } else {
      setForm({ title: '', description: '', priority: 'medium', status: 'pending', assigned_to: '', due_date: '', notes: '' });
    }
    setError('');
  }, [isOpen, editTask]);

  const fetchEmployees = async () => {
    const query = profile?.role === 'admin'
      ? supabase.from('profiles').select('*').eq('is_active', true)
      : supabase.from('profiles').select('*').eq('role', 'employee').eq('is_active', true);
    const { data } = await query;
    if (data) setEmployees(data as Profile[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.assigned_to) { setError('Please assign to someone'); return; }
    setLoading(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      assigned_to: form.assigned_to,
      assigned_by: profile!.id,
      due_date: form.due_date || null,
      notes: form.notes.trim(),
      ...(form.status === 'completed' && !editTask?.completed_at ? { completed_at: new Date().toISOString() } : {}),
    };

    let err;
    if (editTask) {
      ({ error: err } = await supabase.from('tasks').update(payload).eq('id', editTask.id));
    } else {
      ({ error: err } = await supabase.from('tasks').insert(payload));
    }

    setLoading(false);
    if (err) { setError(err.message); return; }
    onCreated();
    onClose();
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/60 focus:bg-slate-800 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

  const isEmployee = profile?.role === 'employee';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTask ? 'Edit Task' : 'Create New Task'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            placeholder="Task title..."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            disabled={isEmployee}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            placeholder="Describe the task..."
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            disabled={isEmployee}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Priority</label>
            <select
              className={inputClass}
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              disabled={isEmployee}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Assign To</label>
            <select
              className={inputClass}
              value={form.assigned_to}
              onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
              disabled={isEmployee}
            >
              <option value="">Select person...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type="date"
              className={`${inputClass} [color-scheme:dark]`}
              value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              disabled={isEmployee}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${inputClass} resize-none`}
            placeholder="Additional notes..."
            rows={2}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
