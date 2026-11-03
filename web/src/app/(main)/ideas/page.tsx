"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ThumbsUp, MessageCircle, Tag, Plus, X, ChevronRight, Flame } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";

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

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    authorHandle: "priya_founder",
    title: "AI-powered vernacular customer support for rural NBFCs",
    description: "Rural NBFCs lose 40% of customers because support is only in English/Hindi. An LLM-powered WhatsApp bot in 12 Indian languages could be a $500M opportunity.",
    tags: ["Fintech", "AI/ML", "Rural India", "B2B SaaS"],
    upvotes: 142,
    comments: 28,
    createdAt: "2026-11-03T16:00:00.000Z",
    lookingFor: "Technical co-founder with NLP experience",
  },
  {
    id: "2",
    authorHandle: "arjun_vc",
    title: "Peer-to-peer cold chain logistics for small farmers",
    description: "India loses 30% of produce to spoilage. A marketplace connecting farmers to cold storage operators within 50km radius could slash this. Think Airbnb for cold storage.",
    tags: ["Agritech", "Logistics", "Marketplace"],
    upvotes: 89,
    comments: 17,
    createdAt: "2026-11-03T13:00:00.000Z",
    lookingFor: "Co-founder with logistics/supply chain background",
  },
  {
    id: "3",
    authorHandle: "neha_design",
    title: "Mental health platform for Indian startup founders",
    description: "Burnout is an epidemic in India's startup ecosystem but nobody talks about it. A peer-support network + therapist connect platform specifically designed for founder stress.",
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
    description: "99% of Indian SMEs struggle with GST filing. A document AI that reads invoices, auto-categorises, and files returns could save 4 hours per week for 13M businesses.",
    tags: ["Fintech", "AI/ML", "SME", "GovTech"],
    upvotes: 178,
    comments: 41,
    createdAt: "2026-11-02T18:00:00.000Z",
  },
];

function IdeaCard({ idea }: { idea: Idea }) {
  const [upvoted, setUpvoted] = useState(idea.upvoted ?? false);
  const [count, setCount] = useState(idea.upvotes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3"
    >
      {/* Author + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={idea.authorHandle} size="sm" />
          <span className="text-[#A1A1A6] text-[13px]">@{idea.authorHandle}</span>
        </div>
        <TimeAgo date={idea.createdAt} fallback="2h" className="text-[#6E6E73] text-[12px]" />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-[16px] leading-snug">{idea.title}</h3>

      {/* Description */}
      <p className="text-[#A1A1A6] text-[14px] leading-relaxed">{idea.description}</p>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {idea.tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#A1A1A6]">
            <Tag size={9} />{tag}
          </span>
        ))}
      </div>

      {/* Looking for */}
      {idea.lookingFor && (
        <div className="flex items-start gap-2 bg-[#A24BFF]/10 border border-[#A24BFF]/20 rounded-xl px-3 py-2">
          <span className="text-[#A24BFF] text-[11px] font-semibold shrink-0 mt-0.5">Looking for</span>
          <span className="text-[#A24BFF] text-[12px] leading-snug">{idea.lookingFor}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-[#1C1C1E]">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { setUpvoted(v => !v); setCount(c => upvoted ? c - 1 : c + 1); }}
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
        <button className="ml-auto flex items-center gap-1 text-[#A24BFF] text-[13px] font-semibold hover:opacity-80 transition-opacity">
          Collaborate <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Post idea form ────────────────────────────────────────────
function PostIdeaForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#A24BFF]/30 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-[16px]">Share an Idea</h3>
        <button onClick={onClose} className="text-[#6E6E73] hover:text-white"><X size={18} /></button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Idea title (be specific)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[15px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]" />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the problem and your approach…" rows={4}
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] resize-none" />
      <input value={lookingFor} onChange={e => setLookingFor(e.target.value)} placeholder="Looking for… (optional)"
        className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]" />
      <div className="flex gap-2">
        <input value={tag} onChange={e => setTag(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && tag.trim()) { e.preventDefault(); setTags(t => [...t, tag.trim()]); setTag(""); }}}
          placeholder="Add tag + Enter"
          className="flex-1 bg-[#1C1C1E] text-white rounded-full px-4 py-2.5 text-[13px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]" />
      </div>
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map(t => (
            <span key={t} onClick={() => setTags(ts => ts.filter(x => x !== t))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A24BFF]/10 border border-[#A24BFF]/30 text-[#A24BFF] text-[12px] cursor-pointer">
              {t}<X size={10} />
            </span>
          ))}
        </div>
      )}
      <GradientRingButton size="md" className="w-full" disabled={!title.trim()}>
        <Lightbulb size={16} /> Post Idea
      </GradientRingButton>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
const SORT_TABS = ["Trending", "Recent", "My Ideas"];

function IdeasPageContent() {
  const [sort, setSort] = useState("Trending");
  const [showForm, setShowForm] = useState(false);
  const [navTab, setNavTab] = useState("ideas");

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      <div className="px-4 pt-3 max-w-[430px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-[#FF8A3D]" />
            <h1 className="text-white font-bold text-[20px]">Ideas & Projects</h1>
          </div>
          <GradientRingButton size="sm" onClick={() => setShowForm(v => !v)}>
            <Plus size={14} /> Share Idea
          </GradientRingButton>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-4">
          {SORT_TABS.map(t => (
            <button key={t} onClick={() => setSort(t)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-colors",
                sort === t ? "bg-[#A24BFF] text-white" : "bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2D] hover:text-white"
              )}
            >{t}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-4 max-w-[430px] mx-auto space-y-3">
          <AnimatePresence>
            {showForm && <PostIdeaForm key="form" onClose={() => setShowForm(false)} />}
          </AnimatePresence>
          {MOCK_IDEAS.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      </main>

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
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF8A3D] border-t-transparent animate-spin" />
      </div>
    }>
      <IdeasPageContent />
    </Suspense>
  );
}

