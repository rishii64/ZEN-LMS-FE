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
  FolderPlus
} from 'lucide-react';

export const OrgAdminDashboard: React.FC = () => {
  const { activeOrganization } = useAuth();
  const { t, primaryColor, secondaryColor, sector } = useTenant();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'departments' | 'terminology' | 'branding'>('overview');
  const [metrics, setMetrics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
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

  const loadData = async () => {
    try {
      const [overviewData, usersData, deptsData] = await Promise.all([
        ApiClient.get('/reports/overview'),
        ApiClient.get('/users'),
        ApiClient.get('/departments')
      ]);
      setMetrics(overviewData.metrics);
      setUsers(usersData);
      setDepartments(deptsData);

      // Populate current terminology
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
      await ApiClient.put(`/organizations/${activeOrganization.id}/settings`, {
        terminology: termState
      });
      alert('Custom sector terminology successfully updated!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update terminology.');
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
      alert('Brand identity successfully updated!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to update branding.');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
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
      alert(err.message || 'Failed to invite member.');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/departments', {
        name: deptName,
        code: deptCode
      });
      setShowDeptModal(false);
      setDeptName('');
      setDeptCode('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create department.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
            {activeOrganization?.name} Admin Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Organization Governance & Sector Customization
          </h1>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('learners', 'Members')} & Roles
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'departments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('departments', 'Departments')}
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'terminology' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sector Terminology
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'branding' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Branding
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">{t('learners', 'Members')}</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalMembers || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Active in organization</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">{t('courses', 'Courses')}</span>
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalCourses || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Hosted in catalog</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Completion Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700">{metrics?.completionRate || 0}%</div>
              <span className="text-xs text-slate-400 mt-1 block">Overall curriculum progress</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">{t('credential', 'Certificates')}</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalCertificates || 0}</div>
              <span className="text-xs text-slate-400 mt-1 block">Conferred & verifiable</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Member Name & Email</th>
                  <th className="py-3 px-4">Scoped Role</th>
                  <th className="py-3 px-4">{t('department', 'Department')}</th>
                  <th className="py-3 px-4">Title / Persona</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.user.firstName} {m.user.lastName}</div>
                      <div className="text-slate-400">{m.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.department?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.title || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
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

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {t('departments', 'Departments')} & Organizational Hierarchy
            </h3>
            <button
              onClick={() => setShowDeptModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add {t('department', 'Department')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{d.name}</h4>
                    {d.code && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {d.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{d.description || 'No description provided'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {d._count?.memberships || 0} members
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECTOR TERMINOLOGY ENGINE */}
      {activeTab === 'terminology' && (
        <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Configurable Sector Terminology Dictionary
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adapt ZenLMS to your domain vocabulary. Changes update all client portals, navigation menus, and certificates in real-time.
            </p>
          </div>

          <form onSubmit={handleSaveTerminology} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Learner (Singular)</label>
                <input
                  type="text"
                  value={termState.learner}
                  onChange={(e) => setTermState({ ...termState, learner: e.target.value })}
                  placeholder="e.g. Student, Employee, Volunteer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Learners (Plural)</label>
                <input
                  type="text"
                  value={termState.learners}
                  onChange={(e) => setTermState({ ...termState, learners: e.target.value })}
                  placeholder="e.g. Students, Employees, Volunteers"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructor (Singular)</label>
                <input
                  type="text"
                  value={termState.instructor}
                  onChange={(e) => setTermState({ ...termState, instructor: e.target.value })}
                  placeholder="e.g. Professor, Trainer, Lead"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructors (Plural)</label>
                <input
                  type="text"
                  value={termState.instructors}
                  onChange={(e) => setTermState({ ...termState, instructors: e.target.value })}
                  placeholder="e.g. Faculty, Trainers, Mentors"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course (Singular)</label>
                <input
                  type="text"
                  value={termState.course}
                  onChange={(e) => setTermState({ ...termState, course: e.target.value })}
                  placeholder="e.g. Course, Training Module, Workshop"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Courses (Plural)</label>
                <input
                  type="text"
                  value={termState.courses}
                  onChange={(e) => setTermState({ ...termState, courses: e.target.value })}
                  placeholder="e.g. Courses, Modules, Workshops"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department (Singular)</label>
                <input
                  type="text"
                  value={termState.department}
                  onChange={(e) => setTermState({ ...termState, department: e.target.value })}
                  placeholder="e.g. Faculty, Business Unit, Team"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credential Name</label>
                <input
                  type="text"
                  value={termState.credential}
                  onChange={(e) => setTermState({ ...termState, credential: e.target.value })}
                  placeholder="e.g. Academic Certificate, Compliance Badge"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
              >
                Apply Terminology Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: BRANDING IDENTITY */}
      {activeTab === 'branding' && (
        <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Tenant Brand Colors & Visual Identity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize your primary theme colors and display logo.
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Organization Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Theme Color</label>
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
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Secondary / Dark Shade</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandSecondary}
                  onChange={(e) => setBrandSecondary(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={brandSecondary}
                  onChange={(e) => setBrandSecondary(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
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

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invite New {t('learner', 'Member')}</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={inviteFirst}
                    onChange={(e) => setInviteFirst(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={inviteLast}
                    onChange={(e) => setInviteLast(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                >
                  <option value="LEARNER">{t('learner', 'Learner')}</option>
                  <option value="INSTRUCTOR">{t('instructor', 'Instructor / Trainer')}</option>
                  <option value="DEPT_MANAGER">Department Manager</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">{t('department', 'Department')}</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                >
                  <option value="">None / General</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
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

      {/* Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New {t('department', 'Department')}</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Applied AI & Data Science"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Department Code</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. AI-DEPT"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
