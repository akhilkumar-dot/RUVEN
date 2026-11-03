"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { PillInput } from "@/ui/PillInput";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { WavyGradientHeader } from "@/ui/WavyGradientHeader";
import { Avatar } from "@/ui/Avatar";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

const INDIAN_HUBS = [
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Chennai",
  "Ahmedabad",
  "Kolkata",
  "Remote / All India",
];

const POPULAR_SKILLS = [
  "B2B SaaS",
  "AI / ML",
  "Fintech",
  "Full Stack",
  "Product Management",
  "UX Design",
  "D2C",
  "Agritech",
  "Fundraising",
  "GTM & Sales",
  "Operations",
  "Legal & GST",
];

const LOOKING_FOR_OPTIONS = [
  "Technical Co-founder",
  "GTM / Business Co-founder",
  "Angel / Seed Investment",
  "Joining an Early Startup",
  "First 10 Hires",
  "Founder Mentorship",
];

function OnboardingContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0); // 0=Basics, 1=Ecosystem fit, 2=Ready
  const [headline, setHeadline] = useState("Building the future of Indian startups");
  const [location, setLocation] = useState("Bengaluru");
  const [bio, setBio] = useState("Passionate about solving genuine Indian problems with high product-market fit.");
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("Pre-seed");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["B2B SaaS", "AI / ML"]);
  const [lookingFor, setLookingFor] = useState<string>("Technical Co-founder");
  const [saving, setSaving] = useState(false);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleComplete() {
    setSaving(true);
    // Simulate brief save
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    router.replace("/home");
  }

  const displayName = user?.userHandle ? `@${user.userHandle}` : "Founder";

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* TopBar */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black border border-[#2A2A2E] flex items-center justify-center overflow-hidden">
            <BridgeLogo size={32} />
          </div>
          <span className="text-white font-bold text-[16px]">Ruven</span>
        </div>
        <button
          onClick={() => router.replace("/home")}
          className="text-[#8E8E93] text-[13px] hover:text-white transition-colors"
        >
          Skip to Feed
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 max-w-[460px] mx-auto w-full pb-8">
        {/* Title */}
        <div className="relative w-full flex flex-col items-center mb-6 text-center">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#A24BFF] mb-1">
            Step {step + 1} of 3
          </span>
          <h1 className="text-white font-bold text-[32px] tracking-tight z-10 leading-tight">
            {step === 0 && "Complete Your Profile"}
            {step === 1 && "What Are You Building?"}
            {step === 2 && "Welcome Aboard!"}
          </h1>
          <WavyGradientHeader className="w-full max-w-[240px] mt-1" />
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i === step
                  ? "bg-[#A24BFF]"
                  : i < step
                  ? "bg-[#A24BFF]/50"
                  : "bg-[#2A2A2D]"
              )}
            />
          ))}
        </div>

        {/* Step Container */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Basics ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0F0F11] border border-[#1C1C1E]">
                  <Avatar name={displayName} size="lg" />
                  <div>
                    <p className="text-white font-semibold text-[15px]">{displayName}</p>
                    <p className="text-[#8E8E93] text-[12px]">India Startup Ecosystem</p>
                  </div>
                </div>

                <PillInput
                  label="Headline / Role"
                  placeholder="e.g. Co-founder @ Startup · Ex-Flipkart"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Startup Hub / Location
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {INDIAN_HUBS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setLocation(city)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border",
                          location === city
                            ? "bg-[#A24BFF]/20 border-[#A24BFF] text-white"
                            : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Short Founder Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell founders & investors what you are passionate about..."
                    className="w-full bg-[#121214] border border-[#2A2A2D] rounded-2xl p-3.5 text-white text-[14px] placeholder:text-[#6E6E73] focus:outline-none focus:border-[#A24BFF] resize-none"
                  />
                </div>

                <GradientRingButton
                  size="lg"
                  className="w-full mt-4"
                  onClick={() => setStep(1)}
                >
                  Continue <ChevronRight size={18} />
                </GradientRingButton>
              </motion.div>
            )}

            {/* ── STEP 1: Startup Details & Skills ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <PillInput
                  label="Startup / Project Name (Optional)"
                  placeholder="e.g. FinPilot, NovaLeaf Labs..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Current Stage
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Idea / Concept", "Pre-seed", "Seed Stage", "Bootstrapped Profitable"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStage(st)}
                        className={cn(
                          "p-2.5 rounded-xl text-[13px] font-medium transition-all border text-center",
                          stage === st
                            ? "bg-[#A24BFF]/20 border-[#A24BFF] text-white"
                            : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Looking For Right Now
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {LOOKING_FOR_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLookingFor(opt)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all border text-left flex items-center justify-between",
                          lookingFor === opt
                            ? "bg-[#A24BFF]/20 border-[#A24BFF] text-white font-semibold"
                            : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"
                        )}
                      >
                        <span>{opt}</span>
                        {lookingFor === opt && <CheckCircle2 size={16} className="text-[#A24BFF]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Sectors & Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_SKILLS.map((sk) => {
                      const isSel = selectedSkills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                            isSel
                              ? "bg-white text-black font-semibold border-white"
                              : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"
                          )}
                        >
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 text-[#8E8E93] text-[14px] hover:text-white px-3"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <GradientRingButton
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Next <ChevronRight size={18} />
                  </GradientRingButton>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Preview & Launch ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                {/* Preview Bento Card */}
                <div
                  className="rounded-[28px] p-6 text-left relative overflow-hidden shadow-2xl border border-white/10"
                  style={{
                    background: "linear-gradient(135deg, #1C1C1E 0%, #0F0F11 100%)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Avatar name={displayName} size="lg" />
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#A24BFF]/20 text-[#A24BFF] border border-[#A24BFF]/30">
                      Founder Profile
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-[20px] leading-tight">
                    {displayName}
                  </h3>
                  <p className="text-[#A24BFF] text-[13px] font-medium mt-0.5">
                    {headline}
                  </p>
                  <p className="text-[#8E8E93] text-[12px] flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {location}
                  </p>

                  <p className="text-white/80 text-[13px] mt-3 leading-relaxed">
                    {bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
                    {selectedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                      Seeking: {lookingFor}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-white font-semibold text-[20px]">
                    Your founder card is ready!
                  </h2>
                  <p className="text-[#8E8E93] text-[14px] mt-1">
                    You can now network with verified founders, angels, and incubators across India.
                  </p>
                </div>

                <GradientRingButton
                  size="lg"
                  className="w-full"
                  disabled={saving}
                  onClick={handleComplete}
                >
                  {saving ? "Launching…" : "Launch Into FounderBridge"} <ArrowRight size={18} />
                </GradientRingButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
