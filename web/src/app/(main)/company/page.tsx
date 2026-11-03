"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, LayoutDashboard, FolderOpen, Edit3,
  Briefcase, Users, ImageIcon, Mail, Settings,
  CheckCircle2, AlertCircle, ExternalLink, Plus, Trash2, Globe
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

// ── Company Initial Data ──────────────────────────────────────
const INITIAL_COMPANY = {
  name: "DeepStack AI",
  slug: "deepstack-ai",
  tagline: "LLM infrastructure for Indian enterprises",
  about: "We build private LLM deployment tooling for Indian SMEs and enterprises — on-premise, multilingual, cost-efficient, and secure.",
  industry: "AI / MLOps",
  foundedYear: 2023,
  location: "Bangalore",
  website: "https://deepstack.ai",
  email: "contact@deepstack.ai",
  phone: "9876543210",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
  verified: true,
  themeId: "brivon",
  isPublished: true,
  stats: { views: 4210, connections: 89, applications: 34, team: 4 },
};

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("preview");
  const [company, setCompany] = useState(INITIAL_COMPANY);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Application Statuses matching PDF Spec (New, Shortlisted, Hired, Rejected)
  const [applications, setApplications] = useState([
    { id: "app-1", name: "Priya Sharma", role: "Senior ML Engineer", status: "New", color: "#38bdf8" },
    { id: "app-2", name: "Rahul Verma", role: "Backend Engineer (Java)", status: "Shortlisted", color: "#A24BFF" },
    { id: "app-3", name: "Ananya Iyer", role: "Product Designer", status: "Hired", color: "#10b981" },
  ]);

  // Projects list
  const [projects, setProjects] = useState([
    { id: "p-1", title: "Indic-LLM Benchmark", status: "Completed", desc: "Open benchmark evaluating multilingual reasoning across 12 Indian languages." },
    { id: "p-2", title: "Private On-Prem RAG Appliance", status: "Ongoing", desc: "Hardware-accelerated private search appliance for banking intranet." },
  ]);

  // Team list
  const [team, setTeam] = useState([
    { id: "t-1", name: "Aarav Reddy", role: "Founder & CTO" },
    { id: "t-2", name: "Dr. Arvind Rao", role: "Chief AI Scientist" },
    { id: "t-3", name: "Sneha Kapur", role: "Head of Product" },
  ]);

  // Validation according to Spec D3
  function validatePublish(): string[] {
    const errors: string[] = [];
    if (!company.name || company.name.trim().length === 0) {
      errors.push("Company Name is required.");
    }
    if (!company.logo) {
      errors.push("Company Logo is mandatory.");
    }
    if (!company.about || company.about.trim().length < 20) {
      errors.push("About text must be at least 20 characters (current: " + (company.about?.length || 0) + ").");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!company.email || !emailRegex.test(company.email)) {
      errors.push("A valid contact email address is required.");
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!company.phone || !phoneRegex.test(company.phone.replace(/[^0-9]/g, "").slice(-10))) {
      errors.push("A valid 10-digit Indian phone number is required.");
    }
    return errors;
  }

  function handleTogglePublish() {
    if (company.isPublished) {
      // Unpublish
      setCompany(prev => ({ ...prev, isPublished: false }));
      return;
    }

    const errors = validatePublish();
    if (errors.length > 0) {
      setPublishErrors(errors);
      setShowErrorModal(true);
      return;
    }

    // Publish successfully
    setCompany(prev => ({ ...prev, isPublished: true }));
    setPublishErrors([]);
  }

  function handleApplicationStatusChange(id: string, newStatus: string) {
    const colorMap: Record<string, string> = {
      New: "#38bdf8",
      Shortlisted: "#A24BFF",
      Hired: "#10b981",
      Rejected: "#ef4444",
    };
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: newStatus, color: colorMap[newStatus] || "#8E8E93" } : app))
    );
  }

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div
        className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-[#1C1C1E]"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-[16px]">{company.name}</p>
              <p className="text-[#6E6E73] text-[12px]">{company.industry}</p>
            </div>

            {/* Publish / Unpublish Toggle Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublish}
                id="btn-publish-company"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all flex items-center gap-1.5",
                  company.isPublished
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-[#A24BFF]/15 border-[#A24BFF]/40 text-[#A24BFF] hover:bg-[#A24BFF]/25"
                )}
              >
                <CheckCircle2 size={13} />
                {company.isPublished ? "Published ✓" : "Publish"}
              </button>
            </div>
          </div>

          {/* Tab bar — scrollable */}
          <div className="flex overflow-x-auto scrollbar-hide gap-0 px-2 pb-0">
            {TABS.map((tab) => (
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
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141416] border border-red-500/30 rounded-3xl p-6 max-w-[400px] w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle size={24} />
                <h3 className="font-bold text-[18px] text-white">Publish Blocked</h3>
              </div>
              <p className="text-[#8E8E93] text-[13px] leading-relaxed">
                Before your company page can be published and visible in Discover, the following mandatory requirements must be fulfilled:
              </p>
              <ul className="space-y-2 bg-[#1C1C20] rounded-2xl p-4 text-[13px] text-red-300">
                {publishErrors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-[14px]"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto w-full">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 1. Preview Tab */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div
                className="rounded-3xl p-6 text-white border border-[#222]"
                style={{ background: "linear-gradient(135deg, #0a0a0c 0%, #1f1a30 100%)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                    DS
                  </div>
                  {company.isPublished ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                      Live on Discover
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#2A2A2E] text-[#8E8E93] text-[11px]">
                      Draft Mode
                    </span>
                  )}
                </div>
                <h2 className="text-[22px] font-bold">{company.name}</h2>
                <p className="text-[#D4FF3A] text-[13px] font-medium uppercase tracking-wider mt-0.5">{company.tagline}</p>
                <p className="text-white/80 text-[14px] leading-relaxed mt-3">{company.about}</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[company.industry, `Est. ${company.foundedYear}`, company.location].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Stable Public URL Link */}
              <Link href={`/c/${company.slug}`} className="block">
                <GradientRingButton size="md" className="w-full flex items-center justify-center gap-2">
                  <Globe size={16} /> View Public Page (/c/{company.slug})
                </GradientRingButton>
              </Link>
            </div>
          )}

          {/* 2. Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Page Views", value: company.stats.views.toLocaleString("en-IN") },
                  { label: "Connections", value: company.stats.connections },
                  { label: "Applications", value: applications.length },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#101012] rounded-2xl p-3.5 border border-[#1E1E22] text-center">
                    <p className="text-white font-bold text-[22px]">{stat.value}</p>
                    <p className="text-[#6E6E73] text-[11px] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  const title = prompt("Enter project title:");
                  if (title) {
                    setProjects(prev => [...prev, { id: "p-" + Date.now(), title, status: "Ongoing", desc: "Newly created project showcase." }]);
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-[#141416] border border-[#222226] text-white hover:border-[#A24BFF] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Project
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.map(p => (
                  <div key={p.id} className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-4 space-y-1.5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-[15px]">{p.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#18181C] text-[#A24BFF] text-[11px] font-medium">{p.status}</span>
                      </div>
                      <p className="text-[#8E8E93] text-[13px] leading-relaxed mt-1">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Edit Page Tab */}
          {activeTab === "editpage" && (
            <div className="space-y-3.5">
              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">Company Name *</p>
                <input
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                />
              </div>

              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">Tagline</p>
                <input
                  value={company.tagline}
                  onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                />
              </div>

              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">About Company (20+ chars) *</p>
                <textarea
                  value={company.about}
                  onChange={(e) => setCompany({ ...company, about: e.target.value })}
                  rows={3}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF] resize-none"
                />
                <p className="text-[11px] text-[#6E6E73] mt-0.5">{company.about.length} characters (min 20)</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Contact Email *</p>
                  <input
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Contact Phone *</p>
                  <input
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Industry</p>
                  <input
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Location</p>
                  <input
                    value={company.location}
                    onChange={(e) => setCompany({ ...company, location: e.target.value })}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
              </div>

              {saveSuccess && (
                <p className="text-emerald-400 text-[13px] text-center">Changes saved successfully!</p>
              )}

              <GradientRingButton
                size="md"
                className="w-full mt-2"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2000);
                }}
              >
                Save Changes
              </GradientRingButton>
            </div>
          )}

          {/* 5. Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-3">
              <button
                onClick={() => alert("Job post modal opened")}
                className="w-full py-2.5 rounded-2xl bg-[#141416] border border-[#222226] text-white hover:border-[#A24BFF] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Post a Job
              </button>
              <div className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22]">
                <p className="text-white font-semibold">Senior ML Engineer</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {["Full-time", "Remote", "₹40–60L"].map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262C] text-[11px] text-[#A1A1A6]">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[#6E6E73] text-[12px] mt-2">12 applications · Posted 3 days ago</p>
              </div>
            </div>
          )}

          {/* 6. Applications Tab (Matching PDF Spec Statuses: New / Shortlisted / Hired / Rejected) */}
          {activeTab === "applications" && (
            <div className="space-y-3">
              <p className="text-[#8E8E93] text-[12px]">Candidate Applications ({applications.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {applications.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] h-full">
                    <Avatar name={a.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-[15px]">{a.name}</p>
                      <p className="text-[#6E6E73] text-[12px]">{a.role}</p>
                    </div>
                    {/* Status Dropdown conforming to PDF Spec */}
                    <select
                      value={a.status}
                      onChange={(e) => handleApplicationStatusChange(a.id, e.target.value)}
                      className="bg-[#18181C] text-white text-[12px] font-semibold border border-[#2A2A2E] rounded-xl px-2.5 py-1.5 outline-none"
                      style={{ color: a.color }}
                    >
                      <option value="New">New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  const name = prompt("Team member name:");
                  const role = prompt("Role:");
                  if (name && role) {
                    setTeam(prev => [...prev, { id: "t-" + Date.now(), name, role }]);
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-[#141416] border border-[#222226] text-white hover:border-[#A24BFF] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Team Member
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {team.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-[#101012] border border-[#1E1E22] rounded-2xl p-3.5 h-full">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="md" />
                      <div>
                        <p className="text-white font-medium text-[14px]">{m.name}</p>
                        <p className="text-[#6E6E73] text-[12px]">{m.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTeam(prev => prev.filter(x => x.id !== m.id))}
                      className="text-[#6E6E73] hover:text-red-400 p-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Photos Tab */}
          {activeTab === "photos" && (
            <div className="space-y-3">
              <p className="text-[#8E8E93] text-[12px]">Company Photos & Gallery (tap to open full lightbox)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&auto=format&fit=crop&q=80"
                ].map((src, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-[#222] bg-[#141416]">
                    <img src={src} alt="Office" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Mail Tab */}
          {activeTab === "mail" && (
            <div className="space-y-3">
              <p className="text-[#8E8E93] text-[12px]">Outbound Announcements & Updates</p>
              <div className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-4 space-y-3">
                <input placeholder="Subject line" className="w-full bg-[#18181C] text-white rounded-xl px-3 py-2 text-[13px] border border-[#26262C] outline-none" />
                <textarea rows={3} placeholder="Campaign message…" className="w-full bg-[#18181C] text-white rounded-xl px-3 py-2 text-[13px] border border-[#26262C] outline-none resize-none" />
                <GradientRingButton size="sm" className="w-full">Send Update</GradientRingButton>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
