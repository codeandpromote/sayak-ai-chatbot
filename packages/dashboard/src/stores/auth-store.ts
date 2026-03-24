import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; name: string; isSuperAdmin?: boolean } | null;
  tenantId: string | null;
  tenantRole: string | null;
  tenants: { id: string; name: string; slug: string; role: string }[];
  setAuth: (data: any) => void;
  setTenant: (tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: null,
  tenantRole: null,
  tenants: [],

  setAuth: (data) => {
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    const tenantId = data.tenant?.id || data.tenants?.[0]?.id || null;
    if (tenantId) localStorage.setItem('tenantId', tenantId);

    const tenants = data.tenants || (data.tenant ? [data.tenant] : []);
    const tenantRole = tenants.find((t: any) => t.id === tenantId)?.role || null;

    set({
      user: data.user,
      tenantId,
      tenantRole,
      tenants,
    });
  },

  setTenant: (tenantId) => {
    localStorage.setItem('tenantId', tenantId);
    const tenants = useAuthStore.getState().tenants;
    const tenantRole = tenants.find((t) => t.id === tenantId)?.role || null;
    set({ tenantId, tenantRole });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantId');
    set({ user: null, tenantId: null, tenants: [] });
    window.location.href = '/login';
  },
}));

// Hydrate from localStorage on mount
if (typeof window !== 'undefined') {
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) {
    useAuthStore.setState({ tenantId });
  }
}
