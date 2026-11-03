import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi, setAccessToken, type AuthResponse, type ApiError } from "@/lib/api/client";
import { mockAuthApi } from "@/lib/api/mockAuth";
import { supabaseAuth } from "@/lib/api/supabaseAuth";

// ── Types ─────────────────────────────────────────────────────
export type AccountType =
  | "INDIVIDUAL"
  | "INVESTOR"
  | "STARTUP_FOUNDER"
  | "COMPANY_OWNER";

export interface AuthUser {
  id: string;
  userHandle: string;
  email: string;
  type: AccountType;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (payload: { emailOrHandle: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    type: AccountType;
  }) => Promise<AuthUser>;
  switchAccountType: (type: AccountType) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  /** Called by OAuth callback page to hydrate session from redirect params */
  setAuth: (opts: { accessToken: string; userHandle: string; type?: AccountType }) => void;
}

// ── Store with localStorage persistence ───────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      switchAccountType: (type: AccountType) =>
        set((state) => {
          if (!state.user) {
            return {
              user: {
                id: "usr-" + Math.random().toString(36).substring(2, 9),
                userHandle: "aarav_reddy",
                email: "aarav@founderbridge.in",
                type,
              },
              isAuthenticated: true,
            };
          }
          return { user: { ...state.user, type } };
        }),

      setAuth: ({ accessToken, userHandle, type = "STARTUP_FOUNDER" }) => {
        setAccessToken(accessToken);
        set({
          accessToken,
          isAuthenticated: true,
          user: {
            id: "u-" + Math.random().toString(36).substring(2, 9),
            userHandle,
            email: `${userHandle}@founderbridge.in`,
            type,
          },
        });
      },

      login: async (payload) => {
        set({ isLoading: true });
        try {
          let data: AuthResponse;
          try {
            data = await supabaseAuth.login(payload);
          } catch (supaErr) {
            if (mockAuthApi.isEnabled) {
              data = await mockAuthApi.login(payload);
            } else {
              throw supaErr;
            }
          }
          setAccessToken(data.accessToken);
          set({
            user: data.user as AuthUser,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          let data: AuthResponse;
          try {
            data = await supabaseAuth.register(payload);
          } catch (supaErr) {
            if (mockAuthApi.isEnabled) {
              data = await mockAuthApi.register(payload);
            } else {
              throw supaErr;
            }
          }
          setAccessToken(data.accessToken);
          const user = data.user as AuthUser;
          set({ user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await supabaseAuth.logout().catch(() => {});
        if (mockAuthApi.isEnabled) await mockAuthApi.logout();
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      logoutAll: async () => {
        await supabaseAuth.logout().catch(() => {});
        if (mockAuthApi.isEnabled) await mockAuthApi.logoutAll();
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshSession: async () => {
        try {
          const data = await supabaseAuth.refresh();
          if (data) {
            setAccessToken(data.accessToken);
            set({ user: data.user as AuthUser, accessToken: data.accessToken, isAuthenticated: true });
            return true;
          }
          if (mockAuthApi.isEnabled) {
            const mockData = await mockAuthApi.refresh();
            setAccessToken(mockData.accessToken);
            set({ user: mockData.user as AuthUser, accessToken: mockData.accessToken, isAuthenticated: true });
            return true;
          }
          setAccessToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false;
        } catch {
          setAccessToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: "founderbridge-auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.sessionStorage : localStorage)),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Tokens are in-memory only (never saved to localStorage per security spec)
      }),
    }
  )
);
