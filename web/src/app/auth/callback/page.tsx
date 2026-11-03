"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

// Handles redirect from Google OAuth — reads ?token=&handle= from backend redirect
function OAuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore(s => s.setAuth);

  useEffect(() => {
    const token  = params.get("token");
    const handle = params.get("handle");

    if (!token || !handle) {
      // Missing params — something went wrong
      router.replace("/sign-in?error=oauth_failed");
      return;
    }

    // Store access token in Zustand (in-memory only — no localStorage for JWT)
    setAuth({ accessToken: token, userHandle: handle });

    // Redirect to home feed
    router.replace("/home");
  }, [params, router, setAuth]);

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#A24BFF] border-t-transparent animate-spin" />
      <p className="text-[#6E6E73] text-[15px]">Signing you in…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#A24BFF] border-t-transparent animate-spin" />
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
