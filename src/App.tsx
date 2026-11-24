import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Login } from './pages/Login.js';
import { PublicVerify } from './pages/PublicVerify.js';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.js';
import { OrgAdminDashboard } from './pages/OrgAdminDashboard.js';
import { InstructorStudio } from './pages/InstructorStudio.js';
import { LearnerDashboard } from './pages/LearnerDashboard.js';
import { CoursePlayer } from './pages/CoursePlayer.js';
import { CertificatesPage } from './pages/CertificatesPage.js';

export const App: React.FC = () => {
  const { user, activeRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
        Initializing ZenLMS Multi-Tenant Engine...
      </div>
    );
  }

  // Standalone public routes (No navbar needed)
  if (location.pathname.startsWith('/verify')) {
    return (
      <Routes>
        <Route path="/verify" element={<PublicVerify />} />
        <Route path="/verify/:code" element={<PublicVerify />} />
      </Routes>
    );
  }

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {user && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/admin" element={<OrgAdminDashboard />} />
          <Route path="/instructor" element={<InstructorStudio />} />
          <Route path="/learner" element={<LearnerDashboard />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};
