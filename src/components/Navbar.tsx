import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { 
  Building2, 
  GraduationCap, 
  LogOut, 
  User as UserIcon, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, memberships, activeOrganization, activeRole, logout, switchOrganization } = useAuth();
  const { organizationName, logoUrl, primaryColor, sector, t } = useTenant();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  const getSectorBadge = (sec: string) => {
    switch (sec) {
      case 'EDUCATION':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">Higher Ed</span>;
      case 'CORPORATE':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">Corporate L&D</span>;
      case 'GOVERNMENT':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">Government</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">Non-Profit</span>;
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Platform Super Admin',
      ORG_ADMIN: `${organizationName} Admin`,
      INSTRUCTOR: t('instructor', 'Instructor'),
      DEPT_MANAGER: 'Department Manager',
      LEARNER: t('learner', 'Learner')
    };
    return (
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-semibold">
        {labels[role] || role}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Tenant Brand & Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={organizationName} 
                  className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition" 
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {organizationName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    {organizationName}
                  </span>
                  {getSectorBadge(sector)}
                </div>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  Powered by ZenLMS Generalized Engine
                </span>
              </div>
            </Link>

            {/* Navigation Links based on Role */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {activeRole === 'SUPER_ADMIN' && (
                <>
                  <Link
                    to="/super-admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Organizations
                  </Link>
                  <Link
                    to="/verify"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Credential Verifier
                  </Link>
                </>
              )}

              {activeRole === 'ORG_ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Console & Analytics
                  </Link>
                  <Link
                    to="/instructor"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    {t('courses', 'Courses')} Studio
                  </Link>
                  <Link
                    to="/learner"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    {t('learner', 'Learner')} View
                  </Link>
                </>
              )}

              {activeRole === 'INSTRUCTOR' && (
                <>
                  <Link
                    to="/instructor"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    {t('courses', 'Courses')} Studio
                  </Link>
                  <Link
                    to="/learner"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Preview Catalog
                  </Link>
                </>
              )}

              {activeRole === 'LEARNER' && (
                <>
                  <Link
                    to="/learner"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/certificates"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    My {t('credential', 'Certificates')}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Section: Tenant Switcher & User Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Tenant Switcher */}
            {(memberships.length > 1 || user?.isSuperAdmin) && (
              <div className="relative">
                <button
                  onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Switch Tenant</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {tenantDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Organization Tenant
                    </div>
                    {user?.isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => { switchOrganization('apex-university'); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">Apex Institute (Higher Ed)</span>
                          {activeOrganization?.slug === 'apex-university' && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                        <button
                          onClick={() => { switchOrganization('nexus-corp'); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">Nexus Global (Corporate L&D)</span>
                          {activeOrganization?.slug === 'nexus-corp' && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      </>
                    ) : (
                      memberships.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { switchOrganization(m.organization.slug); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">{m.organization.name}</span>
                          {activeOrganization?.slug === m.organization.slug && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Public Verifier Link */}
            <Link
              to="/verify"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Credential</span>
            </Link>

            {/* Role indicator */}
            <div className="hidden sm:block">
              {getRoleBadge(activeRole)}
            </div>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-slate-300 transition"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                      {user.firstName[0]}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-sm text-slate-900">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/verify"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verify Credential
                      </Link>

                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition"
                style={{ backgroundColor: primaryColor }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
