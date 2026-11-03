"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ThumbsUp, MessageCircle, Tag, Plus, X, ChevronRight, Flame, Send, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

interface Idea {
  id: string;
  authorHandle: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  comments: number;
  createdAt: string;
  upvoted?: boolean;
  lookingFor?: string;
}

const SEED_IDEAS: Idea[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    authorHandle: "priya_founder",
    title: "Vernacular Voice AI for Rural Kiranas",
    description: "Rural NBFCs and kiranas lose 40% of customers due to language friction. An offline-first voice ordering LLM in 8 Indian regional languages.",
    tags: ["Fintech", "AI/ML", "Rural India", "B2B SaaS"],
    upvotes: 84,
    comments: 12,
    createdAt: "2026-11-03T16:00:00.000Z",
    lookingFor: "Technical co-founder (ML / Whisper fine-tuning)",
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    authorHandle: "arjun_indiv",
    title: "DevSecOps Compliance Guardrails for FinTechs",
    description: "Automated RBI cybersecurity compliance auditor for early-stage payment aggregators and NBFCs. Auto-generates audit reports.",
    tags: ["Cybersecurity", "Fintech", "DevTools"],
    upvotes: 56,
    comments: 7,
    createdAt: "2026-11-03T13:00:00.000Z",
    lookingFor: "GTM co-founder with banking relationships",
  },
  {
    id: "3",
    authorHandle: "neha_design",
    title: "Mental health platform for Indian startup founders",
    description: "Burnout is an epidemic in India's startup ecosystem. A peer-support network + curated therapist connect platform specifically designed for founder stress.",
    tags: ["Healthtech", "Mental Health", "Founders"],
    upvotes: 231,
    comments: 54,
    createdAt: "2026-11-03T00:00:00.000Z",
    lookingFor: "Clinical psychologist co-founder or advisor",
  },
  {
    id: "4",
    authorHandle: "deepstack_ai",
    title: "Automated GST compliance engine using document AI",
    description: "99% of Indian SMEs struggle with GST filing. A document AI that reads invoices, auto-categorises, and files returns seamlessly.",
    tags: ["Fintech", "AI/ML", "SME", "GovTech"],
    upvotes: 178,
    comments: 41,
    createdAt: "2026-11-02T18:00:00.000Z",
  },
];

// ── Collaborate Modal ─────────────────────────────────────────
function CollaborateModal({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const [pitch, setPitch] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pitch.trim()) return;
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1800);
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
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white"><X size={18} /></button>
        </div>

        <div>
          <p className="text-[13px] text-[#A24BFF] font-semibold">{idea.title}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Author: @{idea.authorHandle}</p>
          {idea.lookingFor && (
            <p className="text-[11px] text-[#D4FF3A] bg-[#D4FF3A]/10 border border-[#D4FF3A]/20 px-2 py-1 rounded-lg mt-2">
              Looking for: {idea.lookingFor}
            </p>
          )}
        </div>

        {sent ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto animate-bounce" />
            <p className="font-bold text-white text-[15px]">Collaboration Request Sent!</p>
            <p className="text-[#8E8E93] text-[12px]">
              @{idea.authorHandle} will review your application. Upon acceptance, a direct chat will open automatically.
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
            <GradientRingButton size="md" type="submit" className="w-full" disabled={!pitch.trim()}>
              <Send size={14} /> Send Collaboration Application
            </GradientRingButton>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function IdeaCard({ idea, onCollaborate }: { idea: Idea; onCollaborate: (idea: Idea) => void }) {
  const [upvoted, setUpvoted] = useState(idea.upvoted ?? false);
  const [count, setCount] = useState(idea.upvotes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 h-full flex flex-col justify-between hover:border-[#2A2A2E] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={idea.authorHandle} size="sm" />
          <span className="text-[#A1A1A6] text-[13px]">@{idea.authorHandle}</span>
        </div>
        <TimeAgo date={idea.createdAt} fallback="2h" className="text-[#6E6E73] text-[12px]" />
      </div>

      <h3 className="text-white font-semibold text-[16px] leading-snug">{idea.title}</h3>
      <p className="text-[#A1A1A6] text-[14px] leading-relaxed">{idea.description}</p>

      <div className="flex gap-1.5 flex-wrap">
        {idea.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">
            <Tag size={9} />{tag}
          </span>
        ))}
      </div>

      {idea.lookingFor && (
        <div className="flex items-start gap-2 bg-[#A24BFF]/10 border border-[#A24BFF]/20 rounded-xl px-3 py-2">
          <span className="text-[#A24BFF] text-[11px] font-semibold shrink-0 mt-0.5">Looking for</span>
          <span className="text-[#A24BFF] text-[12px] leading-snug">{idea.lookingFor}</span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-[#1C1C1E]">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            setUpvoted((v) => !v);
            setCount((c) => (upvoted ? c - 1 : c + 1));
          }}
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-semibold transition-colors",
            upvoted ? "text-[#FF8A3D]" : "text-[#6E6E73] hover:text-white"
          )}
        >
          <ThumbsUp size={15} fill={upvoted ? "#FF8A3D" : "none"} />
          {count}
        </motion.button>
        <button className="flex items-center gap-1.5 text-[#6E6E73] text-[13px] hover:text-white transition-colors">
          <MessageCircle size={15} />{idea.comments}
        </button>
        <button
          onClick={() => onCollaborate(idea)}
          className="ml-auto flex items-center gap-1 text-[#A24BFF] text-[13px] font-semibold hover:opacity-80 transition-opacity"
        >
          Collaborate <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Post idea form ────────────────────────────────────────────
function PostIdeaForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (idea: Idea) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>(["AI", "SaaS"]);
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);

    const newIdea: Idea = {
      id: "id-" + Date.now(),
      authorHandle: user?.userHandle || "founder",
      title: title.trim(),
      description: desc.trim(),
      lookingFor: lookingFor.trim(),
      tags: tags,
      upvotes: 1,
      comments: 0,
      createdAt: new Date().toISOString(),
      upvoted: true,
    };

    if (user?.id) {
      try {
        const { data } = await supabase.from("ideas").insert({
          author_id: user.id,
          title: newIdea.title,
          description: newIdea.description,
          looking_for: newIdea.lookingFor,
          tags: tags.join(", "),
          upvote_count: 1,
          comment_count: 0,
        }).select("id").single();
        if (data?.id) newIdea.id = data.id;
      } catch (err) {
        console.error("Failed to insert idea in Supabase:", err);
      }
    }

    onCreated(newIdea);
    setSubmitting(false);
    onClose();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#A24BFF]/30 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-[16px]">Share an Idea</h3>
        <button type="button" onClick={onClose} className="text-[#6E6E73] hover:text-white">
          <X size={18} />
        </button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Idea title (be specific)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[15px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the problem, target audience, and your approach…"
        rows={4}
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] resize-none"
      />
      <input
        value={lookingFor}
        onChange={(e) => setLookingFor(e.target.value)}
        placeholder="Looking for… (e.g. Technical Co-founder, GTM Specialist)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
      />
      <div className="flex gap-2">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tag.trim()) {
              e.preventDefault();
              setTags((t) => [...t, tag.trim()]);
              setTag("");
            }
          }}
          placeholder="Add tag + Enter"
          className="flex-1 bg-[#1C1C1E] text-white rounded-full px-4 py-2.5 text-[13px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
        />
      </div>
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((t) => (
            <span
              key={t}
              onClick={() => setTags((ts) => ts.filter((x) => x !== t))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A24BFF]/10 border border-[#A24BFF]/30 text-[#A24BFF] text-[12px] cursor-pointer"
            >
              {t}
              <X size={10} />
            </span>
          ))}
        </div>
      )}
      <GradientRingButton size="md" type="submit" className="w-full" disabled={!title.trim() || submitting}>
        <Lightbulb size={16} /> {submitting ? "Publishing…" : "Post Idea"}
      </GradientRingButton>
    </motion.form>
  );
}

// ── Main page ─────────────────────────────────────────────────
const SORT_TABS = ["Trending", "Recent", "My Ideas"];

function IdeasPageContent() {
  const [sort, setSort] = useState("Trending");
  const [ideas, setIdeas] = useState<Idea[]>(SEED_IDEAS);
  const [showForm, setShowForm] = useState(false);
  const [collaboratingIdea, setCollaboratingIdea] = useState<Idea | null>(null);
  const [navTab, setNavTab] = useState("ideas");

  // Load from Supabase
  useEffect(() => {
    async function loadIdeas() {
      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("id, author_id, title, description, looking_for, upvote_count, comment_count, tags, created_at")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbIdeas: Idea[] = data.map((r) => ({
            id: r.id,
            authorHandle: "founder",
            title: r.title,
            description: r.description,
            lookingFor: r.looking_for,
            tags: r.tags ? r.tags.split(",").map((t: string) => t.trim()) : ["Startup"],
            upvotes: r.upvote_count || 1,
            comments: r.comment_count || 0,
            createdAt: r.created_at,
          }));

          setIdeas((prev) => {
            const ids = new Set(dbIdeas.map((i) => i.id));
            return [...dbIdeas, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch {
        // fallback to seed
      }
    }
    loadIdeas();
  }, []);

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-[#FF8A3D]" />
            <h1 className="text-white font-bold text-[20px]">Ideas & Projects</h1>
          </div>
          <GradientRingButton size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Share Idea
          </GradientRingButton>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-4">
          {SORT_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setSort(t)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-colors",
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

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-24">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-4">
          <AnimatePresence>
            {showForm && (
              <PostIdeaForm
                key="form"
                onClose={() => setShowForm(false)}
                onCreated={(newIdea) => setIdeas((prev) => [newIdea, ...prev])}
              />
            )}
          </AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onCollaborate={(selected) => setCollaboratingIdea(selected)}
              />
            ))}
          </div>
        </div>
      </main>

      {collaboratingIdea && (
        <CollaborateModal
          idea={collaboratingIdea}
          onClose={() => setCollaboratingIdea(null)}
        />
      )}

      <BottomDock
        activeTab={navTab}
        tabs={[{ key: "ideas", label: "Ideas" }]}
        onTabChange={setNavTab}
        userName="Aarav Reddy"
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
