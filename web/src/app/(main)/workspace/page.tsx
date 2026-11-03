"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Clock, Users, Lock, Globe } from "lucide-react";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { fmtDate, cn } from "@/lib/utils";

interface Doc {
  id: string;
  title: string;
  updatedAt: Date;
  wordCount: number;
  collaborators: number;
  visibility: "private" | "workspace" | "public";
  emoji?: string;
}

const MOCK_DOCS: Doc[] = [
  { id: "1", title: "Product Roadmap Q4 2024",           updatedAt: new Date(Date.now() - 1*3600000),   wordCount: 1240, collaborators: 3, visibility: "workspace", emoji: "🗺️" },
  { id: "2", title: "Investor Pitch Deck — Notes",       updatedAt: new Date(Date.now() - 6*3600000),   wordCount: 820,  collaborators: 1, visibility: "private",   emoji: "💼" },
  { id: "3", title: "Technical Architecture v2",         updatedAt: new Date(Date.now() - 24*3600000),  wordCount: 3100, collaborators: 2, visibility: "workspace", emoji: "⚙️" },
  { id: "4", title: "Hiring: ML Engineer JD",            updatedAt: new Date(Date.now() - 48*3600000),  wordCount: 560,  collaborators: 1, visibility: "public",    emoji: "📋" },
  { id: "5", title: "Co-founder Agreement Draft",        updatedAt: new Date(Date.now() - 3*86400000),  wordCount: 4200, collaborators: 2, visibility: "private",   emoji: "🤝" },
];

// ── Minimal doc editor (rich textarea) ───────────────────────
function DocEditor({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const [content, setContent] = useState(
    `# ${doc.title}\n\nStart writing here…`
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col"
         style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C1E]">
        <button onClick={onClose} className="text-[#A1A1A6] hover:text-white text-[14px] transition-colors">← Docs</button>
        <p className="text-white font-semibold text-[15px] truncate max-w-[200px]">{doc.emoji} {doc.title}</p>
        <span className="text-[#6E6E73] text-[12px]">Auto-saved</span>
      </div>

      {/* Format bar */}
      <div className="flex gap-3 px-4 py-2 border-b border-[#1C1C1E] overflow-x-auto scrollbar-hide">
        {["B", "I", "U", "H1", "H2", "• List", "1. List", "[ ] Task", "---"].map(fmt => (
          <button key={fmt}
            className="text-[#6E6E73] text-[13px] hover:text-white px-2 py-1 rounded hover:bg-[#1C1C1E] transition-colors whitespace-nowrap shrink-0 font-mono">
            {fmt}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="flex-1 bg-black text-white text-[16px] leading-relaxed px-6 py-6 outline-none resize-none font-['Plus_Jakarta_Sans',sans-serif] placeholder:text-[#6E6E73]"
        spellCheck
        autoFocus
      />

      {/* Word count */}
      <div className="px-6 py-3 border-t border-[#1C1C1E]">
        <p className="text-[#6E6E73] text-[12px]">
          {content.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </div>
    </div>
  );
}

// ── Doc card ──────────────────────────────────────────────────
function DocCard({ doc, onClick }: { doc: Doc; onClick: () => void }) {
  const visIcon = doc.visibility === "private" ? <Lock size={11} /> :
                  doc.visibility === "public"  ? <Globe size={11} /> :
                  <Users size={11} />;
  const visColor = doc.visibility === "private" ? "text-[#6E6E73]" :
                   doc.visibility === "public"  ? "text-emerald-400" :
                   "text-[#A24BFF]";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-start gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 text-left hover:border-[#2A2A2D] transition-colors"
    >
      <span className="text-2xl shrink-0 mt-0.5">{doc.emoji ?? "📄"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[16px] truncate">{doc.title}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[#6E6E73] text-[12px]">
            <Clock size={11} />{fmtDate(doc.updatedAt, { day:"numeric", month:"short" })}
          </span>
          <span className="text-[#6E6E73] text-[12px]">{doc.wordCount.toLocaleString("en-IN")} words</span>
          {doc.collaborators > 1 && (
            <span className="flex items-center gap-1 text-[#6E6E73] text-[12px]">
              <Users size={11} />{doc.collaborators}
            </span>
          )}
          <span className={cn("flex items-center gap-1 text-[12px]", visColor)}>
            {visIcon}{doc.visibility}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

const FILTER_TABS = ["All", "Private", "Shared", "Public"];

export default function WorkspacePage() {
  const [filter, setFilter] = useState("All");
  const [openDoc, setOpenDoc] = useState<Doc | null>(null);
  const [navTab, setNavTab] = useState("workspace");

  const filtered = MOCK_DOCS.filter(d =>
    filter === "All"     ? true :
    filter === "Private" ? d.visibility === "private" :
    filter === "Shared"  ? d.visibility === "workspace" :
    d.visibility === "public"
  );

  return (
    <>
      {openDoc && <DocEditor doc={openDoc} onClose={() => setOpenDoc(null)} />}

      <div className="min-h-dvh bg-black flex flex-col">
        <TopBar unreadCount={3} />

        <div className="px-4 pt-3 max-w-[430px] mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white font-bold text-[20px] flex items-center gap-2">
              <FileText size={20} className="text-[#A24BFF]" />Workspace
            </h1>
            <GradientRingButton size="sm">
              <Plus size={14} /> New Doc
            </GradientRingButton>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] font-medium transition-colors",
                  filter === t ? "bg-[#A24BFF] text-white" : "bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2D] hover:text-white"
                )}>{t}</button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
          <div className="px-4 max-w-[430px] mx-auto space-y-2">
            {filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onClick={() => setOpenDoc(doc)} />
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <FileText size={32} className="text-[#2A2A2D]" />
                <p className="text-[#6E6E73] text-[15px]">No documents in this filter</p>
              </div>
            )}
          </div>
        </main>

        <BottomDock
          activeTab={navTab}
          tabs={[{ key: "workspace", label: "Workspace" }]}
          onTabChange={setNavTab}
          userName="Aarav Reddy"
        />
      </div>
    </>
  );
}
