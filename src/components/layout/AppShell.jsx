import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import {
  Award, BarChart3, Bell, BookOpen, Building2, CheckSquare, CreditCard,
  Globe, GraduationCap, LayoutDashboard, Layers, LogOut, Megaphone, Menu, Moon,
  Network, Search, Settings, Shield, ShieldCheck, Sun, UserCheck, Users,
  ClipboardCheck, MessageSquare, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { api } from '../../api/client.js';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, memberships, activeOrg, activeMembership, terminology, hasPermission, hasEntitlement, announcements } = useAuthContext();
  const { accessToken, theme, toggleTheme, sidebarCollapsed, toggleSidebar, clearAuth, setActiveOrganizationId, addToast } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);
  const [seenAnnIds, setSeenAnnIds] = useState(() => new Set());
  const notifRef = useRef(null);

  const seenStorageKey = user?.id ? `lms_seen_ann_${user.id}` : null;

  useEffect(() => {
    if (!seenStorageKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(seenStorageKey) || '[]');
      if (Array.isArray(saved)) setSeenAnnIds(new Set(saved));
    } catch { /* ignore */ }
  }, [seenStorageKey]);

  const notifQuery = useQuery({
    queryKey: ['notifications', activeOrg?.id],
    queryFn: () => api.get('/notifications'),
    enabled: Boolean(user && activeOrg?.id)
  });

  // Real-time Socket.IO connection for announcements and user notifications
  useEffect(() => {
    if (!accessToken || !user?.id) return;
    const socket = io('/', {
      path: '/socket.io',
      auth: {
        token: accessToken,
        organizationId: activeOrg?.id || null
      },
      transports: ['websocket', 'polling']
    });

    socket.on('platform:announcement', (ann) => {
      if (!ann?.id) return;
      setLiveAnnouncements((prev) => [ann, ...prev.filter((p) => p.id !== ann.id)]);
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.invalidateQueries({ queryKey: ['platform', 'announcements'] });
      addToast({
        title: `Announcement: ${ann.title}`,
        message: ann.body,
        type: ann.severity === 'warning' ? 'warning' : ann.severity === 'error' ? 'error' : 'info'
      });
    });

    socket.on('notification:new', (notif) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      if (notif?.title) {
        addToast({
          title: notif.title,
          message: notif.body || '',
          type: 'info'
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user?.id, activeOrg?.id, qc, addToast]);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [notifOpen]);

  const mergedAnnouncements = useMemo(() => {
    const map = new Map();
    for (const a of [...liveAnnouncements, ...(announcements || [])]) {
      if (a?.id && !map.has(a.id)) map.set(a.id, a);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
    );
  }, [liveAnnouncements, announcements]);

  const userNotifications = notifQuery.data?.data || [];
  const unreadNotifCount = userNotifications.filter((n) => !n.is_read).length;
  const unreadAnnCount = mergedAnnouncements.filter((a) => !seenAnnIds.has(a.id)).length;
  const unreadCount = unreadNotifCount + unreadAnnCount;

  const markAllRead = async () => {
    const nextSeen = new Set(seenAnnIds);
    mergedAnnouncements.forEach((a) => nextSeen.add(a.id));
    setSeenAnnIds(nextSeen);
    if (seenStorageKey) {
      localStorage.setItem(seenStorageKey, JSON.stringify(Array.from(nextSeen)));
    }
    const unreadNotifs = userNotifications.filter((n) => !n.is_read);
    if (unreadNotifs.length > 0 && activeOrg?.id) {
      await Promise.allSettled(unreadNotifs.map((n) => api.patch(`/notifications/${n.id}/read`, {})));
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const navGroups = [];

  if (user?.isPlatformAdmin) {
    navGroups.push({
      label: 'Platform Super Admin',
      items: [
        { to: '/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
        { to: '/platform/tenants', label: 'Tenants & Onboarding', icon: Building2 },
        { to: '/platform/plans', label: 'Plans & Entitlements', icon: CreditCard },
        { to: '/platform/settings', label: 'Global Settings & Audit', icon: Globe }
      ]
    });
  }

  if (activeOrg) {
    const learningItems = [
      !user?.isPlatformAdmin && { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      hasPermission('courses', 'view') && { to: '/courses', label: terminology.courses, icon: BookOpen },
      hasPermission('learning_paths', 'view') && { to: '/learning-paths', label: 'Learning Paths', icon: Layers },
      hasPermission('enrollments', 'view') && { to: '/enrollments', label: 'Enrollments & Live', icon: GraduationCap },
      hasPermission('assessments', 'view') && { to: '/assessments', label: 'Assessments & Grading', icon: ClipboardCheck },
      hasPermission('certificates', 'view') && hasEntitlement('certificates') && { to: '/certificates', label: 'Certificates & Badges', icon: Award },
      { to: '/engagement', label: 'Forums & Community', icon: MessageSquare }
    ].filter(Boolean);

    if (learningItems.length) {
      navGroups.push({ label: 'Learning & Delivery', items: learningItems });
    }

    const adminItems = [
      hasPermission('users', 'view') && { to: '/users', label: `${terminology.learners} & Directory`, icon: Users },
      hasPermission('departments', 'view') && { to: '/org-structure', label: `${terminology.departments} & Hierarchy`, icon: Network },
      hasPermission('roles', 'view') && { to: '/roles', label: 'Roles & Permissions', icon: Shield },
      hasPermission('compliance', 'view') && hasEntitlement('compliance') && { to: '/compliance', label: 'Compliance & Policies', icon: ShieldCheck },
      hasPermission('reports', 'view') && { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
      hasPermission('billing', 'view') && { to: '/billing', label: 'Subscription & Billing', icon: CreditCard },
      hasPermission('organizations', 'view') && { to: '/org-settings', label: 'Branding & Config', icon: Settings }
    ].filter(Boolean);

    if (adminItems.length) {
      navGroups.push({ label: 'Organization Governance', items: adminItems });
    }
  }

  const handleOrgSwitch = async (newOrgId) => {
    try {
      await api.post('/auth/switch-organization', { organizationId: newOrgId });
      setActiveOrganizationId(newOrgId);
      addToast({ title: 'Organization switched', message: 'Loaded tenant context.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ title: 'Switch failed', message: err.message, type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const breadcrumbs = location.pathname.split('/').filter(Boolean);

  return (
    <div className="h-screen h-[100dvh] flex overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 lg:relative lg:z-30 shrink-0 h-full ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center px-3.5">
          {sidebarCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <Link
                to="/dashboard"
                className="flex items-center justify-center group"
                title={activeOrg?.name || 'AstraLearn SaaS'}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm transition group-hover:scale-105"
                  style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
                >
                  {(activeOrg?.name || 'AL').slice(0, 2).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-2 overflow-hidden">
              <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden min-w-0 group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm transition group-hover:scale-105"
                  style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
                >
                  {(activeOrg?.name || 'AL').slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {activeOrg?.name || 'AstraLearn SaaS'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.isPlatformAdmin ? 'Platform Control' : activeMembership?.is_org_admin ? 'Tenant Admin' : 'LMS Workspace'}
                  </p>
                </div>
              </Link>
              {/* <button
                onClick={toggleSidebar}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button> */}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                      style={active ? { backgroundColor: 'var(--brand-primary, #2563eb)' } : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/profile"
            title={sidebarCollapsed ? 'Security & Profile' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Security & Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Right Section - Scrollable according to data */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Fixed Topbar */}
        <header className="h-16 shrink-0 px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Home</span>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="capitalize font-medium text-slate-700 dark:text-slate-200">{b.replace(/-/g, ' ')}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Global Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (globalSearch.trim()) navigate(`/courses?search=${encodeURIComponent(globalSearch.trim())}`);
              }}
              className="hidden md:block relative w-60"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={`Search ${terminology.courses.toLowerCase()}...`}
                className="input-field pl-9 py-1.5 text-xs"
              />
            </form>

            {/* Org Switcher when user has multiple memberships */}
            {memberships.length > 1 && (
              <select
                value={activeOrg?.id || ''}
                onChange={(e) => handleOrgSwitch(e.target.value)}
                className="input-field py-1.5 text-xs w-auto max-w-[180px]"
                aria-label="Switch organization"
              >
                {memberships.map((m) => (
                  <option key={m.organization_id} value={m.organization_id}>
                    {m.organization_name}
                  </option>
                ))}
              </select>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm card shadow-xl p-3.5 z-50">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                    {userNotifications.length === 0 && mergedAnnouncements.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications</p>
                    ) : (
                      <>
                        {mergedAnnouncements.map((a) => {
                          const isUnread = !seenAnnIds.has(a.id);
                          return (
                            <div
                              key={a.id}
                              className={`p-2.5 rounded-xl border text-xs transition ${
                                isUnread
                                  ? 'bg-blue-50/90 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
                                  : 'bg-slate-50/70 border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                  <Megaphone className="w-3 h-3" />
                                  Announcement
                                </span>
                                {isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{a.body}</p>
                            </div>
                          );
                        })}
                        {userNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs ${
                              !n.is_read
                                ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                                : 'bg-slate-50 border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Profile Avatar Link (Details shown on dedicated /profile page) */}
            <Link
              to="/profile"
              title={`${user?.fullName || 'Profile'} (${user?.email || user?.phone || ''})`}
              aria-label="User profile"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-900 hover:brightness-110 transition shrink-0"
            >
              {(user?.fullName || 'U').slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport according to data */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 lg:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
