"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/ui/TopBar";
import { BottomDock, NAV_TABS } from "@/ui/BottomDock";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { TimeAgo } from "@/ui/TimeAgo";
import { useAuthStore, type AccountType } from "@/lib/store/authStore";
import { dataService, type FeedPost as DbFeedPost, type MeetupEvent, type AdItem, type UserStats } from "@/lib/api/dataService";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Building2,
  Sparkles,
  Briefcase,
  User,
  Check,
  CheckSquare,
  Trash2,
  X,
  Send,
  Link2,
} from "lucide-react";

// Fallback quotes (used only if DB is empty)
const FALLBACK_QUOTES: Record<AccountType, { quote: string; author: string }> = {
  STARTUP_FOUNDER: {
    quote: "Move fast, be bold, and build what customers genuinely cannot live without.",
    author: "Naveen Tewari, InMobi",
  },
  COMPANY_OWNER: {
    quote: "Execution is everything; culture eats strategy for breakfast every single day.",
    author: "N.R. Narayana Murthy, Infosys",
  },
  INDIVIDUAL: {
    quote: "Exceptional craftsmanship and consistency open high-leverage doors capital alone cannot buy.",
    author: "Kunal Shah, CRED",
  },
  INVESTOR: {
    quote: "Back unreasonable people building non-consensus breakthroughs against all odds.",
    author: "Vinod Khosla, Khosla Ventures",
  },
};

// ── Local UI adapter for FeedPost ─────────────────────────────
interface FeedPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorHeadline: string;
  authorAvatarUrl?: string | null;
  body: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  liked?: boolean;
}

// ── Inline Comment Drawer ─────────────────────────────────────
interface CommentDrawerProps {
  post: FeedPost;
  currentUserId?: string;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

function CommentDrawer({ post, currentUserId, onClose, onCommentAdded }: CommentDrawerProps) {
  const [comments, setComments] = useState<{ id: string; body: string; author_name: string; author_handle: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await dataService.fetchPostComments(post.id);
        if (!cancelled) setComments(data);
      } catch {
        // keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [post.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !currentUserId || submitting) return;
    const commentBody = text.trim();
    setSubmitting(true);
    try {
      const newComment = await dataService.createPostComment(post.id, currentUserId, commentBody);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        onCommentAdded(post.id);
      } else {
        // Optimistic fallback
        setComments((prev) => [
          ...prev,
          {
            id: `cmt-${Date.now()}`,
            body: commentBody,
            author_name: "You",
            author_handle: "you",
            created_at: new Date().toISOString(),
          },
        ]);
        onCommentAdded(post.id);
      }
      setText("");
    } catch (err) {
      console.error("Comment error:", err);
      // Still show comment optimistically
      setComments((prev) => [
        ...prev,
        {
          id: `cmt-${Date.now()}`,
          body: commentBody,
          author_name: "You",
          author_handle: "you",
          created_at: new Date().toISOString(),
        },
      ]);
      onCommentAdded(post.id);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#121214] border border-[#222226] rounded-t-3xl w-full max-w-lg max-h-[75dvh] flex flex-col"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#3A3A3E] rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1C1C1E] shrink-0">
          <h3 className="text-white font-semibold text-[15px]">Comments ({post.commentCount + comments.filter(c => ![''].includes(c.id)).length})</h3>
          <button onClick={onClose} className="text-[#6E6E73] hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Post preview */}
        <div className="px-4 py-3 border-b border-[#1C1C1E] shrink-0">
          <p className="text-[#A1A1A6] text-[12px] line-clamp-2">
            <span className="text-[#A24BFF] font-semibold">@{post.authorHandle}</span>: {post.body}
          </p>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#1C1C1E] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[#1C1C1E] rounded w-1/3" />
                    <div className="h-3 bg-[#1C1C1E] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-[#6E6E73] text-[13px] text-center py-6">
              No comments yet. Be the first to reply.
            </p>
          )}
          {!loading && comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.author_name || c.author_handle} size="sm" className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[13px] font-semibold">@{c.author_handle}</span>
                  <span className="text-[#6E6E73] text-[11px]">
                    <TimeAgo date={c.created_at} fallback="just now" />
                  </span>
                </div>
                <p className="text-[#D1D1D6] text-[13px] mt-0.5 leading-snug whitespace-pre-wrap">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-[#1C1C1E] flex gap-2 shrink-0" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            rows={1}
            placeholder={currentUserId ? "Add a comment…" : "Sign in to comment"}
            disabled={!currentUserId}
            className="flex-1 bg-[#1A1A1E] text-white rounded-2xl px-4 py-2.5 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF] resize-none placeholder:text-[#6E6E73] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!text.trim() || !currentUserId || submitting}
            className="w-10 h-10 rounded-full bg-[#A24BFF] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#8D34F0] transition-colors self-end"
          >
            <Send size={15} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function dbPostToUiPost(p: DbFeedPost): FeedPost {
  return {
    id: p.id,
    authorName: p.author.name || p.author.user_handle || "Community Member",
    authorHandle: p.author.user_handle,
    authorHeadline: p.author.type?.replace(/_/g, " ") || "Community Member",
    authorAvatarUrl: p.author.avatar_url,
    body: p.body,
    likeCount: p.like_count,
    commentCount: p.comment_count,
    createdAt: p.created_at,
    liked: p.hasLiked,
  };
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
  } | null;
  featuredProfile: {
    name: string;
    role: string;
    location: string;
    statValue: string;
    statLabel: string;
    colorSeed: string;
    color: string;
  } | null;
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
// NOTE: Only UI metadata here — labels, colors, icons. No fake data.
const ROLE_CONFIGS: Record<AccountType, RoleDashboardConfig> = {
  // 1. INDIVIDUAL: Freelancer, student, or professional
  INDIVIDUAL: {
    label: "Individual",
    badgeLabel: "Individual",
    badgeColorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500/20",
    accentColor: "#10B981",
    icon: <User size={16} />,
    roleDescription: "Talent & Freelance",
    greetingTitle: "Welcome back, Talent & Freelance 👋",
    greetingSubtitle: "Explore startup project gigs, 1:1 mentorship & hackathon challenges.",
    stats: [],
    quickActions: [
      { label: "Browse Startup Gigs", actionKey: "gigs" },
      { label: "Book 1:1 Mentor", actionKey: "mentors" },
      { label: "Submit Portfolio", actionKey: "portfolio" },
    ],
    featuredOpportunity: null,
    featuredProfile: null,
    bentoGrid: [],
    feedPosts: [],
  },

  // 2. STARTUP_FOUNDER: Building own startup, looking for co-founders/investors
  STARTUP_FOUNDER: {
    label: "Startup Founder",
    badgeLabel: "Founder",
    badgeColorClass: "bg-[#A24BFF]/10 text-[#A24BFF] border-[#A24BFF]/30",
    borderClass: "border-[#A24BFF]/20",
    accentColor: "#A24BFF",
    icon: <TrendingUp size={16} />,
    roleDescription: "Early Stage Startup",
    greetingTitle: "Founder Command Center 🚀",
    greetingSubtitle: "Cap table momentum, co-founder match pipeline & investor intros.",
    stats: [],
    quickActions: [
      { label: "Pitch to Angels", actionKey: "pitch" },
      { label: "Find Co-founder", actionKey: "cofounder" },
      { label: "Apply to Grant", actionKey: "grant" },
    ],
    featuredOpportunity: null,
    featuredProfile: null,
    bentoGrid: [],
    feedPosts: [],
  },

  // 3. COMPANY_OWNER: Running established company, hiring or partnering
  COMPANY_OWNER: {
    label: "Company Owner",
    badgeLabel: "Company Owner",
    badgeColorClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    borderClass: "border-blue-500/20",
    accentColor: "#3B82F6",
    icon: <Building2 size={16} />,
    roleDescription: "Enterprise & SME",
    greetingTitle: "Enterprise & Business Hub 🏢",
    greetingSubtitle: "Corporate vendor proposals, B2B deal flow & executive recruitment.",
    stats: [],
    quickActions: [
      { label: "Post Job / RFP", actionKey: "rfp" },
      { label: "B2B Vendor Directory", actionKey: "vendors" },
      { label: "Corporate Tax Perks", actionKey: "perks" },
    ],
    featuredOpportunity: null,
    featuredProfile: null,
    bentoGrid: [],
    feedPosts: [],
  },

  // 4. INVESTOR: Angel, VC, or family office looking for deal flow
  INVESTOR: {
    label: "Investor",
    badgeLabel: "Investor",
    badgeColorClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500/20",
    accentColor: "#F59E0B",
    icon: <Briefcase size={16} />,
    roleDescription: "Angel & VC Terminal",
    greetingTitle: "Investor Deal Flow Terminal 💼",
    greetingSubtitle: "Curated Indian startup pipeline, due diligence rooms & syndicate deals.",
    stats: [],
    quickActions: [
      { label: "Browse Deal Pipeline", actionKey: "deals" },
      { label: "Lead a Syndicate", actionKey: "syndicate" },
      { label: "Request Founder Demo", actionKey: "demo" },
    ],
    featuredOpportunity: null,
    featuredProfile: null,
    bentoGrid: [],
    feedPosts: [],
  },
};

const HOME_TABS = [
  { key: "home", label: "Home" },
  { key: "discover", label: "Discover" },
  { key: "hub", label: "Hub" },
  { key: "ideas", label: "Ideas" },
  { key: "meetups", label: "Meetups" },
];

export default function HomeClient() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const activeRole: AccountType = user?.type && ROLE_CONFIGS[user.type]
    ? user.type
    : "STARTUP_FOUNDER";

  const config = ROLE_CONFIGS[activeRole];

  const [activeTab, setActiveTab] = useState("dashboard"); // Internal page tab: dashboard or feed
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [showPostBox, setShowPostBox] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real data states
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; author: string }>(FALLBACK_QUOTES[activeRole]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [todayMeetups, setTodayMeetups] = useState<MeetupEvent[]>([]);
  const [activeAd, setActiveAd] = useState<AdItem | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Private To-Do list (session-local only, no fake pre-filled data)
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    setTodos((prev) => [...prev, { id: "td-" + Date.now(), text: newTodo.trim(), done: false }]);
    setNewTodo("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setStatsLoading(true);
      try {
        const [quote, ad, meetups] = await Promise.all([
          dataService.fetchDailyQuote(activeRole),
          dataService.fetchActiveAd(),
          dataService.fetchTodayMeetups(),
        ]);
        setDailyQuote(quote);
        setActiveAd(ad);
        setTodayMeetups(meetups);

        if (user?.id) {
          const stats = await dataService.fetchUserStats(user.id);
          setUserStats(stats);
        }
      } catch (e) {
        console.warn("Failed to load home data:", e);
      } finally {
        setStatsLoading(false);
      }
    }
    loadData();
  }, [user?.id, activeRole]);

  useEffect(() => {
    async function loadFeed() {
      setFeedLoading(true);
      try {
        const dbPosts = await dataService.fetchFeedPosts(user?.id);
        setPosts(dbPosts.map(dbPostToUiPost));
      } catch {
        // keep empty
      } finally {
        setFeedLoading(false);
      }
    }
    loadFeed();
  }, [user?.id]);

  async function handleLike(id: string) {
    if (!user?.id) return;
    const post = posts.find((p) => p.id === id);
    const willBeLiked = !post?.liked;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: willBeLiked, likeCount: willBeLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) }
          : p
      )
    );

    try {
      await dataService.togglePostLike(id, user.id, !willBeLiked);
    } catch (err) {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: !willBeLiked, likeCount: !willBeLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) }
            : p
        )
      );
      console.error("Like toggle error:", err);
    }
  }

  const handleShare = async (post: FeedPost) => {
    // Share a link directly to this post (opens home feed)
    const url = typeof window !== "undefined" ? `${window.location.origin}/home?post=${post.id}` : "";
    let shared = false;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${post.authorName} on COLLAB`,
          text: post.body.slice(0, 120) + (post.body.length > 120 ? "…" : ""),
          url,
        });
        shared = true;
        setToastMessage("Shared successfully!");
      } catch {
        // user cancelled or share failed, fallback
      }
    }
    if (!shared && typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setToastMessage("Post link copied to clipboard!");
      } catch {
        setToastMessage("Link: " + url);
      }
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleComment = (post: FeedPost) => {
    setCommentPost(post);
  };

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostText.trim() || !user?.id) return;
    const bodyText = newPostText.trim();
    setNewPostText("");
    setShowPostBox(false);

    try {
      const newPost = await dataService.createPost(user.id, bodyText);
      if (newPost) {
        setPosts((prev) => [dbPostToUiPost(newPost), ...prev]);
      }
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* Top bar */}
      <TopBar />

      {/* Inline Comment Drawer */}
      <AnimatePresence>
        {commentPost && (
          <CommentDrawer
            post={commentPost}
            currentUserId={user?.id}
            onClose={() => setCommentPost(null)}
            onCommentAdded={(postId) => {
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
                )
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-[#1C1C1E] border border-[#A24BFF]/40 text-white text-[13px] font-medium rounded-2xl shadow-2xl backdrop-blur-xl whitespace-nowrap flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#A24BFF] animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto pb-32"
        id="main-content"
      >
        <div className="px-4 pt-6 max-w-full mx-auto w-full">
          {/* ══════════ TOP ROW: ACCOUNT CLASS + DAILY QUOTE (B1) ══════════ */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Single Account Class Header */}
            <div className="p-3.5 rounded-2xl bg-[#0F0F12] border border-[#1E1E22] relative overflow-hidden flex flex-col justify-center">
              {/* Subtle ambient role glow */}
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-20"
                style={{ background: config.accentColor }}
              />

              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar 
                    name={user?.userHandle ? `@${user.userHandle}` : "Founder"} 
                    photoUrl={user?.avatarUrl}
                    size="md" 
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-[14px] truncate leading-tight">
                      {user?.userHandle ? `@${user.userHandle}` : "Welcome back"}
                    </p>
                    <p className="text-[#8E8E93] text-[11px] truncate mt-0.5 leading-tight">
                      {config.roleDescription}
                    </p>
                  </div>
                </div>

                {/* Single Account Class Badge */}
                <div
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shrink-0 shadow-sm bg-black/20",
                    config.badgeColorClass
                  )}
                >
                  <span className="shrink-0">{config.icon}</span>
                  <span className="truncate max-w-[70px] xs:max-w-none">{config.badgeLabel}</span>
                </div>
              </div>
            </div>

            {/* Daily Quote Widget (B1) */}
            <div data-testid="daily-quote" className="p-4 rounded-2xl bg-[#0F0F12] border border-[#1E1E22] relative overflow-hidden flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center justify-between text-[10px] text-[#8E8E93] mb-1.5 gap-2">
                <span className="uppercase tracking-wider font-semibold text-[#A24BFF] truncate">
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="text-[10px] text-[#6E6E73] shrink-0">Daily Inspiration</span>
              </div>
              <blockquote className="text-white text-[13px] italic font-medium leading-relaxed">
                &ldquo;{dailyQuote?.quote || FALLBACK_QUOTES[activeRole]?.quote || "Build relentlessly."}&rdquo;
              </blockquote>
              <p className="text-[#8E8E93] text-[11px] mt-1.5 text-right font-medium">
                — {dailyQuote?.author || FALLBACK_QUOTES[activeRole]?.author || "Founder"}
              </p>
            </div>
          </div>

          {/* Top Switcher Tabs */}
          <div className="flex items-center bg-[#1C1C1E] p-1 rounded-2xl mb-5 w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all truncate px-1 text-center",
                activeTab === "dashboard"
                  ? "bg-white text-black shadow"
                  : "text-[#8E8E93] hover:text-white"
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={cn(
                "flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all truncate px-1 text-center",
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

              {/* 4 Real Server-Computed Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Connections",
                    value: statsLoading ? "…" : (userStats?.connectionsCount ?? 0).toString(),
                    sublabel: "Network peers",
                    trend: "Real",
                  },
                  {
                    label: "Feed Updates",
                    value: statsLoading ? "…" : (userStats?.postsCount ?? 0).toString(),
                    sublabel: "Published",
                    trend: "Live",
                  },
                  {
                    label: "Profile",
                    value: statsLoading ? "…" : `${userStats?.profileCompleteness ?? 20}%`,
                    sublabel: "Setup status",
                    trend: (userStats?.profileCompleteness ?? 20) === 100 ? "Done" : "Action",
                  },
                  {
                    label: "RSVPs",
                    value: statsLoading ? "…" : (userStats?.upcomingMeetupsCount ?? 0).toString(),
                    sublabel: "Attending",
                    trend: "Events",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#121214] border border-[#1E1E22] hover:border-[#2A2A2E] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#71717A] mb-1 gap-1">
                      <span className="truncate pr-1">{s.label}</span>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          background: `${config.accentColor}15`,
                          color: config.accentColor,
                        }}
                      >
                        {s.trend}
                      </span>
                    </div>
                    <p className="text-white text-[18px] font-bold tracking-tight leading-tight break-words">
                      {s.value}
                    </p>
                    <p className="text-[#8E8E93] text-[10px] mt-0.5 break-words">
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
                        router.push("/discover");
                      } else if (qa.actionKey === "cofounder" || qa.actionKey === "mentors") {
                        router.push("/ideas");
                      } else if (qa.actionKey === "grant" || qa.actionKey === "perks") {
                        router.push("/plans");
                      } else {
                        setActiveTab("feed");
                        setShowPostBox(true);
                      }
                    }}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2A2A2E] text-white text-[11px] font-medium hover:border-white/30 flex items-center gap-1.5 shrink-0 transition-colors"
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

              {/* ══════════ LAUNCH CHECKLIST (B10) ══════════ */}
              <div className="bg-[#0F0F12] border border-[#1E1E22] rounded-2xl p-4 space-y-3">
                {(() => {
                  const checklist = [
                    { label: "Complete profile", done: (userStats?.profileCompleteness ?? 20) >= 50, href: "/profile" },
                    { label: "Connect with founders", done: (userStats?.connectionsCount ?? 0) > 0, href: "/hub" },
                    { label: "Share startup idea", done: false, href: "/ideas" },
                    { label: "Post update", done: (userStats?.postsCount ?? 0) > 0, href: "#feed-anchor" },
                    { label: "RSVP to meetup", done: (userStats?.upcomingMeetupsCount ?? 0) > 0, href: "/meetups" },
                  ];
                  const doneCount = checklist.filter((c) => c.done).length;
                  const percent = Math.round((doneCount / checklist.length) * 100);

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-[15px] flex items-center gap-2">
                            <Sparkles size={16} className="text-[#D4FF3A]" /> Launch Checklist
                          </h3>
                          <p className="text-[#8E8E93] text-[11px] mt-0.5">
                            {doneCount} of {checklist.length} achieved
                          </p>
                        </div>
                        <span className="text-[12px] font-bold text-[#D4FF3A] bg-[#D4FF3A]/10 px-2 py-0.5 rounded-full border border-[#D4FF3A]/20">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-[#1C1C1E] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#A24BFF] to-[#D4FF3A] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex flex-col gap-2.5 pt-1 text-[12px]">
                        {checklist.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-[#1E1E22]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={cn(
                                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                                  item.done
                                    ? "bg-[#D4FF3A] text-black font-bold"
                                    : "border border-[#3A3A3E] text-transparent"
                                )}
                              >
                                ✓
                              </span>
                              <span className={cn("break-words pr-2", item.done ? "line-through text-[#6E6E73]" : "text-white font-medium")}>
                                {item.label}
                              </span>
                            </div>
                            {item.href && !item.done && (
                              <button
                                onClick={() => {
                                  if (item.href === "#feed-anchor") {
                                    setActiveTab("feed");
                                    setShowPostBox(true);
                                  } else {
                                    router.push(item.href);
                                  }
                                }}
                                className="text-[#A24BFF] hover:underline text-[11px] font-semibold shrink-0 ml-2"
                              >
                                Start →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Lower column widgets row */}
              <div className="flex flex-col gap-4">
                {/* ══════════ TODAY'S MEETUPS BLOCK (B9) ══════════ */}
                <div className="bg-[#0F0F12] border border-[#1E1E22] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-[15px]">Today&apos;s Meetups</h3>
                    <Link href="/meetups" className="text-[12px] text-[#A24BFF] hover:underline">
                      All →
                    </Link>
                  </div>
                  {todayMeetups.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#141416] border border-[#222226] text-center space-y-1.5">
                      <p className="text-[#8E8E93] text-[12px]">No meetups today.</p>
                      <Link href="/meetups" className="inline-block text-[11px] text-[#A24BFF] hover:underline font-semibold">
                        Browse mixers →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#141416] border border-[#222226] flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-[13px] break-words truncate">{todayMeetups[0].title}</p>
                        <p className="text-[#8E8E93] text-[11px] break-words truncate mt-0.5">
                          {todayMeetups[0].location} · {todayMeetups[0].attendee_count} attending
                        </p>
                      </div>
                      <Link
                        href="/meetups"
                        className="px-3 py-1.5 bg-[#A24BFF] text-white text-[12px] font-medium rounded-xl hover:bg-[#8e3eee] transition-colors shrink-0"
                      >
                        RSVP
                      </Link>
                    </div>
                  )}
                </div>

                {/* ══════════ ADS PANEL (B4) ══════════ */}
                <div data-testid="ads-panel" className="bg-[#0F0F12] border border-[#1E1E22] rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1A6] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {activeAd ? "Sponsored" : "COLLAB Ecosystem"}
                    </span>
                    <span className="text-[11px] text-[#6E6E73]">
                      {activeAd?.sponsor_name || activeAd?.business_name || "Startup Perks"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-white font-bold text-[15px]">
                      {activeAd ? (activeAd.title || activeAd.headline) : "Verified Startup Grants & Perks"}
                    </h4>
                    <p className="text-[#8E8E93] text-[12px] mt-1 leading-snug">
                      {activeAd
                        ? activeAd.description
                        : "Get cloud credits, legal templates, and priority intros with verified angels."}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-[#1E1E22]">
                    <span className="text-[#D4FF3A] text-[12px] font-medium">
                      {activeAd?.tag || "COLLAB Pro"}
                    </span>
                    <a
                      href={activeAd?.cta_link || activeAd?.website || "/plans"}
                      className="px-3 py-1 bg-white text-black text-[11px] font-bold rounded-lg transition-colors"
                    >
                      {activeAd?.cta_text || activeAd?.button_text || "Explore"}
                    </a>
                  </div>
                </div>

                {/* ══════════ PRIVATE TO-DO LIST (B7) ══════════ */}
                <div data-testid="todo-list" className="bg-[#0F0F12] border border-[#1E1E22] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-semibold text-white flex items-center gap-2">
                      <CheckSquare size={15} className="text-[#A24BFF]" /> Private To-do List
                    </span>
                    <span className="text-[11px] text-[#6E6E73]">
                      {todos.filter((t) => t.done).length}/{todos.length}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTodo();
                      }}
                      placeholder="Add task…"
                      className="flex-1 bg-[#161618] text-white rounded-xl px-3 py-1.5 text-[12px] border border-[#26262A] outline-none focus:border-[#A24BFF]"
                    />
                    <button
                      onClick={handleAddTodo}
                      className="px-3 py-1.5 bg-[#A24BFF] text-white text-[12px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#141416] border border-[#1E1E22] text-[12px]"
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className={cn(
                            "flex items-center gap-2 text-left flex-1 min-w-0",
                            todo.done ? "line-through text-[#6E6E73]" : "text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                              todo.done ? "bg-[#A24BFF] border-[#A24BFF]" : "border-[#3A3A3E]"
                            )}
                          >
                            {todo.done && <Check size={11} className="text-white" />}
                          </span>
                          <span className="truncate">{todo.text}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-[#6E6E73] hover:text-red-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
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
              className="flex flex-col gap-4"
            >
              {/* Main Stream */}
              <div className="space-y-4">
                {/* Quick Post Trigger */}
                <div className="p-3 bg-[#0F0F11] border border-[#1C1C1E] rounded-2xl">
                  {!showPostBox ? (
                    <button
                      onClick={() => setShowPostBox(true)}
                      className="w-full flex items-center gap-3 text-left py-2 px-3 rounded-xl bg-[#1C1C1E] text-[#8E8E93] text-[14px] hover:text-white transition-colors"
                    >
                      <Avatar name={user?.name || user?.userHandle || "Me"} photoUrl={user?.avatarUrl} size="sm" />
                      <span>Share an update…</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreatePost} className="space-y-3 pt-1">
                      <textarea
                        autoFocus
                        rows={3}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder={`Share with the community…`}
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
                            Post
                          </GradientRingButton>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Skeletons while loading */}
                {feedLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1C1C1E]" />
                          <div className="space-y-1.5 flex-1">
                            <div className="w-32 h-3.5 bg-[#1C1C1E] rounded" />
                            <div className="w-20 h-2.5 bg-[#1C1C1E] rounded" />
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="w-full h-3 bg-[#1C1C1E] rounded" />
                          <div className="w-4/5 h-3 bg-[#1C1C1E] rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!feedLoading && posts.length === 0 && (
                  <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#A24BFF]">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-white font-bold text-[16px]">No community posts yet</h3>
                    <p className="text-[#8E8E93] text-[13px] mx-auto">
                      Be the first to share an update to the COLLAB network.
                    </p>
                    <button
                      onClick={() => setShowPostBox(true)}
                      className="px-4 py-2 bg-[#A24BFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
                    >
                      Share First Update
                    </button>
                  </div>
                )}

                {/* Feed Posts */}
                {!feedLoading &&
                  posts.map((post, index) => (
                    <div key={post.id} className="space-y-4">
                      <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 hover:border-[#2A2A2E] transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar name={post.authorName} photoUrl={post.authorAvatarUrl} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-white font-semibold text-[15px] leading-tight truncate max-w-[120px]">
                                  {post.authorName}
                                </p>
                                <span className="text-[#6E6E73] text-[12px] truncate max-w-[80px]">@{post.authorHandle}</span>
                              </div>
                              <p className="text-[#8E8E93] text-[12px] leading-snug mt-0.5 truncate max-w-[200px]">
                                {post.authorHeadline}
                              </p>
                            </div>
                          </div>
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
                            <button
                              onClick={() => handleComment(post)}
                              className="flex items-center gap-1.5 hover:text-white transition-colors"
                            >
                              <MessageCircle size={16} />
                              <span>{post.commentCount}</span>
                            </button>
                            <button
                              onClick={() => handleShare(post)}
                              className="hover:text-white transition-colors"
                            >
                              <Share2 size={15} />
                            </button>
                          </div>
                          <TimeAgo date={post.createdAt} fallback="1h" className="text-[11px] text-[#6E6E73]" />
                        </div>
                      </div>

                      {/* Inject rotating sponsor ad every 2 posts */}
                      {(index + 1) % 2 === 0 && (() => {
                        const SPONSOR_ADS = [
                          {
                            sponsor: "AWS for Startups",
                            color: "#FF9900",
                            title: "Claim up to $25,000 in AWS Cloud Credits",
                            desc: "Accelerate your compute and AI workloads with free AWS promotional credits and 1-on-1 architecture reviews.",
                            cta: "Claim Credits",
                            href: "https://aws.amazon.com/startups/",
                            badge: "🚀 Cloud Deal",
                          },
                          {
                            sponsor: "COLLAB Pro",
                            color: "#A24BFF",
                            title: "Unlock 500+ Verified Angel Introductions",
                            desc: "Direct access to top angels, standard legal SAFE templates, and priority discoverability on COLLAB.",
                            cta: "Upgrade to Pro",
                            href: "/plans",
                            badge: "⚡ COLLAB",
                          },
                          {
                            sponsor: "Razorpay Rize",
                            color: "#3395FF",
                            title: "Zero Gateway Fees + Instant Incorporation",
                            desc: "Accept payments globally with zero platform fee for first 3 months plus dedicated startup banking support.",
                            cta: "Join Rize",
                            href: "https://razorpay.com/rize/",
                            badge: "💳 Fintech",
                          },
                          {
                            sponsor: "Google Cloud for Startups",
                            color: "#34A853",
                            title: "Build with Gemini 1.5 & Vertex AI Credits",
                            desc: "Get up to $100K in Google Cloud credits, technical mentoring, and Google Workspace for your core team.",
                            cta: "Apply Now",
                            href: "https://cloud.google.com/startup",
                            badge: "☁️ AI Credits",
                          },
                          {
                            sponsor: "Zoho for Startups",
                            color: "#E44D2E",
                            title: "Zoho One — Free 30+ Startup Apps for 1 Year",
                            desc: "CRM, books, invoices, contracts, payroll, and recruiting suite free for newly registered startups.",
                            cta: "Get Suite",
                            href: "https://www.zoho.com/startups/",
                            badge: "🏢 SaaS Bundle",
                          },
                        ];
                        const adIdx = Math.floor(index / 2) % SPONSOR_ADS.length;
                        const ad = activeAd && index === 1 ? {
                          sponsor: activeAd.sponsor_name || "COLLAB Partners",
                          color: "#A24BFF",
                          title: activeAd.title,
                          desc: activeAd.description,
                          cta: activeAd.cta_text || "Learn More",
                          href: activeAd.cta_link || "/plans",
                          badge: "Featured Partner",
                        } : SPONSOR_ADS[adIdx];

                        return (
                          <div className="bg-[#0F0F12] border border-[#1E1E22] rounded-2xl p-4 space-y-2.5 transition-all hover:border-[#2C2C32]">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                                style={{ color: ad.color, backgroundColor: `${ad.color}15`, borderColor: `${ad.color}40` }}
                              >
                                Sponsored
                              </span>
                              <span className="text-[11px] text-[#8E8E93]">{ad.sponsor}</span>
                            </div>
                            <div>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5"
                                style={{ color: ad.color, backgroundColor: `${ad.color}15` }}
                              >
                                {ad.badge}
                              </span>
                              <h4 className="text-white font-bold text-[15px]">{ad.title}</h4>
                              <p className="text-[#8E8E93] text-[12px] mt-1 leading-snug">{ad.desc}</p>
                            </div>
                            <div className="pt-2 flex items-center justify-between border-t border-[#1E1E22]">
                              <span className="text-[#D4FF3A] text-[12px] font-medium">Featured Deal</span>
                              <a
                                href={ad.href}
                                target={ad.href.startsWith("http") ? "_blank" : undefined}
                                rel={ad.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="px-3 py-1.5 text-black text-[11px] font-bold rounded-lg transition-colors"
                                style={{ backgroundColor: ad.color }}
                              >
                                {ad.cta}
                              </a>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
              </div>

              <div className="h-6" />
            </motion.div>
          )}
        </div>
      </main>

      {/* Bottom dock */}
      <BottomDock
        activeTab="home"
        tabs={HOME_TABS}
        onTabChange={(key) => {
          if (key === "home") {
            setActiveTab("dashboard");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const route = NAV_TABS.find((t) => t.key === key);
            if (route) router.push(route.href);
          }
        }}
        userName={user?.name || user?.userHandle || ""}
      />
    </div>
  );
}
