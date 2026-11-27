import { create } from 'zustand';

const initialTheme = typeof window !== 'undefined' ? localStorage.getItem('lms_theme') || 'light' : 'light';
if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}

export const useAppStore = create((set) => ({
  theme: initialTheme,
  sidebarCollapsed: false,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('lms_access_token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('lms_refresh_token') : null,
  activeOrganizationId: typeof window !== 'undefined' ? localStorage.getItem('lms_org_id') : null,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lms_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setTokens: (accessToken, refreshToken, activeOrganizationId = null) => {
    if (accessToken) localStorage.setItem('lms_access_token', accessToken);
    else localStorage.removeItem('lms_access_token');
    if (refreshToken) localStorage.setItem('lms_refresh_token', refreshToken);
    else localStorage.removeItem('lms_refresh_token');
    if (activeOrganizationId) localStorage.setItem('lms_org_id', activeOrganizationId);
    else if (activeOrganizationId === '') localStorage.removeItem('lms_org_id');

    set((state) => ({
      accessToken,
      refreshToken,
      activeOrganizationId: activeOrganizationId !== null ? activeOrganizationId : state.activeOrganizationId
    }));
  },

  setActiveOrganizationId: (orgId) => {
    if (orgId) localStorage.setItem('lms_org_id', orgId);
    else localStorage.removeItem('lms_org_id');
    set({ activeOrganizationId: orgId });
  },

  clearAuth: () => {
    localStorage.removeItem('lms_access_token');
    localStorage.removeItem('lms_refresh_token');
    localStorage.removeItem('lms_org_id');
    set({ accessToken: null, refreshToken: null, activeOrganizationId: null });
  },

  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { id, type: 'info', ...toast }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
