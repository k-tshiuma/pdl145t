import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, RoleName } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'pdl145t-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Vérifie si l'utilisateur a un rôle spécifique.
 */
export function useHasRole(...roles: RoleName[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return roles.includes(user.roleName);
}
