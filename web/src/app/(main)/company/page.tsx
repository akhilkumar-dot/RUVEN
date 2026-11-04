"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  LayoutDashboard,
  Edit3,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Globe,
  Building2,
  Save,
  Check,
  X,
} from "lucide-react";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService } from "@/lib/api/dataService";

const TABS = [
  { key: "preview", label: "Preview", icon: <Eye size={15} /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
  { key: "editpage", label: "Edit Page", icon: <Edit3 size={15} /> },
  { key: "jobs", label: "Jobs", icon: <Briefcase size={15} /> },
  { key: "applications", label: "Applications", icon: <Users size={15} /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  industry?: string | null;
  founded_year?: number | null;
  location?: string | null;
  website?: string | null;
  status: string;
  verified: boolean;
}

interface JobData {
  id: string;
  title: string;
  role_type?: string | null;
  location?: string | null;
  description?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  status: string;
  created_at: string;
}

interface ApplicationData {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_note?: string | null;
  status: string;
  created_at: string;
  job?: { title: string } | null;
  applicant?: {
    id: string;
    name: string;
    user_handle: string;
    avatar_url?: string | null;
    type: string;
  } | null;
}

function PostJobModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: (job: JobData) => void;
}) {
  const [title, setTitle] = useState("");
  const [roleType, setRoleType] = useState("FULL_TIME");
  const [location, setLocation] = useState("Remote");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await dataService.createJob(companyId, {
        title: title.trim(),
        role_type: roleType,
        location: location.trim(),
        description: description.trim() || undefined,
      });
      onCreated(created as JobData);
      onClose();
    } catch (err) {
      console.error("Failed to post job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#141416] border border-[#2A2A2E] rounded-3xl p-6 max-w-[440px] w-full space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Post a Job Opening</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs text-[#8E8E93] mb-1 block">Job Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-[#1C1C1E] text-white rounded-xl px-3.5 py-2.5 text-sm border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full bg-[#1C1C1E] text-white rounded-xl px-3 py-2 text-xs border border-[#2A2A2E] outline-none"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore / Remote"
                className="w-full bg-[#1C1C1E] text-white rounded-xl px-3 py-2 text-xs border border-[#2A2A2E] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8E8E93] mb-1 block">Job Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe requirements, tech stack, and what makes this role unique…"
              className="w-full bg-[#1C1C1E] text-white rounded-xl px-3.5 py-2 text-xs border border-[#2A2A2E] outline-none focus:border-[#A24BFF] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="w-full py-2.5 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? "Publishing…" : "Publish Job"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function CompanyPage() {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<TabKey>("preview");
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formName, setFormName] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIndustry, setFormIndustry] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCompanyData() {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await dataService.fetchOwnerCompany(user.id);
        if (isMounted) {
          if (res && res.company) {
            const c = res.company as CompanyData;
            setCompany(c);
            setFormName(c.name || "");
            setFormTagline(c.tagline || "");
            setFormDescription(c.description || "");
            setFormIndustry(c.industry || "");
            setFormLocation(c.location || "");
            setFormWebsite(c.website || "");
            setJobs((res.jobs || []) as JobData[]);
            setApplications((res.applications || []) as unknown as ApplicationData[]);
          } else {
            setCompany(null);
          }
        }
      } catch (err) {
        console.error("Failed to load company:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCompanyData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSaveCompany = async () => {
    if (!user?.id || !formName.trim() || saving) return;
    setSaving(true);
    try {
      const saved = await dataService.saveCompany(user.id, {
        id: company?.id,
        name: formName.trim(),
        tagline: formTagline.trim() || null,
        description: formDescription.trim() || null,
        industry: formIndustry.trim() || null,
        location: formLocation.trim() || null,
        website: formWebsite.trim() || null,
      });
      setCompany(saved as CompanyData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save company:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!user?.id || !company) return;

    if (company.status === "PUBLISHED") {
      try {
        const updated = await dataService.saveCompany(user.id, {
          id: company.id,
          status: "DRAFT",
        });
        setCompany(updated as CompanyData);
      } catch (err) {
        console.error("Failed to unpublish company:", err);
      }
      return;
    }

    const errors: string[] = [];
    if (!company.name || company.name.trim().length === 0) {
      errors.push("Company Name is required.");
    }
    if (!company.description || company.description.trim().length < 20) {
      errors.push("About / Description must be at least 20 characters.");
    }
    if (!company.website) {
      errors.push("A valid website is required.");
    }

    if (errors.length > 0) {
      setPublishErrors(errors);
      setShowErrorModal(true);
      return;
    }

    try {
      const updated = await dataService.saveCompany(user.id, {
        id: company.id,
        status: "PUBLISHED",
      });
      setCompany(updated as CompanyData);
      setPublishErrors([]);
    } catch (err) {
      console.error("Failed to publish company:", err);
    }
  };

  const handleApplicationStatusChange = async (appId: string, newStatus: string) => {
    try {
      await dataService.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If user hasn't created a company yet, show the registration screen
  if (!company) {
    return (
      <div className="min-h-dvh bg-black text-white px-4 py-8">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#141416] border border-[#2A2A2E] flex items-center justify-center mx-auto text-[#A24BFF] mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-2xl font-bold">Register Your Company Page</h1>
            <p className="text-sm text-[#8E8E93]">
              Showcase your startup to founders, hire talent, and connect with verified investors.
            </p>
          </div>

          <div className="bg-[#101012] border border-[#1E1E22] rounded-3xl p-6 space-y-4">
            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Company Name *</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Sarvam AI"
                className="w-full bg-[#18181C] text-white rounded-xl px-4 py-2.5 text-sm border border-[#26262C] outline-none focus:border-[#A24BFF]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Tagline</label>
              <input
                value={formTagline}
                onChange={(e) => setFormTagline(e.target.value)}
                placeholder="e.g. Foundational AI models for India"
                className="w-full bg-[#18181C] text-white rounded-xl px-4 py-2.5 text-sm border border-[#26262C] outline-none focus:border-[#A24BFF]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Description * (min 20 chars)</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Tell the ecosystem what you are building…"
                className="w-full bg-[#18181C] text-white rounded-xl px-4 py-2.5 text-sm border border-[#26262C] outline-none focus:border-[#A24BFF] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#8E8E93] mb-1 block">Industry</label>
                <input
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="e.g. AI / FinTech"
                  className="w-full bg-[#18181C] text-white rounded-xl px-3 py-2 text-xs border border-[#26262C] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8E8E93] mb-1 block">Location</label>
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-[#18181C] text-white rounded-xl px-3 py-2 text-xs border border-[#26262C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8E8E93] mb-1 block">Website</label>
              <input
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full bg-[#18181C] text-white rounded-xl px-4 py-2.5 text-sm border border-[#26262C] outline-none focus:border-[#A24BFF]"
              />
            </div>

            <button
              onClick={handleSaveCompany}
              disabled={!formName.trim() || saving}
              className="w-full py-3 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Creating Company…" : "Create Company Page"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPublished = company.status === "PUBLISHED";

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
              <p className="text-[#6E6E73] text-[12px]">{company.industry || "Startup"}</p>
            </div>

            {/* Publish / Unpublish Toggle Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublish}
                id="btn-publish-company"
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all flex items-center gap-1.5",
                  isPublished
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-[#A24BFF]/15 border-[#A24BFF]/40 text-[#A24BFF] hover:bg-[#A24BFF]/25"
                )}
              >
                <CheckCircle2 size={13} />
                {isPublished ? "Published ✓" : "Publish"}
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto scrollbar-hide gap-0 px-2 pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors",
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
                Before your company page can be published and visible in Discover, please complete the required fields:
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

      {/* Post Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <PostJobModal
            companyId={company.id}
            onClose={() => setShowJobModal(false)}
            onCreated={(newJob) => setJobs((prev) => [newJob, ...prev])}
          />
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
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  {isPublished ? (
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
                {company.tagline && (
                  <p className="text-[#D4FF3A] text-[13px] font-medium tracking-wider mt-0.5">
                    {company.tagline}
                  </p>
                )}
                {company.description && (
                  <p className="text-white/80 text-[14px] leading-relaxed mt-3">
                    {company.description}
                  </p>
                )}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {company.industry && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[12px]">
                      {company.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Public URL Link */}
              {isPublished ? (
                <Link href={`/c/${company.slug}`} className="block">
                  <GradientRingButton size="md" className="w-full flex items-center justify-center gap-2">
                    <Globe size={16} /> View Public Page (/c/{company.slug})
                  </GradientRingButton>
                </Link>
              ) : (
                <div className="p-4 rounded-2xl bg-[#141416] border border-[#222226] text-center text-xs text-[#8E8E93]">
                  Publish your company page to make it viewable at{" "}
                  <span className="text-white font-mono">/c/{company.slug}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] text-center">
                  <p className="text-white font-bold text-2xl">{jobs.length}</p>
                  <p className="text-[#6E6E73] text-xs mt-1">Active Jobs</p>
                </div>
                <div className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] text-center">
                  <p className="text-white font-bold text-2xl">{applications.length}</p>
                  <p className="text-[#6E6E73] text-xs mt-1">Applications</p>
                </div>
                <div className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] text-center">
                  <p className="text-white font-bold text-2xl">{isPublished ? "Live" : "Draft"}</p>
                  <p className="text-[#6E6E73] text-xs mt-1">Status</p>
                </div>
                <div className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] text-center">
                  <p className="text-white font-bold text-2xl">
                    {company.verified ? "Yes" : "No"}
                  </p>
                  <p className="text-[#6E6E73] text-xs mt-1">Verified Entity</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Edit Page Tab */}
          {activeTab === "editpage" && (
            <div className="space-y-3.5 max-w-2xl">
              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">Company Name *</p>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                />
              </div>

              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">Tagline</p>
                <input
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                />
              </div>

              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">About Company (20+ chars) *</p>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF] resize-none"
                />
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  {formDescription.length} characters (min 20)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Industry</p>
                  <input
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
                <div>
                  <p className="text-[#8E8E93] text-[12px] mb-1">Location</p>
                  <input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#121214] text-white rounded-xl px-3 py-2 text-[13px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                  />
                </div>
              </div>

              <div>
                <p className="text-[#8E8E93] text-[12px] mb-1">Website URL *</p>
                <input
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-[#121214] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#222226] outline-none focus:border-[#A24BFF]"
                />
              </div>

              {saveSuccess && (
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <Check size={14} /> Changes saved successfully!
                </p>
              )}

              <button
                onClick={handleSaveCompany}
                disabled={saving || !formName.trim()}
                className="w-full py-2.5 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* 4. Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-3">
              <button
                onClick={() => setShowJobModal(true)}
                className="w-full py-2.5 rounded-2xl bg-[#141416] border border-[#222226] text-white hover:border-[#A24BFF] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Post a Job
              </button>

              {jobs.length === 0 ? (
                <div className="p-8 text-center text-[#8E8E93] bg-[#101012] border border-[#1E1E22] rounded-2xl">
                  <p className="text-sm">No job openings posted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((j) => (
                    <div
                      key={j.id}
                      className="bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{j.title}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262C] text-[11px] text-[#A1A1A6]">
                              {j.role_type || "Full-time"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262C] text-[11px] text-[#A1A1A6]">
                              {j.location || "Remote"}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-3">
              <p className="text-[#8E8E93] text-[12px]">
                Candidate Applications ({applications.length})
              </p>
              {applications.length === 0 ? (
                <div className="p-8 text-center text-[#8E8E93] bg-[#101012] border border-[#1E1E22] rounded-2xl">
                  <p className="text-sm">No applications received yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applications.map((a) => {
                    const applicantName = a.applicant?.name || a.applicant?.user_handle || "Applicant";
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 bg-[#101012] rounded-2xl p-4 border border-[#1E1E22] h-full"
                      >
                        <Avatar name={applicantName} photoUrl={a.applicant?.avatar_url} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-[15px] truncate">
                            {applicantName}
                          </p>
                          <p className="text-[#6E6E73] text-[12px] truncate">
                            {a.job?.title || "Role"}
                          </p>
                        </div>
                        <select
                          value={a.status}
                          onChange={(e) => handleApplicationStatusChange(a.id, e.target.value)}
                          className="bg-[#18181C] text-white text-[12px] font-semibold border border-[#2A2A2E] rounded-xl px-2.5 py-1.5 outline-none"
                        >
                          <option value="NEW">New</option>
                          <option value="REVIEWING">Reviewing</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
