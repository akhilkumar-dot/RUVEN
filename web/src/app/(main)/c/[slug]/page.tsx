"use client";

import { use, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  ShieldCheck,
  Share2,
  ArrowLeft,
  Check,
  Briefcase,
  Building2,
} from "lucide-react";
import { dataService, DiscoverCompany, DiscoverJob } from "@/lib/api/dataService";
import { useAuthStore } from "@/lib/store/authStore";

interface PublicCompanyProps {
  params: Promise<{ slug: string }>;
}

function CompanySkeleton() {
  return (
    <div className="max-w-[640px] w-full mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="bg-[#121212] rounded-3xl p-6 border border-[#1C1C1E] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E]" />
        <div className="h-7 bg-[#1C1C1E] rounded w-1/2" />
        <div className="h-4 bg-[#18181A] rounded w-1/3" />
        <div className="h-16 bg-[#18181A] rounded w-full" />
      </div>
    </div>
  );
}

function CompanyDetail({ params }: PublicCompanyProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const user = useAuthStore((s) => s.user);

  const [company, setCompany] = useState<DiscoverCompany | null>(null);
  const [jobs, setJobs] = useState<DiscoverJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    async function loadCompany() {
      try {
        const res = await dataService.fetchCompanyBySlug(slug);
        if (isMounted) {
          if (res) {
            setCompany(res.company as DiscoverCompany);
            setJobs((res.jobs || []) as DiscoverJob[]);
          } else {
            setCompany(null);
          }
        }
      } catch (err) {
        console.error("Failed to load company by slug:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCompany();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (typeof window === "undefined" || !company) return;
    if (navigator.share) {
      navigator.share({ title: company.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user?.id || appliedJobIds.has(jobId)) return;
    try {
      await dataService.applyToJob(jobId, user.id);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      console.error("Failed to apply:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <CompanySkeleton />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-dvh bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#18181A] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] mb-4">
          <Building2 size={26} className="text-[#A24BFF]" />
        </div>
        <h1 className="text-xl font-bold mb-1">Company Not Found</h1>
        <p className="text-sm text-[#8E8E93] max-w-sm mb-6">
          This company page does not exist or has not been published yet.
        </p>
        <Link
          href="/discover"
          className="px-5 py-2.5 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold transition-colors"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between">
        <Link
          href="/discover"
          className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Discover
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-[#1C1C1E] hover:bg-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] hover:text-white transition-colors relative"
            aria-label="Share page"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
          </button>
          {copied && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-[640px] w-full mx-auto px-4 py-6 space-y-6">
        <div
          className="rounded-3xl p-6 relative overflow-hidden border border-[#222]"
          style={{ background: "linear-gradient(135deg, #0e0e12 0%, #1a162b 100%)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            {company.verified && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A24BFF]/15 border border-[#A24BFF]/30 text-[#A24BFF] text-xs font-semibold">
                <ShieldCheck size={14} /> Verified Entity
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mt-4">{company.name}</h1>
          {company.tagline && (
            <p className="text-[#D4FF3A] text-sm font-medium tracking-wide mt-1">
              {company.tagline}
            </p>
          )}
          {company.description && (
            <p className="text-[#B3B3BA] text-sm leading-relaxed mt-3">
              {company.description}
            </p>
          )}

          <div className="flex gap-2 mt-4 flex-wrap">
            {company.industry && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                {company.industry}
              </span>
            )}
            {company.founded_year && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                Est. {company.founded_year}
              </span>
            )}
            {company.location && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                <MapPin size={11} /> {company.location}
              </span>
            )}
          </div>
        </div>

        {/* Website & Links */}
        {company.website && (
          <div className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-4">
            <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
              Website
            </h2>
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#A24BFF] hover:underline text-sm font-medium"
            >
              <Globe size={15} /> {company.website}
            </a>
          </div>
        )}

        {/* Active Openings */}
        <div className="bg-[#101012] border border-[#1E1E22] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Open Positions ({jobs.length})
            </h2>
            <Briefcase size={15} className="text-[#8E8E93]" />
          </div>

          {jobs.length === 0 ? (
            <p className="text-sm text-[#6E6E73] py-2">No active job listings right now.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {jobs.map((job) => {
                const isApplied = appliedJobIds.has(job.id);
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-[#141416] border border-[#222226] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{job.title}</p>
                        <p className="text-xs text-[#8E8E93] mt-0.5">
                          {job.location || "Remote"} · {job.employment_type || "Full-time"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplied}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#A24BFF]/20 text-[#A24BFF] hover:bg-[#A24BFF]/30 transition-colors shrink-0 disabled:bg-emerald-500/20 disabled:text-emerald-400"
                      >
                        {isApplied ? "Applied ✓" : "Apply"}
                      </button>
                    </div>
                    {job.description && (
                      <p className="text-xs text-[#A1A1A6] line-clamp-2">{job.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicCompanyPage({ params }: PublicCompanyProps) {
  return (
    <Suspense fallback={<CompanySkeleton />}>
      <CompanyDetail params={params} />
    </Suspense>
  );
}
