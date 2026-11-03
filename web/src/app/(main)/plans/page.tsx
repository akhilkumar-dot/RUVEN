"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, ChevronRight, Star, Shield, Sparkles } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";

// ── Plan definitions ──────────────────────────────────────────
const PLANS = [
  {
    key: "free",
    name: "Free",
    icon: <Star size={20} />,
    price: 0,
    tagline: "Get started — no card needed",
    color: "#A1A1A6",
    features: [
      "Basic profile",
      "Discover people & companies",
      "Send 5 connection requests/month",
      "Post in the feed",
      "1 company page (Classic theme)",
      "Join meetups",
    ],
    locked: [
      "Unlimited connections",
      "All 9 company themes",
      "Priority in search results",
      "Analytics dashboard",
      "Workspace documents (3 max)",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    icon: <Zap size={20} />,
    price: 19900, // ₹199 in paise (GST inclusive)
    tagline: "For serious founders & investors",
    color: "#A24BFF",
    features: [
      "Everything in Free",
      "Unlimited connections",
      "All 9 company page themes",
      "Priority in Discover results",
      "Analytics: profile & company views",
      "Workspace documents (unlimited)",
      "Investor introductions",
      "Verified badge",
      "Remove FounderBridge branding",
    ],
    locked: [],
  },
] as const;

// ── Feature row ───────────────────────────────────────────────
function FeatureRow({ text, included = true }: { text: string; included?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-[14px]">
      <span className={cn("mt-0.5 shrink-0", included ? "text-emerald-400" : "text-[#2A2A2D]")}>
        {included ? <Check size={14} /> : <span className="text-[12px]">—</span>}
      </span>
      <span className={included ? "text-[#A1A1A6]" : "text-[#3A3A3D]"}>{text}</span>
    </li>
  );
}

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({
  plan,
  current,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  current: boolean;
  onSelect: () => void;
}) {
  const isPro = plan.key === "pro";
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-2xl p-5 border",
        isPro
          ? "border-[#A24BFF] bg-gradient-to-br from-[#A24BFF]/10 to-[#FF3D81]/5"
          : "border-[#1C1C1E] bg-[#0C0C0C]"
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A24BFF] to-[#FF3D81] text-white text-[11px] font-bold">
          MOST POPULAR
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <span style={{ color: plan.color }}>{plan.icon}</span>
        <div>
          <h3 className="text-white font-bold text-[18px]">{plan.name}</h3>
          <p className="text-[#6E6E73] text-[12px]">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        {plan.price === 0 ? (
          <p className="text-white font-bold text-[32px]">₹0</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <p className="text-white font-bold text-[32px]">₹199</p>
            <p className="text-[#6E6E73] text-[14px]">/mo · GST incl.</p>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-5">
        {plan.features.map(f => <FeatureRow key={f} text={f} included />)}
        {plan.locked.map(f => <FeatureRow key={f} text={f} included={false} />)}
      </ul>

      {/* CTA */}
      {current ? (
        <div className="w-full py-3 rounded-full border border-[#2A2A2D] text-[#6E6E73] text-[14px] text-center">
          Current Plan
        </div>
      ) : isPro ? (
        <GradientRingButton size="lg" className="w-full" onClick={onSelect}>
          <Crown size={16} /> Upgrade to Pro
        </GradientRingButton>
      ) : (
        <button onClick={onSelect}
          className="w-full py-3 rounded-full border border-[#2A2A2D] text-white text-[14px] hover:bg-[#1C1C1E] transition-colors">
          Downgrade to Free
        </button>
      )}
    </motion.div>
  );
}

// ── Payment modal ─────────────────────────────────────────────
function PaymentModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"confirm" | "processing" | "done">("confirm");

  function handlePay() {
    setStep("processing");
    setTimeout(() => setStep("done"), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#121212] border border-[#2A2A2D] rounded-3xl p-6 w-full max-w-[400px] space-y-5"
      >
        {step === "confirm" && (
          <>
            <div className="text-center">
              <Crown size={36} className="text-[#A24BFF] mx-auto mb-3" />
              <h3 className="text-white font-bold text-[20px]">Upgrade to Pro</h3>
              <p className="text-[#6E6E73] text-[14px] mt-1">₹199/month · GST inclusive · Cancel anytime</p>
            </div>

            <div className="bg-[#1C1C1E] rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#A1A1A6]">FounderBridge Pro</span>
                <span className="text-white">₹168.64</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#A1A1A6]">GST (18%)</span>
                <span className="text-white">₹30.36</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold border-t border-[#2A2A2D] pt-2 mt-2">
                <span className="text-white">Total</span>
                <span className="text-white">₹199.00</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#6E6E73] text-[12px]">
              <Shield size={14} className="text-emerald-400" />
              Secured by Razorpay. UPI, cards, net banking accepted.
            </div>

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-full border border-[#2A2A2D] text-[#6E6E73] text-[14px] hover:text-white transition-colors">
                Cancel
              </button>
              <GradientRingButton size="md" className="flex-1" onClick={handlePay}>
                Pay ₹199
              </GradientRingButton>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#A24BFF] border-t-transparent animate-spin mx-auto" />
            <p className="text-white font-semibold">Processing payment…</p>
            <p className="text-[#6E6E73] text-[13px]">Redirecting to Razorpay</p>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8 space-y-4">
            <Sparkles size={48} className="text-[#A24BFF] mx-auto" />
            <p className="text-white font-bold text-[20px]">Welcome to Pro! 🎉</p>
            <p className="text-[#6E6E73] text-[14px]">All Pro features are now unlocked.</p>
            <GradientRingButton size="md" className="w-full" onClick={onClose}>
              Explore Pro Features <ChevronRight size={16} />
            </GradientRingButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main plans page ───────────────────────────────────────────
export default function PlansPage() {
  const [currentPlan] = useState<"free" | "pro">("free");
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}

      <div className="min-h-dvh bg-black">
        {/* Header */}
        <div className="flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
          </div>
        </div>

        <div className="px-4 pb-16 max-w-[430px] mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-white font-bold text-[32px] tracking-tight">Simple Pricing</h1>
            <p className="text-[#6E6E73] text-[15px] mt-2">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="space-y-4">
            {PLANS.map(plan => (
              <PlanCard
                key={plan.key}
                plan={plan}
                current={currentPlan === plan.key}
                onSelect={() => plan.key === "pro" && setShowPayment(true)}
              />
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-8 space-y-4">
            <h2 className="text-white font-bold text-[18px]">Frequently Asked</h2>
            {[
              ["Can I cancel anytime?", "Yes — cancel before your next billing date and you won't be charged."],
              ["Is there a free trial?", "The Free plan is always free. Pro is ₹199/month — start anytime."],
              ["What payment methods?", "UPI (GPay, PhonePe), all debit/credit cards, and net banking via Razorpay."],
              ["Is GST included?", "Yes — ₹199 is GST-inclusive. Your invoice will show ₹168.64 + ₹30.36 GST (18%)."],
            ].map(([q, a]) => (
              <div key={q} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4">
                <p className="text-white font-semibold text-[15px] mb-1">{q}</p>
                <p className="text-[#6E6E73] text-[14px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
