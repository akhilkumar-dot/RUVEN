"use client";

import { use } from "react";
import Link from "next/link";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Users,
  ShieldCheck,
  Share2,
  ArrowLeft
} from "lucide-react";

interface PublicCompanyProps {
  params: Promise<{ slug: string }>;
}

export default function PublicCompanyPage({ params }: PublicCompanyProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const company = {
    name: slug === "deepstack-ai" ? "DeepStack AI" : slug.replace(/-/g, " ").toUpperCase(),
    slug: slug,
    tagline: "LLM infrastructure for Indian enterprises",
    about: "We build private LLM deployment tooling for Indian SMEs and enterprises — on-premise, multilingual, cost-efficient, and secure.",
    industry: "AI / MLOps",
    foundedYear: 2023,
    location: "Bengaluru, Karnataka",
    website: `https://${slug}.in`,
    email: `contact@${slug}.in`,
    phone: "+91 98765 43210",
    verified: true,
    stats: { views: 4210, jobs: 2, team: 6 },
  };

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-[14px]">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: company.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#A1A1A6] hover:text-white"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-[600px] w-full mx-auto px-4 py-6 space-y-6">
        <div
          className="rounded-3xl p-6 relative overflow-hidden border border-[#222]"
          style={{ background: "linear-gradient(135deg, #0e0e12 0%, #1a162b 100%)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold">
              {company.name.slice(0, 2)}
            </div>
            {company.verified && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A24BFF]/15 border border-[#A24BFF]/30 text-[#A24BFF] text-[12px] font-semibold">
                <ShieldCheck size={14} /> Verified Entity
              </span>
            )}
          </div>

          <h1 className="text-[26px] font-bold text-white mt-4">{company.name}</h1>
          <p className="text-[#D4FF3A] text-[14px] font-medium tracking-wide mt-1">{company.tagline}</p>
          <p className="text-[#B3B3BA] text-[14px] leading-relaxed mt-3">{company.about}</p>

          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">{company.industry}</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">Est. {company.foundedYear}</span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">
              <MapPin size={11} /> {company.location}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-5 space-y-3">
          <h2 className="text-[14px] font-bold text-[#8E8E93] uppercase tracking-wider">Contact & Registration</h2>
          <div className="space-y-2 text-[14px]">
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#A24BFF] hover:underline">
              <Globe size={15} /> {company.website}
            </a>
            <p className="flex items-center gap-2 text-[#A1A1A6]">
              <Mail size={15} /> {company.email}
            </p>
            <p className="flex items-center gap-2 text-[#A1A1A6]">
              <Phone size={15} /> {company.phone}
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-5 space-y-4">
          <h2 className="text-[14px] font-bold text-[#8E8E93] uppercase tracking-wider">Open Positions ({company.stats.jobs})</h2>
          <div className="bg-[#18181C] border border-[#26262C] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-[15px]">Senior ML Engineer</p>
              <p className="text-[#8E8E93] text-[12px]">Full-time · Remote · ₹40–60L</p>
            </div>
            <GradientRingButton size="sm">Apply</GradientRingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
