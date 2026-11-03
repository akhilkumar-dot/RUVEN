"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  ShieldCheck,
  Sparkles,
  MapPin
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

export interface FounderCard {
  id: string;
  name: string;
  handle: string;
  role: string;
  company: string;
  companyLogo?: string;
  industry: string;
  stage: string;
  location: string;
  bio: string;
  linkedin?: string;
  photo?: string;
  verified?: boolean;
}

const SEED_FOUNDERS: FounderCard[] = [
  {
    id: "f-1",
    name: "Priya Patel",
    handle: "priya_founder",
    role: "Co-founder & CEO",
    company: "Sattva Health",
    industry: "Healthtech",
    stage: "Seed",
    location: "Bengaluru",
    bio: "Building AI-driven early detection diagnostics for Tier 2 and Tier 3 clinical networks. Ex-Apollo, Techstars '24.",
    linkedin: "https://linkedin.com/in/priyapatel",
    verified: true,
  },
  {
    id: "f-2",
    name: "Vikram Mehta",
    handle: "vikram_co",
    role: "Founder & Managing Director",
    company: "Konnect Logistics",
    industry: "Logistics",
    stage: "Growth",
    location: "Mumbai",
    bio: "Operating a 400+ vehicle electric freight network connecting agricultural hubs to enterprise retail chains.",
    linkedin: "https://linkedin.com/in/vikrammehta",
    verified: true,
  },
  {
    id: "f-3",
    name: "Aarav Reddy",
    handle: "aarav_reddy",
    role: "Founder & CTO",
    company: "DeepStack AI",
    industry: "AI/ML",
    stage: "Pre-seed",
    location: "Bengaluru",
    bio: "Building private multilingual LLM deployment pipelines for Indian banking and fintech compliance.",
    linkedin: "https://linkedin.com/in/aaravreddy",
    verified: true,
  },
  {
    id: "f-4",
    name: "Ananya Iyer",
    handle: "ananya_pro",
    role: "Founder & CEO",
    company: "Finvo Labs",
    industry: "Fintech",
    stage: "Seed",
    location: "Hyderabad",
    bio: "Automating cross-border treasury and GST reconciliation for Indian tech exporters.",
    linkedin: "https://linkedin.com/in/ananyaiyer",
    verified: true,
  },
  {
    id: "f-5",
    name: "Rohan Singhania",
    handle: "rohan_das",
    role: "Co-founder & Product Lead",
    company: "AgriStack Bharat",
    industry: "Agritech",
    stage: "Early Revenue",
    location: "Pune",
    bio: "Connecting smallholder farmers directly with institutional buyers, reducing post-harvest wastage by 35%.",
    linkedin: "https://linkedin.com/in/rohansinghania",
    verified: false,
  },
];

const INDUSTRIES = ["All", "AI/ML", "Fintech", "Healthtech", "Logistics", "Agritech", "B2B SaaS"];

export default function FoundersHubPage() {
  const user = useAuthStore((s) => s.user);
  const isFounder = user?.type === "STARTUP_FOUNDER" || user?.type === "COMPANY_OWNER";

  const [hasJoined, setHasJoined] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [navTab, setNavTab] = useState("hub");

  const filteredFounders = SEED_FOUNDERS.filter((founder) => {
    const matchesIndustry = selectedIndustry === "All" || founder.industry === selectedIndustry;
    const matchesSearch =
      founder.name.toLowerCase().includes(search.toLowerCase()) ||
      founder.company.toLowerCase().includes(search.toLowerCase()) ||
      founder.bio.toLowerCase().includes(search.toLowerCase()) ||
      founder.location.toLowerCase().includes(search.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  function toggleConnect(id: string) {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-24">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-6xl mx-auto w-full">
          {/* Header Title & Hub Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#A24BFF] flex items-center gap-1.5">
                  <Sparkles size={13} /> Founders Directory
                </span>
                <h1 className="text-white font-bold text-[24px] tracking-tight mt-0.5">
                  Founders Hub
                </h1>
              </div>

              {/* Join / Leave Toggle (Only for Startup Founders and Company Owners) */}
              {isFounder ? (
                <button
                  onClick={() => setHasJoined(!hasJoined)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 flex items-center gap-1.5",
                    hasJoined
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-[#1C1C1E] border-[#2A2A2D] text-[#A1A1A6] hover:text-white"
                  )}
                >
                  <CheckCircle2 size={13} />
                  {hasJoined ? "Hub Member ✓" : "Join Hub"}
                </button>
              ) : (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A1A1E] text-[#8E8E93] border border-[#222]">
                  Directory View
                </span>
              )}
            </div>

            <p className="text-[#8E8E93] text-[13px] mt-1 leading-relaxed">
              Connect with fellow Indian startup founders and company operators building across India.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by founder, company, sector, city…"
              className="w-full bg-[#121214] text-white rounded-2xl pl-10 pr-4 py-2.5 text-[14px] border border-[#222226] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] transition-colors"
            />
          </div>

          {/* Industry Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-4">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors shrink-0",
                  selectedIndustry === ind
                    ? "bg-[#A24BFF] text-white"
                    : "bg-[#141416] text-[#8E8E93] border border-[#222226] hover:text-white"
                )}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Founders Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFounders.map((founder) => {
              const isConnected = connectedIds.includes(founder.id);
              return (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0D0D10] border border-[#1E1E22] rounded-2xl p-4.5 space-y-3 hover:border-[#2C2C32] transition-colors h-full flex flex-col justify-between"
                >
                  {/* Top: Avatar, Name, Company, Verified */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={founder.name} size="md" verified={founder.verified} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-semibold text-[15px] truncate">
                            {founder.name}
                          </p>
                          {founder.verified && (
                            <ShieldCheck size={14} className="text-[#A24BFF] shrink-0" />
                          )}
                        </div>
                        <p className="text-[#8E8E93] text-[12px] truncate">
                          {founder.role} · <span className="text-[#D4FF3A] font-medium">{founder.company}</span>
                        </p>
                      </div>
                    </div>

                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#18181C] border border-[#26262C] flex items-center justify-center text-[#8E8E93] hover:text-[#0077B5] hover:border-[#0077B5]/40 transition-colors shrink-0"
                        title="LinkedIn Profile"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Badges: Industry, Stage, Location */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262C] text-[#A1A1A6] text-[11px] font-medium">
                      {founder.industry}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#A24BFF]/10 border border-[#A24BFF]/30 text-[#A24BFF] text-[11px] font-medium">
                      {founder.stage}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#18181C] border border-[#26262C] text-[#8E8E93] text-[11px]">
                      <MapPin size={10} /> {founder.location}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-[#B3B3BA] text-[13px] leading-relaxed">
                    {founder.bio}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#1C1C20]">
                    <button
                      onClick={() => toggleConnect(founder.id)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all border flex items-center justify-center gap-1.5",
                        isConnected
                          ? "bg-transparent border-[#26262C] text-[#8E8E93]"
                          : "bg-[#A24BFF]/15 border-[#A24BFF]/40 text-[#A24BFF] hover:bg-[#A24BFF]/25"
                      )}
                    >
                      <UserPlus size={14} />
                      {isConnected ? "Connected ✓" : "Connect"}
                    </button>
                    <a
                      href={`/messages`}
                      className="px-4 py-2 rounded-xl bg-[#16161A] border border-[#26262C] text-[#A1A1A6] hover:text-white hover:border-[#3A3A42] text-[13px] font-medium transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      Message
                    </a>
                  </div>
                </motion.div>
              );
            })}

            {filteredFounders.length === 0 && (
              <div className="py-16 text-center text-[#8E8E93] text-[14px]">
                No founders found in this industry. Try a different search.
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomDock
        activeTab={navTab}
        tabs={[{ key: "hub", label: "Founders Hub" }]}
        onTabChange={setNavTab}
        userName={user?.userHandle ? `@${user.userHandle}` : "Founder"}
      />
    </div>
  );
}
