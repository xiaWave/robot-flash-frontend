import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, token) => {
        set({
          currentUser: user,
          token: token || null,
          isAuthenticated: !!user,
        });
        
        // 同步到localStorage
        if (token) {
          localStorage.setItem('auth_token', token);
        } else if (!user) {
          localStorage.removeItem('auth_token');
        }
      },

      logout: () => {
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('auth_token');
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          // 这里可以调用验证token的API
          // const response = await authApi.getCurrentUser();
          // if (response) {
          //   set({ currentUser: response, isAuthenticated: true });
          // } else {
          //   get().logout();
          // }
          
          // 临时模拟：如果有token就认为已认证
          set({ isAuthenticated: true });
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
