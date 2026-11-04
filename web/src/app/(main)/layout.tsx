"use client";

/**
 * (main)/layout.tsx - Auth guard for all protected main-app routes.
 *
 * Strategy:
 *  - On mount, call supabase.auth.getSession() (reads from persisted storage,
 *    no network round-trip needed after first call).
 *  - If Zustand already reports isAuthenticated=true (hydrated from
 *    sessionStorage), skip the spinner and render children immediately.
 *  - If the session check comes back empty, redirect to /sign-in.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { setAccessToken } from "@/lib/api/client";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [ready, setReady] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setReady(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Already confirmed by Zustand - nothing to do.
    if (useAuthStore.getState().isAuthenticated) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session) {
        if (useAuthStore.getState().isAuthenticated) {
          setReady(true);
          return;
        }
        router.replace("/sign-in");
        return;
      }

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

      setAccessToken(session.access_token);
      setAuth({
        accessToken: session.access_token,
        userHandle: resolvedHandle,
        type: resolvedType,
        userId: authUser.id,
        email: dbUser?.email || authUser.email || "",
      });

      setReady(true);
    });
  }, [router, setAuth]);

  // Show a minimal full-screen spinner while we confirm the session.
  // This replaces the repeated redirect-to-sign-in flicker.
  if (!ready) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
