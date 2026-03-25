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

function saveToStorage(user: any, tenants: any[], tenantId: string | null, tenantRole: string | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem('user', JSON.stringify(user));
  if (tenants.length) localStorage.setItem('tenants', JSON.stringify(tenants));
  if (tenantId) localStorage.setItem('tenantId', tenantId);
  if (tenantRole) localStorage.setItem('tenantRole', tenantRole);
}

function loadFromStorage() {
  if (typeof window === 'undefined') return {};
  try {
    const user = localStorage.getItem('user');
    const tenants = localStorage.getItem('tenants');
    const tenantId = localStorage.getItem('tenantId');
    const tenantRole = localStorage.getItem('tenantRole');
    return {
      user: user ? JSON.parse(user) : null,
      tenants: tenants ? JSON.parse(tenants) : [],
      tenantId: tenantId || null,
      tenantRole: tenantRole || null,
    };
  } catch {
    return {};
  }
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
    const tenants = data.tenants || (data.tenant ? [{ ...data.tenant, role: 'OWNER' }] : []);
    const tenantRole = tenants.find((t: any) => t.id === tenantId)?.role || 'OWNER';

    saveToStorage(data.user, tenants, tenantId, tenantRole);

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
    if (tenantRole) localStorage.setItem('tenantRole', tenantRole);
    set({ tenantId, tenantRole });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('tenantRole');
    localStorage.removeItem('user');
    localStorage.removeItem('tenants');
    set({ user: null, tenantId: null, tenantRole: null, tenants: [] });
    window.location.href = '/login';
  },
}));

// Hydrate from localStorage on mount
if (typeof window !== 'undefined') {
  const stored = loadFromStorage();
  if (stored.tenantId) {
    useAuthStore.setState(stored);
  }
}
