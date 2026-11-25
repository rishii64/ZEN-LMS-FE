import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { Organization, SubscriptionPlan } from '../types/index.js';
import { 
  Building2, 
  Plus, 
  Users, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  CreditCard, 
  Activity, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'audit'>('tenants');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { switchOrganization } = useAuth();

  // New Organization Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState('CORPORATE');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  const fetchGlobalData = async () => {
    try {
      const [orgsData, plansData] = await Promise.all([
        ApiClient.get('/organizations'),
        ApiClient.get('/subscriptions/plans')
      ]);
      setOrganizations(orgsData);
      setPlans(plansData);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/organizations', {
        name,
        slug,
        sector,
        primaryColor
      });
      setShowModal(false);
      setName('');
      setSlug('');
      fetchGlobalData();
    } catch (err: any) {
      alert(err.message || 'Failed to create organization');
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    const nextStatus = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await ApiClient.put(`/organizations/${org.id}`, { status: nextStatus });
      fetchGlobalData();
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-mono text-[10px] font-bold">
              PLATFORM SUPER ADMIN FLEET
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Global SaaS Operations & Multi-Tenant Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor tenant quotas, manage subscription commercial tiers, and enforce multi-tenant isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Tenants</span>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{organizations.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Active across sectors</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Platform Workforce</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {organizations.reduce((acc, o) => acc + (o._count?.memberships || 0), 0)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Total provisioned users</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Hosted Courses</span>
            <BookOpen className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {organizations.reduce((acc, o) => acc + (o._count?.courses || 0), 0)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Curriculum modules</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Est. Monthly MRR</span>
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">$1,098</div>
          <span className="text-xs text-slate-400 mt-1 block">Recurring subscription run-rate</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start w-fit">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'tenants' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Tenant Fleet
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'plans' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          SaaS Plans & Pricing
        </button>
      </div>

      {/* TAB 1: TENANTS FLEET */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map(org => (
            <div 
              key={org.id} 
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-base"
                        style={{ backgroundColor: org.primaryColor }}
                      >
                        {org.name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{org.name}</h4>
                      <span className="text-xs font-mono text-slate-400">/{org.slug}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(org)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                      org.status === 'ACTIVE' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {org.status}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{org._count?.courses || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Courses</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{org._count?.memberships || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Users</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{org._count?.departments || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Depts</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Sector:</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                    {org.sector}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: org.primaryColor }} />
                  <span>Theme Color</span>
                </div>

                <button
                  onClick={() => switchOrganization(org.slug)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Enter Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {p.name}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{p.displayName}</h4>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white my-3">
                  ${p.monthlyPrice} <span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{p.description}</p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <li>• Maximum {p.maxUsers} workforce seats</li>
                  <li>• Up to {p.maxCourses} courses</li>
                  <li>• {p.maxStorageGb} GB private storage</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                Annual Price: ${p.annualPrice} / year
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Provision New Tenant</h3>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Metro Government Academy"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Tenant Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. metro-gov"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Sector Archetype</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="CORPORATE">Corporate & Enterprise L&D</option>
                  <option value="EDUCATION">Higher Education / Academy</option>
                  <option value="GOVERNMENT">Government & Public Sector</option>
                  <option value="NON_PROFIT">Non-Profit & Humanitarian</option>
                  <option value="TRAINING_INSTITUTE">Commercial Training Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Brand Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
