"use client";

/**
 * AuthBootstrap — mounted once in the root layout.
 *
 * Responsibilities:
 *  1. On first mount, call supabase.auth.getSession() to restore any
 *     existing Supabase session (persisted in their own cookie/localStorage).
 *     If a session exists, write the access token into the in-memory store
 *     AND hydrate Zustand so the app never shows a stale "not logged in" state.
 *
 *  2. Subscribe to onAuthStateChange so that when Supabase silently refreshes
 *     the access token (every ~55 min), the in-memory token is kept current
 *     without a page reload.
 *
 *  3. When a SIGNED_OUT event is received, clear the Zustand store so every
 *     guarded route redirects immediately.
 *
 * This component renders nothing — it only manages side-effects.
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { setAccessToken } from "@/lib/api/client";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";

export function AuthBootstrap() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    // 1. Restore existing session on cold start
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session) return;

      const session = data.session;
      const authUser = session.user;

      const { data: dbUser } = await supabase
        .from("users")
        .select("id, user_handle, email, type")
        .eq("id", authUser.id)
        .maybeSingle();

      const resolvedType = (
        dbUser?.type ||
        authUser.user_metadata?.type ||
        "STARTUP_FOUNDER"
      ) as AccountType;

      const resolvedHandle =
        dbUser?.user_handle ||
        authUser.user_metadata?.user_handle ||
        authUser.email?.split("@")[0] ||
        "founder";

      setAuth({
        accessToken: session.access_token,
        userHandle: resolvedHandle,
        type: resolvedType,
        userId: authUser.id,
        email: dbUser?.email || authUser.email || "",
      });
    });

    // 2. Keep in-memory token current on silent refreshes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAccessToken(null);
        setUser(null);
        return;
      }

      const authUser = session.user;

      const { data: dbUser } = await supabase
        .from("users")
        .select("id, user_handle, email, type")
        .eq("id", authUser.id)
        .maybeSingle();

      const resolvedType = (
        dbUser?.type ||
        authUser.user_metadata?.type ||
        "STARTUP_FOUNDER"
      ) as AccountType;

      const resolvedHandle =
        dbUser?.user_handle ||
        authUser.user_metadata?.user_handle ||
        authUser.email?.split("@")[0] ||
        "founder";

      setAuth({
        accessToken: session.access_token,
        userHandle: resolvedHandle,
        type: resolvedType,
        userId: authUser.id,
        email: dbUser?.email || authUser.email || "",
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setUser]);

  return null;
}
