import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { 
  Users, 
  BookOpen, 
  Award, 
  Layers, 
  Palette, 
  Settings, 
  UserPlus, 
  Building2, 
  CheckCircle2,
  TrendingUp,
  FolderPlus,
  Shield,
  CreditCard,
  MapPin,
  FileText,
  Plus,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

export const OrgAdminDashboard: React.FC = () => {
  const { activeOrganization } = useAuth();
  const { t, primaryColor, secondaryColor, sector } = useTenant();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'hierarchy' | 'rbac' | 'terminology' | 'branding' | 'billing'>('overview');
  const [metrics, setMetrics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Terminology Editor State
  const [termState, setTermState] = useState({
    learner: '',
    learners: '',
    instructor: '',
    instructors: '',
    course: '',
    courses: '',
    department: '',
    departments: '',
    credential: ''
  });

  // Branding Editor State
  const [brandPrimary, setBrandPrimary] = useState(primaryColor);
  const [brandSecondary, setBrandSecondary] = useState(secondaryColor);
  const [brandName, setBrandName] = useState(activeOrganization?.name || '');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviteRole, setInviteRole] = useState('LEARNER');
  const [inviteDept, setInviteDept] = useState('');

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleScope, setNewRoleScope] = useState('ORGANIZATION');
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadData = async () => {
    try {
      const [
        overviewData, 
        usersData, 
        deptsData, 
        locsData, 
        teamsData, 
        rolesData, 
        permsData, 
        subData,
        plansData,
        invoicesData
      ] = await Promise.all([
        ApiClient.get('/reports/overview'),
        ApiClient.get('/users'),
        ApiClient.get('/departments'),
        ApiClient.get('/structure/locations').catch(() => []),
        ApiClient.get('/structure/teams').catch(() => []),
        ApiClient.get('/roles').catch(() => []),
        ApiClient.get('/roles/permissions').catch(() => []),
        ApiClient.get('/subscriptions/current').catch(() => null),
        ApiClient.get('/subscriptions/plans').catch(() => []),
        ApiClient.get('/subscriptions/invoices').catch(() => [])
      ]);

      setMetrics(overviewData.metrics);
      setUsers(usersData);
      setDepartments(deptsData);
      setLocations(locsData);
      setTeams(teamsData);
      setRoles(rolesData);
      setPermissions(permsData);
      setSubscriptionData(subData);
      setPlans(plansData);
      setInvoices(invoicesData);

      setTermState({
        learner: t('learner'),
        learners: t('learners'),
        instructor: t('instructor'),
        instructors: t('instructors'),
        course: t('course'),
        courses: t('courses'),
        department: t('department'),
        departments: t('departments'),
        credential: t('credential')
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrganization?.id]);

  const handleSaveTerminology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    try {
      await ApiClient.put(`/organizations/${activeOrganization.id}/settings`, { terminology: termState });
      alert('Custom sector terminology updated!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update terminology');
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    try {
      await ApiClient.put(`/organizations/${activeOrganization.id}`, {
        name: brandName,
        primaryColor: brandPrimary,
        secondaryColor: brandSecondary
      });
      alert('Brand identity updated!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update branding');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/roles', {
        name: newRoleName,
        description: newRoleDesc,
        scope: newRoleScope,
        permissionCodes: selectedPermCodes
      });
      setShowRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermCodes([]);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create role');
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      await ApiClient.post('/subscriptions/upgrade', {
        planId,
        billingCycle: 'ANNUAL'
      });
      setShowUpgradeModal(false);
      alert('Subscription plan successfully updated!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to upgrade plan');
    }
  };

  const togglePerm = (code: string) => {
    setSelectedPermCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {activeOrganization?.name} Admin Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Organization Governance & Multi-Unit Architecture
          </h1>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('learners', 'Members')}
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'hierarchy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Structure
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'rbac' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Dynamic RBAC
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'terminology' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Terminology
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'branding' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Branding
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'billing' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Subscription & Billing
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">{t('learners', 'Members')}</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalMembers || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Active in organization</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">{t('courses', 'Courses')}</span>
                <BookOpen className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalCourses || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Hosted in catalog</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Completion Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics?.completionRate || 0}%</div>
              <span className="text-xs text-slate-400 mt-1 block">Overall curriculum progress</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">{t('credential', 'Certificates')}</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalCertificates || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Conferred & verifiable</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('learners', 'Members')} Directory & Scoped RBAC
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite New Member</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Member Name & Email</th>
                  <th className="py-3 px-4">Archetype Role</th>
                  <th className="py-3 px-4">{t('department', 'Department')}</th>
                  <th className="py-3 px-4">Title / Persona</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{m.user.firstName} {m.user.lastName}</div>
                      <div className="text-slate-400">{m.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {m.department?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {m.title || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('departments', 'Departments')} & Academic Units
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(d => (
                <div key={d.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{d.name}</h4>
                    {d.code && <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{d.code}</span>}
                    <p className="text-xs text-slate-400 mt-1">{d.description || 'No description'}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                    {d._count?.memberships || 0} members
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Locations & Branch Campuses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map(l => (
                <div key={l.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{l.name}</div>
                      <div className="text-xs text-slate-400">{l.city}, {l.country}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                    {l._count?.memberships || 0} members
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DYNAMIC RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dynamic Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create unlimited custom roles with fine-grained action permissions and organizational scopes.
              </p>
            </div>

            <button
              onClick={() => setShowRoleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(r => (
              <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{r.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Scope: {r.scope}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{r.description || 'No description provided'}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Assigned Permissions</div>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions?.slice(0, 5).map((p: any) => (
                        <span key={p.permission.code} className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                          {p.permission.code}
                        </span>
                      ))}
                      {(r.permissions?.length || 0) > 5 && (
                        <span className="text-[10px] text-slate-400">+{r.permissions.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span>{r._count?.memberships || 0} members assigned</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TERMINOLOGY */}
      {activeTab === 'terminology' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-3xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configurable Sector Terminology</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customize vocabulary across learner portals and certificate generation.</p>
          </div>

          <form onSubmit={handleSaveTerminology} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Learner (Singular)</label>
                <input
                  type="text"
                  value={termState.learner}
                  onChange={(e) => setTermState({ ...termState, learner: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Learners (Plural)</label>
                <input
                  type="text"
                  value={termState.learners}
                  onChange={(e) => setTermState({ ...termState, learners: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Instructor (Singular)</label>
                <input
                  type="text"
                  value={termState.instructor}
                  onChange={(e) => setTermState({ ...termState, instructor: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course (Singular)</label>
                <input
                  type="text"
                  value={termState.course}
                  onChange={(e) => setTermState({ ...termState, course: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
              >
                Apply Terminology
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tenant Brand Colors</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure primary branding colors dynamically reflected across client portals.</p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Organization Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandPrimary}
                  onChange={(e) => setBrandPrimary(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={brandPrimary}
                  onChange={(e) => setBrandPrimary(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
              >
                Save Branding
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: SUBSCRIPTION & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-8">
          {/* Active Plan Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                  Current SaaS Tier
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {subscriptionData?.subscription?.status || 'ACTIVE'}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">
                {subscriptionData?.subscription?.plan?.displayName || 'Enterprise Plan'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {subscriptionData?.subscription?.plan?.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
              >
                Change Subscription Plan
              </button>
            </div>
          </div>

          {/* Usage Quotas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Workforce Quota</span>
                <span>{subscriptionData?.usage?.currentUsersCount || 0} / {subscriptionData?.usage?.maxUsers || 100}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${subscriptionData?.usage?.userUtilizationPct || 10}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Course Catalog Quota</span>
                <span>{subscriptionData?.usage?.currentCoursesCount || 0} / {subscriptionData?.usage?.maxCourses || 50}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: `${subscriptionData?.usage?.courseUtilizationPct || 10}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Private Object Storage</span>
                <span>1.2 GB / {subscriptionData?.usage?.maxStorageGb || 20} GB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="h-2 rounded-full bg-indigo-600 w-1/12" />
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span>Subscription Invoices & Payment Receipts</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Billing Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${inv.amount} {inv.currency}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(inv.billingDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">No previous invoices found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 dark:border-slate-700 my-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select SaaS Subscription Tier</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Choose a plan scale appropriate for your organization size.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{p.displayName}</h4>
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 my-2">${p.monthlyPrice} <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 my-3">
                      <li>• Up to {p.maxUsers} users</li>
                      <li>• {p.maxCourses} hosted courses</li>
                      <li>• {p.maxStorageGb} GB private storage</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgradePlan(p.id)}
                    className="w-full py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm mt-4"
                  >
                    Switch to {p.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Dynamic Custom Role</h3>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Role Name</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Training Manager, Content Reviewer"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Responsibilities and purpose of this role..."
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Organizational Scope</label>
                <select
                  value={newRoleScope}
                  onChange={(e) => setNewRoleScope(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="ORGANIZATION">Organization-Wide</option>
                  <option value="DEPARTMENT">Department-Level</option>
                  <option value="BRANCH">Branch / Location-Level</option>
                  <option value="COURSE">Course-Level</option>
                  <option value="SELF">Self-Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Granular Permissions</label>
                <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  {permissions.map((p) => (
                    <label key={p.code} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedPermCodes.includes(p.code)}
                        onChange={() => togglePerm(p.code)}
                        className="rounded accent-blue-600"
                      />
                      <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">{p.code}</span>
                      <span className="text-[11px] text-slate-500 truncate">- {p.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Save Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Invite New {t('learner', 'Member')}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await ApiClient.post('/users/invite', {
                  email: inviteEmail,
                  firstName: inviteFirst,
                  lastName: inviteLast,
                  role: inviteRole,
                  departmentId: inviteDept || null
                });
                setShowInviteModal(false);
                setInviteEmail('');
                setInviteFirst('');
                setInviteLast('');
                loadData();
              } catch (err: any) {
                alert(err.message || 'Failed to invite user');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={inviteFirst}
                  onChange={(e) => setInviteFirst(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={inviteLast}
                  onChange={(e) => setInviteLast(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="LEARNER">{t('learner', 'Learner')}</option>
                <option value="INSTRUCTOR">{t('instructor', 'Instructor / Trainer')}</option>
                <option value="DEPT_MANAGER">Department Manager</option>
                <option value="ORG_ADMIN">Organization Admin</option>
              </select>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
