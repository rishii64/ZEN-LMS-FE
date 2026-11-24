import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { Organization } from '../types/index.js';
import { Building2, Plus, Users, BookOpen, Layers, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { switchOrganization } = useAuth();

  // New Organization Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState('CORPORATE');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  const fetchOrganizations = async () => {
    try {
      const data = await ApiClient.get('/organizations');
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
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
      fetchOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to create organization');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Platform Super Admin Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
              PLATFORM SUPER ADMIN CONSOLE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Tenant Fleet & Multi-Sector Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage provisioned organizations, monitor multi-tenant isolation, and configure global system policies.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      {/* Fleet Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{organizations.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Organizations</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {organizations.reduce((acc, o) => acc + (o._count?.courses || 0), 0)}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hosted Courses</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {organizations.reduce((acc, o) => acc + (o._count?.memberships || 0), 0)}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Provisioned Memberships</div>
          </div>
        </div>
      </div>

      {/* Organization Tenants Grid */}
      <h3 className="text-lg font-bold text-slate-900 mb-4">Provisioned Tenant Environments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div 
            key={org.id} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
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
                    <h4 className="font-bold text-slate-900 text-base">{org.name}</h4>
                    <span className="text-xs font-mono text-slate-400">/{org.slug}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  org.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {org.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-sm font-bold text-slate-800">{org._count?.courses || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Courses</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-sm font-bold text-slate-800">{org._count?.memberships || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Users</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-sm font-bold text-slate-800">{org._count?.departments || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Depts</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Sector:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {org.sector}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: org.primaryColor }} />
                <span>Primary Theme</span>
              </div>

              <button
                onClick={() => switchOrganization(org.slug)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Enter Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Provision Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Provision New Tenant</h3>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Metro Government Academy"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Tenant Slug (Unique URL identifier)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. metro-gov"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Sector Archetype</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="CORPORATE">Corporate & Enterprise L&D</option>
                  <option value="EDUCATION">Higher Education / Academy</option>
                  <option value="GOVERNMENT">Government & Public Sector</option>
                  <option value="NON_PROFIT">Non-Profit & Humanitarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Primary Brand Color</label>
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
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
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
