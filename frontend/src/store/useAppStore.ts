import { create } from 'zustand';
import { User, AppState } from '../types';
import { authApi } from '../lib/auth';

interface AppStore extends AppState {
  setUser: (user: User | null) => void;
  setSelectedOrganizationId: (id: string | null) => void;
  setViewMode: (mode: 'system' | 'organization' | 'enterprise') => void;
  initialize: () => void;
}

const STORAGE_KEY = 'erm-app-storage';

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  selectedOrganizationId: null,
  viewMode: 'organization',
  
  setUser: (user) => {
    set({ user });
    // Persist to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      data.user = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  },
  
  setSelectedOrganizationId: (id) => {
    set({ selectedOrganizationId: id });
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      data.selectedOrganizationId = id;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save org to localStorage', e);
    }
  },
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  initialize: () => {
    // Try to restore from localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.user) {
          set({ user: data.user, selectedOrganizationId: data.selectedOrganizationId });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    
    // Fallback: Try to get user from stored auth token
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      const appUser = {
        id: storedUser.id,
        email: storedUser.email,
        fullName: storedUser.full_name || storedUser.email.split('@')[0],
        organizationId: storedUser.organization_id || 'org-1',
        roles: storedUser.roles as any,
      };
      set({ user: appUser });
      // Also save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: appUser }));
      } catch (e) {
        console.error('Failed to save user to localStorage', e);
      }
    }
  },
}));

