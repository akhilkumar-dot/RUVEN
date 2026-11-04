"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, UserCheck } from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between">
        <Link href="/sign-up" className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-[14px]">
          <ArrowLeft size={16} /> Back to Sign Up
        </Link>
        <div className="flex items-center gap-2">
          <BridgeLogo size={16} />
          <span className="text-[13px] font-semibold text-white">Ruven Privacy</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[720px] w-full mx-auto px-5 py-8 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[12px] font-semibold">
            <ShieldCheck size={14} /> Compliant with Digital Personal Data Protection Act, 2023 (India)
          </div>
          <h1 className="text-[30px] font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-[#8E8E93] text-[14px]">Last revised: November 3, 2026 · Committed to zero data leakage</p>
        </div>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <Lock size={16} className="text-[#A24BFF]" /> 1. Data Collection & Purpose
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            We collect personal identification information including your full name, email address, phone number, professional experience, and enterprise details strictly to enable networking, co-founder discovery, hiring, and investment matching on Ruven.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <EyeOff size={16} className="text-[#A24BFF]" /> 2. Contact Privacy & Phone/Email Masking
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            Your raw email address and phone number are <strong>never exposed</strong> in public API responses or discoverable profile cards to unverified strangers or non-connections.
            All direct communications and inquiries happen through end-to-end authenticated in-app messaging or mutual consent introductions.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
            <UserCheck size={16} className="text-[#A24BFF]" /> 3. Data Subject Rights & Deletion
          </h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            Under India&apos;s DPDP Act 2023, you hold the absolute right to access your stored data, request data export, rectify outdated particulars, and request permanent erasure of your account and associated assets at any time by contacting our designated Data Protection Officer.
          </p>
        </section>

        <section className="space-y-3 bg-[#101012] p-5 rounded-2xl border border-[#1E1E22]">
          <h2 className="text-[18px] font-semibold text-white">4. Grievance Redressal</h2>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed">
            Grievance Officer: <strong>Ruven Compliance Officer</strong><br />
            Ruven Technologies Private Limited<br />
            Indiranagar, Bengaluru, Karnataka 560038<br />
            Email: <span className="text-[#D4FF3A]">grievance@ruven.in</span>
          </p>
        </section>

        <div className="pt-4 border-t border-[#1C1C1E] flex items-center justify-between text-[13px] text-[#6E6E73]">
          <span>© 2026 Ruven Technologies Pvt. Ltd.</span>
          <Link href="/terms" className="text-[#A24BFF] hover:underline">
            Read Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
