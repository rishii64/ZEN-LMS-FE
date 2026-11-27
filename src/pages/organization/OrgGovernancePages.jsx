import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Users, Building, CreditCard, Upload } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Modal, StatusBadge, LoadingSkeleton, PasswordInput } from '../../components/ui/Primitives.jsx';

export function OrganizationSettingsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { terminology } = useAuthContext();
  const q = useQuery({ queryKey: ['org', 'current'], queryFn: () => api.get('/organizations/current') });

  const [form, setForm] = useState(null);
  const [cfForm, setCfForm] = useState({ entityType: 'membership', fieldKey: '', label: '', fieldType: 'text' });

  useEffect(() => {
    if (q.data?.organization && !form) {
      const o = q.data.organization;
      setForm({
        name: o.name || '',
        industry: o.industry || '',
        primaryColor: o.primary_color || '#2563eb',
        secondaryColor: o.secondary_color || '#0f172a',
        logoUrl: o.logo_url || '',
        timezone: o.timezone || 'UTC',
        defaultLanguage: o.default_language || 'en',
        terminology: {
          learner: o.terminology?.learner || 'Learner',
          learners: o.terminology?.learners || 'Learners',
          instructor: o.terminology?.instructor || 'Instructor',
          department: o.terminology?.department || 'Department',
          course: o.terminology?.course || 'Course'
        }
      });
    }
  }, [q.data, form]);

  const saveMut = useMutation({
    mutationFn: (payload) => api.patch('/organizations/current', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'current'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      addToast({ title: 'Settings saved', message: 'Branding and terminology updated.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Update failed', message: err.message, type: 'error' })
  });

  const cfMut = useMutation({
    mutationFn: (payload) => api.post('/organizations/custom-fields', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'current'] });
      setCfForm({ entityType: 'membership', fieldKey: '', label: '', fieldType: 'text' });
      addToast({ title: 'Custom field added', message: 'Field available on records.', type: 'success' });
    }
  });

  if (q.isLoading || !form) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Branding & Configuration</h1>
        <p className="text-sm text-slate-500">Customize theme colors, terminology ({terminology.learners}, {terminology.departments}), locale, and custom fields.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate({
            ...form,
            terminology: {
              ...form.terminology,
              instructors: `${form.terminology.instructor}s`,
              departments: `${form.terminology.department}s`,
              courses: `${form.terminology.course}s`
            }
          });
        }}
        className="card p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Organization Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Industry</label>
            <input className="input-field" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Primary Brand Color</label>
            <div className="flex gap-2">
              <input type="color" className="h-9 w-12 rounded border border-slate-300" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
              <input className="input-field" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Secondary Brand Color</label>
            <div className="flex gap-2">
              <input type="color" className="h-9 w-12 rounded border border-slate-300" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
              <input className="input-field" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Timezone</label>
            <input className="input-field" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Default Language</label>
            <input className="input-field" value={form.defaultLanguage} onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })} />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <h3 className="text-sm font-semibold mb-3">Configurable Sector Terminology</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(form.terminology).map(([k, v]) => (
              <div key={k}>
                <label className="block text-xs text-slate-500 capitalize mb-1">{k}</label>
                <input
                  className="input-field"
                  value={v}
                  onChange={(e) => setForm({ ...form, terminology: { ...form.terminology, [k]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saveMut.isPending}>
            {saveMut.isPending ? 'Saving...' : 'Save Organization Settings'}
          </button>
        </div>
      </form>

      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Custom Fields</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cfMut.mutate(cfForm);
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <select className="input-field" value={cfForm.entityType} onChange={(e) => setCfForm({ ...cfForm, entityType: e.target.value })}>
            <option value="membership">Member / Learner</option>
            <option value="course">Course</option>
            <option value="department">Department</option>
          </select>
          <input className="input-field" required placeholder="field_key" value={cfForm.fieldKey} onChange={(e) => setCfForm({ ...cfForm, fieldKey: e.target.value })} />
          <input className="input-field" required placeholder="Display Label" value={cfForm.label} onChange={(e) => setCfForm({ ...cfForm, label: e.target.value })} />
          <button className="btn-primary">Add Field</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {(q.data?.customFields || []).map((cf) => (
            <span key={cf.id} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              <strong>{cf.label}</strong> ({cf.entity_type} · {cf.field_key})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrgStructurePage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { terminology } = useAuthContext();
  const q = useQuery({ queryKey: ['org', 'hierarchy'], queryFn: () => api.get('/departments/hierarchy') });
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState('branch');
  const [groupName, setGroupName] = useState('');

  const deptMut = useMutation({
    mutationFn: (p) => api.post('/departments', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'hierarchy'] });
      setDeptName('');
      setDeptCode('');
      addToast({ title: `${terminology.department} created`, message: 'Hierarchy updated.', type: 'success' });
    }
  });

  const unitMut = useMutation({
    mutationFn: (p) => api.post('/departments/units', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'hierarchy'] });
      setUnitName('');
      addToast({ title: 'Organizational Unit created', message: 'Structure updated.', type: 'success' });
    }
  });

  const groupMut = useMutation({
    mutationFn: (p) => api.post('/departments/groups', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'hierarchy'] });
      setGroupName('');
      addToast({ title: 'Group created', message: 'Learning group added.', type: 'success' });
    }
  });

  if (q.isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizational Hierarchy & Groups</h1>
        <p className="text-sm text-slate-500">Manage parent units, campuses/branches, {terminology.departments.toLowerCase()}, and learning groups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form onSubmit={(e) => { e.preventDefault(); deptMut.mutate({ name: deptName, code: deptCode }); }} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Building className="w-4 h-4 text-blue-600" /> Add {terminology.department}</h3>
          <input className="input-field" required placeholder={`${terminology.department} name`} value={deptName} onChange={(e) => setDeptName(e.target.value)} />
          <input className="input-field" placeholder="Code (e.g. ENG)" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
          <button className="btn-primary w-full">Create {terminology.department}</button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); unitMut.mutate({ name: unitName, unitType }); }} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Add Subsidiary / Campus / Branch</h3>
          <select className="input-field" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
            <option value="subsidiary">Subsidiary</option>
            <option value="campus">Campus</option>
            <option value="branch">Branch</option>
            <option value="division">Division</option>
          </select>
          <input className="input-field" required placeholder="Unit name" value={unitName} onChange={(e) => setUnitName(e.target.value)} />
          <button className="btn-primary w-full">Create Unit</button>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); groupMut.mutate({ name: groupName, groupType: 'learning_group' }); }} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Add Cohort / Learning Group</h3>
          <input className="input-field" required placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <button className="btn-primary w-full">Create Group</button>
        </form>
      </div>

      <DataTable
        data={q.data?.departments || []}
        searchPlaceholder={`Search ${terminology.departments.toLowerCase()}...`}
        columns={[
          { key: 'name', label: terminology.department },
          { key: 'code', label: 'Code' },
          { key: 'member_count', label: terminology.learners },
          { key: 'is_active', label: 'Status', render: (r) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> }
        ]}
      />
    </div>
  );
}

export function UsersDirectoryPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const { terminology } = useAuthContext();
  const [openCreate, setOpenCreate] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [csvText, setCsvText] = useState('email,fullName,jobTitle\nnew.user@acme-corp.local,Jordan Lee,Analyst');
  const [form, setForm] = useState({ email: '', fullName: '', password: '', jobTitle: '', departmentId: '', isOrgAdmin: false });

  const usersQuery = useQuery({ queryKey: ['org', 'users'], queryFn: () => api.get('/users') });
  const deptsQuery = useQuery({ queryKey: ['org', 'depts'], queryFn: () => api.get('/departments') });

  const createMut = useMutation({
    mutationFn: (p) => api.post('/users/create', { ...p, departmentId: p.departmentId || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'users'] });
      setOpenCreate(false);
      setForm({ email: '', fullName: '', password: '', jobTitle: '', departmentId: '', isOrgAdmin: false });
      addToast({ title: 'User created', message: 'Added to organization directory.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Failed', message: err.message, type: 'error' })
  });

  const bulkMut = useMutation({
    mutationFn: (rows) => api.post('/users/bulk-import', { rows }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'users'] });
      setOpenBulk(false);
      addToast({ title: 'Bulk import queued', message: 'Background worker is processing users.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Bulk import failed', message: err.message, type: 'error' })
  });

  if (usersQuery.isLoading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{terminology.learners} & Workforce Directory</h1>
          <p className="text-sm text-slate-500">Create, invite, bulk import, and manage organizational members.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setOpenBulk(true)}><Upload className="w-4 h-4" /> Bulk CSV Import</button>
          <button className="btn-primary" onClick={() => setOpenCreate(true)}><Plus className="w-4 h-4" /> Add {terminology.learner}</button>
        </div>
      </div>

      <DataTable
        data={usersQuery.data?.data || []}
        searchPlaceholder="Search by name, email, or code..."
        columns={[
          { key: 'full_name', label: 'Name', render: (r) => <div><p className="font-semibold">{r.full_name}</p><p className="text-xs text-slate-500">{r.email}</p></div> },
          { key: 'department_name', label: terminology.department },
          { key: 'job_title', label: 'Title' },
          {
            key: 'roles',
            label: 'Assigned Roles',
            sortable: false,
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.is_org_admin && <span className="px-2 py-0.5 text-[11px] rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">Tenant Admin</span>}
                {(r.roles || []).map((role) => (
                  <span key={role.assignmentId} className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800">{role.roleName}</span>
                ))}
              </div>
            )
          },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }
        ]}
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={`Add ${terminology.learner}`}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
          <input className="input-field" required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input type="email" className="input-field" required placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <PasswordInput required minLength={8} placeholder="Initial Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input-field" placeholder="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          <select className="input-field" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            <option value="">No {terminology.department}</option>
            {(deptsQuery.data?.data || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isOrgAdmin} onChange={(e) => setForm({ ...form, isOrgAdmin: e.target.checked })} />
            Grant Tenant Administrator privileges
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpenCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      <Modal open={openBulk} onClose={() => setOpenBulk(false)} title="Bulk User CSV Import">
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Paste CSV rows with header: <code>email,fullName,jobTitle</code></p>
          <textarea className="input-field font-mono text-xs" rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setOpenBulk(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => {
                const lines = csvText.trim().split('\n').slice(1);
                const rows = lines.map((line) => {
                  const [email, fullName, jobTitle] = line.split(',').map((s) => s.trim());
                  return { email, fullName, jobTitle };
                }).filter((r) => r.email && r.fullName);
                bulkMut.mutate(rows);
              }}
            >
              Queue Background Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function RolesPermissionsPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [openRole, setOpenRole] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState({});
  const [assignForm, setAssignForm] = useState({ membershipId: '', roleId: '', scopeEntityType: '', scopeEntityId: '' });

  const rolesQuery = useQuery({ queryKey: ['org', 'roles'], queryFn: () => api.get('/roles') });
  const permsQuery = useQuery({ queryKey: ['permissions'], queryFn: () => api.get('/permissions') });
  const usersQuery = useQuery({ queryKey: ['org', 'users'], queryFn: () => api.get('/users') });

  const createRoleMut = useMutation({
    mutationFn: (payload) => api.post('/roles', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'roles'] });
      setOpenRole(false);
      setRoleName('');
      setRoleDesc('');
      setSelectedPerms({});
      addToast({ title: 'Custom role created', message: 'Dynamic RBAC role ready to assign.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  const assignMut = useMutation({
    mutationFn: (p) => api.post('/roles/assign', {
      membershipId: p.membershipId,
      roleId: p.roleId,
      scopeEntityType: p.scopeEntityType || null,
      scopeEntityId: p.scopeEntityId || null
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', 'users'] });
      qc.invalidateQueries({ queryKey: ['org', 'roles'] });
      addToast({ title: 'Role assigned', message: 'User permissions updated.', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Assign failed', message: err.message, type: 'error' })
  });

  if (rolesQuery.isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dynamic Roles & Scoped Permissions</h1>
          <p className="text-sm text-slate-500">Create unlimited custom roles with module-level actions and organizational scopes.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpenRole(true)}><Plus className="w-4 h-4" /> Create Custom Role</button>
      </div>

      {/* Assign Role Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); assignMut.mutate(assignForm); }}
        className="card p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold mb-1">Member</label>
          <select className="input-field" required value={assignForm.membershipId} onChange={(e) => setAssignForm({ ...assignForm, membershipId: e.target.value })}>
            <option value="">Select user...</option>
            {(usersQuery.data?.data || []).map((u) => <option key={u.membership_id} value={u.membership_id}>{u.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Role</label>
          <select className="input-field" required value={assignForm.roleId} onChange={(e) => setAssignForm({ ...assignForm, roleId: e.target.value })}>
            <option value="">Select role...</option>
            {(rolesQuery.data?.data || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Optional Scope Entity</label>
          <select className="input-field" value={assignForm.scopeEntityType} onChange={(e) => setAssignForm({ ...assignForm, scopeEntityType: e.target.value })}>
            <option value="">Organization-wide / Inherited</option>
            <option value="department">Department-scoped</option>
            <option value="branch">Branch-scoped</option>
            <option value="course">Course-scoped</option>
            <option value="group">Group-scoped</option>
          </select>
        </div>
        <button className="btn-primary">Assign Role</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(rolesQuery.data?.data || []).map((r) => (
          <div key={r.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> {r.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{r.description || r.slug}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{r.assigned_users_count} assigned</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(r.permissions || []).slice(0, 12).map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                  {p.module}:{p.action} ({p.scope})
                </span>
              ))}
              {(r.permissions || []).length > 12 && (
                <span className="text-xs text-slate-400">+{r.permissions.length - 12} more</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={openRole} onClose={() => setOpenRole(false)} title="Create Custom Role" maxWidth="max-w-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const permissions = Object.entries(selectedPerms)
              .filter(([, val]) => val.enabled)
              .map(([permissionId, val]) => ({ permissionId, scope: val.scope || 'organization', allow: true }));
            createRoleMut.mutate({ name: roleName, description: roleDesc, permissions });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input-field" required placeholder="Role Name (e.g. Compliance Auditor)" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            <input className="input-field" placeholder="Description" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} />
          </div>
          <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
            {(permsQuery.data?.data || []).map((p) => {
              const cur = selectedPerms[p.id] || { enabled: false, scope: 'organization' };
              return (
                <div key={p.id} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cur.enabled}
                      onChange={(e) => setSelectedPerms({ ...selectedPerms, [p.id]: { ...cur, enabled: e.target.checked } })}
                    />
                    <span className="font-medium">{p.module}:{p.action}</span>
                  </label>
                  <select
                    className="input-field py-1 text-xs w-36"
                    value={cur.scope}
                    onChange={(e) => setSelectedPerms({ ...selectedPerms, [p.id]: { ...cur, enabled: true, scope: e.target.value } })}
                  >
                    <option value="organization">Organization</option>
                    <option value="department">Department</option>
                    <option value="branch">Branch</option>
                    <option value="course">Course</option>
                    <option value="group">Group</option>
                    <option value="self">Self-only</option>
                  </select>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpenRole(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Role</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SubscriptionBillingPage() {
  const qc = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const subQuery = useQuery({ queryKey: ['billing', 'sub'], queryFn: () => api.get('/subscriptions/current') });
  const plansQuery = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => api.get('/subscriptions/plans') });
  const invQuery = useQuery({ queryKey: ['billing', 'invoices'], queryFn: () => api.get('/billing/invoices') });

  const changePlanMut = useMutation({
    mutationFn: (p) => api.post('/subscriptions/change-plan', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      addToast({ title: 'Plan updated', message: 'Subscription entitlements updated (user RBAC unchanged).', type: 'success' });
    },
    onError: (err) => addToast({ title: 'Error', message: err.message, type: 'error' })
  });

  if (subQuery.isLoading) return <LoadingSkeleton rows={5} />;
  const s = subQuery.data?.subscription;
  const u = subQuery.data?.usage || {};
  const lim = subQuery.data?.entitlements?.limits || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription, Quotas & Billing</h1>
        <p className="text-sm text-slate-500">Manage SaaS subscription plan, usage limits, renewals, and invoices.</p>
      </div>

      <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Active Plan</p>
          <p className="text-2xl font-bold mt-1">{s?.plan_name}</p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={s?.status} />
            <span className="text-xs text-slate-500 capitalize">{s?.billing_cycle} billing</span>
          </div>
          {subQuery.data?.renewalAlert && (
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Renewal due in {subQuery.data.renewalAlert.daysRemaining} days
            </p>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">Usage vs Plan Limits</p>
          <p>Users: <strong>{u.usersCount}</strong> / {lim.maxUsers}</p>
          <p>Courses: <strong>{u.coursesCount}</strong> / {lim.maxCourses}</p>
          <p>Storage: <strong>{(u.storageBytes / (1024 * 1024)).toFixed(2)} MB</strong> / {(lim.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(0)} GB</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Change Subscription Plan</p>
          <div className="space-y-2">
            {(plansQuery.data?.data || []).map((p) => (
              <button
                key={p.id}
                disabled={p.id === s?.plan_id || changePlanMut.isPending}
                onClick={() => changePlanMut.mutate({ planId: p.id, billingCycle: s?.billing_cycle || 'monthly' })}
                className="btn-secondary w-full justify-between text-xs py-1.5"
              >
                <span>{p.name}</span>
                <span>{p.id === s?.plan_id ? 'Current' : `$${(p.monthly_price_cents / 100).toFixed(0)}/mo`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        data={invQuery.data?.invoices || []}
        searchPlaceholder="Search invoices..."
        columns={[
          { key: 'invoice_number', label: 'Invoice #' },
          { key: 'total_cents', label: 'Amount', render: (r) => `$${(r.total_cents / 100).toFixed(2)} ${r.currency}` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'due_date', label: 'Due Date', render: (r) => new Date(r.due_date).toLocaleDateString() }
        ]}
      />
    </div>
  );
}
