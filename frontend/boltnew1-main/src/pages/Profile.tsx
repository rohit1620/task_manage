import { useState } from 'react';
import { Camera, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const roleColors: Record<string, string> = {
  admin: 'from-amber-500 to-orange-500',
  manager: 'from-blue-500 to-cyan-500',
  employee: 'from-emerald-500 to-teal-500',
};

export default function Profile() {
  const { profile, refreshProfile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const gradient = roleColors[profile?.role || 'employee'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Full name required'); return; }
    setSaving(true); setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), department: department.trim() })
      .eq('id', profile!.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/60 transition-all";

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/50 animate-slide-up text-center">
        <div className="relative inline-block mb-4">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow-xl`}>
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-all">
            <Camera size={12} className="text-slate-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
        <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${gradient} text-white`}>
          {profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1)}
        </span>
      </div>

      {/* Edit form */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/50 animate-slide-up stagger-1">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Edit Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 animate-slide-up">
              <CheckCircle size={14} /> Profile updated successfully
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              className={inputClass}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <input
              className={inputClass}
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="Your department"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
            <input className={`${inputClass} opacity-50 cursor-not-allowed`} value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
            <input className={`${inputClass} opacity-50 cursor-not-allowed capitalize`} value={profile?.role || ''} disabled />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="glass-card rounded-2xl p-5 border border-slate-700/50 animate-slide-up stagger-2">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Account Info</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
            { label: 'Account status', value: profile?.is_active ? 'Active' : 'Inactive' },
            { label: 'User ID', value: profile?.id ? profile.id.slice(0, 8) + '...' : '—' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-medium text-slate-300">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
