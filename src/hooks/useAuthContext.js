import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAppStore } from '../stores/useAppStore.js';

const DEFAULT_TERMS = {
  learner: 'Learner',
  learners: 'Learners',
  instructor: 'Instructor',
  instructors: 'Instructors',
  department: 'Department',
  departments: 'Departments',
  course: 'Course',
  courses: 'Courses',
  branch: 'Branch',
  branches: 'Branches'
};

export function useAuthContext() {
  const accessToken = useAppStore((s) => s.accessToken);
  const activeOrganizationId = useAppStore((s) => s.activeOrganizationId);
  const setActiveOrganizationId = useAppStore((s) => s.setActiveOrganizationId);

  const meQuery = useQuery({
    queryKey: ['auth', 'me', accessToken, activeOrganizationId],
    queryFn: () => api.get('/auth/me'),
    enabled: Boolean(accessToken),
    retry: false
  });

  const activeOrg = meQuery.data?.activeContext?.organization;
  const activeMembership = meQuery.data?.activeContext?.membership;
  const entitlements = meQuery.data?.activeContext?.entitlements || {};
  const permissions = meQuery.data?.activeContext?.permissions || {};
  const roles = meQuery.data?.activeContext?.roles || [];

  // Apply tenant branding CSS variables & store active org ID
  useEffect(() => {
    if (activeOrg) {
      if (!activeOrganizationId && activeOrg.id) {
        setActiveOrganizationId(activeOrg.id);
      }
      document.documentElement.style.setProperty('--brand-primary', activeOrg.primary_color || '#2563eb');
      document.documentElement.style.setProperty('--brand-secondary', activeOrg.secondary_color || '#0f172a');
    } else {
      document.documentElement.style.setProperty('--brand-primary', '#2563eb');
      document.documentElement.style.setProperty('--brand-secondary', '#0f172a');
    }
  }, [activeOrg, activeOrganizationId, setActiveOrganizationId]);

  const terminology = { ...DEFAULT_TERMS, ...(activeOrg?.terminology || {}) };

  const hasPermission = (module, action = 'view') => {
    if (activeMembership?.is_org_admin) return true;
    return Boolean(permissions[`${module}:${action}`] || permissions[`${module}:manage`]);
  };

  const hasEntitlement = (moduleKey) => {
    if (entitlements[moduleKey] === undefined) return true;
    return Boolean(entitlements[moduleKey]);
  };

  return {
    ...meQuery,
    user: meQuery.data?.user || null,
    memberships: meQuery.data?.memberships || [],
    activeContext: meQuery.data?.activeContext || null,
    activeOrg,
    activeMembership,
    entitlements,
    permissions,
    roles,
    announcements: meQuery.data?.announcements || [],
    terminology,
    hasPermission,
    hasEntitlement
  };
}
