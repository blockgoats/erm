import { create } from 'zustand';
import { AuthUser } from '../lib/auth';
import { authApi } from '../lib/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: () => {
    const storedUser = authApi.getStoredUser();
    set({ user: storedUser, loading: false });
  },

  login: async (email: string, password: string) => {
    const { user } = await authApi.login({ email, password });
    set({ user });
  },

  logout: () => {
    authApi.logout();
    set({ user: null });
  },
}));

