import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Login } from './pages/Login.js';
import { PublicVerify } from './pages/PublicVerify.js';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.js';
import { OrgAdminDashboard } from './pages/OrgAdminDashboard.js';
import { InstructorStudio } from './pages/InstructorStudio.js';
import { LearnerDashboard } from './pages/LearnerDashboard.js';
import { CoursePlayer } from './pages/CoursePlayer.js';
import { CertificatesPage } from './pages/CertificatesPage.js';
import { ComplianceDashboard } from './pages/ComplianceDashboard.js';

export const App: React.FC = () => {
  const { user, activeRole, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        Initializing ZenLMS Multi-Tenant Engine...
      </div>
    );
  }

  // Standalone public routes
  if (location.pathname.startsWith('/verify')) {
    return (
      <Routes>
        <Route path="/verify" element={<PublicVerify />} />
        <Route path="/verify/:code" element={<PublicVerify />} />
      </Routes>
    );
  }

  // Fullscreen interactive classroom player
  if (location.pathname.startsWith('/learn/')) {
    if (!user) return <Navigate to="/login" replace />;
    return (
      <Routes>
        <Route path="/learn/:courseId" element={<CoursePlayer />} />
      </Routes>
    );
  }

  // Unauthenticated user
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (activeRole === 'SUPER_ADMIN') return '/super-admin';
    if (activeRole === 'ORG_ADMIN') return '/admin';
    if (activeRole === 'INSTRUCTOR') return '/instructor';
    return '/learner';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {user && <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}

      <div className="flex-1 flex overflow-hidden">
        {user && location.pathname !== '/login' && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/admin" element={<OrgAdminDashboard />} />
            <Route path="/instructor" element={<InstructorStudio />} />
            <Route path="/learner" element={<LearnerDashboard />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/compliance" element={<ComplianceDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
