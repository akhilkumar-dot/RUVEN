"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Zap } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { relativeTime, cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface PostItem {
  id: string;
  authorHandle: string;
  authorHeadline?: string;
  body: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  liked?: boolean;
}

// ── Mock posts ────────────────────────────────────────────────
const MOCK_POSTS: PostItem[] = [
  {
    id: "1",
    authorHandle: "priya_founder",
    authorHeadline: "Co-founder @ Sattva Health · Ex-Apollo",
    body: "Just crossed ₹1 Cr ARR with a team of 4. No VC. No big office. Just product-market fit and relentless customer obsession.\n\nIndia's next wave of startups will be lean, profitable, and real. 🇮🇳",
    likeCount: 312,
    commentCount: 47,
    createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
  {
    id: "2",
    authorHandle: "arjun_vc",
    authorHeadline: "Partner @ Blume Ventures",
    body: "Hot take: The best Indian founders I've met in 2024 are solving problems that *only* exist in India — not 'Uber for X' clones.\n\nThe India Stack moment is real. BharatPe, PhonePe, Zepto all started from genuine Indian problems.",
    likeCount: 891,
    commentCount: 134,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "3",
    authorHandle: "deepstack_ai",
    authorHeadline: "Building LLM infra for Indian SMEs",
    body: "We just open-sourced our multilingual embedding model trained on 12 Indian languages.\n\nHindi, Tamil, Telugu, Kannada, Bengali, Gujarati, Marathi, Punjabi, Odia, Malayalam, Assamese, Urdu — all in one model, 4x smaller than alternatives.\n\nGitHub link in comments 👇",
    likeCount: 2140,
    commentCount: 289,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "4",
    authorHandle: "neha_design",
    authorHeadline: "Design Lead · Building in public",
    body: "Design tip nobody talks about:\n\nStop asking \"does this look good?\"\nStart asking \"does this reduce friction?\"\n\nThe best UX is the one users don't notice.",
    likeCount: 445,
    commentCount: 61,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

// ── Post card ─────────────────────────────────────────────────
function PostCard({ post }: { post: PostItem }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  function toggleLike() {
    setLiked(v => !v);
    setLikeCount(c => liked ? c - 1 : c + 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4"
    >
      {/* Author row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.authorHandle} size="md" />
          <div>
            <p className="text-white font-semibold text-[15px] leading-tight">
              @{post.authorHandle}
            </p>
            {post.authorHeadline && (
              <p className="text-[#6E6E73] text-[12px] leading-tight mt-0.5">
                {post.authorHeadline}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6E6E73] text-[12px]">
            {relativeTime(new Date(post.createdAt))}
          </span>
          <button className="text-[#6E6E73] hover:text-white transition-colors" aria-label="More options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
        {post.body}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-[#1C1C1E] pt-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
            liked ? "text-[#FF3D81]" : "text-[#6E6E73] hover:text-white"
          )}
        >
          <Heart size={16} fill={liked ? "#FF3D81" : "none"} />
          {likeCount.toLocaleString("en-IN")}
        </motion.button>

        <button className="flex items-center gap-1.5 text-[#6E6E73] text-[13px] hover:text-white transition-colors">
          <MessageCircle size={16} />
          {post.commentCount}
        </button>

        <button className="flex items-center gap-1.5 text-[#6E6E73] text-[13px] hover:text-white transition-colors ml-auto">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </motion.div>
  );
}

// ── Quick post bar ────────────────────────────────────────────
function QuickPostBar({ onPost }: { onPost: (body: string) => void }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  function submit() {
    if (body.trim()) { onPost(body.trim()); setBody(""); setOpen(false); }
  }

  return (
    <div className="mb-4">
      {!open ? (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl px-4 py-3.5 text-[#6E6E73] text-[15px] hover:border-[#2A2A2D] transition-colors"
        >
          <Zap size={16} className="text-[#A24BFF]" />
          Share something with the community…
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-[#0C0C0C] border border-[#A24BFF]/40 rounded-2xl p-4 space-y-3"
          >
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What's on your mind, founder?"
              autoFocus
              rows={4}
              className="w-full bg-transparent text-white text-[15px] outline-none resize-none placeholder:text-[#6E6E73]"
            />
            <div className="flex justify-between items-center">
              <span className={cn("text-[12px]", body.length > 1800 ? "text-red-400" : "text-[#6E6E73]")}>
                {body.length}/2000
              </span>
              <div className="flex gap-2">
                <button onClick={() => { setOpen(false); setBody(""); }}
                  className="px-4 py-2 rounded-full text-[13px] text-[#6E6E73] hover:text-white transition-colors">
                  Cancel
                </button>
                <GradientRingButton size="sm" onClick={submit} disabled={!body.trim()}>
                  Post
                </GradientRingButton>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Tab toggle ────────────────────────────────────────────────
const FEED_TABS = [
  { key: "feed", label: "Feed" },
  { key: "founders", label: "Founders" },
];

// ── Main feed page ────────────────────────────────────────────
export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState(MOCK_POSTS);

  function handlePost(body: string) {
    const newPost: PostItem = {
      id: String(Date.now()),
      authorHandle: "aarav1234",
      authorHeadline: "Building AI infrastructure for Indian SMEs",
      body,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={9} />

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-3 pt-3 max-w-[430px] mx-auto space-y-3">
          <QuickPostBar onPost={handlePost} />
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      <BottomDock
        activeTab={activeTab}
        tabs={FEED_TABS}
        onTabChange={setActiveTab}
        onCreateOpen={() => {}}
        userName="Aarav Reddy"
      />
    </div>
  );
}
