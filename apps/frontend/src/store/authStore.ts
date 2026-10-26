import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthTokens, UUID } from '@monopoly/shared';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = 'monopoly-auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/login', { email, password });
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          api.setAuthToken(response.tokens.accessToken);
        } catch (error: any) {
          set({ error: error.message || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ user: User; tokens: AuthTokens }>('/auth/register', { username, email, password });
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          api.setAuthToken(response.tokens.accessToken);
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, tokens: null, isAuthenticated: false });
        api.setAuthToken(null);
      },

      initializeAuth: async () => {
        const stored = get();
        if (stored.tokens?.accessToken) {
          api.setAuthToken(stored.tokens.accessToken);
          try {
            const user = await api.get<User>('/auth/me');
            set({ user, isAuthenticated: true });
          } catch {
            // Token expired, try refresh
            try {
              await get().refreshToken();
              const user = await api.get<User>('/auth/me');
              set({ user, isAuthenticated: true });
            } catch {
              get().logout();
            }
          }
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        try {
          const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken: tokens.refreshToken });
          set({ tokens: response });
          api.setAuthToken(response.accessToken);
        } catch {
          get().logout();
          throw new Error('Session expired');
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const user = await api.patch<User>('/users/me', data);
          set({ user, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Update failed', isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);