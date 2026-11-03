"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Users, Building2, TrendingUp, Briefcase } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";

// ── Discover tabs ─────────────────────────────────────────────
const DISCOVER_TABS = [
  { key: "people",    label: "People",    icon: <Users size={14} /> },
  { key: "companies", label: "Companies", icon: <Building2 size={14} /> },
  { key: "investors", label: "Investors", icon: <TrendingUp size={14} /> },
  { key: "jobs",      label: "Jobs",      icon: <Briefcase size={14} /> },
];

// ── Mock data ─────────────────────────────────────────────────
const PEOPLE = [
  { handle: "priya_sharma",    headline: "Co-founder @ Sattva Health · Ex-Apollo",        type: "STARTUP_FOUNDER", connections: 342 },
  { handle: "rahul_verma",     headline: "CTO @ Finovo · IIT-Delhi CS '19",               type: "STARTUP_FOUNDER", connections: 218 },
  { handle: "ananya_iyer",     headline: "ML Engineer · Open to opportunities",            type: "INDIVIDUAL",      connections: 97  },
  { handle: "vikram_mehta",    headline: "CEO @ Konnect Logistics · B2B SaaS",            type: "COMPANY_OWNER",   connections: 785 },
  { handle: "sneha_patel",     headline: "Product Designer · Building in public",         type: "INDIVIDUAL",      connections: 156 },
  { handle: "rohan_das",       headline: "Founder & CEO @ AgriStack · Rural fintech",     type: "STARTUP_FOUNDER", connections: 422 },
];

const COMPANIES = [
  { name: "DeepStack AI",    slug: "deepstack-ai",  tagline: "LLM infra for Indian SMEs",       industry: "AI/ML",    founded: 2023 },
  { name: "Sattva Health",   slug: "sattva-health", tagline: "Preventive care at scale",         industry: "Healthtech",founded: 2022 },
  { name: "Finovo",          slug: "finovo",         tagline: "Embedded finance for SMBs",        industry: "Fintech",  founded: 2021 },
  { name: "AgriStack",       slug: "agristack",      tagline: "Connecting farmers to markets",    industry: "Agritech", founded: 2022 },
  { name: "Konnect Logistics",slug:"konnect",        tagline: "B2B supply chain for Bharat",     industry: "Logistics",founded: 2020 },
];

const INVESTORS = [
  { handle: "arjun_vc",   firm: "Blume Ventures",      thesis: "Pre-seed / Seed · Enterprise & Consumer",  ticketSize: "₹1–5 Cr" },
  { handle: "meera_angel",firm: "Solo Angel",           thesis: "D2C, Healthtech, Edtech",                  ticketSize: "₹25–75L" },
  { handle: "sid_kapoor",  firm: "Matrix Partners IN",  thesis: "Series A/B · Deep tech, SaaS",            ticketSize: "₹5–25 Cr" },
];

const JOBS = [
  { title: "Senior ML Engineer",      company: "DeepStack AI",  location: "Bangalore / Remote", salaryRange: "₹40–60L", type: "Full-time" },
  { title: "Backend Engineer (Java)",  company: "Finovo",         location: "Hyderabad",         salaryRange: "₹30–45L", type: "Full-time" },
  { title: "Product Designer",         company: "Sattva Health",  location: "Mumbai",            salaryRange: "₹20–35L", type: "Full-time" },
  { title: "Growth Intern",            company: "AgriStack",      location: "Remote",            salaryRange: "₹15K/mo", type: "Internship" },
];

// ── Person card ───────────────────────────────────────────────
function PersonCard({ person }: { person: (typeof PEOPLE)[0] }) {
  const [connected, setConnected] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4"
    >
      <Avatar name={person.handle} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[15px] leading-tight">@{person.handle}</p>
        <p className="text-[#6E6E73] text-[12px] leading-snug mt-0.5 truncate">{person.headline}</p>
        <p className="text-[#A24BFF] text-[11px] mt-1">{person.connections} connections</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setConnected(v => !v)}
        className={cn(
          "px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors border",
          connected
            ? "border-[#2A2A2D] text-[#6E6E73] bg-transparent"
            : "border-[#A24BFF] text-[#A24BFF] bg-[#A24BFF]/10 hover:bg-[#A24BFF]/20"
        )}
      >
        {connected ? "Connected" : "Connect"}
      </motion.button>
    </motion.div>
  );
}

// ── Company card ──────────────────────────────────────────────
function CompanyCard({ co }: { co: (typeof COMPANIES)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4"
    >
      <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] flex items-center justify-center text-white font-bold text-[16px] shrink-0">
        {co.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[15px]">{co.name}</p>
        <p className="text-[#6E6E73] text-[13px] truncate">{co.tagline}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[co.industry, `Est. ${co.founded}`].map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Investor card ─────────────────────────────────────────────
function InvestorCard({ inv }: { inv: (typeof INVESTORS)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={inv.handle} size="md" />
        <div>
          <p className="text-white font-semibold text-[15px]">@{inv.handle}</p>
          <p className="text-[#A24BFF] text-[12px]">{inv.firm}</p>
        </div>
      </div>
      <p className="text-[#A1A1A6] text-[13px] leading-snug">{inv.thesis}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="px-3 py-1 rounded-full bg-[#A24BFF]/10 border border-[#A24BFF]/30 text-[#A24BFF] text-[12px] font-semibold">
          {inv.ticketSize}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="px-4 py-1.5 rounded-full border border-[#A24BFF] text-[#A24BFF] text-[13px] font-semibold hover:bg-[#A24BFF]/10"
        >
          Request Intro
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Job card ──────────────────────────────────────────────────
function JobCard({ job }: { job: (typeof JOBS)[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4"
    >
      <p className="text-white font-semibold text-[16px]">{job.title}</p>
      <p className="text-[#A24BFF] text-[13px]">{job.company}</p>
      <div className="flex gap-2 mt-2 flex-wrap">
        {[job.location, job.salaryRange, job.type].map(t => (
          <span key={t} className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">{t}</span>
        ))}
      </div>
      <GradientRingButton size="sm" className="w-full mt-3">Apply Now</GradientRingButton>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("people");
  const [query, setQuery] = useState("");
  const [navTab, setNavTab] = useState("discover");

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 max-w-[430px] mx-auto w-full">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people, companies, investors…"
            className="w-full bg-[#1C1C1E] text-white rounded-full pl-10 pr-12 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] transition-colors"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-white" aria-label="Filters">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Discover sub-tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 pb-2 max-w-[430px] mx-auto w-full">
        {DISCOVER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shrink-0",
              activeTab === t.key
                ? "bg-[#A24BFF] text-white"
                : "bg-[#1C1C1E] text-[#6E6E73] hover:text-white border border-[#2A2A2D]"
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-4 py-2 max-w-[430px] mx-auto space-y-3">
          {activeTab === "people"    && PEOPLE.map(p    => <PersonCard   key={p.handle} person={p} />)}
          {activeTab === "companies" && COMPANIES.map(c  => <CompanyCard  key={c.slug} co={c} />)}
          {activeTab === "investors" && INVESTORS.map(i  => <InvestorCard key={i.handle} inv={i} />)}
          {activeTab === "jobs"      && JOBS.map((j, i)  => <JobCard      key={i} job={j} />)}
        </div>
      </main>

      <BottomDock
        activeTab={navTab}
        tabs={[{ key: "discover", label: "Discover" }]}
        onTabChange={setNavTab}
        userName="Aarav Reddy"
      />
    </div>
  );
}
