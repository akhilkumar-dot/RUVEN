"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";
import { PillInput } from "@/ui/PillInput";
import { GradientRingButton } from "@/ui/GradientRingButton";

/** Round social-login button with white/dark border */
function SocialButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      aria-label={label}
      className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] flex items-center justify-center text-white hover:bg-[#2A2A2D] transition-colors"
    >
      {children}
    </motion.button>
  );
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!emailOrId.trim() || !password) {
      setError("Please enter your email/User ID and password.");
      return;
    }
    setLoading(true);
    try {
      // Phase 1: wire to real API. For now, simulate.
      await new Promise((r) => setTimeout(r, 1000));
      // TODO: POST /api/v1/auth/login → store access token in memory → redirect
      setError("Backend not connected yet — Phase 1 will wire this up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-start bg-black"
      style={{ background: "#000" }}
    >
      {/* ── Top bar ───────────────────────────────────────── */}
      <div
        className="w-full flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4"
      >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
        </div>
        <Link
          href="/sign-up"
          className="flex items-center gap-2 text-white text-[14px] font-semibold hover:opacity-80 transition-opacity"
          aria-label="Sign Up"
        >
          <User size={16} />
          Sign Up
        </Link>
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="w-full max-w-[360px] mx-auto px-6 flex flex-col items-center mt-8">
        {/* Title + wavy line */}
        <div className="relative w-full flex flex-col items-center mb-8">
          <h1 className="text-white font-bold text-[42px] text-center tracking-tight z-10">
            Sign In
          </h1>
          <WavyGradientHeader className="w-full max-w-[280px] mt-1" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
          noValidate
        >
          <PillInput
            label="Email or User ID"
            type="text"
            id="emailOrId"
            autoComplete="username"
            placeholder="hannadowie@gmail.com"
            value={emailOrId}
            onChange={(e) => setEmailOrId(e.target.value)}
          />

          <div className="relative w-full">
            <PillInput
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 text-[#6E6E73] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-[13px] text-center"
            >
              {error}
            </motion.p>
          )}

          <GradientRingButton
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full mt-1"
          >
            <LogIn size={18} />
            {loading ? "Signing in…" : "Sign In"}
          </GradientRingButton>
        </form>

        {/* Forgot password */}
        <Link
          href="/forgot-password"
          className="mt-4 text-[#A1A1A6] text-[13px] hover:text-white transition-colors"
        >
          Forgot password?
        </Link>

        {/* Social login */}
        <div className="flex flex-col items-center gap-4 mt-8 w-full">
          <p className="text-[#6E6E73] text-[13px]">or Sign In with</p>
          <div className="flex gap-4">
            {/* Google */}
            <SocialButton label="Sign in with Google">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </SocialButton>

            {/* LinkedIn */}
            <SocialButton label="Sign in with LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </SocialButton>

            {/* X (Twitter) — feature-flagged, shown as disabled */}
            <SocialButton label="Sign in with X (coming soon)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </SocialButton>

            {/* GitHub — feature-flagged */}
            <SocialButton label="Sign in with GitHub (coming soon)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </SocialButton>
          </div>
        </div>
      </div>

      {/* Bottom safe area */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }} />
    </div>
  );
}
