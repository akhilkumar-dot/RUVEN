import { create } from "zustand";
import { authApi, setAccessToken, type AuthResponse } from "@/lib/api/client";

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
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  /** Called by OAuth callback page to hydrate session from redirect params */
  setAuth: (opts: { accessToken: string; userHandle: string }) => void;
}

// ── Store ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  setAuth: ({ accessToken, userHandle }) => {
    setAccessToken(accessToken);
    set({
      accessToken,
      isAuthenticated: true,
      user: { id: "", userHandle, email: "", type: "INDIVIDUAL" },
    });
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const data: AuthResponse = await authApi.login(payload);
      setAccessToken(data.accessToken);
      set({
        user: data.user as AuthUser,
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
      const data: AuthResponse = await authApi.register(payload);
      setAccessToken(data.accessToken);
      const user = data.user as AuthUser;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout().catch(() => {});
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  logoutAll: async () => {
    await authApi.logoutAll().catch(() => {});
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  refreshSession: async () => {
    try {
      const data: AuthResponse = await authApi.refresh();
      setAccessToken(data.accessToken);
      set({ user: data.user as AuthUser, isAuthenticated: true });
      return true;
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },
}));
