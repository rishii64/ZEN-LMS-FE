import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './stores/useAppStore.js';
import { ToastContainer } from './components/ui/Primitives.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { AcceptInvitePage, ForgotPasswordPage, LoginPage, PublicVerifyCertificatePage } from './pages/auth/AuthPages.jsx';
import { DashboardPage } from './pages/dashboards/DashboardPage.jsx';
import { PlatformPlansPage, PlatformSettingsPage, PlatformTenantsPage } from './pages/platform/PlatformPages.jsx';
import {
  OrganizationSettingsPage,
  OrgStructurePage,
  RolesPermissionsPage,
  SubscriptionBillingPage,
  UsersDirectoryPage
} from './pages/organization/OrgGovernancePages.jsx';
import { CourseDetailPage, CoursesCatalogPage, EnrollmentsSessionsPage, LearningPathsPage } from './pages/learning/LearningPages.jsx';
import { AssessmentsPage } from './pages/assessments/AssessmentsPage.jsx';
import { CertificatesPage } from './pages/credentials/CertificatesPage.jsx';
import { CompliancePage, EngagementPage, ProfileSecurityPage, ReportsPage } from './pages/compliance/ComplianceReportsPages.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      refetchOnWindowFocus: false
    }
  }
});

function ProtectedRoute({ children }) {
  const token = useAppStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify/:code" element={<PublicVerifyCertificatePage />} />

          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Super Admin */}
            <Route path="platform/tenants" element={<PlatformTenantsPage />} />
            <Route path="platform/plans" element={<PlatformPlansPage />} />
            <Route path="platform/settings" element={<PlatformSettingsPage />} />

            {/* Tenant Governance */}
            <Route path="org-settings" element={<OrganizationSettingsPage />} />
            <Route path="org-structure" element={<OrgStructurePage />} />
            <Route path="users" element={<UsersDirectoryPage />} />
            <Route path="roles" element={<RolesPermissionsPage />} />
            <Route path="billing" element={<SubscriptionBillingPage />} />

            {/* LMS Core */}
            <Route path="courses" element={<CoursesCatalogPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="learning-paths" element={<LearningPathsPage />} />
            <Route path="enrollments" element={<EnrollmentsSessionsPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="engagement" element={<EngagementPage />} />
            <Route path="profile" element={<ProfileSecurityPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
