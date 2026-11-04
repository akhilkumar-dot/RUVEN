"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ThumbsUp, Tag, Plus, X, ChevronRight, Flame, Send, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService, type StartupIdea } from "@/lib/api/dataService";

// ── Collaborate Modal ─────────────────────────────────────────
function CollaborateModal({
  idea,
  currentUserId,
  onClose,
}: {
  idea: StartupIdea;
  currentUserId?: string;
  onClose: () => void;
}) {
  const [pitch, setPitch] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pitch.trim() || !currentUserId || submitting) return;
    setSubmitting(true);
    try {
      await dataService.createDirectChat(currentUserId, idea.author_id, `[Collaboration Ask for "${idea.title}"]\n${pitch.trim()}`);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      console.error("Collaborate request error:", err);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121214] border border-[#222226] rounded-2xl p-5 max-w-[420px] w-full text-white space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[16px] text-white">Apply to Collaborate</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-[13px] text-[#A24BFF] font-semibold">{idea.title}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Author: @{idea.author.user_handle}</p>
          {idea.looking_for && (
            <p className="text-[11px] text-[#D4FF3A] bg-[#D4FF3A]/10 border border-[#D4FF3A]/20 px-2 py-1 rounded-lg mt-2">
              Looking for: {idea.looking_for}
            </p>
          )}
        </div>

        {sent ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-[15px]">Message & Request Sent!</p>
            <p className="text-[#8E8E93] text-[12px]">
              A direct conversation has been started with @{idea.author.user_handle}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Your Pitch & Experience</label>
              <textarea
                autoFocus
                required
                rows={4}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Explain why you're a great fit (skills, previous projects, time commitment)…"
                className="w-full bg-[#1A1A1E] text-white rounded-xl p-3 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF] resize-none"
              />
            </div>
            <GradientRingButton size="md" type="submit" className="w-full" disabled={!pitch.trim() || submitting}>
              <Send size={14} /> {submitting ? "Sending…" : "Send Collaboration Application"}
            </GradientRingButton>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Idea Card ─────────────────────────────────────────────────
function IdeaCard({
  idea,
  currentUserId,
  onCollaborate,
  onUpvoteToggle,
}: {
  idea: StartupIdea;
  currentUserId?: string;
  onCollaborate: (idea: StartupIdea) => void;
  onUpvoteToggle: (ideaId: string) => void;
}) {
  const isUpvoted = Boolean(idea.hasUpvoted);
  const tagList = idea.tags ? idea.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 h-full flex flex-col justify-between hover:border-[#2A2A2D] transition-colors"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={idea.author.name || idea.author.user_handle} size="sm" />
            <span className="text-[#A1A1A6] text-[13px]">@{idea.author.user_handle}</span>
          </div>
          <TimeAgo date={idea.created_at} fallback="today" className="text-[#6E6E73] text-[12px]" />
        </div>

        <h3 className="text-white font-semibold text-[16px] leading-snug">{idea.title}</h3>
        <p className="text-[#A1A1A6] text-[14px] leading-relaxed line-clamp-3">{idea.description}</p>

        {tagList.length > 0 && (
          <div className="flex gap-1.5 flex-wrap pt-1">
            {tagList.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {idea.looking_for && (
          <div className="flex items-start gap-2 bg-[#A24BFF]/10 border border-[#A24BFF]/20 rounded-xl px-3 py-2">
            <span className="text-[#A24BFF] text-[11px] font-semibold shrink-0 mt-0.5">Looking for</span>
            <span className="text-[#A24BFF] text-[12px] leading-snug">{idea.looking_for}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1E]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={!currentUserId}
          onClick={() => onUpvoteToggle(idea.id)}
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-semibold transition-colors px-2 py-1 rounded-lg",
            isUpvoted ? "text-[#FF8A3D] bg-[#FF8A3D]/10" : "text-[#8E8E93] hover:text-white"
          )}
        >
          <ThumbsUp size={15} fill={isUpvoted ? "#FF8A3D" : "none"} />
          <span>{idea.upvote_count}</span>
        </motion.button>

        {currentUserId !== idea.author_id && (
          <button
            onClick={() => onCollaborate(idea)}
            className="flex items-center gap-1 text-[#A24BFF] text-[13px] font-semibold hover:opacity-80 transition-opacity"
          >
            Collaborate <ChevronRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Post Idea Form ────────────────────────────────────────────
function PostIdeaForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (idea: StartupIdea) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["AI/ML", "SaaS"]);
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !user?.id || submitting) return;
    setSubmitting(true);

    try {
      const created = await dataService.createIdea(
        user.id,
        title.trim(),
        desc.trim(),
        lookingFor.trim(),
        tags.join(", ")
      );
      if (created) {
        onCreated(created);
      }
      onClose();
    } catch (err) {
      console.error("Failed to post idea:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-[#0C0C0C] border border-[#A24BFF]/30 rounded-2xl p-4.5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-[16px]">Share an Idea or Co-founder Ask</h3>
        <button type="button" onClick={onClose} className="text-[#6E6E73] hover:text-white">
          <X size={18} />
        </button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Idea title (e.g. Offline Voice AI for Rural Kiranas)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-2.5 text-[15px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the problem, target market, and what you are building…"
        rows={4}
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] resize-none"
      />
      <input
        value={lookingFor}
        onChange={(e) => setLookingFor(e.target.value)}
        placeholder="Looking for… (e.g. Technical Co-founder with Rust / ML experience)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-2.5 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
      />
      <div className="flex gap-2">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                setTags((t) => [...t, tagInput.trim()]);
              }
              setTagInput("");
            }
          }}
          placeholder="Add tag and press Enter"
          className="flex-1 bg-[#1C1C1E] text-white rounded-xl px-4 py-2 text-[13px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
        />
      </div>
      {tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {tags.map((t) => (
            <span
              key={t}
              onClick={() => setTags((ts) => ts.filter((x) => x !== t))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A24BFF]/10 border border-[#A24BFF]/30 text-[#A24BFF] text-[12px] cursor-pointer hover:bg-[#A24BFF]/20"
            >
              {t}
              <X size={10} />
            </span>
          ))}
        </div>
      )}
      <GradientRingButton size="md" type="submit" className="w-full" disabled={!title.trim() || !desc.trim() || submitting}>
        <Lightbulb size={16} /> {submitting ? "Publishing…" : "Post Idea to Ecosystem"}
      </GradientRingButton>
    </motion.form>
  );
}

// ── Ideas Page Content ────────────────────────────────────────
const SORT_TABS = ["Trending", "Recent", "My Ideas"];

function IdeasPageContent() {
  const user = useAuthStore((s) => s.user);

  const [sort, setSort] = useState("Trending");
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [collaboratingIdea, setCollaboratingIdea] = useState<StartupIdea | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadIdeas() {
      setLoading(true);
      try {
        const data = await dataService.fetchIdeas(user?.id);
        if (!isCancelled) setIdeas(data);
      } catch (err) {
        console.error("Failed to load ideas:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadIdeas();
    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  async function handleToggleUpvote(ideaId: string) {
    if (!user?.id) return;
    const target = ideas.find((i) => i.id === ideaId);
    if (!target) return;

    const willBeUpvoted = !target.hasUpvoted;
    const newCount = willBeUpvoted ? target.upvote_count + 1 : Math.max(0, target.upvote_count - 1);

    // Optimistic update
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === ideaId ? { ...i, hasUpvoted: willBeUpvoted, upvote_count: newCount } : i
      )
    );

    try {
      await dataService.toggleIdeaUpvote(ideaId, user.id, !willBeUpvoted);
    } catch (err) {
      console.error("Upvote error:", err);
      // Revert on error
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId
            ? { ...i, hasUpvoted: target.hasUpvoted, upvote_count: target.upvote_count }
            : i
        )
      );
    }
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (sort === "My Ideas") {
      return idea.author_id === user?.id;
    }
    return true;
  }).sort((a, b) => {
    if (sort === "Trending") {
      return b.upvote_count - a.upvote_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={0} />

      <div className="px-4 pt-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-[#FF8A3D]" />
            <h1 className="text-white font-bold text-[20px]">Ideas & Asks</h1>
          </div>
          <GradientRingButton size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Share
          </GradientRingButton>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {SORT_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setSort(t)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap",
                sort === t
                  ? "bg-[#A24BFF] text-white"
                  : "bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2D] hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-4 w-full space-y-4">
          <AnimatePresence>
            {showForm && (
              <PostIdeaForm
                key="form"
                onClose={() => setShowForm(false)}
                onCreated={(newIdea) => setIdeas((prev) => [newIdea, ...prev])}
              />
            )}
          </AnimatePresence>

          {/* Skeletons while loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1C1C1E]" />
                    <div className="w-24 h-3 bg-[#1C1C1E] rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-[#1C1C1E] rounded" />
                  <div className="h-12 w-full bg-[#1C1C1E] rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredIdeas.length === 0 && (
            <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
              <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#FF8A3D]">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-white font-bold text-[16px]">
                {sort === "My Ideas" ? "No ideas yet" : "No startup ideas yet"}
              </h3>
              <p className="text-[#8E8E93] text-[13px]">
                {sort === "My Ideas"
                  ? "Share what problem you are solving."
                  : "Be the first to share a breakthrough concept."}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-[#A24BFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
              >
                Share Idea
              </button>
            </div>
          )}

          {/* Ideas List */}
          {!loading && (
            <div className="flex flex-col gap-4">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUserId={user?.id}
                  onCollaborate={(selected) => setCollaboratingIdea(selected)}
                  onUpvoteToggle={handleToggleUpvote}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {collaboratingIdea && (
        <CollaborateModal
          idea={collaboratingIdea}
          currentUserId={user?.id}
          onClose={() => setCollaboratingIdea(null)}
        />
      )}

      <BottomDock
        activeTab="ideas"
        userName={user?.name || user?.userHandle || ""}
      />
    </div>
  );
}

export default function IdeasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF8A3D] border-t-transparent animate-spin" />
        </div>
      }
    >
      <IdeasPageContent />
    </Suspense>
  );
}
