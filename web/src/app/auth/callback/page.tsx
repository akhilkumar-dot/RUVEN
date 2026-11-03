"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { setAccessToken } from "@/lib/api/client";
import { BridgeLogo } from "@/ui/BridgeLogo";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState("Authenticating with Supabase…");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleAuth() {
      try {
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data?.session;
        if (!session?.user) {
          throw new Error("No active Supabase session found.");
        }

        const authUser = session.user;
        const token = session.access_token;
        setAccessToken(token);

        // Fetch or create user record in public.users to get their class
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, user_handle, email, type, name")
          .eq("id", authUser.id)
          .maybeSingle();

        const resolvedType = (dbUser?.type ||
          authUser.user_metadata?.type ||
          "STARTUP_FOUNDER") as AccountType;

        const resolvedHandle =
          dbUser?.user_handle ||
          authUser.user_metadata?.user_handle ||
          authUser.email?.split("@")[0] ||
          "founder";

        setUser({
          id: authUser.id,
          userHandle: resolvedHandle,
          email: dbUser?.email || authUser.email || "",
          type: resolvedType,
        });

        setStatus("Authentication successful! Redirecting…");
        setTimeout(() => {
          router.replace("/home");
        }, 500);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Supabase OAuth callback error:", error);
        setErrorMsg(error?.message || "Authentication failed. Please try again.");
      }
    }

    handleAuth();
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(162,75,255,0.35)] animate-pulse">
        <BridgeLogo size={32} strokeColor="#000" accentColor="#000" />
      </div>

      {!errorMsg ? (
        <div className="space-y-3">
          <div className="w-6 h-6 border-2 border-[#A24BFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-white font-bold text-[20px]">{status}</h2>
          <p className="text-[#8E8E93] text-[13px]">
            Connecting your account to FounderBridge…
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-[360px]">
          <p className="text-red-400 font-semibold text-[15px]">{errorMsg}</p>
          <button
            onClick={() => router.replace("/sign-in")}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-[14px] hover:bg-white/90 transition-colors shadow-lg"
          >
            Return to Sign In
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
