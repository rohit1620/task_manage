import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Mail, Lock, User, ChevronRight, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error.message);
    } else {
      if (!form.fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
      const { error } = await signUp(form.email, form.password, form.fullName, form.role);
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/60 focus:bg-slate-800 transition-all pl-10";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/30 mb-4 animate-pulse-glow">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TaskFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Role-based Task Management</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 animate-slide-up">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="relative animate-slide-up">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                className={inputClass}
              />
            </div>

            {mode === 'register' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'manager', 'employee'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('role', r)}
                      className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                        form.role === r
                          ? r === 'admin' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : r === 'manager' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader size={15} className="animate-spin" /> Processing...</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ChevronRight size={15} /></>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Register with your role to get started. Admin can manage all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
