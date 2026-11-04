"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

function VerifyEmailContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (resending || !user?.email) return;
    setResending(true);
    try {
      await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      setResent(true);
    } catch (err) {
      console.error("Failed to resend email:", err);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px] flex flex-col items-center text-center">
        <Link
          href="/"
          className="w-16 h-16 rounded-2xl bg-black border border-[#2A2A2E] flex items-center justify-center mb-6 shadow-[0_0_40px_#A24BFF30] overflow-hidden"
        >
          <BridgeLogo size={56} />
        </Link>

        <h1 className="text-white font-bold text-[30px] tracking-tight mb-2">
          Verify Your Email
        </h1>
        <WavyGradientHeader className="w-48 mb-6" />

        <div className="w-16 h-16 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] flex items-center justify-center text-[#A24BFF] mb-4">
          <Mail size={28} />
        </div>

        <p className="text-white text-[16px] font-medium mb-1">
          Verification link sent
        </p>
        <p className="text-[#8E8E93] text-[14px] leading-relaxed mb-6">
          Please check your inbox and click the verification link to activate all platform features.
        </p>

        <GradientRingButton
          size="lg"
          className="w-full mb-3"
          onClick={() => router.push("/home")}
        >
          Continue to Feed <ArrowRight size={18} />
        </GradientRingButton>

        {user?.email && (
          <button
            type="button"
            disabled={resending || resent}
            onClick={handleResend}
            className="text-[#8E8E93] text-[13px] hover:text-white transition-colors"
          >
            {resent
              ? "Email resent! Check your inbox"
              : resending
              ? "Resending…"
              : "Didn't receive an email? Resend"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
