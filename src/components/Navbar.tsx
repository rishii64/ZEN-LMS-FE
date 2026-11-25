import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { ApiClient } from '../services/api.js';
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
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  Sparkles,
  Menu
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, memberships, activeOrganization, activeRole, logout, switchOrganization } = useAuth();
  const { organizationName, logoUrl, primaryColor, sector, t } = useTenant();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      ApiClient.get('/communication/notifications')
        .then(res => setNotifications(res))
        .catch(() => {});
    }
  }, [user]);

  const getSectorBadge = (sec: string) => {
    switch (sec) {
      case 'EDUCATION':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">Higher Ed</span>;
      case 'CORPORATE':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">Corporate L&D</span>;
      case 'GOVERNMENT':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">Government</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">Non-Profit</span>;
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
      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-semibold shadow-sm">
        {labels[role] || role}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Tenant Brand & Toggle */}
          <div className="flex items-center gap-4">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={organizationName} 
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:scale-105 transition-transform" 
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {organizationName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                    {organizationName}
                  </span>
                  {getSectorBadge(sector)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  ZenLMS Multi-Tenant SaaS
                </span>
              </div>
            </Link>
          </div>

          {/* Right Section: Theme Toggle, Notifications, Tenant Switcher & User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.isRead) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] text-slate-400">ZenLMS Center</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tenant Switcher */}
            {(memberships.length > 1 || user?.isSuperAdmin) && (
              <div className="relative">
                <button
                  onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Switch Tenant</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {tenantDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Organization Tenant
                    </div>
                    {user?.isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => { switchOrganization('apex-university'); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Apex Institute (Higher Ed)</span>
                          {activeOrganization?.slug === 'apex-university' && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                        <button
                          onClick={() => { switchOrganization('nexus-corp'); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Nexus Global (Corporate L&D)</span>
                          {activeOrganization?.slug === 'nexus-corp' && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      </>
                    ) : (
                      memberships.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { switchOrganization(m.organization.slug); setTenantDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{m.organization.name}</span>
                          {activeOrganization?.slug === m.organization.slug && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Public Verifier Shortcut */}
            <Link
              to="/verify"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verify Credential</span>
            </Link>

            {/* Role indicator */}
            <div className="hidden sm:block">
              {getRoleBadge(activeRole)}
            </div>

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 transition"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.firstName[0]}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/verify"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Verify Credential
                      </Link>

                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
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
                className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition"
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
