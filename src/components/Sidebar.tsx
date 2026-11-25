import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTenant } from '../context/TenantContext.js';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Users, 
  Building2, 
  Video, 
  ShieldCheck, 
  Settings, 
  FileCheck, 
  CreditCard, 
  GitFork,
  Radio,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, activeRole } = useAuth();
  const { t, primaryColor } = useTenant();

  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isOrgAdmin = activeRole === 'ORG_ADMIN';
  const isInstructor = activeRole === 'INSTRUCTOR';
  const isLearner = activeRole === 'LEARNER';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-6 px-4 transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="space-y-6">
          {/* Section: Main Portals */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
              Learning Core
            </span>

            {isSuperAdmin && (
              <NavLink to="/super-admin" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Super Admin Fleet</span>
              </NavLink>
            )}

            {isOrgAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Organization Console</span>
              </NavLink>
            )}

            {(isInstructor || isOrgAdmin) && (
              <NavLink to="/instructor" className={linkClass}>
                <BookOpen className="w-4 h-4" />
                <span>{t('courses', 'Courses')} Studio</span>
              </NavLink>
            )}

            <NavLink to="/learner" className={linkClass}>
              <BookOpen className="w-4 h-4" />
              <span>{t('learner', 'Learner')} Workspace</span>
            </NavLink>

            <NavLink to="/certificates" className={linkClass}>
              <Award className="w-4 h-4" />
              <span>My {t('credential', 'Certificates')}</span>
            </NavLink>
          </div>

          {/* Section: Live & Compliance */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
              Delivery & Compliance
            </span>

            <NavLink to="/compliance" className={linkClass}>
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Auditor & Compliance</span>
            </NavLink>

            <NavLink to="/verify" className={linkClass}>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Universal Verifier</span>
            </NavLink>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          ZenLMS v2.0 Enterprise SaaS
        </div>
      </aside>
    </>
  );
};
