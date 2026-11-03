"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, LayoutDashboard, FolderOpen, Edit3,
  Briefcase, Users, ImageIcon, Mail, Settings
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { key: "preview",      label: "Preview",     icon: <Eye size={15} /> },
  { key: "dashboard",    label: "Dashboard",   icon: <LayoutDashboard size={15} /> },
  { key: "projects",     label: "Projects",    icon: <FolderOpen size={15} /> },
  { key: "editpage",     label: "Edit Page",   icon: <Edit3 size={15} /> },
  { key: "jobs",         label: "Jobs",        icon: <Briefcase size={15} /> },
  { key: "applications", label: "Applications",icon: <Users size={15} /> },
  { key: "team",         label: "Team",        icon: <Users size={15} /> },
  { key: "photos",       label: "Photos",      icon: <ImageIcon size={15} /> },
  { key: "mail",         label: "Mail",        icon: <Mail size={15} /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Mock company data ─────────────────────────────────────────
const MOCK = {
  name: "DeepStack AI",
  slug: "deepstack-ai",
  tagline: "LLM infrastructure for Indian enterprises",
  description: "We build private LLM deployment tooling for Indian SMEs and enterprises — on-premise, multilingual, cost-efficient.",
  industry: "AI / MLOps",
  foundedYear: 2023,
  location: "Bangalore",
  website: "https://deepstack.ai",
  verified: false,
  themeId: "brivon",
  stats: { views: 4210, connections: 89, applications: 34 },
};

// ── Panel components ──────────────────────────────────────────
function PreviewPanel() {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #0a0a0c 0%, #2c3a00 100%)" }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
            DS
          </div>
          <div>
            <h2 className="text-[22px] font-bold">{MOCK.name}</h2>
            <p className="text-[#d4ff3a] text-[13px] uppercase tracking-widest">{MOCK.tagline}</p>
          </div>
        </div>
        <p className="text-white/80 text-[15px] leading-relaxed">{MOCK.description}</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          {[MOCK.industry, `Est. ${MOCK.foundedYear}`, MOCK.location].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">{tag}</span>
          ))}
        </div>
      </div>
      <GradientRingButton size="md" className="w-full">Visit Company Page</GradientRingButton>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Page Views", value: MOCK.stats.views.toLocaleString("en-IN") },
        { label: "Connections", value: MOCK.stats.connections },
        { label: "Applications", value: MOCK.stats.applications },
      ].map(stat => (
        <div key={stat.label} className="bg-[#121212] rounded-2xl p-4 border border-[#1C1C1E] text-center">
          <p className="text-white font-bold text-[24px]">{stat.value}</p>
          <p className="text-[#6E6E73] text-[12px] mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function EditPagePanel() {
  const fields = [
    { label: "Company Name", value: MOCK.name },
    { label: "Tagline", value: MOCK.tagline },
    { label: "Industry", value: MOCK.industry },
    { label: "Founded Year", value: String(MOCK.foundedYear) },
    { label: "Location", value: MOCK.location },
    { label: "Website", value: MOCK.website },
  ];
  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.label}>
          <p className="text-[#6E6E73] text-[12px] mb-1">{f.label}</p>
          <input defaultValue={f.value}
            className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[15px] border border-[#2A2A2D] outline-none focus:border-[#A24BFF]"
          />
        </div>
      ))}
      {/* Theme selector */}
      <div>
        <p className="text-[#6E6E73] text-[12px] mb-2">Page Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {["Classic Midnight","Pink Noir","Neon Studio","Aurora Slides","Editorial Cream","Emerald Split"].map((name, i) => (
            <button key={name}
              className={cn(
                "rounded-xl p-3 border text-[12px] text-center transition-colors",
                i === 2
                  ? "border-[#A24BFF] bg-[#A24BFF]/10 text-white"
                  : "border-[#2A2A2D] bg-[#1C1C1E] text-[#6E6E73] hover:border-[#444]"
              )}
            >
              {i === 0 ? "🆓 " : ""}{name}
            </button>
          ))}
        </div>
      </div>
      <GradientRingButton size="md" className="w-full mt-2">Save Changes</GradientRingButton>
    </div>
  );
}

function JobsPanel() {
  return (
    <div className="space-y-3">
      <GradientRingButton size="sm" className="w-full">+ Post a Job</GradientRingButton>
      <div className="bg-[#121212] rounded-2xl p-4 border border-[#1C1C1E]">
        <p className="text-white font-semibold">Senior ML Engineer</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {["Full-time", "Remote", "₹40–60L"].map(t => (
            <span key={t} className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">{t}</span>
          ))}
        </div>
        <p className="text-[#6E6E73] text-[12px] mt-2">12 applications · Posted 3 days ago</p>
      </div>
    </div>
  );
}

function ApplicationsPanel() {
  const apps = [
    { name: "Priya Sharma", role: "Senior ML Engineer", status: "REVIEWING", color: "#5E9C8A" },
    { name: "Rahul Verma",  role: "Senior ML Engineer", status: "APPLIED",   color: "#D8BF4A" },
    { name: "Ananya Iyer",  role: "Senior ML Engineer", status: "SHORTLISTED", color: "#A24BFF" },
  ];
  return (
    <div className="space-y-3">
      {apps.map(a => (
        <div key={a.name} className="flex items-center gap-3 bg-[#121212] rounded-2xl p-4 border border-[#1C1C1E]">
          <Avatar name={a.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px]">{a.name}</p>
            <p className="text-[#6E6E73] text-[12px]">{a.role}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: a.color + "20", color: a.color }}>
            {a.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Settings size={32} className="text-[#2A2A2D]" />
      <p className="text-[#6E6E73] text-[15px]">{label} coming soon</p>
    </div>
  );
}

// ── Main company page ─────────────────────────────────────────
export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("preview");

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-[#1C1C1E]"
           style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-[16px]">{MOCK.name}</p>
            <p className="text-[#6E6E73] text-[12px]">{MOCK.industry}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <Settings size={16} className="text-[#A1A1A6]" />
          </div>
        </div>

        {/* Tab bar — scrollable */}
        <div className="flex overflow-x-auto scrollbar-hide gap-0 px-2 pb-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-[#A24BFF] text-white"
                  : "border-transparent text-[#6E6E73] hover:text-[#A1A1A6]"
              )}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-w-[430px] mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "preview"      && <PreviewPanel />}
          {activeTab === "dashboard"    && <DashboardPanel />}
          {activeTab === "editpage"     && <EditPagePanel />}
          {activeTab === "jobs"         && <JobsPanel />}
          {activeTab === "applications" && <ApplicationsPanel />}
          {activeTab === "projects"     && <PlaceholderPanel label="Projects" />}
          {activeTab === "team"         && <PlaceholderPanel label="Team management" />}
          {activeTab === "photos"       && <PlaceholderPanel label="Photo gallery" />}
          {activeTab === "mail"         && <PlaceholderPanel label="Mail campaigns" />}
        </motion.div>
      </div>
    </div>
  );
}
