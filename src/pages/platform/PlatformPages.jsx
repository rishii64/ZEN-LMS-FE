import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Building2, CreditCard, Megaphone } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal, StatusBadge, LoadingSkeleton, PasswordInput } from '../../components/ui/Primitives.jsx';

export function PlatformTenantsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', industry: '', organizationType: 'corporate',
    contactEmail: '', country: '', planId: '', billingCycle: 'monthly',
    adminEmail: '', adminFullName: '', adminTemporaryPassword: '', activateImmediately: true
  });

  const orgsQuery = useQuery({
    queryKey: ['platform', 'orgs'],
    queryFn: () => api.get('/platform/organizations?limit=500'),
    refetchInterval: 15000
  });
  const plansQuery = useQuery({ queryKey: ['platform', 'plans'], queryFn: () => api.get('/platform/plans') });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/platform/organizations', payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['platform'] });
      setOpen(false);
      addToast({ title: 'Organization onboarded', message: `Invite token: ${res.invitationToken}`, type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/platform/organizations/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform'] });
      addToast({ title: 'Tenant status updated', message: 'Organization state updated.', type: 'success' });
    }
  });

  if (orgsQuery.isLoading) return <LoadingSkeleton rows={6} />;

  const orgRows = orgsQuery.data?.data || [];
  const activeCount = orgRows.filter((o) => o.status === 'active').length;
  const suspendedCount = orgRows.filter((o) => o.status === 'suspended').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tenant Organizations</h1>
          <p className="text-sm text-slate-500">
            Onboard, approve, activate, suspend, and monitor SaaS tenants ·{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {orgRows.length} total ({activeCount} active · {suspendedCount} suspended)
            </span>
          </p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Onboard Organization
        </button>
      </div>

      <DataTable
        data={orgRows}
        searchPlaceholder="Search organizations..."
        columns={[
          { key: 'name', label: 'Organization', render: (r) => <div><p className="font-semibold">{r.name}</p><p className="text-xs text-slate-500">{r.slug} · {r.organization_type}</p></div> },
          { key: 'plan_name', label: 'Plan', render: (r) => <span>{r.plan_name || '—'} <span className="text-xs text-slate-500">({r.subscription_status})</span></span> },
          { key: 'users_count', label: 'Users' },
          { key: 'courses_count', label: 'Courses' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            label: 'Controls',
            sortable: false,
            render: (r) => (
              <div className="flex gap-1.5">
                {r.status !== 'active' && (
                  <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => statusMutation.mutate({ id: r.id, status: 'active' })}>Activate</button>
                )}
                {r.status === 'active' && (
                  <button className="btn-secondary px-2.5 py-1 text-xs text-rose-600" onClick={() => statusMutation.mutate({ id: r.id, status: 'suspended' })}>Suspend</button>
                )}
              </div>
            )
          }
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Onboard New Tenant Organization" maxWidth="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const planId = form.planId || plansQuery.data?.data?.[0]?.id;
            createMutation.mutate({
              ...form,
              planId,
              adminTemporaryPassword: form.adminTemporaryPassword || undefined
            });
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">Organization Name</label>
            <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Unique Slug</label>
            <input className="input-field" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Sector / Type</label>
            <select className="input-field" value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}>
              <option value="corporate">Corporate</option>
              <option value="educational">Educational Institution</option>
              <option value="government">Government Agency</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="training_institute">Training Institute</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Industry</label>
            <input className="input-field" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Contact Email</label>
            <input type="email" className="input-field" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Subscription Plan</label>
            <select className="input-field" value={form.planId || plansQuery.data?.data?.[0]?.id || ''} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
              {(plansQuery.data?.data || []).map((p) => (
                <option key={p.id} value={p.id}>{p.name} (${(p.monthly_price_cents / 100).toFixed(0)}/mo)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Initial Tenant Admin Name</label>
            <input className="input-field" required value={form.adminFullName} onChange={(e) => setForm({ ...form, adminFullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Initial Tenant Admin Email</label>
            <input type="email" className="input-field" required value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Temporary Password (optional — leave empty to invite via token)</label>
            <PasswordInput value={form.adminTemporaryPassword} onChange={(e) => setForm({ ...form, adminTemporaryPassword: e.target.value })} placeholder="Leave empty to invite via token" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create & Provision Tenant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function PlatformPlansPage() {
  const plansQuery = useQuery({ queryKey: ['platform', 'plans'], queryFn: () => api.get('/platform/plans') });
  if (plansQuery.isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans & Entitlements</h1>
        <p className="text-sm text-slate-500">Configurable SaaS tiers governing quotas and module availability independently of RBAC.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(plansQuery.data?.data || []).map((p) => (
          <div key={p.id} className="card p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">{p.name}</h3>
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold mt-2">${(p.monthly_price_cents / 100).toFixed(0)}<span className="text-xs font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              <div className="mt-4 space-y-1 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <p>Max Users: <strong>{p.max_users.toLocaleString()}</strong></p>
                <p>Max Courses: <strong>{p.max_courses.toLocaleString()}</strong></p>
                <p>Max Custom Roles: <strong>{p.max_custom_roles}</strong></p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(p.features || []).filter((f) => f.is_enabled).map((f) => (
                  <span key={f.id} className="px-2 py-0.5 text-[10px] rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                    {f.module_key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformSettingsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const auditQuery = useQuery({ queryKey: ['platform', 'audit'], queryFn: () => api.get('/platform/audit-logs') });
  const annQuery = useQuery({ queryKey: ['platform', 'announcements'], queryFn: () => api.get('/platform/announcements') });

  const annMut = useMutation({
    mutationFn: (payload) => api.post('/platform/announcements', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'announcements'] });
      setTitle('');
      setBody('');
      addToast({ title: 'Announcement published', message: 'Visible across tenants.', type: 'success' });
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Announcements & Audit Trail</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          annMut.mutate({ title, body, severity: 'info' });
        }}
        className="card p-5 space-y-3"
      >
        <div className="flex items-center gap-2 text-sm font-semibold"><Megaphone className="w-4 h-4 text-blue-600" /> Publish Platform Announcement</div>
        <input className="input-field" required placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input-field" rows={2} required placeholder="Message for all tenants..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="btn-primary">Publish Announcement</button>
      </form>

      <DataTable
        data={auditQuery.data?.data || []}
        searchPlaceholder="Filter platform audit logs..."
        columns={[
          { key: 'created_at', label: 'Time', render: (r) => new Date(r.created_at).toLocaleString() },
          { key: 'organization_name', label: 'Tenant', render: (r) => r.organization_name || 'Platform' },
          { key: 'action', label: 'Action' },
          { key: 'resource_type', label: 'Resource' },
          { key: 'actor_email', label: 'Actor' }
        ]}
      />
    </div>
  );
}
