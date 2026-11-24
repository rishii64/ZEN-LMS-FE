import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { GraduationCap, Briefcase, ShieldAlert, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string, tenantSlug?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass, tenantSlug);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ZenLMS
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Generalized, Multi-Tenant Learning Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>🚀 1-Click Sector Demo Accounts</span>
            </h4>

            <div className="space-y-3">
              {/* Higher Ed Tenant: Apex University */}
              <div className="p-3 rounded-lg bg-white border border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Apex Institute (Higher Education)
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    Edu Sector
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student.alex@apex.edu', 'Apex123!', 'apex-university')}
                    className="px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-800 text-center transition"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('prof.sharma@apex.edu', 'Apex123!', 'apex-university')}
                    className="px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-800 text-center transition"
                  >
                    Professor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@apex.edu', 'Apex123!', 'apex-university')}
                    className="px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-800 text-center transition"
                  >
                    Edu Admin
                  </button>
                </div>
              </div>

              {/* Corporate Tenant: Nexus Corp */}
              <div className="p-3 rounded-lg bg-white border border-emerald-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Nexus Global (Corporate L&D)
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Enterprise
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('employee.john@nexuscorp.com', 'Nexus123!', 'nexus-corp')}
                    className="px-2.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 text-center transition"
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('trainer.david@nexuscorp.com', 'Nexus123!', 'nexus-corp')}
                    className="px-2.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 text-center transition"
                  >
                    Trainer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('hr@nexuscorp.com', 'Nexus123!', 'nexus-corp')}
                    className="px-2.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 text-center transition"
                  >
                    HR / Admin
                  </button>
                </div>
              </div>

              {/* Platform Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@zenlms.io', 'Admin123!')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
              >
                <span>Log in as Platform Super Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or Sign In with Credentials</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@organization.com"
                  className="block w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
