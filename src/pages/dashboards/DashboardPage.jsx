import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Award, BookOpen, Building2, CheckCircle2, Clock, CreditCard,
  GraduationCap, HardDrive, RefreshCw, ShieldAlert, TrendingUp, Users
} from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { KpiCard, LoadingSkeleton, StatusBadge } from '../../components/ui/Primitives.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { BarChartCard } from '../../components/charts/AnalyticsChart.jsx';

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DashboardPage() {
  const { user, activeOrg, activeMembership, terminology, hasPermission } = useAuthContext();

  const platformQuery = useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: () => api.get('/platform/dashboard'),
    enabled: Boolean(user?.isPlatformAdmin),
    refetchInterval: 15000
  });

  const tenantQuery = useQuery({
    queryKey: ['reports', 'dashboard', activeOrg?.id],
    queryFn: () => api.get('/reports/dashboard'),
    enabled: Boolean(activeOrg?.id)
  });

  if (user?.isPlatformAdmin) {
    if (platformQuery.isLoading) return <LoadingSkeleton rows={6} />;
    const d = platformQuery.data;
    const s = d?.summary || {};
    const lastSynced = d?.generatedAt ? new Date(d.generatedAt).toLocaleTimeString() : 'Just now';
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">Platform Super Admin Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Last synced at {lastSynced}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Centralized real-time SaaS telemetry across all registered tenants and users.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => platformQuery.refetch()}
              disabled={platformQuery.isFetching}
              className="btn-secondary"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${platformQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/platform/tenants" className="btn-primary">Onboard New Tenant</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Organizations" value={s.total_organizations ?? 0} subtitle={`${s.active_tenants ?? 0} active · ${s.suspended_tenants ?? 0} suspended`} icon={Building2} />
          <KpiCard title="Platform Users" value={s.total_users ?? 0} subtitle={`${s.active_users ?? 0} active · ${s.active_learners ?? 0} learners`} icon={Users} />
          <KpiCard title="Monthly Recurring Revenue" value={`$${((Number(s.mrr_cents) || 0) / 100).toLocaleString()}`} subtitle={`${s.active_subscriptions ?? 0} active subs · ${s.expiring_subscriptions ?? 0} expiring`} icon={CreditCard} />
          <KpiCard title="Storage & Courses" value={formatBytes(s.total_storage_bytes)} subtitle={`${s.total_courses ?? 0} total courses (${s.published_courses ?? 0} published)`} icon={HardDrive} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartCard
            title="Subscription Plan Distribution"
            items={d?.subscriptionDistribution || []}
            labelKey="name"
            valueKey="tenant_count"
          />
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Tenant Registrations</h3>
              <Link to="/platform/tenants" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {(d?.recentRegistrations || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No tenant organizations registered yet.</p>
              ) : (
                (d?.recentRegistrations || []).map((org) => (
                  <div key={org.id} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-3">
                      <p className="font-medium truncate">{org.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {org.organization_type} · {org.plan_name || 'No plan'} · {org.users_count ?? 0} users · {org.courses_count ?? 0} courses
                      </p>
                    </div>
                    <StatusBadge status={org.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Tenants Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight">Live Tenant Organizations</h2>
              <p className="text-xs text-slate-500">Real-time organization metrics, plan subscriptions, users, courses, and storage.</p>
            </div>
            <Link to="/platform/tenants" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage tenants →</Link>
          </div>
          <DataTable
            data={d?.tenants || []}
            searchPlaceholder="Search tenants by name, slug, or plan..."
            emptyText="No tenant organizations found"
            columns={[
              {
                key: 'name',
                label: 'Organization',
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.slug} · {r.organization_type}</p>
                  </div>
                )
              },
              {
                key: 'plan_name',
                label: 'Plan & Billing',
                render: (r) => (
                  <span className="text-xs">
                    <span className="font-medium">{r.plan_name || '—'}</span>
                    {r.subscription_status && (
                      <span className="ml-1 text-slate-500">({r.subscription_status}{r.billing_cycle ? ` · ${r.billing_cycle}` : ''})</span>
                    )}
                  </span>
                )
              },
              { key: 'users_count', label: 'Users', render: (r) => <span className="font-semibold tabular-nums">{r.users_count ?? 0}</span> },
              { key: 'courses_count', label: 'Courses', render: (r) => <span className="tabular-nums">{r.courses_count ?? 0}</span> },
              { key: 'enrollments_count', label: 'Enrollments', render: (r) => <span className="tabular-nums">{r.enrollments_count ?? 0}</span> },
              { key: 'storage_used_bytes', label: 'Storage', render: (r) => <span className="text-xs tabular-nums">{formatBytes(r.storage_used_bytes)}</span> },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }
            ]}
          />
        </div>

        {/* Real-Time Platform Users Table */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">Live Platform Users</h2>
            <p className="text-xs text-slate-500">Registered users across all tenants with organization memberships, admin status, and last login.</p>
          </div>
          <DataTable
            data={d?.users || []}
            searchPlaceholder="Search users by name or email..."
            emptyText="No platform users found"
            columns={[
              {
                key: 'full_name',
                label: 'User',
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.full_name}</p>
                    <p className="text-xs text-slate-500">{r.email || r.phone || '—'}</p>
                  </div>
                )
              },
              {
                key: 'is_platform_admin',
                label: 'Organizations & Roles',
                sortable: false,
                render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {r.is_platform_admin && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                        Platform Super Admin
                      </span>
                    )}
                    {(r.organizations || []).map((org) => (
                      <span
                        key={org.organization_id}
                        className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {org.organization_name}{org.is_org_admin ? ' (Admin)' : ''}
                      </span>
                    ))}
                    {!r.is_platform_admin && (!r.organizations || r.organizations.length === 0) && (
                      <span className="text-xs text-slate-400">No organization</span>
                    )}
                  </div>
                )
              },
              {
                key: 'mfa_enabled',
                label: 'MFA',
                render: (r) => (
                  <span className={`text-xs font-medium ${r.mfa_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {r.mfa_enabled ? 'Enabled' : 'Off'}
                  </span>
                )
              },
              {
                key: 'last_login_at',
                label: 'Last Login',
                render: (r) => (
                  <span className="text-xs text-slate-500">
                    {r.last_login_at ? new Date(r.last_login_at).toLocaleString() : 'Never'}
                  </span>
                )
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (r) => <StatusBadge status={r.is_active ? 'active' : 'suspended'} />
              }
            ]}
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent Platform Audit Activities</h3>
            <Link to="/platform/settings" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Audit log</Link>
          </div>
          <div className="space-y-2 text-xs">
            {(d?.recentActivities || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent audit events recorded.</p>
            ) : (
              (d?.recentActivities || []).map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span><strong className="text-blue-600 dark:text-blue-400">{a.action}</strong> on {a.resource_type} ({a.organization_name || 'Platform'})</span>
                  </span>
                  <span className="text-slate-500">{a.actor_email || 'system'} · {new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tenantQuery.isLoading) return <LoadingSkeleton rows={6} />;
  const td = tenantQuery.data || {};
  const om = td.organizationMetrics || {};
  const lm = td.learnerMetrics || {};
  const im = td.instructorMetrics || {};
  const isOrgAdmin = Boolean(activeMembership?.is_org_admin);
  const canManageUsers = hasPermission('users', 'view');
  const canCreateCourses = hasPermission('courses', 'create');
  const canAuditCompliance = hasPermission('compliance', 'view');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{activeOrg?.name} Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isOrgAdmin ? 'Organization Administrator Dashboard' : 'Role-Scoped Learning & Operations Dashboard'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/courses" className="btn-secondary">Browse {terminology.courses}</Link>
          {canCreateCourses && <Link to="/courses" className="btn-primary">Create {terminology.course}</Link>}
        </div>
      </div>

      {/* Admin / Manager / Compliance KPIs */}
      {(isOrgAdmin || canManageUsers || canAuditCompliance) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title={`Total ${terminology.learners}`} value={om.total_users ?? 0} subtitle={`${om.active_learners ?? 0} active · ${om.departments_count ?? 0} ${terminology.departments.toLowerCase()}`} icon={Users} />
          <KpiCard title={`${terminology.courses} & Enrollments`} value={om.total_courses ?? 0} subtitle={`${om.total_enrollments ?? 0} enrollments · ${om.pending_approvals ?? 0} pending approvals`} icon={BookOpen} />
          <KpiCard title="Completion Rate" value={`${om.completion_rate_percent ?? 0}%`} subtitle={`${om.overdue_enrollments ?? 0} overdue assignments`} icon={TrendingUp} />
          <KpiCard title="Assessments & Credentials" value={`${om.avg_assessment_score ?? 0}%`} subtitle={`${om.issued_certificates ?? 0} active certificates`} icon={Award} />
        </div>
      )}

      {/* Instructor / Reviewer Operational Strip */}
      {canCreateCourses && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard title={`My Created ${terminology.courses}`} value={im.my_created_courses ?? 0} icon={BookOpen} />
          <KpiCard title="Grading Queue" value={im.grading_queue_count ?? 0} subtitle="Attempts awaiting review" icon={CheckCircle2} />
          <KpiCard title="Courses In Review" value={td.reviewerMetrics?.courses_in_review ?? 0} subtitle={`${im.upcoming_sessions_count ?? 0} upcoming live sessions`} icon={Clock} />
        </div>
      )}

      {/* Learner Personal Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={`My Assigned ${terminology.courses}`} value={lm.assigned_courses ?? 0} icon={GraduationCap} />
        <KpiCard title="Completed" value={lm.completed_courses ?? 0} icon={CheckCircle2} />
        <KpiCard title="Overdue" value={lm.overdue_courses ?? 0} icon={ShieldAlert} />
        <KpiCard title="My Certificates" value={lm.my_certificates ?? 0} icon={Award} />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title={`${terminology.department}-wise Active ${terminology.learners}`}
          items={td.departmentPerformance || []}
          labelKey="name"
          valueKey="members_count"
        />
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Organization Activity</h3>
          {(td.recentActivities || []).length === 0 ? (
            <p className="text-sm text-slate-500">No recent audit events recorded yet.</p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {td.recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span><strong className="text-blue-600 dark:text-blue-400">{act.action}</strong> · {act.resource_type}</span>
                  <span className="text-slate-500">{act.actor_email || 'system'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
