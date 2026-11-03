"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  Building2,
  User,
  Briefcase,
  Sparkles
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { PillInput } from "@/ui/PillInput";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { Avatar } from "@/ui/Avatar";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ACCOUNT_CLASSES = [
  {
    key: "STARTUP_FOUNDER" as AccountType,
    label: "Startup Founder",
    badge: "Founder",
    icon: <TrendingUp size={22} />,
    description: "Building your own startup, looking for co-founders, early team & investors.",
    accent: "#A24BFF",
    borderClass: "border-[#A24BFF]",
    bgClass: "bg-[#A24BFF]/10",
  },
  {
    key: "COMPANY_OWNER" as AccountType,
    label: "Company Owner",
    badge: "Enterprise",
    icon: <Building2 size={22} />,
    description: "Running an established company, hiring specialized talent & partnering with B2B ventures.",
    accent: "#5E9C8A",
    borderClass: "border-[#5E9C8A]",
    bgClass: "bg-[#5E9C8A]/10",
  },
  {
    key: "INDIVIDUAL" as AccountType,
    label: "Individual / Professional",
    badge: "Talent",
    icon: <User size={22} />,
    description: "Developer, designer, student, or freelancer seeking exciting startups or consulting gigs.",
    accent: "#3B82F6",
    borderClass: "border-[#3B82F6]",
    bgClass: "bg-[#3B82F6]/10",
  },
  {
    key: "INVESTOR" as AccountType,
    label: "Investor",
    badge: "Capital",
    icon: <Briefcase size={22} />,
    description: "Angel, venture capitalist, or family office seeking high-growth Indian deal flow.",
    accent: "#FF8A3D",
    borderClass: "border-[#FF8A3D]",
    bgClass: "bg-[#FF8A3D]/10",
  },
] as const;

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
  "AI & ML",
  "B2B SaaS",
  "Fintech",
  "Full Stack",
  "Product Management",
  "UX Design",
  "Growth & GTM",
  "Operations",
  "Fundraising",
  "Legal & GST",
];

function OnboardingContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const switchAccountType = useAuthStore((s) => s.switchAccountType);

  const [step, setStep] = useState(0); // 0=Class selection, 1=Profile details, 2=Welcome preview
  const [selectedClass, setSelectedClass] = useState<AccountType>(user?.type || "STARTUP_FOUNDER");
  const [headline, setHeadline] = useState(
    user?.type === "INVESTOR"
      ? "Angel Investor · Early-stage deal flow"
      : user?.type === "COMPANY_OWNER"
      ? "Founder & Managing Director"
      : user?.type === "INDIVIDUAL"
      ? "Full Stack Engineer & Tech Consultant"
      : "Building the future of Indian tech"
  );
  const [location, setLocation] = useState("Bengaluru");
  const [bio, setBio] = useState("Passionate about building impactful solutions with strong product-market fit in India.");
  const [organizationName, setOrganizationName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["AI & ML", "B2B SaaS"]);
  const [saving, setSaving] = useState(false);

  const activeClassConfig = ACCOUNT_CLASSES.find((c) => c.key === selectedClass) || ACCOUNT_CLASSES[0];

  function handleSelectClass(type: AccountType) {
    setSelectedClass(type);
    switchAccountType(type);

    // Set contextual default headline
    if (type === "INVESTOR") {
      setHeadline("Angel Investor · Early-stage tech");
    } else if (type === "COMPANY_OWNER") {
      setHeadline("Managing Director & Enterprise Builder");
    } else if (type === "INDIVIDUAL") {
      setHeadline("Full Stack Engineer & Consultant");
    } else {
      setHeadline("Building the future of Indian tech");
    }
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleComplete() {
    setSaving(true);
    try {
      switchAccountType(selectedClass);

      // Persist chosen class to Supabase if session exists
      if (user?.id) {
        await supabase
          .from("users")
          .update({
            type: selectedClass,
            headline: headline.trim(),
            location: location,
            bio: bio.trim(),
          })
          .eq("id", user.id);
      }
    } catch {
      // Ignore background persistence errors
    } finally {
      setSaving(false);
      router.replace("/home");
    }
  }

  const displayName = user?.userHandle ? `@${user.userHandle}` : "Founder";

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 border-b border-[#1C1C1E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black border border-[#2A2A2E] flex items-center justify-center overflow-hidden shrink-0">
            <BridgeLogo size={32} />
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight">Ruven</span>
        </div>
        <button
          onClick={() => router.replace("/home")}
          className="text-[#8E8E93] text-[13px] hover:text-white transition-colors px-2 py-1"
        >
          Skip to Feed
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-6 w-full max-w-[500px] mx-auto">
        {/* Step Indicator & Title */}
        <div className="w-full text-center mb-5">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#A24BFF] mb-1">
            Step {step + 1} of 3
          </span>
          <h1 className="text-white font-bold text-[22px] sm:text-[26px] tracking-tight leading-snug">
            {step === 0 && "Select Your Account Class"}
            {step === 1 && "Tailor Your Profile"}
            {step === 2 && "Welcome to Ruven!"}
          </h1>
          <p className="text-[#8E8E93] text-[13px] sm:text-[14px] mt-1 max-w-[340px] mx-auto leading-normal">
            {step === 0 && "Ruven tailors your dashboard, deals, and ecosystem according to your role."}
            {step === 1 && "Help other founders, investors, and talent discover and collaborate with you."}
            {step === 2 && "Your personalized card is ready. Tap launch to enter the ecosystem."}
          </p>
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

        {/* Dynamic Step Content */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* ══════════ STEP 0: 4 ACCOUNT CLASSES ══════════ */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {ACCOUNT_CLASSES.map((cls) => {
                  const isSelected = selectedClass === cls.key;
                  return (
                    <button
                      key={cls.key}
                      type="button"
                      onClick={() => handleSelectClass(cls.key)}
                      className={cn(
                        "w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative",
                        isSelected
                          ? cn("border-2 bg-[#121216] shadow-lg", cls.borderClass)
                          : "border-[#1E1E22] bg-[#0E0E10] hover:border-[#2E2E34] hover:bg-[#141416]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                          isSelected
                            ? cn(cls.bgClass, cls.borderClass, "text-white")
                            : "bg-[#18181C] border-[#26262A] text-[#8E8E93]"
                        )}
                        style={{ color: isSelected ? cls.accent : undefined }}
                      >
                        {cls.icon}
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-white font-bold text-[15px] sm:text-[16px] leading-tight">
                            {cls.label}
                          </h2>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${cls.accent}15`,
                              color: cls.accent,
                              borderColor: `${cls.accent}30`,
                            }}
                          >
                            {cls.badge}
                          </span>
                        </div>
                        <p className="text-[#8E8E93] text-[12px] sm:text-[13px] mt-1 leading-snug">
                          {cls.description}
                        </p>
                      </div>

                      {/* Selection Radio / Checkmark */}
                      <div className="absolute right-3.5 top-4">
                        {isSelected ? (
                          <CheckCircle2 size={20} style={{ color: cls.accent }} />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#2E2E34] bg-black/40" />
                        )}
                      </div>
                    </button>
                  );
                })}

                <div className="pt-3">
                  <GradientRingButton
                    size="lg"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Continue as {activeClassConfig.label} <ChevronRight size={18} />
                  </GradientRingButton>
                </div>
              </motion.div>
            )}

            {/* ══════════ STEP 1: PROFILE DETAILS ══════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Selected class indicator badge */}
                <div className="p-3 rounded-xl bg-[#121216] border border-[#222226] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: activeClassConfig.accent }}>
                      {activeClassConfig.icon}
                    </span>
                    <span className="text-white text-[13px] font-semibold">
                      {activeClassConfig.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-[#A24BFF] text-[12px] font-medium hover:underline"
                  >
                    Change Class
                  </button>
                </div>

                {/* Organization or Venture Name */}
                <PillInput
                  label={
                    selectedClass === "INVESTOR"
                      ? "Fund / Angel Portfolio Name (Optional)"
                      : selectedClass === "COMPANY_OWNER"
                      ? "Company Name"
                      : "Startup / Venture Name (Optional)"
                  }
                  placeholder={
                    selectedClass === "INVESTOR"
                      ? "e.g. Bharat Venture Partners"
                      : selectedClass === "COMPANY_OWNER"
                      ? "e.g. Apex Tech Solutions"
                      : "e.g. FinPilot, NovaLeaf Labs..."
                  }
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />

                {/* Headline / Role */}
                <PillInput
                  label="Headline / Title"
                  placeholder="e.g. Co-founder & CEO · Ex-Razorpay"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Primary Hub
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#121214] border border-[#222226] text-white text-[14px] rounded-2xl px-4 py-3 outline-none focus:border-[#A24BFF] transition-colors"
                  >
                    {INDIAN_HUBS.map((hub) => (
                      <option key={hub} value={hub} className="bg-[#121214] text-white">
                        {hub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bio / Summary */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8E8E93] px-3">
                    Short Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief intro about what you're building or seeking..."
                    className="w-full bg-[#121214] border border-[#222226] text-white text-[13px] rounded-2xl px-4 py-2.5 outline-none focus:border-[#A24BFF] transition-colors resize-none"
                  />
                </div>

                {/* Key Sectors & Focus Areas */}
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
                              : "bg-[#18181C] border-[#26262A] text-[#8E8E93] hover:text-white"
                          )}
                        >
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1 text-[#8E8E93] text-[13px] hover:text-white px-2 py-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <GradientRingButton
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Review Profile <ChevronRight size={18} />
                  </GradientRingButton>
                </div>
              </motion.div>
            )}

            {/* ══════════ STEP 2: MEMBER PREVIEW & LAUNCH ══════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 text-center"
              >
                {/* Ruven Member Card Preview */}
                <div
                  className="rounded-3xl p-5 text-left relative overflow-hidden border border-[#26262C] shadow-2xl space-y-3"
                  style={{
                    background: "linear-gradient(135deg, #131316 0%, #0A0A0C 100%)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={displayName} size="md" />
                      <div>
                        <p className="text-white font-bold text-[15px]">{displayName}</p>
                        <p className="text-[#8E8E93] text-[11px] flex items-center gap-1">
                          <MapPin size={11} className="text-[#A24BFF]" /> {location}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${activeClassConfig.accent}15`,
                        color: activeClassConfig.accent,
                        borderColor: `${activeClassConfig.accent}30`,
                      }}
                    >
                      {activeClassConfig.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-white text-[13px] font-medium leading-snug">
                      {headline}
                    </p>
                    {organizationName && (
                      <p className="text-[#A24BFF] text-[12px] font-semibold mt-0.5">
                        {organizationName}
                      </p>
                    )}
                    <p className="text-[#8E8E93] text-[12px] leading-relaxed mt-2 line-clamp-2">
                      {bio}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1E1E22]">
                    {selectedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-2">
                  <div className="inline-flex items-center gap-1.5 text-[12px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium mb-1">
                    <Sparkles size={13} /> Class confirmed & verified
                  </div>
                  <h2 className="text-white font-bold text-[18px]">
                    You&apos;re ready to launch
                  </h2>
                  <p className="text-[#8E8E93] text-[12px] max-w-[320px] mx-auto mt-0.5">
                    Your tailored ecosystem, deal flow, and directory filters are now configured.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-[#8E8E93] text-[13px] hover:text-white px-2 py-2"
                  >
                    <ChevronLeft size={16} /> Edit
                  </button>
                  <GradientRingButton
                    size="lg"
                    className="flex-1"
                    disabled={saving}
                    onClick={handleComplete}
                  >
                    {saving ? "Launching…" : "Enter Ruven Dashboard"} <ArrowRight size={18} />
                  </GradientRingButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[#6E6E73] text-[11px] border-t border-[#1C1C1E]">
        © 2026 Ruven Technologies Private Limited
      </footer>
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
