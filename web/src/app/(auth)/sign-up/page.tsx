"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  User, Building2, TrendingUp, ChevronRight, ChevronLeft,
  Eye, EyeOff, CheckCircle2, LogIn
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { PillInput } from "@/ui/PillInput";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { type ApiError } from "@/lib/api/client";
import { supabaseAuth } from "@/lib/api/supabaseAuth";
import { cn } from "@/lib/utils";

// ── Validation schemas ────────────────────────────────────────
const step1Schema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Enter a valid email address"),
  phone:    z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step1 = z.infer<typeof step1Schema>;

// ── Account type selector cards ───────────────────────────────
const ACCOUNT_TYPES = [
  {
    key: "INDIVIDUAL" as AccountType,
    icon: <User size={24} />,
    label: "Individual",
    description: "Freelancer, student, or professional looking to connect",
  },
  {
    key: "STARTUP_FOUNDER" as AccountType,
    icon: <TrendingUp size={24} />,
    label: "Startup Founder",
    description: "Building your own startup and looking for co-founders or investors",
  },
  {
    key: "COMPANY_OWNER" as AccountType,
    icon: <Building2 size={24} />,
    label: "Company Owner",
    description: "Running an established company, hiring or partnering",
  },
  {
    key: "INVESTOR" as AccountType,
    icon: <span className="text-2xl">💼</span>,
    label: "Investor",
    description: "Angel, VC, or family office looking for deal flow",
  },
] as const;

// ── Progress indicator ────────────────────────────────────────
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === step
              ? "w-8 bg-[#A24BFF]"
              : i < step
              ? "w-4 bg-[#A24BFF]/40"
              : "w-4 bg-[#2A2A2D]"
          )}
        />
      ))}
    </div>
  );
}

// ── Type card ─────────────────────────────────────────────────
function TypeCard({
  type,
  selected,
  onSelect,
}: {
  type: (typeof ACCOUNT_TYPES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200",
        selected
          ? "border-[#A24BFF] bg-[#A24BFF]/10 shadow-[0_0_24px_#A24BFF20]"
          : "border-[#1C1C1E] bg-[#0C0C0C] hover:border-[#2A2A2D]"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          selected
            ? "bg-[#A24BFF] text-white"
            : "bg-[#1C1C1E] text-[#A1A1A6]"
        )}
      >
        {type.icon}
      </div>
      <div>
        <p className={cn("font-semibold text-[15px]", selected ? "text-white" : "text-[#A1A1A6]")}>
          {type.label}
        </p>
        <p className="text-[13px] text-[#6E6E73] mt-0.5 leading-snug">
          {type.description}
        </p>
      </div>
      {selected && (
        <CheckCircle2 size={18} className="ml-auto shrink-0 mt-0.5 text-[#A24BFF]" />
      )}
    </motion.button>
  );
}

// ── Main Sign Up content ──────────────────────────────────────
function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [authMode, setAuthMode] = useState<"signup" | "login">(initialMode);
  const register = useAuthStore(s => s.register);
  const login = useAuthStore(s => s.login);

  // Sign up state
  const [step, setStep] = useState(0); // 0=type, 1=details, 2=done
  const [accountType, setAccountType] = useState<AccountType>("INDIVIDUAL");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sign in state
  const [selectedLoginRole, setSelectedLoginRole] = useState<AccountType>("STARTUP_FOUNDER");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1>({ resolver: zodResolver(step1Schema) });

  async function onSubmit(values: Step1) {
    setServerError("");
    setSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        type: accountType,
      });
      setStep(2);
    } catch (err) {
      const e = err as ApiError;
      setServerError(
        e?.detail ?? "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter your email and password");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
      await login({
        emailOrHandle: loginEmail,
        password: loginPassword,
      });
      router.replace("/home");
    } catch (err: unknown) {
      const e = err as ApiError;
      setLoginError(e?.detail ?? "Invalid credentials. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  function goNext() { setDirection(1); setStep(s => s + 1); }
  function goBack() { setDirection(-1); setStep(s => s - 1); }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* TopBar */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4">
        <Link href="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
        </Link>
        <button
          onClick={() => {
            setAuthMode(m => m === "signup" ? "login" : "signup");
            setServerError("");
            setLoginError("");
          }}
          className="text-[#A1A1A6] text-[14px] hover:text-white transition-colors"
        >
          {authMode === "signup" ? "Sign In" : "Create Account"}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 max-w-[440px] mx-auto w-full">
        {/* Title */}
        <div className="relative w-full flex flex-col items-center mb-6">
          <h1 className="text-white font-bold text-[36px] text-center tracking-tight z-10">
            {authMode === "login"
              ? "Welcome Back"
              : step === 2
              ? "You're in! 🎉"
              : "Create Account"}
          </h1>
          <WavyGradientHeader className="w-full max-w-[260px] mt-1" />
        </div>

        {/* Mode Toggle Tab */}
        <div className="flex items-center bg-[#1C1C1E] p-1 rounded-2xl mb-6 w-full max-w-[320px]">
          <button
            type="button"
            onClick={() => { setAuthMode("signup"); setServerError(""); }}
            className={cn(
              "flex-1 py-2 text-[14px] font-medium rounded-xl transition-all",
              authMode === "signup" ? "bg-white text-black font-semibold shadow" : "text-[#8E8E93] hover:text-white"
            )}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("login"); setLoginError(""); }}
            className={cn(
              "flex-1 py-2 text-[14px] font-medium rounded-xl transition-all",
              authMode === "login" ? "bg-white text-black font-semibold shadow" : "text-[#8E8E93] hover:text-white"
            )}
          >
            Sign In
          </button>
        </div>

        {/* ── LOGIN MODE ── */}
        {authMode === "login" && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={onLoginSubmit}
            className="w-full space-y-4"
          >
            {/* Google OAuth Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => supabaseAuth.signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1a1a] font-semibold text-[15px] rounded-2xl h-[52px] shadow-lg hover:bg-white/90 transition-all cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>

            <div className="flex items-center gap-3 w-full my-2">
              <div className="flex-1 h-px bg-[#2A2A2D]" />
              <span className="text-[#6E6E73] text-[11px] uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-[#2A2A2D]" />
            </div>

            <PillInput
              label="Email or Username"
              type="text"
              autoComplete="username"
              placeholder="aarav@startup.in or handle"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <div className="relative">
              <PillInput
                label="Password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 text-[#6E6E73] hover:text-white transition-colors"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-400 text-[13px] text-center">{loginError}</p>
            )}

            <GradientRingButton
              type="submit"
              size="lg"
              disabled={loginLoading}
              className="w-full mt-4"
              id="btn-login-submit"
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </GradientRingButton>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="text-[#8E8E93] text-[13px] hover:text-white"
              >
                Don&apos;t have an account? <span className="text-[#A24BFF]">Create one</span>
              </button>
            </div>

            {/* Quick Demo Accounts for Testing Single Accounts */}
            <div className="pt-4 border-t border-[#1C1C1E] mt-4">
              <p className="text-[#6E6E73] text-[11px] text-center mb-2">
                Sign in with a demo account:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("freelancer@founderbridge.in");
                    setLoginPassword("password123");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#141416] border border-[#222] text-[#A1A1A6] hover:text-white hover:border-[#333] transition-colors truncate text-left"
                >
                  👤 Freelancer / Talent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("founder@founderbridge.in");
                    setLoginPassword("password123");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#141416] border border-[#222] text-[#A1A1A6] hover:text-white hover:border-[#333] transition-colors truncate text-left"
                >
                  🚀 Startup Founder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("company@founderbridge.in");
                    setLoginPassword("password123");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#141416] border border-[#222] text-[#A1A1A6] hover:text-white hover:border-[#333] transition-colors truncate text-left"
                >
                  🏢 Company Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("investor@founderbridge.in");
                    setLoginPassword("password123");
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#141416] border border-[#222] text-[#A1A1A6] hover:text-white hover:border-[#333] transition-colors truncate text-left"
                >
                  💼 Angel / VC Investor
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {/* ── SIGNUP MODE ── */}
        {authMode === "signup" && (
          <>
            {/* Progress */}
            {step < 2 && <ProgressDots step={step} total={2} />}

            {/* Steps */}
            <div className="w-full mt-6 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {/* ── STEP 0: Choose account type ── */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                    className="flex flex-col gap-3"
                  >
                    <p className="text-[#6E6E73] text-[14px] text-center mb-2">
                      What best describes you?
                    </p>
                    {ACCOUNT_TYPES.map(type => (
                      <TypeCard
                        key={type.key}
                        type={type}
                        selected={accountType === type.key}
                        onSelect={() => setAccountType(type.key)}
                      />
                    ))}
                    <GradientRingButton
                      size="lg"
                      className="w-full mt-2"
                      onClick={goNext}
                    >
                      Continue <ChevronRight size={18} />
                    </GradientRingButton>
                  </motion.div>
                )}

                {/* ── STEP 1: Details ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <PillInput
                        label="Full Name"
                        autoComplete="name"
                        placeholder="Aarav Reddy"
                        error={errors.name?.message}
                        {...reg("name")}
                      />
                      <PillInput
                        label="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="aarav@startup.in"
                        error={errors.email?.message}
                        {...reg("email")}
                      />
                      <PillInput
                        label="Mobile (India)"
                        type="tel"
                        autoComplete="tel"
                        placeholder="9876543210"
                        error={errors.phone?.message}
                        {...reg("phone")}
                      />

                      {/* Password with toggle */}
                      <div className="relative">
                        <PillInput
                          label="Password"
                          type={showPass ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Min. 8 characters"
                          error={errors.password?.message}
                          {...reg("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(v => !v)}
                          className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 text-[#6E6E73] hover:text-white transition-colors"
                          aria-label={showPass ? "Hide password" : "Show password"}
                        >
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Confirm password */}
                      <div className="relative">
                        <PillInput
                          label="Confirm Password"
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Same password again"
                          error={errors.confirmPassword?.message}
                          {...reg("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 text-[#6E6E73] hover:text-white transition-colors"
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {serverError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-[13px] text-center"
                        >
                          {serverError}
                        </motion.p>
                      )}

                      <p className="text-[11px] text-[#6E6E73] text-center px-2">
                        By creating an account you agree to our{" "}
                        <Link href="/terms" className="text-[#A1A1A6] hover:text-white underline">Terms</Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#A1A1A6] hover:text-white underline">Privacy Policy</Link>.
                      </p>

                      <div className="flex gap-3 mt-1">
                        <button
                          type="button"
                          onClick={goBack}
                          className="flex items-center gap-1.5 text-[#A1A1A6] text-[14px] hover:text-white transition-colors px-2 py-2"
                        >
                          <ChevronLeft size={16} /> Back
                        </button>
                        <GradientRingButton
                          type="submit"
                          size="lg"
                          disabled={submitting}
                          className="flex-1"
                          id="btn-create-account"
                        >
                          {submitting ? "Creating…" : "Create Account"}
                        </GradientRingButton>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── STEP 2: Done ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                    className="flex flex-col items-center gap-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    >
                      <CheckCircle2 size={72} className="text-[#A24BFF]" />
                    </motion.div>

                    <div>
                      <p className="text-white text-[20px] font-semibold">
                        Welcome to FounderBridge!
                      </p>
                      <p className="text-[#6E6E73] text-[15px] mt-2 leading-relaxed">
                        Account created successfully. Complete your profile to connect with founders and investors.
                      </p>
                    </div>

                    <GradientRingButton
                      size="lg"
                      className="w-full"
                      onClick={() => router.replace("/home")}
                    >
                      Enter Platform <ChevronRight size={18} />
                    </GradientRingButton>

                    <button
                      onClick={() => router.replace("/onboarding")}
                      className="text-[#A1A1A6] text-[14px] hover:text-white transition-colors underline"
                    >
                      Complete Onboarding Profile
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }} />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
