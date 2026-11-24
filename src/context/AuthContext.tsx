import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserMembership, Organization } from '../types/index.js';
import { ApiClient } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  memberships: UserMembership[];
  activeOrganization: Organization | null;
  activeRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string, tenantSlug?: string) => Promise<void>;
  logout: () => void;
  switchOrganization: (orgSlug: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('zen_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await ApiClient.get('/auth/me');
      setUser(data.user);
      setMemberships(data.memberships);

      const savedSlug = localStorage.getItem('zen_active_tenant_slug');
      let currentOrg: Organization | null = null;
      let currentRole: string | null = null;

      if (data.user.isSuperAdmin) {
        currentRole = 'SUPER_ADMIN';
      }

      if (savedSlug && data.memberships.length > 0) {
        const found = data.memberships.find((m: any) => m.organization.slug === savedSlug);
        if (found) {
          currentOrg = found.organization;
          if (!data.user.isSuperAdmin) currentRole = found.role;
        }
      }

      if (!currentOrg && data.memberships.length > 0) {
        currentOrg = data.memberships[0].organization;
        if (!data.user.isSuperAdmin) currentRole = data.memberships[0].role;
        if (currentOrg) {
          localStorage.setItem('zen_active_tenant_slug', currentOrg.slug);
        }
      }

      setActiveOrganization(currentOrg);
      setActiveRole(currentRole);
    } catch (err) {
      console.error('Session expired or error refreshing user:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, tenantSlug?: string) => {
    const data = await ApiClient.post('/auth/login', { email, password, tenantSlug });
    localStorage.setItem('zen_token', data.token);

    setUser(data.user);
    setMemberships(data.memberships);

    if (data.activeOrganization) {
      setActiveOrganization(data.activeOrganization);
      localStorage.setItem('zen_active_tenant_slug', data.activeOrganization.slug);
    }

    if (data.user.isSuperAdmin) {
      setActiveRole('SUPER_ADMIN');
    } else if (data.activeOrganization?.role) {
      setActiveRole(data.activeOrganization.role);
    } else if (data.memberships.length > 0) {
      setActiveRole(data.memberships[0].role);
    }
  };

  const switchOrganization = async (orgSlug: string) => {
    localStorage.setItem('zen_active_tenant_slug', orgSlug);
    const membership = memberships.find(m => m.organization.slug === orgSlug);
    if (membership) {
      setActiveOrganization(membership.organization);
      if (!user?.isSuperAdmin) {
        setActiveRole(membership.role);
      }
    } else if (user?.isSuperAdmin) {
      // Super admin can switch context to any tenant
      try {
        const org = await ApiClient.get(`/organizations/${orgSlug}`);
        setActiveOrganization(org);
        setActiveRole('SUPER_ADMIN');
      } catch (e) {
        console.error('Could not switch to org:', e);
      }
    }
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('zen_token');
    localStorage.removeItem('zen_active_tenant_slug');
    setUser(null);
    setMemberships([]);
    setActiveOrganization(null);
    setActiveRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        activeOrganization,
        activeRole,
        isLoading,
        login,
        logout,
        switchOrganization,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
