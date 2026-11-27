import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileCheck2, Shield, ShieldCheck, MessageSquare } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { KpiCard, LoadingSkeleton, StatusBadge } from '../../components/ui/Primitives.jsx';

export function CompliancePage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [policyForm, setPolicyForm] = useState({ title: '', version: '1.0', content: '' });

  const q = useQuery({ queryKey: ['compliance', 'overview'], queryFn: () => api.get('/compliance/overview') });

  const ackMut = useMutation({
    mutationFn: (id) => api.post(`/compliance/policies/${id}/acknowledge`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compliance'] });
      addToast({ title: 'Policy acknowledged', message: 'Compliance record timestamped.', type: 'success' });
    }
  });

  const createMut = useMutation({
    mutationFn: (p) => api.post('/compliance/policies', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compliance'] });
      setPolicyForm({ title: '', version: '1.0', content: '' });
      addToast({ title: 'Policy published', message: 'Assigned for workforce acknowledgement.', type: 'success' });
    }
  });

  if (q.isLoading) return <LoadingSkeleton rows={5} />;
  const s = q.data?.summary || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compliance, Mandatory Training & Policies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Mandatory Assignments" value={s.total_mandatory ?? 0} icon={ShieldCheck} />
        <KpiCard title="Completed Mandatory" value={s.completed_mandatory ?? 0} icon={FileCheck2} />
        <KpiCard title="Overdue Mandatory" value={s.overdue_mandatory ?? 0} icon={Shield} />
      </div>

      {hasPermission('compliance', 'create') && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(policyForm); }} className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold">Publish Compliance Policy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="input-field sm:col-span-2" required placeholder="Policy Title" value={policyForm.title} onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })} />
            <input className="input-field" required placeholder="Version" value={policyForm.version} onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })} />
          </div>
          <textarea className="input-field" rows={3} required placeholder="Policy text..." value={policyForm.content} onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })} />
          <button className="btn-primary">Publish Policy</button>
        </form>
      )}

      <div className="space-y-3">
        {(q.data?.policies || []).map((p) => (
          <div key={p.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{p.title} (v{p.version})</h3>
                <span className="text-xs text-slate-500">{p.ack_count} acknowledgements</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{p.content}</p>
            </div>
            {p.acknowledged_by_me ? (
              <StatusBadge status="completed" />
            ) : (
              <button className="btn-primary" onClick={() => ackMut.mutate(p.id)}>Acknowledge Policy</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const { hasPermission } = useAuthContext();
  const [reportType, setReportType] = useState('enrollments');

  const q = useQuery({
    queryKey: ['reports', 'run', reportType],
    queryFn: () => api.get(`/reports/run?type=${reportType}`)
  });

  const auditQ = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit-logs'),
    enabled: hasPermission('audit_logs', 'view')
  });

  const exportFile = async (format) => {
    try {
      const res = await api.download(`/reports/export?type=${reportType}&format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      addToast({ title: 'Export failed', message: err.message, type: 'error' });
    }
  };

  const rows = q.data?.data || [];
  const cols = rows.length ? Object.keys(rows[0]).slice(0, 6).map((k) => ({ key: k, label: k.replace(/_/g, ' ') })) : [{ key: 'empty', label: 'Report' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports, Analytics & Audit Logs</h1>
          <p className="text-sm text-slate-500">Build tenant-isolated reports and export in CSV, Excel, or PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="input-field w-44" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="enrollments">Enrollments & Progress</option>
            <option value="assessments">Assessment Grades</option>
            <option value="certificates">Certificates Issued</option>
          </select>
          {hasPermission('reports', 'export') && (
            <>
              <button className="btn-secondary" onClick={() => exportFile('csv')}><Download className="w-4 h-4" /> CSV</button>
              <button className="btn-secondary" onClick={() => exportFile('xlsx')}><Download className="w-4 h-4" /> Excel</button>
              <button className="btn-primary" onClick={() => exportFile('pdf')}><Download className="w-4 h-4" /> PDF</button>
            </>
          )}
        </div>
      </div>

      <DataTable data={rows} columns={cols} searchPlaceholder="Filter report rows..." />

      {hasPermission('audit_logs', 'view') && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold">Organization Audit Log</h3>
          <DataTable
            data={auditQ.data?.data || []}
            searchPlaceholder="Search audit events..."
            columns={[
              { key: 'created_at', label: 'Timestamp', render: (r) => new Date(r.created_at).toLocaleString() },
              { key: 'action', label: 'Action' },
              { key: 'resource_type', label: 'Resource' },
              { key: 'actor_email', label: 'Actor' }
            ]}
          />
        </div>
      )}
    </div>
  );
}

export function EngagementPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const forumsQ = useQuery({ queryKey: ['engagement', 'forums'], queryFn: () => api.get('/engagement/forums') });

  const postMut = useMutation({
    mutationFn: (p) => api.post('/engagement/forums', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagement', 'forums'] });
      setTitle('');
      setBody('');
      addToast({ title: 'Discussion posted', message: 'Visible to your organization.', type: 'success' });
    }
  });

  if (forumsQ.isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discussion Forums & Community</h1>
      <form onSubmit={(e) => { e.preventDefault(); postMut.mutate({ title, body }); }} className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-600" /> Start a Discussion</h3>
        <input className="input-field" required placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input-field" rows={3} required placeholder="Share a question or insight..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="btn-primary">Post Thread</button>
      </form>
      <div className="space-y-3">
        {(forumsQ.data?.data || []).map((t) => (
          <div key={t.id} className="card p-5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{t.author_name} {t.course_title ? `· ${t.course_title}` : ''}</span>
              <span>{new Date(t.created_at).toLocaleString()}</span>
            </div>
            <h3 className="font-bold mt-1">{t.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSecurityPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { user, activeOrg, activeMembership, memberships, roles } = useAuthContext();
  const [mfaSetup, setMfaSetup] = useState(null);
  const [totpCode, setTotpCode] = useState('');

  const sessionsQ = useQuery({ queryKey: ['auth', 'sessions'], queryFn: () => api.get('/auth/sessions') });

  const setupMfa = async () => {
    const res = await api.post('/auth/mfa/setup', {});
    setMfaSetup(res);
  };

  const enableMfa = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/mfa/verify', { code: totpCode });
      setMfaSetup(null);
      setTotpCode('');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      addToast({ title: 'MFA enabled', message: 'Two-factor authentication is now active.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Invalid code', message: err.message, type: 'error' });
    }
  };

  const revokeMut = useMutation({
    mutationFn: (id) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'sessions'] });
      addToast({ title: 'Session revoked', message: 'Device signed out.', type: 'info' });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Profile & Security</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Account details, organization memberships, MFA, and active login sessions.</p>
      </div>

      {/* User Identity & Details Card */}
      <div className="card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              {(user?.fullName || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</h2>
                {user?.isPlatformAdmin && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                    Platform Super Admin
                  </span>
                )}
                {activeMembership?.is_org_admin && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                    Tenant Admin
                  </span>
                )}
                {(roles || []).filter((r) => r.slug !== 'tenant_admin').map((r) => (
                  <span key={r.id || r.slug} className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {r.name}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email || user?.phone}</p>
            </div>
          </div>

          {!user?.mfaEnabled && (
            <button className="btn-primary shrink-0" onClick={setupMfa}>Configure TOTP MFA</button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
            <p className="font-medium text-slate-900 dark:text-white mt-1 break-all">{user?.email || '—'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phone</p>
            <p className="font-medium text-slate-900 dark:text-white mt-1">{user?.phone || '—'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Workspace</p>
            <p className="font-medium text-slate-900 dark:text-white mt-1 truncate">
              {activeOrg ? activeOrg.name : user?.isPlatformAdmin ? 'Platform Control' : 'None'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Security Status</p>
            <p className="font-medium text-slate-900 dark:text-white mt-1">
              MFA: <span className={user?.mfaEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{user?.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
            </p>
          </div>
        </div>

        {(memberships || []).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Organization Memberships</p>
            <div className="flex flex-wrap gap-2">
              {memberships.map((m) => (
                <div key={m.organization_id} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{m.organization_name}</span>
                  {m.is_org_admin && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-semibold">Admin</span>}
                  {m.jobTitle && <span className="text-slate-500">· {m.jobTitle}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {mfaSetup && (
          <form onSubmit={enableMfa} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-3">
            <p className="text-xs">Add this secret key to your authenticator app: <code className="font-mono font-bold">{mfaSetup.secret}</code></p>
            <div className="flex flex-wrap gap-2 max-w-xs">
              <input className="input-field" required maxLength={6} placeholder="6-digit code" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
              <button className="btn-primary">Verify</button>
            </div>
          </form>
        )}
      </div>

      <DataTable
        data={sessionsQ.data?.data || []}
        searchPlaceholder="Search sessions..."
        columns={[
          { key: 'ip_address', label: 'IP Address' },
          { key: 'user_agent', label: 'Device / Client', render: (r) => <span className="text-xs truncate max-w-xs block">{r.user_agent || 'API Client'}</span> },
          { key: 'last_active_at', label: 'Last Active', render: (r) => new Date(r.last_active_at).toLocaleString() },
          { key: 'revoked_at', label: 'State', render: (r) => <StatusBadge status={r.revoked_at ? 'cancelled' : 'active'} /> },
          {
            key: 'actions',
            label: 'Action',
            sortable: false,
            render: (r) => !r.revoked_at && (
              <button className="btn-secondary px-2.5 py-1 text-xs text-rose-600" onClick={() => revokeMut.mutate(r.id)}>Revoke</button>
            )
          }
        ]}
      />
    </div>
  );
}
