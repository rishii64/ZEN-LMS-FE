import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Lock, Mail, CheckCircle2, XCircle, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { PasswordInput } from '../../components/ui/Primitives.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAppStore((s) => s.setTokens);
  const addToast = useAppStore((s) => s.addToast);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier,
        password,
        ...(mfaRequired ? { mfaCode } : {})
      });
      if (res.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }
      setTokens(res.accessToken, res.refreshToken, res.user.activeOrganizationId || '');
      addToast({ title: 'Welcome back', message: `Signed in as ${res.user.fullName}`, type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      {/* Subtle ambient SaaS mesh gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/25 ring-4 ring-white dark:ring-slate-900">
            AL
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">AstraLearn Enterprise LMS</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Multi-Tenant SaaS Learning & Workforce Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email or Phone</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@organization.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <PasswordInput
              icon={Lock}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {mfaRequired && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">MFA Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit authenticator code"
                className="input-field"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Signing in...' : mfaRequired ? 'Verify MFA & Sign In' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link to="/forgot-password" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
            <Link to="/accept-invite" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Have an invite token?</Link>
          </div>
        </form>

        {/* Demo Sandbox Accounts Helper */}
        <div className="card p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Seeded Demo Accounts (Click to Autofill)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => quickFill('saptarsi.mitra@zentelex.com', 'SuperAdmin#2026!')} className="btn-secondary py-2 text-xs justify-start px-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              Super Admin
            </button>
            <button type="button" onClick={() => quickFill('admin@acme-corp.local', 'DemoPass#2026!')} className="btn-secondary py-2 text-xs justify-start px-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              Acme Corp Admin
            </button>
            <button type="button" onClick={() => quickFill('trainer@acme-corp.local', 'DemoPass#2026!')} className="btn-secondary py-2 text-xs justify-start px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Acme Trainer
            </button>
            <button type="button" onClick={() => quickFill('learner@acme-corp.local', 'DemoPass#2026!')} className="btn-secondary py-2 text-xs justify-start px-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Acme Employee
            </button>
            <button type="button" onClick={() => quickFill('dean@horizon.edu.local', 'DemoPass#2026!')} className="btn-secondary py-2 text-xs col-span-2 justify-start px-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              Horizon University Dean (Tenant 2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const [token, setToken] = useState(params.get('token') || '');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/accept-invite', { token, fullName, password });
      addToast({ title: 'Registration complete', message: 'Your organization account is active. Please sign in.', type: 'success' });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15" />
      </div>
      <form onSubmit={handleSubmit} className="relative card p-7 w-full max-w-md space-y-4 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Complete Organization Invitation</h1>
            <p className="text-xs text-slate-500">Activate your workspace membership</p>
          </div>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold mb-1.5">Invitation Token</label>
          <input className="input-field" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste invite token" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Full Name</label>
          <input className="input-field" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Password (min 8 chars)</label>
          <PasswordInput icon={Lock} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
        </div>
        <button className="btn-primary w-full">Activate Membership</button>
        <Link to="/login" className="block text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Back to Sign In</Link>
      </form>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const initialToken = params.get('token') || '';
  const [email, setEmail] = useState('');
  const [devToken, setDevToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(initialToken ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addToast = useAppStore((s) => s.addToast);
  const navigate = useNavigate();

  const requestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.devResetToken) setDevToken(res.devResetToken);
      setStep(2);
      addToast({ title: 'Reset link sent', message: res.message, type: 'info' });
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: devToken.trim(), newPassword });
      addToast({ title: 'Password updated', message: 'You can now sign in with your new password.', type: 'success' });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15" />
      </div>
      <div className="relative card p-7 w-full max-w-md space-y-4 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 1
              ? 'Enter your account email to receive a password reset link and token.'
              : 'Enter the reset token sent to your email and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestReset} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending Reset Email...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={completeReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reset Token</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Paste reset token from email"
                value={devToken}
                onChange={(e) => setDevToken(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
              <PasswordInput
                icon={Lock}
                required
                minLength={8}
                placeholder="New password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => { setError(''); setStep(1); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Didn&apos;t receive an email? Try again
            </button>
          </form>
        )}
        <Link to="/login" className="block text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export function PublicVerifyCertificatePage() {
  const { code } = useParams();
  const query = useQuery({
    queryKey: ['public-verify', code],
    queryFn: () => api.get(`/certificates/verify/${code}`)
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="card p-8 w-full max-w-lg text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto" />
        <h1 className="text-xl font-bold">Credential Verification</h1>
        {query.isLoading ? (
          <p className="text-sm text-slate-500">Verifying credential...</p>
        ) : query.isError ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex flex-col items-center gap-2">
            <XCircle className="w-6 h-6" />
            <p className="font-semibold">Certificate not found or invalid verification code.</p>
          </div>
        ) : (
          <div className="space-y-3 text-left p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {query.data.valid ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-600" /> <span className="text-emerald-700 dark:text-emerald-400">Verified Authentic ({query.data.status})</span></>
              ) : (
                <><XCircle className="w-5 h-5 text-rose-600" /> <span className="text-rose-700 dark:text-rose-400">Invalid ({query.data.status})</span></>
              )}
            </div>
            <p className="text-sm"><span className="text-slate-500">Recipient:</span> <strong>{query.data.certificate.recipient_name}</strong></p>
            <p className="text-sm"><span className="text-slate-500">Course:</span> <strong>{query.data.certificate.course_title}</strong></p>
            <p className="text-sm"><span className="text-slate-500">Issued By:</span> {query.data.certificate.organization_name}</p>
            <p className="text-sm"><span className="text-slate-500">Certificate ID:</span> {query.data.certificate.certificate_number}</p>
            <p className="text-sm"><span className="text-slate-500">Issued Date:</span> {new Date(query.data.certificate.issued_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
