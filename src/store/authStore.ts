import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);

// Role strings are a cross-repo seam ([Authorize(Roles = ...)] on the API) — this
// selector is the one place the frontend compares against 'Admin'.
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'Admin');
