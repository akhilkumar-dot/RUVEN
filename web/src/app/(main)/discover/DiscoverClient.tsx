"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, Building2, TrendingUp, Briefcase, Check } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import {
  dataService,
  type DiscoverPerson,
  type DiscoverCompany,
  type DiscoverInvestor,
  type DiscoverJob
} from "@/lib/api/dataService";

// ── Discover tabs ─────────────────────────────────────────────
const DISCOVER_TABS = [
  { key: "people", label: "People", icon: <Users size={14} /> },
  { key: "companies", label: "Companies", icon: <Building2 size={14} /> },
  { key: "investors", label: "Investors", icon: <TrendingUp size={14} /> },
  { key: "jobs", label: "Jobs", icon: <Briefcase size={14} /> },
];

// ── Person card ───────────────────────────────────────────────
function PersonCard({
  person,
  currentUserId,
  onStatusChange,
}: {
  person: DiscoverPerson;
  currentUserId?: string;
  onStatusChange: (id: string, status: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED") => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentUserId && person.id === currentUserId) {
    return null; // Hidden for self
  }

  const status = person.connectionStatus || "NONE";
  const isConnected = status === "CONNECTED" || status === "ACCEPTED";
  const isRequested = status === "REQUESTED" || status === "PENDING";
  const isRespond = status === "RESPOND";

  async function handleClick() {
    if (!currentUserId || loading) return;
    if (isConnected) {
      router.push("/messages");
      return;
    }
    setLoading(true);
    try {
      if (isRequested) {
        await dataService.toggleConnection(currentUserId, person.id);
        onStatusChange(person.id, "NONE");
      } else if (isRespond) {
        await dataService.toggleConnection(currentUserId, person.id);
        onStatusChange(person.id, "CONNECTED");
      } else {
        await dataService.sendConnectionRequest(currentUserId, person.id);
        onStatusChange(person.id, "REQUESTED");
      }
    } catch (e) {
      console.error("Connect toggle error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 hover:border-[#2A2A2D] transition-colors min-w-0"
    >
      <Avatar name={person.name} photoUrl={person.avatar_url} size="md" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <Link href={`/u/${person.user_handle}`} className="text-white font-semibold text-[15px] leading-tight hover:underline truncate block">
          @{person.user_handle}
        </Link>
        <p className="text-[#8E8E93] text-[12px] leading-snug mt-0.5 truncate">
          {person.headline || person.type.replace(/_/g, " ")}
        </p>
        {person.location && (
          <p className="text-[#6E6E73] text-[11px] mt-1 truncate">{person.location}</p>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={loading}
        onClick={handleClick}
        className={cn(
          "px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border shrink-0 max-w-[90px] truncate",
          isConnected
            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
            : isRequested
            ? "border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
            : isRespond
            ? "border-purple-400 text-purple-300 bg-purple-500/20 hover:bg-purple-500/30"
            : "border-[#A24BFF] text-[#A24BFF] bg-[#A24BFF]/10 hover:bg-[#A24BFF]/20"
        )}
      >
        {loading
          ? "..."
          : isConnected
          ? "Connected"
          : isRequested
          ? "Requested"
          : isRespond
          ? "Respond"
          : "Connect"}
      </motion.button>
    </motion.div>
  );
}

// ── Company card ──────────────────────────────────────────────
function CompanyCard({ co }: { co: DiscoverCompany }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4.5 hover:border-[#2A2A2D] transition-colors flex flex-col justify-between space-y-3"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1C1C1E] to-[#2A2A2E] border border-white/10 flex items-center justify-center text-white font-bold text-[18px] shrink-0 shadow-md">
          {co.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/c/${co.slug}`} className="text-white font-bold text-[16px] hover:text-[#38BDF8] transition-colors truncate">
              {co.name}
            </Link>
            {co.verified && (
              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Verified Entity
              </span>
            )}
          </div>
          <p className="text-[#38BDF8] text-[12.5px] font-medium mt-0.5 truncate">
            {co.tagline || co.description || "Company on COLLAB"}
          </p>
          {co.about && co.about !== co.tagline && (
            <p className="text-[#8E8E93] text-[12px] line-clamp-2 mt-1 leading-relaxed">
              {co.about}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap pt-1">
        {[co.industry, co.location, co.founded_year ? `Est. ${co.founded_year}` : null].filter(Boolean).map((t) => (
          <span key={t as string} className="px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262A] text-[11px] text-[#A1A1A6]">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-[#1C1C1E] gap-2">
        {co.website ? (
          <a
            href={co.website.startsWith("http") ? co.website : `https://${co.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#8E8E93] hover:text-white transition-colors truncate max-w-[160px]"
          >
            {co.website.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-[12px] text-[#6E6E73]">COLLAB Verified Company</span>
        )}
        <Link
          href={`/c/${co.slug}`}
          className="px-3.5 py-1.5 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/25 text-[12px] font-semibold transition-colors shrink-0"
        >
          View Company Website →
        </Link>
      </div>
    </motion.div>
  );
}

// ── Investor card ─────────────────────────────────────────────
function InvestorCard({
  inv,
  currentUserId,
  onStatusChange,
}: {
  inv: DiscoverInvestor;
  currentUserId?: string;
  onStatusChange: (id: string, status: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED") => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status = inv.connectionStatus || "NONE";
  const isConnected = status === "CONNECTED" || status === "ACCEPTED";
  const isRequested = status === "REQUESTED" || status === "PENDING";
  const isRespond = status === "RESPOND";

  async function handleRequest() {
    if (!currentUserId || loading) return;
    if (isConnected) {
      router.push("/messages");
      return;
    }
    setLoading(true);
    try {
      if (isRequested) {
        await dataService.toggleConnection(currentUserId, inv.user_id);
        onStatusChange(inv.user_id, "NONE");
      } else if (isRespond) {
        await dataService.toggleConnection(currentUserId, inv.user_id);
        onStatusChange(inv.user_id, "CONNECTED");
      } else {
        await dataService.requestInvestorIntro(currentUserId, inv.user_id, "Intro request from Discover");
        onStatusChange(inv.user_id, "REQUESTED");
      }
    } catch (e) {
      console.error("Intro request error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 hover:border-[#2A2A2E] transition-colors flex flex-col justify-between space-y-3"
    >
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <Avatar name={inv.name} photoUrl={inv.avatar_url} size="md" />
          <div className="min-w-0 flex-1">
            <Link href={`/u/${inv.user_handle}`} className="text-white font-semibold text-[15px] hover:underline truncate block">
              {inv.name}
            </Link>
            <p className="text-[#FF8A3D] text-[12px] font-medium truncate">{inv.firm_name || `@${inv.user_handle}`}</p>
          </div>
          <Link
            href={`/u/${inv.user_handle}`}
            className="text-[11px] text-[#A1A1A6] hover:text-white px-2 py-1 rounded-lg bg-[#18181A] border border-[#26262A] shrink-0"
          >
            Profile ↗
          </Link>
        </div>
        <p className="text-[#A1A1A6] text-[13px] leading-snug line-clamp-2">
          {inv.thesis || "Active investor in Indian technology startups & founders."}
        </p>
        {inv.portfolio_companies && (
          <p className="text-[#6E6E73] text-[11px] mt-1.5 truncate">
            Portfolio: <span className="text-[#B3B3BA]">{inv.portfolio_companies}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1E] gap-2">
        <span className="px-2.5 py-1 rounded-full bg-[#FF8A3D]/10 border border-[#FF8A3D]/30 text-[#FF8A3D] text-[11px] font-semibold truncate">
          {inv.min_ticket_lakh && inv.max_ticket_lakh
            ? `₹${inv.min_ticket_lakh}L–₹${inv.max_ticket_lakh}L`
            : inv.stages || "Early Stage"}
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={handleRequest}
          className={cn(
            "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors shrink-0",
            isConnected
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              : isRequested
              ? "border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
              : isRespond
              ? "border-purple-400 text-purple-300 bg-purple-500/20 hover:bg-purple-500/30"
              : "border-[#A24BFF] text-[#A24BFF] hover:bg-[#A24BFF]/10"
          )}
        >
          {loading
            ? "..."
            : isConnected
            ? "Connected"
            : isRequested
            ? "Requested"
            : isRespond
            ? "Respond"
            : "Request Intro"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Job card ──────────────────────────────────────────────────
function JobCard({
  job,
  currentUserId,
  onApply,
}: {
  job: DiscoverJob;
  currentUserId?: string;
  onApply: (jobId: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (!currentUserId || loading || job.hasApplied) return;
    setLoading(true);
    try {
      await dataService.applyToJob(job.id, currentUserId, "Applied via Ruven Discover");
      onApply(job.id);
    } catch (e) {
      console.error("Job apply error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2A2A2E] transition-colors"
    >
      <div>
        <p className="text-white font-semibold text-[16px]">{job.title}</p>
        <p className="text-[#A24BFF] text-[13px] mt-0.5">{job.company_name}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[
            job.location || (job.is_remote ? "Remote" : null),
            job.salary_min_lakh && job.salary_max_lakh
              ? `₹${job.salary_min_lakh}L–₹${job.salary_max_lakh}L`
              : null,
            job.employment_type,
          ]
            .filter(Boolean)
            .map((t) => (
              <span key={t as string} className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">
                {t}
              </span>
            ))}
        </div>
      </div>
      <div className="mt-4">
        {job.hasApplied ? (
          <div className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold flex items-center justify-center gap-1.5">
            <Check size={14} /> Applied
          </div>
        ) : (
          <GradientRingButton
            size="sm"
            onClick={handleApply}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Submitting…" : "Apply Now"}
          </GradientRingButton>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Discover Client ─────────────────────────────────────────
export default function DiscoverClient() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("people");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Live state from Supabase
  const [people, setPeople] = useState<DiscoverPerson[]>([]);
  const [companies, setCompanies] = useState<DiscoverCompany[]>([]);
  const [investors, setInvestors] = useState<DiscoverInvestor[]>([]);
  const [jobs, setJobs] = useState<DiscoverJob[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === "people") {
          const res = await dataService.fetchDiscoverPeople(user?.id, query);
          if (!isCancelled) setPeople(res);
        } else if (activeTab === "companies") {
          const res = await dataService.fetchDiscoverCompanies(query);
          if (!isCancelled) setCompanies(res);
        } else if (activeTab === "investors") {
          const res = await dataService.fetchDiscoverInvestors(user?.id, query);
          if (!isCancelled) setInvestors(res);
        } else if (activeTab === "jobs") {
          const res = await dataService.fetchDiscoverJobs(user?.id, query);
          if (!isCancelled) setJobs(res);
        }
      } catch (err) {
        console.error("Discover load error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [activeTab, query, user?.id]);

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar />

      {/* Sticky Search & Tabs */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]/50 pb-1">
        {/* Search bar */}
        <div className="px-4 pt-4 pb-2 w-full">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search founders, companies, investors…"
              className="w-full bg-[#1C1C1E] text-white rounded-full pl-10 pr-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] transition-colors"
            />
          </div>
        </div>

        {/* Discover sub-tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 pb-3 w-full">
          <div className="flex gap-2 pr-10">
            {DISCOVER_TABS.map((t) => (
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
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 py-2 w-full">
          {/* Skeletons while loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C1C1E]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-[#1C1C1E] rounded" />
                      <div className="w-20 h-2.5 bg-[#1C1C1E] rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-3/4 bg-[#1C1C1E] rounded" />
                </div>
              ))}
            </div>
          )}

          {/* People list */}
          {!loading && activeTab === "people" && (
            people.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#A24BFF]">
                  <Users size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No people found</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  {query ? `No verified members match "${query}".` : "No other verified founders found yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {people.map((p) => (
                  <PersonCard
                    key={p.id}
                    person={p}
                    currentUserId={user?.id}
                    onStatusChange={(id, status) => {
                      setPeople((prev) => prev.map((item) => (item.id === id ? { ...item, connectionStatus: status } : item)));
                    }}
                  />
                ))}
              </div>
            )
          )}

          {/* Companies list */}
          {!loading && activeTab === "companies" && (
            companies.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#3B82F6]">
                  <Building2 size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No companies listed</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  {query ? `No companies match "${query}".` : "No startup companies published yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {companies.map((c) => (
                  <CompanyCard key={c.id} co={c} />
                ))}
              </div>
            )
          )}

          {/* Investors list */}
          {!loading && activeTab === "investors" && (
            investors.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-amber-400">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No investors found</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  {query ? `No investors match "${query}".` : "No registered investors yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {investors.map((inv) => (
                  <InvestorCard
                    key={inv.user_id}
                    inv={inv}
                    currentUserId={user?.id}
                    onStatusChange={(id, status) => {
                      setInvestors((prev) => prev.map((item) => (item.user_id === id ? { ...item, connectionStatus: status } : item)));
                    }}
                  />
                ))}
              </div>
            )
          )}

          {/* Jobs list */}
          {!loading && activeTab === "jobs" && (
            jobs.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-emerald-400">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No active job openings</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  {query ? `No positions match "${query}".` : "No startups have posted open roles yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    currentUserId={user?.id}
                    onApply={(jobId) => {
                      setJobs((prev) => prev.map((item) => (item.id === jobId ? { ...item, hasApplied: true } : item)));
                    }}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </main>

      <BottomDock
        activeTab="discover"
        userName={user?.name || user?.userHandle || ""}
      />
    </div>
  );
}
