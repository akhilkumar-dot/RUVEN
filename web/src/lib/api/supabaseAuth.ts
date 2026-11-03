import { supabase } from "@/lib/supabase/client";
import { type AuthResponse, type RegisterPayload, setAccessToken } from "./client";
import { type AccountType } from "@/lib/store/authStore";

export const supabaseAuth = {
  /**
   * Register with real Supabase Auth + sync to public.users & public.profiles
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const sanitizedBase =
      payload.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 18) || "user";
    const handle = `${sanitizedBase}${Math.floor(Math.random() * 900 + 100)}`;

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          phone: payload.phone,
          type: payload.type,
          user_handle: handle,
        },
      },
    });

    if (error) {
      throw {
        status: 400,
        title: "Registration Failed",
        detail: error.message,
        code: error.code || "SUPABASE_AUTH_ERROR",
      };
    }

    const authUser = data.user;
    if (!authUser) {
      throw {
        status: 400,
        title: "Registration Failed",
        detail: "User could not be created in Supabase.",
        code: "USER_NULL",
      };
    }

    const token = data.session?.access_token || "sb_session_" + authUser.id;
    setAccessToken(token);

    // Ensure public.users entry is synced
    try {
      await supabase.from("users").upsert({
        id: authUser.id,
        user_handle: handle,
        email: payload.email,
        name: payload.name,
        phone: payload.phone,
        role: "USER",
        type: payload.type,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Trigger handles this automatically if table exists
    }

    return {
      accessToken: token,
      expiresInSeconds: data.session?.expires_in || 3600,
      user: {
        id: authUser.id,
        userHandle: handle,
        email: payload.email,
        type: payload.type as AccountType,
      },
    };
  },

  /**
   * Sign In with real Supabase Auth and fetch user's single account class
   */
  login: async (payload: { emailOrHandle: string; password: string }): Promise<AuthResponse> => {
    let emailToUse = payload.emailOrHandle.trim();

    // If input is not an email (e.g. handle), look up email in public.users
    if (!emailToUse.includes("@")) {
      const { data: userRow } = await supabase
        .from("users")
        .select("email")
        .eq("user_handle", emailToUse)
        .maybeSingle();

      if (userRow?.email) {
        emailToUse = userRow.email;
      } else {
        emailToUse = `${emailToUse}@founderbridge.in`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: payload.password,
    });

    if (error) {
      throw {
        status: 401,
        title: "Authentication Failed",
        detail: error.message,
        code: error.code || "INVALID_CREDENTIALS",
      };
    }

    const authUser = data.user;
    const token = data.session?.access_token || "sb_session_" + authUser.id;
    setAccessToken(token);

    // Fetch user row from public.users to get their immutable single account class
    const { data: dbUser } = await supabase
      .from("users")
      .select("id, user_handle, email, type, name")
      .eq("id", authUser.id)
      .maybeSingle();

    const resolvedType = (dbUser?.type || authUser.user_metadata?.type || "STARTUP_FOUNDER") as AccountType;
    const resolvedHandle = dbUser?.user_handle || authUser.user_metadata?.user_handle || emailToUse.split("@")[0];

    return {
      accessToken: token,
      expiresInSeconds: data.session?.expires_in || 3600,
      user: {
        id: authUser.id,
        userHandle: resolvedHandle,
        email: dbUser?.email || authUser.email || emailToUse,
        type: resolvedType,
      },
    };
  },

  /**
   * Real Supabase OAuth with Google
   */
  signInWithGoogle: async (redirectTo?: string) => {
    const callbackUrl =
      redirectTo || `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out from real Supabase
   */
  logout: async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
  },

  /**
   * Refresh session from real Supabase
   */
  refresh: async (): Promise<AuthResponse | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;

    const authUser = data.session.user;
    const { data: dbUser } = await supabase
      .from("users")
      .select("id, user_handle, email, type")
      .eq("id", authUser.id)
      .maybeSingle();

    const resolvedType = (dbUser?.type || authUser.user_metadata?.type || "STARTUP_FOUNDER") as AccountType;
    const resolvedHandle = dbUser?.user_handle || authUser.user_metadata?.user_handle || authUser.email?.split("@")[0] || "founder";

    return {
      accessToken: data.session.access_token,
      expiresInSeconds: data.session.expires_in || 3600,
      user: {
        id: authUser.id,
        userHandle: resolvedHandle,
        email: authUser.email || "",
        type: resolvedType,
      },
    };
  },
};
