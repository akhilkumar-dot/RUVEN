"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/ui/TopBar";
import { BentoGrid, BentoCard } from "@/ui/BentoCard";
import { BottomDock, FloatingActionStack } from "@/ui/BottomDock";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { TimeAgo } from "@/ui/TimeAgo";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Building2,
  MapPin,
  Sparkles,
  Send,
  Plus,
  Briefcase,
  User,
  ExternalLink,
  ChevronRight,
  Award,
  DollarSign,
  FileText,
  Users,
  Compass
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface FeedPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorHeadline: string;
  location: string;
  body: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tag?: string;
  liked?: boolean;
}

interface RoleDashboardConfig {
  label: string;
  badgeLabel: string;
  badgeColorClass: string;
  borderClass: string;
  accentColor: string;
  icon: React.ReactNode;
  roleDescription: string;
  greetingTitle: string;
  greetingSubtitle: string;
  stats: {
    label: string;
    value: string;
    sublabel: string;
    trend: string;
  }[];
  quickActions: {
    label: string;
    badge?: string;
    actionKey: string;
  }[];
  featuredOpportunity: {
    organization: string;
    statValue: string;
    color: string;
    headline: string;
    meta: string;
  };
  featuredProfile: {
    name: string;
    role: string;
    location: string;
    statValue: string;
    statLabel: string;
    colorSeed: string;
    color: string;
  };
  bentoGrid: {
    name: string;
    headline: string;
    location: string;
    statValue: string;
    statLabel: string;
    colorSeed: string;
    color: string;
  }[];
  feedPosts: FeedPost[];
}

// ── 4 Dedicated Role Dashboard Configurations ─────────────────
const ROLE_CONFIGS: Record<AccountType, RoleDashboardConfig> = {
  // 1. INDIVIDUAL: Freelancer, student, or professional
  INDIVIDUAL: {
    label: "Individual",
    badgeLabel: "Individual · Talent & Freelance",
    badgeColorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500/20",
    accentColor: "#10B981",
    icon: <User size={16} />,
    roleDescription: "Freelancer, student, or professional looking to connect & work with startups",
    greetingTitle: "Welcome back, Talent & Freelance 👋",
    greetingSubtitle: "Explore startup project gigs, 1:1 mentorship & hackathon challenges.",
    stats: [
      { label: "Active Proposals", value: "4", sublabel: "2 shortlisted", trend: "+2 new" },
      { label: "Profile Views", value: "1.8k", sublabel: "From founders", trend: "+28%" },
      { label: "Founder Intros", value: "12", sublabel: "3 interviews pending", trend: "Hot" },
      { label: "Skill Match", value: "98%", sublabel: "Verified Talent", trend: "Top 5%" },
    ],
    quickActions: [
      { label: "Browse Startup Gigs", badge: "18 Open", actionKey: "gigs" },
      { label: "Book 1:1 Mentor", badge: "Free", actionKey: "mentors" },
      { label: "Submit Portfolio", actionKey: "portfolio" },
    ],
    featuredOpportunity: {
      organization: "Build with AI Hackathon Bengaluru",
      statValue: "₹10L Prize",
      color: "#D8BF4A", // mustard
      headline: "Autonomous LLM Agents Hackathon 2026: Direct founder interviews & angel scouts",
      meta: "Organized by AI Collective · 16 days left · Open to students & independent engineers",
    },
    featuredProfile: {
      name: "Senior Next.js & AI Engineer",
      role: "Featured Contract Project @ FinPilot",
      location: "Remote / Bengaluru",
      statValue: "₹1.8L - ₹2.5L / mo",
      statLabel: "Full-Time or Contract · Immediate",
      colorSeed: "Freelance Project",
      color: "#5E9C8A", // sage teal
    },
    bentoGrid: [
      {
        name: "Sriram K.",
        headline: "Principal Engineer @ Ex-Google · System Design & Cloud Mentor",
        location: "Bengaluru",
        statValue: "4 slots open",
        statLabel: "Engineering Mentor",
        colorSeed: "Sriram K",
        color: "#9A6BB8", // lavender
      },
      {
        name: "Tanya Bhalla",
        headline: "Product Design Lead @ Razorpay · Reviewing mobile UX portfolios",
        location: "Gurugram",
        statValue: "Design Mentor",
        statLabel: "1:1 Portfolio Review",
        colorSeed: "Tanya Bhalla",
        color: "#C48E69", // tan
      },
      {
        name: "Karan Verma",
        headline: "Full-Stack Contract Lead · Ex-Swiggy · 38 Completed Contracts",
        location: "Pune",
        statValue: "Top Rated",
        statLabel: "Talent Showcase",
        colorSeed: "Karan Verma",
        color: "#D9694A", // coral
      },
      {
        name: "HealthFlow Labs",
        headline: "Seed Stage HealthTech hiring 2 Frontend & 1 ML Engineer",
        location: "Hyderabad",
        statValue: "Hiring 3",
        statLabel: "Startup Job",
        colorSeed: "HealthFlow Labs",
        color: "#5E9C8A", // sage teal
      },
    ],
    feedPosts: [
      {
        id: "ind-1",
        authorName: "Priya Nair",
        authorHandle: "priya_cto",
        authorHeadline: "Co-founder & CTO @ FinPilot",
        location: "Bengaluru",
        body: "We are hiring a freelance UI/UX designer who understands Indian SME fintech workflows! 3-week project with competitive cash compensation + optional conversion. DM your portfolio or Figma link.",
        likeCount: 312,
        commentCount: 42,
        createdAt: "2026-11-03T14:30:00.000Z",
        tag: "Gig Opportunity",
      },
      {
        id: "ind-2",
        authorName: "Sriram K.",
        authorHandle: "sriram_mentor",
        authorHeadline: "Staff Engineer & Tech Advisor",
        location: "Bengaluru",
        body: "Hosting a live 1-hour workshop this Sunday: 'How to transition from freelance software contractor to founding engineer at high-growth Indian startups'. Drop your questions or RSVP in comments!",
        likeCount: 520,
        commentCount: 88,
        createdAt: "2026-11-03T11:00:00.000Z",
        tag: "Mentorship",
      },
    ],
  },

  // 2. STARTUP_FOUNDER: Building own startup, looking for co-founders/investors
  STARTUP_FOUNDER: {
    label: "Startup Founder",
    badgeLabel: "Startup Founder · Early Stage",
    badgeColorClass: "bg-[#A24BFF]/10 text-[#A24BFF] border-[#A24BFF]/30",
    borderClass: "border-[#A24BFF]/20",
    accentColor: "#A24BFF",
    icon: <TrendingUp size={16} />,
    roleDescription: "Building your own startup and looking for co-founders or investors",
    greetingTitle: "Founder Command Center 🚀",
    greetingSubtitle: "Cap table momentum, co-founder match pipeline & investor intros.",
    stats: [
      { label: "Target Raise", value: "₹1.5 Cr", sublabel: "Seed round open", trend: "65% committed" },
      { label: "Pitch Views", value: "32", sublabel: "7 verified VCs", trend: "+12 this week" },
      { label: "Investor Intros", value: "6", sublabel: "2 partner meetings", trend: "High intent" },
      { label: "Co-founder Chats", value: "8", sublabel: "CTO / Growth leads", trend: "3 new" },
    ],
    quickActions: [
      { label: "Pitch to Angels", badge: "Active", actionKey: "pitch" },
      { label: "Find Co-founder", badge: "Matched", actionKey: "cofounder" },
      { label: "Apply to T-Hub Grant", actionKey: "grant" },
    ],
    featuredOpportunity: {
      organization: "T-Hub Hyderabad",
      statValue: "₹5L Grant",
      color: "#9A6BB8", // lavender
      headline: "Startup Pitch Challenge 2026: Win equity-free funding & VC mentorship",
      meta: "T-Hub · Open to student and early-stage founders · 12 days left to apply",
    },
    featuredProfile: {
      name: "Priya Nair",
      role: "Co-founder & CTO @ FinPilot",
      location: "Koramangala, Bengaluru",
      statValue: "₹1.2 Cr ARR",
      statLabel: "Seed · T-Hub Cohort 7",
      colorSeed: "Priya Nair",
      color: "#C48E69", // tan-peach
    },
    bentoGrid: [
      {
        name: "Rohan Mehta",
        headline: "Angel Investor · 14 Startups Backed · Writing ₹15L-₹50L checks",
        location: "Mumbai",
        statValue: "14 Portfolios",
        statLabel: "Angel Investor",
        colorSeed: "Rohan Mehta",
        color: "#D8BF4A", // mustard gold
      },
      {
        name: "Aarav Reddy",
        headline: "Technical Co-founder · Distributed Systems & AI Infrastructure",
        location: "Hyderabad",
        statValue: "Seeking Match",
        statLabel: "Co-founder",
        colorSeed: "Aarav Reddy",
        color: "#5E9C8A", // sage teal
      },
      {
        name: "Peak XV Surge",
        headline: "Cohort 12 Applications Open: ₹8 Cr initial seed check & global immersion",
        location: "Bengaluru",
        statValue: "Cohort 12",
        statLabel: "Accelerator",
        colorSeed: "Peak XV Surge",
        color: "#D9694A", // coral
      },
      {
        name: "Ananya Das",
        headline: "Fractional Growth Lead · Scaled D2C brands past ₹10 Cr ARR",
        location: "Delhi",
        statValue: "Advisor",
        statLabel: "Growth Advisor",
        colorSeed: "Ananya Das",
        color: "#5E9C8A", // sage teal
      },
    ],
    feedPosts: [
      {
        id: "fnd-1",
        authorName: "Rohan Mehta",
        authorHandle: "rohan_angel",
        authorHeadline: "Angel Investor · 14 Portfolios",
        location: "Mumbai",
        body: "Evaluating early-stage B2B SaaS and AI agent workflows for Q4 angel investments. Writing ₹25L-₹50L checks. If you have ₹10L+ ARR or 5+ pilot LOIs, send your deck to my FounderBridge inbox.",
        likeCount: 489,
        commentCount: 73,
        createdAt: "2026-11-03T09:15:00.000Z",
        tag: "Angel Deal Flow",
      },
      {
        id: "fnd-2",
        authorName: "Aarav Reddy",
        authorHandle: "aarav_reddy",
        authorHeadline: "Founder & CEO @ NovaLeaf Labs",
        location: "Hyderabad",
        body: "We just open-sourced our automated founder onboarding checklist for Indian startups (GST, DPIIT tax exemptions, current account & co-founder agreement templates). Free for all FounderBridge members!",
        likeCount: 445,
        commentCount: 61,
        createdAt: "2026-11-03T08:00:00.000Z",
        tag: "Resource",
      },
    ],
  },

  // 3. COMPANY_OWNER: Running established company, hiring or partnering
  COMPANY_OWNER: {
    label: "Company Owner",
    badgeLabel: "Company Owner · Enterprise & SME",
    badgeColorClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    borderClass: "border-blue-500/20",
    accentColor: "#3B82F6",
    icon: <Building2 size={16} />,
    roleDescription: "Running an established company, hiring or partnering",
    greetingTitle: "Enterprise & Business Hub 🏢",
    greetingSubtitle: "Corporate vendor proposals, B2B deal flow & executive recruitment.",
    stats: [
      { label: "Open Requisitions", value: "5", sublabel: "34 candidate matches", trend: "2 in final round" },
      { label: "Inbound B2B Bids", value: "18", sublabel: "Verified vendors", trend: "+6 this week" },
      { label: "Synergy Inquiries", value: "12", sublabel: "Enterprise scaleups", trend: "High value" },
      { label: "Govt Subsidies", value: "₹45L", sublabel: "MSME tech grant ready", trend: "Eligible" },
    ],
    quickActions: [
      { label: "Post Job / RFP", badge: "New", actionKey: "rfp" },
      { label: "B2B Vendor Directory", actionKey: "vendors" },
      { label: "Corporate Tax Perks", badge: "2026 Scheme", actionKey: "perks" },
    ],
    featuredOpportunity: {
      organization: "MSME Digital India Scheme 2026",
      statValue: "40% Subsidy",
      color: "#9A6BB8", // lavender
      headline: "Government Enterprise Tech Scheme: Up to ₹15L reimbursement on ERP & cloud licenses",
      meta: "Ministry of MSME · Fast-track 14-day approval for registered private limited companies",
    },
    featuredProfile: {
      name: "CloudScale Infrastructure",
      role: "Tier-4 Multi-Region Cloud & GPU Partner",
      location: "Mumbai & Hyderabad",
      statValue: "₹25L Credits",
      statLabel: "Exclusive for FounderBridge Corporate Members",
      colorSeed: "CloudScale Infra",
      color: "#5E9C8A", // sage teal
    },
    bentoGrid: [
      {
        name: "Apex Legal & Tax Partners",
        headline: "Cross-border entity setup, ESOP pools & GST optimization",
        location: "Bengaluru",
        statValue: "Top Counsel",
        statLabel: "Corporate Legal",
        colorSeed: "Apex Legal",
        color: "#C48E69", // tan
      },
      {
        name: "Pre-Vetted Senior Engineers",
        headline: "18 Senior consultants ready for fractional enterprise architecture",
        location: "Remote / Pan-India",
        statValue: "Available Now",
        statLabel: "Staff Augmentation",
        colorSeed: "Pre-Vetted Senior Engineers",
        color: "#D8BF4A", // mustard gold
      },
      {
        name: "Metro Logistics Network",
        headline: "Cold chain & B2B express logistics across 28 Indian cities",
        location: "Delhi NCR",
        statValue: "Enterprise SLA",
        statLabel: "Logistics Partner",
        colorSeed: "Metro Logistics",
        color: "#D9694A", // coral
      },
      {
        name: "SecureAudit India",
        headline: "CERT-In certified cybersecurity & SOC2 compliance auditing",
        location: "Bengaluru",
        statValue: "Fast Audit",
        statLabel: "Security Partner",
        colorSeed: "SecureAudit India",
        color: "#9A6BB8", // lavender
      },
    ],
    feedPosts: [
      {
        id: "cmp-1",
        authorName: "CloudScale Infra",
        authorHandle: "cloudscale_in",
        authorHeadline: "Cloud & Infrastructure Partners",
        location: "Mumbai",
        body: "Announcing the FounderBridge Enterprise Credit Program: Any registered company on FounderBridge can now access up to ₹25L in GPU and cloud infrastructure credits with dedicated 24/7 TAM support.",
        likeCount: 395,
        commentCount: 49,
        createdAt: "2026-11-03T12:45:00.000Z",
        tag: "B2B Perk",
      },
      {
        id: "cmp-2",
        authorName: "Apex Legal",
        authorHandle: "apex_legal",
        authorHeadline: "Corporate Legal & Tax Advisory",
        location: "Bengaluru",
        body: "Reminder for Indian Private Limited companies: Filing deadline for annual returns and Director KYC is coming up. Here is our free 5-point compliance checklist to prevent late fee penalties.",
        likeCount: 268,
        commentCount: 31,
        createdAt: "2026-11-03T10:20:00.000Z",
        tag: "Compliance",
      },
    ],
  },

  // 4. INVESTOR: Angel, VC, or family office looking for deal flow
  INVESTOR: {
    label: "Investor",
    badgeLabel: "Investor · Angel & VC Terminal",
    badgeColorClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500/20",
    accentColor: "#F59E0B",
    icon: <Briefcase size={16} />,
    roleDescription: "Angel, VC, or family office looking for deal flow",
    greetingTitle: "Investor Deal Flow Terminal 💼",
    greetingSubtitle: "Curated Indian startup pipeline, due diligence rooms & syndicate deals.",
    stats: [
      { label: "New Deals / Wk", value: "18", sublabel: "12 Seed / 6 Pre-seed", trend: "+5 vs last week" },
      { label: "Active Diligence", value: "4", sublabel: "Cap tables & LOIs", trend: "2 in term sheet" },
      { label: "Capital Deployed", value: "₹8.5 Cr", sublabel: "Across 14 startups", trend: "3.4x MOIC" },
      { label: "Syndicate Invites", value: "6", sublabel: "Co-invest opportunities", trend: "High quality" },
    ],
    quickActions: [
      { label: "Browse Deal Pipeline", badge: "18 New", actionKey: "deals" },
      { label: "Lead a Syndicate", badge: "Open", actionKey: "syndicate" },
      { label: "Request Founder Demo", actionKey: "demo" },
    ],
    featuredOpportunity: {
      organization: "GreenFleet Commercial EV Syndicate",
      statValue: "₹3.5 Cr Round",
      color: "#C48E69", // tan
      headline: "Commercial EV Fleet Operating in 6 Metros: ₹1.4 Cr Monthly Run Rate",
      meta: "Co-investing with Blume Ventures scout pool · ₹25L minimum ticket size · Closes Friday",
    },
    featuredProfile: {
      name: "Deal Spotlight: DataSync AI",
      role: "Autonomous Enterprise ETL Agents · Seed Stage",
      location: "Indiranagar, Bengaluru",
      statValue: "₹2 Cr @ ₹18 Cr",
      statLabel: "Seed Round · ₹80L Committed",
      colorSeed: "DataSync AI",
      color: "#D8BF4A", // mustard gold
    },
    bentoGrid: [
      {
        name: "Priya Nair (FinPilot)",
        headline: "₹1.2 Cr ARR · 240% YoY ARR growth · 15 Enterprise bank contracts",
        location: "Bengaluru",
        statValue: "Pre-Series A",
        statLabel: "Raising Q1",
        colorSeed: "FinPilot Seed",
        color: "#5E9C8A", // sage teal
      },
      {
        name: "MedHealth AI Labs",
        headline: "AI pathology assistant approved by 8 Indian hospital networks",
        location: "Hyderabad",
        statValue: "Raising ₹1.5 Cr",
        statLabel: "Seed Stage",
        colorSeed: "MedHealth AI",
        color: "#D9694A", // coral
      },
      {
        name: "Rohan Mehta (Angel)",
        headline: "Leading ₹75L syndicate in B2B supply chain SaaS · 2 spots left",
        location: "Mumbai",
        statValue: "Syndicate Lead",
        statLabel: "Co-Investment",
        colorSeed: "Rohan Mehta Syndicate",
        color: "#9A6BB8", // lavender
      },
      {
        name: "Due Diligence Room",
        headline: "Audited financial models, GST verification, and IP reviews for 2 finalist startups",
        location: "Platform Verified",
        statValue: "2 Data Rooms",
        statLabel: "Due Diligence",
        colorSeed: "Due Diligence Room",
        color: "#5E9C8A", // sage teal
      },
    ],
    feedPosts: [
      {
        id: "inv-1",
        authorName: "Rohan Mehta",
        authorHandle: "rohan_angel",
        authorHeadline: "Angel Investor · 14 Portfolios",
        location: "Mumbai",
        body: "Market note: Indian B2B SaaS valuations are stabilizing at 8-12x forward ARR for profitable/capital-efficient teams. Founders with under ₹2 Cr ARR focusing on customer retention are raising within 3 weeks.",
        likeCount: 612,
        commentCount: 94,
        createdAt: "2026-11-03T13:10:00.000Z",
        tag: "Venture Insights",
      },
      {
        id: "inv-2",
        authorName: "Priya Nair",
        authorHandle: "priya_cto",
        authorHeadline: "Co-founder & CTO @ FinPilot",
        location: "Bengaluru",
        body: "FinPilot investor update: Closed October at ₹12.5L monthly revenue, up from ₹4.2L in March. We have opened our data room for our upcoming pre-Series A syndicate round. Accredited angels can request access.",
        likeCount: 430,
        commentCount: 52,
        createdAt: "2026-11-03T09:40:00.000Z",
        tag: "Investor Update",
      },
    ],
  },
};

const HOME_TABS = [
  { key: "dashboard", label: "Ecosystem" },
  { key: "feed", label: "Community Feed" },
];

function HomePageContent() {
  const user = useAuthStore((s) => s.user);

  const activeRole: AccountType = user?.type && ROLE_CONFIGS[user.type]
    ? user.type
    : "STARTUP_FOUNDER";

  const config = ROLE_CONFIGS[activeRole];

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [posts, setPosts] = useState<FeedPost[]>(config.feedPosts);
  const [newPostText, setNewPostText] = useState("");
  const [showPostBox, setShowPostBox] = useState(false);

  // Update posts when role switches
  const currentFeedPosts = config.feedPosts;

  function handleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
  }

  function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const post: FeedPost = {
      id: "post-" + Date.now(),
      authorName: user?.userHandle ? `@${user.userHandle}` : "Aarav Reddy",
      authorHandle: user?.userHandle ?? "founder",
      authorHeadline: config.badgeLabel,
      location: "India",
      body: newPostText.trim(),
      likeCount: 1,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      liked: true,
      tag: "Update",
    };
    setPosts([post, ...posts]);
    setNewPostText("");
    setShowPostBox(false);
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* Top bar with internal NavDrawer */}
      <TopBar
        unreadCount={3}
        onSearchOpen={() => {}}
        onNotificationsOpen={() => {}}
      />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]"
        id="main-content"
      >
        <div className="px-3 pt-3 max-w-[440px] mx-auto w-full">
          {/* ══════════ SINGLE ACCOUNT CLASS HEADER ══════════ */}
          <div className="mb-4 p-3.5 rounded-2xl bg-[#0F0F12] border border-[#1E1E22] relative overflow-hidden">
            {/* Subtle ambient role glow */}
            <div
              className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-20"
              style={{ background: config.accentColor }}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={user?.userHandle ? `@${user.userHandle}` : "Founder"} size="md" />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-[15px] truncate">
                    {user?.userHandle ? `@${user.userHandle}` : "Welcome back"}
                  </p>
                  <p className="text-[#8E8E93] text-[12px] truncate mt-0.5">
                    {config.roleDescription}
                  </p>
                </div>
              </div>

              {/* Single Account Class Badge */}
              <span
                className={cn(
                  "text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 shadow-sm",
                  config.badgeColorClass
                )}
              >
                {config.icon}
                <span>{config.badgeLabel}</span>
              </span>
            </div>
          </div>

          {/* Top Switcher Tabs */}
          <div className="flex items-center bg-[#1C1C1E] p-1 rounded-2xl mb-4 w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all",
                activeTab === "dashboard"
                  ? "bg-white text-black shadow"
                  : "text-[#8E8E93] hover:text-white"
              )}
            >
              {config.label} Dashboard
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={cn(
                "flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all",
                activeTab === "feed"
                  ? "bg-white text-black shadow"
                  : "text-[#8E8E93] hover:text-white"
              )}
            >
              Community Feed
            </button>
          </div>

          {/* ══════════ DEDICATED CLASS DASHBOARD ══════════ */}
          {activeTab === "dashboard" && (
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Greeting & Headline */}
              <div className="px-1">
                <h1 className="text-white text-[20px] font-bold tracking-tight">
                  {config.greetingTitle}
                </h1>
                <p className="text-[#8E8E93] text-[13px] mt-0.5 leading-snug">
                  {config.greetingSubtitle}
                </p>
              </div>

              {/* 4 Dedicated Stats Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {config.stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#121214] border border-[#1E1E22] hover:border-[#2A2A2E] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#71717A] mb-1">
                      <span>{s.label}</span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${config.accentColor}15`,
                          color: config.accentColor,
                        }}
                      >
                        {s.trend}
                      </span>
                    </div>
                    <p className="text-white text-[22px] font-bold tracking-tight leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[#8E8E93] text-[11px] mt-0.5 truncate">
                      {s.sublabel}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Actions Bar */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
                {config.quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (qa.actionKey === "gigs" || qa.actionKey === "deals" || qa.actionKey === "vendors") {
                        window.location.href = "/discover";
                      } else if (qa.actionKey === "cofounder" || qa.actionKey === "mentors") {
                        window.location.href = "/ideas";
                      } else if (qa.actionKey === "grant" || qa.actionKey === "perks") {
                        window.location.href = "/plans";
                      } else {
                        setActiveTab("feed");
                        setShowPostBox(true);
                      }
                    }}
                    className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-[#1C1C1E] border border-[#2A2A2E] text-white text-[13px] font-medium hover:border-white/30 flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <span>{qa.label}</span>
                    {qa.badge && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${config.accentColor}25`,
                          color: config.accentColor,
                        }}
                      >
                        {qa.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Hero Bento Profile / Entity */}
              <div
                className="rounded-3xl p-5 relative overflow-hidden"
                style={{ backgroundColor: config.featuredProfile.color }}
              >
                <div className="relative z-10 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black/70 px-2 py-0.5 rounded-full bg-black/10">
                      {config.label} Spotlight
                    </span>
                    <h2 className="text-black font-bold text-[22px] leading-tight tracking-tight mt-2">
                      {config.featuredProfile.name}
                    </h2>
                    <p className="text-black/80 text-[13px] font-medium mt-1">
                      {config.featuredProfile.role}
                    </p>
                    <p className="text-black/60 text-[12px] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      <span>{config.featuredProfile.location}</span>
                    </p>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-black/10">
                    <div>
                      <p className="text-black font-extrabold text-[24px] leading-none">
                        {config.featuredProfile.statValue}
                      </p>
                      <p className="text-black/70 text-[11px] font-medium mt-0.5">
                        {config.featuredProfile.statLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => { window.location.href = "/discover"; }}
                      className="px-3 py-1.5 rounded-xl bg-black text-white text-[12px] font-semibold flex items-center gap-1 hover:bg-black/80 transition-colors"
                    >
                      <span>Connect</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Bento Items Tailored to this Role */}
              <div className="grid grid-cols-2 gap-2.5">
                {config.bentoGrid.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-3.5 flex flex-col justify-between min-h-[145px] transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: item.color }}
                  >
                    <div>
                      <p className="text-black font-bold text-[15px] leading-snug truncate">
                        {item.name}
                      </p>
                      <p className="text-black/75 text-[11px] line-clamp-2 mt-1 leading-tight font-medium">
                        {item.headline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                      <div>
                        <p className="text-black font-extrabold text-[15px] leading-none">
                          {item.statValue}
                        </p>
                        <p className="text-black/70 text-[10px] font-medium">
                          {item.statLabel}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-black/60" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tailored Opportunity Banner */}
              <div
                className="rounded-2xl p-4 text-white relative overflow-hidden"
                style={{ backgroundColor: config.featuredOpportunity.color }}
              >
                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 px-2 py-0.5 rounded-full bg-black/20">
                      {config.featuredOpportunity.organization}
                    </span>
                    <span className="text-white font-extrabold text-[15px]">
                      {config.featuredOpportunity.statValue}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-[16px] leading-snug mt-1">
                    {config.featuredOpportunity.headline}
                  </h3>
                  <p className="text-white/80 text-[12px] mt-0.5">
                    {config.featuredOpportunity.meta}
                  </p>
                  <button
                    onClick={() => { window.location.href = "/plans"; }}
                    className="self-start mt-2 px-3 py-1.5 bg-black text-white text-[12px] font-semibold rounded-xl flex items-center gap-1 hover:bg-black/80 transition-colors"
                  >
                    <span>View Application Details</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              <div className="h-6" />
            </motion.div>
          )}

          {/* ══════════ COMMUNITY FEED TAB ══════════ */}
          {activeTab === "feed" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Quick Post Trigger */}
              <div className="p-3 bg-[#0F0F11] border border-[#1C1C1E] rounded-2xl">
                {!showPostBox ? (
                  <button
                    onClick={() => setShowPostBox(true)}
                    className="w-full flex items-center gap-3 text-left py-2 px-3 rounded-xl bg-[#1C1C1E] text-[#8E8E93] text-[14px] hover:text-white transition-colors"
                  >
                    <Avatar name={user?.userHandle ? `@${user.userHandle}` : "Aarav Reddy"} size="sm" />
                    <span>Share an ask, milestone, or update as {config.label}…</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreatePost} className="space-y-3 pt-1">
                    <textarea
                      autoFocus
                      rows={3}
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder={`What would you like to share with the community as a ${config.label}?`}
                      className="w-full bg-[#1C1C1E] border border-[#2A2A2D] rounded-xl p-3 text-white text-[14px] placeholder:text-[#6E6E73] focus:outline-none focus:border-[#A24BFF] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6E6E73]">
                        Posting as <strong className="text-white">{config.label}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPostBox(false);
                            setNewPostText("");
                          }}
                          className="px-3 py-1.5 text-[13px] text-[#8E8E93] hover:text-white"
                        >
                          Cancel
                        </button>
                        <GradientRingButton size="sm" type="submit" disabled={!newPostText.trim()}>
                          Post Update
                        </GradientRingButton>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Feed Posts */}
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 hover:border-[#2A2A2D] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={post.authorName} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-semibold text-[15px] leading-tight">
                            {post.authorName}
                          </p>
                          <span className="text-[#6E6E73] text-[12px]">@{post.authorHandle}</span>
                        </div>
                        <p className="text-[#8E8E93] text-[12px] leading-snug mt-0.5">
                          {post.authorHeadline}
                        </p>
                      </div>
                    </div>
                    {post.tag && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#A24BFF]/10 text-[#A24BFF] border border-[#A24BFF]/20">
                        {post.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-white text-[14px] leading-relaxed whitespace-pre-wrap">
                    {post.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1E] text-[#8E8E93] text-[13px]">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "flex items-center gap-1.5 transition-colors",
                          post.liked ? "text-pink-500 font-semibold" : "hover:text-white"
                        )}
                      >
                        <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
                        <span>{post.likeCount}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageCircle size={16} />
                        <span>{post.commentCount}</span>
                      </button>
                      <button className="hover:text-white transition-colors">
                        <Share2 size={15} />
                      </button>
                    </div>
                    <TimeAgo date={post.createdAt} fallback="1h" className="text-[11px] text-[#6E6E73]" />
                  </div>
                </div>
              ))}

              <div className="h-6" />
            </motion.div>
          )}
        </div>
      </main>

      {/* Floating action stack */}
      <FloatingActionStack
        onTodayMeetups={() => {}}
        onQuickPost={() => {
          setActiveTab("feed");
          setShowPostBox(true);
        }}
        onVerifiedStatus={() => {}}
        verifiedCount={2}
      />

      {/* Bottom dock */}
      <BottomDock
        activeTab={activeTab}
        tabs={HOME_TABS}
        onTabChange={(key) => setActiveTab(key)}
        onCreateOpen={() => {
          setActiveTab("feed");
          setShowPostBox(true);
        }}
        userName={user?.userHandle ? `@${user.userHandle}` : "Aarav Reddy"}
        onProfileOpen={() => {}}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
