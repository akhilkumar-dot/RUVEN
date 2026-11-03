"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2 } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between">
        <Link href="/sign-up" className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-[14px]">
          <ArrowLeft size={16} /> Back to Sign Up
        </Link>
        <div className="flex items-center gap-2">
          <BridgeLogo size={16} />
          <span className="text-[13px] font-semibold text-white">FounderBridge Legal</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[720px] w-full mx-auto px-5 py-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A24BFF]/10 text-[#A24BFF] border border-[#A24BFF]/20 text-[12px] font-semibold">
            <Scale size={14} /> Governing Law: Information Technology Act, 2000 (India)
          </div>
          <h1 className="text-[30px] font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="text-[#8E8E93] text-[14px]">Last revised: November 3, 2026 · Effective immediately for all users</p>
        </div>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#D4FF3A]" /> 1. Account Types & Eligibility
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            FounderBridge accommodates four distinct user roles: <strong>Startup Founder</strong>, <strong>Company Owner</strong>, <strong>Individual</strong>, and <strong>Investor</strong>.
            Users may register exactly one account type per verified identity. Falsification of entity ownership, unauthorized impersonation, or misrepresenting accreditation status will result in immediate termination.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#D4FF3A]" /> 2. Content Ownership & Confidentiality
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            All pitch decks, intellectual property, ideas, and workspace documents authored by you remain your exclusive property.
            By posting in public directories (Discover, Founders Hub, Ideas Feed), you grant FounderBridge a non-exclusive license to index and display your publicly shared snippets.
            Private workspaces and direct messages are strictly confidential and protected by Row-Level Security.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#D4FF3A]" /> 3. Verification & Pro Subscription
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            FounderBridge Pro includes verified identity badges, advanced portfolio layouts, and priority discovery ranking.
            Subscriptions are billed through authorized Indian payment gateways (Razorpay / UPI / Cards).
            You may cancel at any time via your account settings; recurring charges will discontinue at the conclusion of the active billing cycle.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#D4FF3A]" /> 4. Jurisdiction & Dispute Resolution
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            These terms are governed by the laws of the Republic of India. Any legal dispute, arbitration, or statutory claim arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
          </p>
        </section>

        <div className="pt-4 border-t border-[#1C1C1E] flex items-center justify-between text-[13px] text-[#6E6E73]">
          <span>© 2026 FounderBridge Technologies Pvt. Ltd.</span>
          <Link href="/privacy" className="text-[#A24BFF] hover:underline">
            Read Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
