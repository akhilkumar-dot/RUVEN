"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { supabaseAuth } from "@/lib/api/supabaseAuth";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();

  // If the user somehow lands on /sign-in while already authenticated,
  // send them home immediately.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/onboarding");
      }
    });
  }, [router]);

  async function handleGoogleSignIn() {
    try {
      await supabaseAuth.signInWithGoogle();
    } catch (err) {
      console.error("Google sign in error:", err);
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center px-6 pb-24">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, #A24BFF18 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-[380px] flex flex-col items-center"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-black border border-[#2A2A2E] flex items-center justify-center mb-6 shadow-[0_0_40px_#A24BFF30] overflow-hidden">
          <BridgeLogo size={72} />
        </div>

        <h1 className="text-white font-bold text-[32px] tracking-tight text-center leading-tight mb-2">
          Welcome to<br />Ruven
        </h1>
        <p className="text-[#6E6E73] text-[15px] text-center mb-10">
          India&apos;s founder community
        </p>

        {/* Google Sign In */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleGoogleSignIn}
          id="btn-google-signin"
          className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold text-[16px] rounded-2xl h-[56px] shadow-lg hover:shadow-xl transition-shadow"
        >
          {/* Google G SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-6">
          <div className="flex-1 h-px bg-[#2A2A2D]" />
          <span className="text-[#6E6E73] text-[12px]">or</span>
          <div className="flex-1 h-px bg-[#2A2A2D]" />
        </div>

        {/* Email sign-up fallback */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/sign-up")}
          className="w-full h-[52px] rounded-2xl border border-[#2A2A2D] text-white text-[15px] font-medium hover:border-[#A24BFF]/60 hover:bg-[#A24BFF]/5 transition-colors"
        >
          Sign up with email
        </motion.button>

        <button
          onClick={() => router.push("/sign-up?mode=login")}
          className="mt-4 text-[#6E6E73] text-[14px] hover:text-white transition-colors"
        >
          Already have an account?{" "}
          <span className="text-[#A24BFF] font-medium">Sign in with email</span>
        </button>

        {/* Terms */}
        <p className="text-[#6E6E73] text-[11px] text-center mt-8 leading-relaxed max-w-[280px]">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-[#A1A1A6] hover:text-white">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="text-[#A1A1A6] hover:text-white">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
