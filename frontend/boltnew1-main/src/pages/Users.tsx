import { useEffect, useState, useMemo } from 'react';
import { UserCheck, UserX, Crown, Users as UsersIcon, Briefcase, CreditCard as Edit2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

const roleConfig: Record<Role, { label: string; color: string; bg: string; icon: typeof Crown }> = {
  admin: { label: 'Admin', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Crown },
  manager: { label: 'Manager', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Briefcase },
  employee: { label: 'Employee', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: UsersIcon },
};

interface Props { searchQuery: string; }

export default function Users({ searchQuery }: Props) {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>('employee');
  const [editDept, setEditDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<Role | 'all'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (user: Profile) => {
    await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    fetchUsers();
  };

  const startEdit = (user: Profile) => {
    setEditingId(user.id);
    setEditRole(user.role);
    setEditDept(user.department || '');
  };

  const saveEdit = async (userId: string) => {
    setSaving(true);
    await supabase.from('profiles').update({ role: editRole, department: editDept }).eq('id', userId);
    setSaving(false);
    setEditingId(null);
    fetchUsers();
  };

  const filtered = useMemo(() => {
    let result = [...users];
    if (filter !== 'all') result = result.filter(u => u.role === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    employee: users.filter(u => u.role === 'employee').length,
  }), [users]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarGradient: Record<Role, string> = {
    admin: 'from-amber-500 to-orange-500',
    manager: 'from-blue-500 to-cyan-500',
    employee: 'from-emerald-500 to-teal-500',
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
        {(['all', 'admin', 'manager', 'employee'] as const).map((r, i) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`stat-card glass-card p-4 rounded-2xl text-left transition-all border stagger-${i + 1} animate-slide-up
              ${filter === r ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-700/50 hover:border-slate-600'}`}
          >
            <p className="text-2xl font-bold text-white">{counts[r]}</p>
            <p className="text-xs text-slate-500 capitalize mt-0.5">{r === 'all' ? 'Total Users' : `${r}s`}</p>
          </button>
        ))}
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-16 animate-pulse border border-slate-700/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-700 animate-fade-in">
          <UsersIcon size={28} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((user, i) => {
            const rc = roleConfig[user.role];
            const RoleIcon = rc.icon;
            const isEditing = editingId === user.id;
            const isSelf = user.id === currentProfile?.id;

            return (
              <div key={user.id} className={`task-card-hover glass-card rounded-2xl p-4 border border-slate-700/50 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient[user.role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getInitials(user.full_name || '?')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-100 text-sm truncate">{user.full_name}</p>
                      {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/20">You</span>}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <input
                          value={editDept}
                          onChange={e => setEditDept(e.target.value)}
                          placeholder="Department..."
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:border-blue-500/50 w-32"
                        />
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as Role)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:border-blue-500/50"
                          disabled={isSelf}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user.department || 'No department'} · Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Role badge */}
                  {!isEditing && (
                    <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold border ${rc.bg} ${rc.color}`}>
                      <RoleIcon size={10} />
                      {rc.label}
                    </span>
                  )}

                  {/* Status */}
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} title={user.is_active ? 'Active' : 'Inactive'} />

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isSelf && (
                      <>
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(user.id)}
                            disabled={saving}
                            className="p-2 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 transition-all disabled:opacity-50"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(user)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleActive(user)}
                          className={`p-2 rounded-lg transition-all ${user.is_active
                            ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                        >
                          {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
