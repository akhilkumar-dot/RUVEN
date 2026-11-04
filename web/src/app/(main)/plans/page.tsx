"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Star, ArrowLeft, Mail } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";

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
      "Send connection requests",
      "Post in the feed",
      "1 company page",
      "Join meetups",
    ],
    locked: [
      "Priority in search results",
      "Analytics dashboard",
      "Workspace documents (unlimited)",
      "Direct investor introductions",
      "Verified founder badge",
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
      "Priority in Discover results",
      "Analytics: profile & company views",
      "Workspace documents (unlimited)",
      "Direct investor introductions",
      "Verified entity badge",
      "Early access to new features",
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

export default function PlansPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Home
        </Link>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <BridgeLogo size={18} strokeColor="#000" accentColor="#000" />
        </div>
      </div>

      <div className="px-4 py-8 pb-16 w-full">
        <div className="text-center mb-10">
          <h1 className="text-white font-bold text-3xl tracking-tight">Pricing</h1>
          <p className="text-[#8E8E93] text-sm mt-2">
            Simple plans for the ecosystem.
          </p>
        </div>

        <div className="flex flex-col gap-6 mb-12">
          {PLANS.map((plan) => {
            const isPro = plan.key === "pro";
            return (
              <motion.div
                key={plan.key}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "relative rounded-2xl p-6 border flex flex-col justify-between",
                  isPro
                    ? "border-[#A24BFF] bg-gradient-to-br from-[#A24BFF]/10 to-[#FF3D81]/5 shadow-xl shadow-[#A24BFF]/5"
                    : "border-[#1C1C1E] bg-[#0C0C0C]"
                )}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A24BFF] to-[#FF3D81] text-white text-[11px] font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ color: plan.color }}>{plan.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                      <p className="text-[#8E8E93] text-xs">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {plan.price === 0 ? (
                      <p className="text-white font-bold text-3xl">₹0</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <p className="text-white font-bold text-3xl">₹199</p>
                        <p className="text-[#8E8E93] text-sm">/mo</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <FeatureRow key={f} text={f} included />
                    ))}
                    {plan.locked.map((f) => (
                      <FeatureRow key={f} text={f} included={false} />
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                {plan.key === "free" ? (
                  <div className="w-full py-3 rounded-full border border-[#2A2A2D] text-[#6E6E73] text-sm text-center font-medium">
                    Current Plan
                  </div>
                ) : (
                  <a
                    href={`mailto:team@ruven.in?subject=Ruven%20Pro%20Upgrade%20Inquiry&body=Hi%20Ruven%20Team,%0A%0AI'd%20like%20to%20inquire%20about%20upgrading%20to%20Ruven%20Pro.%0AUser%20Handle:%20@${user?.userHandle || "user"}`}
                    className="block w-full"
                  >
                    <GradientRingButton size="md" className="w-full flex items-center justify-center gap-2">
                      <Mail size={15} /> Inquire for Pro
                    </GradientRingButton>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xl text-center">
            FAQ
          </h2>
          <div className="flex flex-col gap-4">
            {[
              ["Can I cancel anytime?", "Yes — subscriptions can be cancelled before your next monthly cycle."],
              ["Is there a free trial?", "The Free plan has all core networking features enabled."],
              ["What payments?", "UPI, debit/credit cards, and net banking."],
              ["Is GST included?", "Yes — fee is inclusive of 18% GST."],
            ].map(([q, a]) => (
              <div key={q} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4">
                <p className="text-white font-semibold text-sm mb-1">{q}</p>
                <p className="text-[#8E8E93] text-xs leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
