"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, CheckCircle2 } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { PillInput } from "@/ui/PillInput";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px] flex flex-col items-center text-center">
        <Link href="/" className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-6 shadow-[0_0_40px_#A24BFF30]">
          <BridgeLogo size={28} strokeColor="#000" accentColor="#000" />
        </Link>

        <h1 className="text-white font-bold text-[30px] tracking-tight mb-2">
          Reset Password
        </h1>
        <WavyGradientHeader className="w-48 mb-6" />

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <CheckCircle2 size={56} className="text-[#A24BFF] mx-auto" />
            <p className="text-white text-[17px] font-semibold">Check your email</p>
            <p className="text-[#8E8E93] text-[14px]">
              We sent password reset instructions to <span className="text-white font-medium">{email}</span>.
            </p>
            <Link
              href="/sign-in"
              className="inline-block mt-4 text-[#A24BFF] font-semibold text-[14px] hover:underline"
            >
              Return to Sign In
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            <p className="text-[#8E8E93] text-[14px] text-center mb-4">
              Enter your registered email address and we&apos;ll send you a link to reset your password.
            </p>

            <PillInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="aarav@startup.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <GradientRingButton
              type="submit"
              size="lg"
              disabled={loading || !email}
              className="w-full mt-2"
            >
              {loading ? "Sending link…" : "Send Reset Link"}
            </GradientRingButton>

            <div className="text-center pt-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-[#8E8E93] text-[13px] hover:text-white"
              >
                <ChevronLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
