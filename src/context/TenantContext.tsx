import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext.js';

interface TenantContextType {
  primaryColor: string;
  secondaryColor: string;
  sector: string;
  organizationName: string;
  logoUrl?: string;
  t: (key: string, defaultVal?: string) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOrganization } = useAuth();

  const primaryColor = activeOrganization?.primaryColor || '#2563eb';
  const secondaryColor = activeOrganization?.secondaryColor || '#1e40af';
  const sector = activeOrganization?.sector || 'CORPORATE';
  const organizationName = activeOrganization?.name || 'ZenLMS Platform';
  const logoUrl = activeOrganization?.logoUrl;

  // Dynamic CSS variables injection
  useEffect(() => {
    document.documentElement.style.setProperty('--tenant-primary', primaryColor);
    document.documentElement.style.setProperty('--tenant-secondary', secondaryColor);
  }, [primaryColor, secondaryColor]);

  // Parse terminology dictionary
  const terminologyMap = useMemo(() => {
    if (!activeOrganization?.settings?.terminology) return {};
    try {
      return typeof activeOrganization.settings.terminology === 'string'
        ? JSON.parse(activeOrganization.settings.terminology)
        : activeOrganization.settings.terminology;
    } catch {
      return {};
    }
  }, [activeOrganization?.settings?.terminology]);

  // Sector Terminology helper
  const t = (key: string, defaultVal?: string): string => {
    if (terminologyMap[key]) return terminologyMap[key];
    if (defaultVal) return defaultVal;

    // Standard sensible fallbacks
    const defaults: Record<string, string> = {
      learner: sector === 'EDUCATION' ? 'Student' : sector === 'GOVERNMENT' ? 'Officer' : sector === 'NON_PROFIT' ? 'Volunteer' : 'Employee',
      learners: sector === 'EDUCATION' ? 'Students' : sector === 'GOVERNMENT' ? 'Officers' : sector === 'NON_PROFIT' ? 'Volunteers' : 'Employees',
      instructor: sector === 'EDUCATION' ? 'Professor' : sector === 'GOVERNMENT' ? 'Instructor' : sector === 'NON_PROFIT' ? 'Mentor' : 'Trainer',
      instructors: sector === 'EDUCATION' ? 'Faculty' : sector === 'GOVERNMENT' ? 'Instructors' : sector === 'NON_PROFIT' ? 'Mentors' : 'Trainers',
      course: sector === 'EDUCATION' ? 'Course' : sector === 'NON_PROFIT' ? 'Workshop' : 'Training Program',
      courses: sector === 'EDUCATION' ? 'Courses' : sector === 'NON_PROFIT' ? 'Workshops' : 'Training Programs',
      department: sector === 'EDUCATION' ? 'Faculty / Department' : sector === 'GOVERNMENT' ? 'Agency / Unit' : 'Division / Team',
      departments: sector === 'EDUCATION' ? 'Faculties' : sector === 'GOVERNMENT' ? 'Agencies' : 'Divisions',
      credential: sector === 'EDUCATION' ? 'Academic Certificate' : 'Certificate of Completion'
    };

    return defaults[key] || key;
  };

  return (
    <TenantContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        sector,
        organizationName,
        logoUrl,
        t
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
