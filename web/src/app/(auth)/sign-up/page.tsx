"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  User, Building2, TrendingUp, ChevronRight, ChevronLeft,
  Eye, EyeOff, CheckCircle2
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { PillInput } from "@/ui/PillInput";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { type ApiError } from "@/lib/api/client";
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
    <div className="flex gap-2 items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          animate={{
            width: i === step ? 24 : 8,
            backgroundColor: i <= step ? "#A24BFF" : "#2A2A2D",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="h-2 rounded-full block"
        />
      ))}
    </div>
  );
}

// ── Type card ─────────────────────────────────────────────────
function TypeCard({
  type, selected, onSelect,
}: {
  type: (typeof ACCOUNT_TYPES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors",
        selected
          ? "border-[#A24BFF] bg-[#A24BFF]/10"
          : "border-[#2A2A2D] bg-[#1C1C1E] hover:border-[#444]"
      )}
    >
      <span className={cn("mt-0.5", selected ? "text-[#A24BFF]" : "text-[#6E6E73]")}>
        {type.icon}
      </span>
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

// ── Main Sign Up page ─────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter();
  const register = useAuthStore(s => s.register);

  const [step, setStep] = useState(0); // 0=type, 1=details, 2=done
  const [accountType, setAccountType] = useState<AccountType>("INDIVIDUAL");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
        </div>
        <Link href="/sign-in" className="text-[#A1A1A6] text-[14px] hover:text-white transition-colors">
          Sign In
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 max-w-[440px] mx-auto w-full">
        {/* Title */}
        <div className="relative w-full flex flex-col items-center mb-6">
          <h1 className="text-white font-bold text-[38px] text-center tracking-tight z-10">
            {step === 2 ? "You're in! 🎉" : "Create Account"}
          </h1>
          <WavyGradientHeader className="w-full max-w-[260px] mt-1" />
        </div>

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
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  <PillInput
                    label="Full Name"
                    type="text"
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
                    Check your email to verify your address. Then complete your profile to get discovered.
                  </p>
                </div>

                <GradientRingButton
                  size="lg"
                  className="w-full"
                  onClick={() => router.replace("/onboarding")}
                >
                  Complete My Profile <ChevronRight size={18} />
                </GradientRingButton>

                <button
                  onClick={() => router.replace("/home")}
                  className="text-[#6E6E73] text-[14px] hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }} />
    </div>
  );
}
