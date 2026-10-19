import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryCache } from '../lib/queryCache';

interface AuthState {
  token: string | null;
  user: { name: string; username: string; role: string } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      // Cached pages belong to the session that loaded them; the 401 interceptor
      // routes through here too, so an expired token also empties the cache.
      logout: () => {
        queryCache.clear();
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-storage' }
  )
);

// Role strings are a cross-repo seam ([Authorize(Roles = ...)] on the API) — this
// selector is the one place the frontend compares against 'Admin'.
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'Admin');
