"use client";

/**
 * MainAuthGuard - Client-side auth guard for all protected main-app routes.
 *
 * Rendered by the (main) Server Component layout. Lives in its own client
 * module so that the layout itself can stay a Server Component and export
 * the `instant` route segment config.
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
import { buildAuthPayload } from "@/ui/AuthBootstrap";
import { useAuthStore } from "@/lib/store/authStore";

export function MainAuthGuard({
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

      // Reuse the same payload builder as AuthBootstrap so this guard never
      // overwrites the hydrated avatar/name with undefined.
      setAuth(await buildAuthPayload(data.session));
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
