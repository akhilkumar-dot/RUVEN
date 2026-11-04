import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setAccessToken, type AuthResponse } from "@/lib/api/client";
import { supabaseAuth } from "@/lib/api/supabaseAuth";
import { supabase } from "@/lib/supabase/client";

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
  name?: string;
  type: AccountType;
  avatarUrl?: string;
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
  switchAccountType: (type: AccountType) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  /** Update the signed-in user's avatar so nav/home reflect a photo change instantly */
  setAvatarUrl: (url: string) => void;
  /** Called by OAuth callback page to hydrate session from redirect params */
  setAuth: (opts: { 
    accessToken: string; 
    userHandle: string; 
    type?: AccountType; 
    userId?: string; 
    email?: string; 
    avatarUrl?: string;
    name?: string;
  }) => void;
}

// ── Store with sessionStorage persistence ───────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      setAvatarUrl: (url) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl: url } : null,
        })),

      switchAccountType: async (type: AccountType) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Persist account type update to Supabase
        try {
          await supabase
            .from("users")
            .update({ type, updated_at: new Date().toISOString() })
            .eq("id", currentUser.id);
        } catch (e) {
          console.warn("Failed to update user type in database:", e);
        }

        set({ user: { ...currentUser, type } });
      },

      setAuth: ({ accessToken, userHandle, type = "STARTUP_FOUNDER", userId, email, avatarUrl, name }) => {
        setAccessToken(accessToken);
        set({
          accessToken,
          isAuthenticated: true,
          user: {
            id: userId || "",
            userHandle,
            email: email || `${userHandle}@ruven.app`,
            type,
            avatarUrl,
            name,
          },
        });
      },

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const data: AuthResponse = await supabaseAuth.login(payload);
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
          const data: AuthResponse = await supabaseAuth.register(payload);
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
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      logoutAll: async () => {
        await supabaseAuth.logout().catch(() => {});
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
      name: "ruven-auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.sessionStorage : localStorage)),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
