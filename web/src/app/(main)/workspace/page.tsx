"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Clock,
  Lock,
  Globe,
  Trash2,
  Save,
  Check,
  ChevronLeft,
  Sparkles,
  Share2,
  Copy,
  X,
  Link2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { fmtDate, cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService, WorkspaceDocument } from "@/lib/api/dataService";

const EMOJI_OPTIONS = ["📄", "🗺️", "💼", "⚙️", "📋", "🤝", "💡", "🚀", "📊", "🎯"];

const STARTUP_TEMPLATES = [
  {
    emoji: "🚀",
    title: "Pitch Deck Outline",
    body: `# Pitch Deck Outline\n\n## 1. Problem\nWhat problem are you solving?\n\n## 2. Solution\nYour unique approach.\n\n## 3. Market Size\nTAM / SAM / SOM\n\n## 4. Business Model\nHow you make money.\n\n## 5. Traction\nKey metrics, users, revenue.\n\n## 6. Team\nFounders & advisors.\n\n## 7. Ask\nAmount raising & use of funds.`,
  },
  {
    emoji: "📊",
    title: "Investor Update Memo",
    body: `# Investor Update — [Month Year]\n\n## Highlights\n- \n\n## KPIs\n| Metric | Last Month | This Month | Change |\n|--------|-----------|------------|--------|\n| MRR    |           |            |        |\n| Users  |           |            |        |\n\n## Product Updates\n- \n\n## Challenges\n- \n\n## Next 30 Days\n- \n\n## Ask\n- `,
  },
  {
    emoji: "📋",
    title: "PRD Specs",
    body: `# Product Requirements Document\n\n## Overview\nProduct name, goal, target users.\n\n## Problem Statement\n\n## User Stories\n- As a [user], I want to [action] so that [benefit].\n\n## Functional Requirements\n1. \n\n## Non-Functional Requirements\n- Performance:\n- Security:\n\n## Out of Scope\n- \n\n## Success Metrics\n- `,
  },
  {
    emoji: "🤝",
    title: "Co-Founder Agreement Draft",
    body: `# Co-Founder Agreement\n\n**Company:** \n**Date:** \n\n## Founders\n| Name | Role | Equity % |\n|------|------|----------|\n|      |      |          |\n\n## Vesting Schedule\n4 years, 1-year cliff.\n\n## Responsibilities\n- Founder 1:\n- Founder 2:\n\n## Decision Making\nMajority vote for operational, unanimous for strategic.\n\n## IP Assignment\nAll IP created for the company belongs to the company.\n\n## Exit / Buyout Clause\n`,
  },
];

// ── Skeletons ─────────────────────────────────────────────────
function DocGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 animate-pulse flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1C1C1E] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-[#1C1C1E] rounded w-3/4" />
            <div className="h-3 bg-[#18181A] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Real doc editor ───────────────────────────────────────────
function DocEditor({
  doc,
  ownerId,
  onClose,
  onSaved,
  onDeleted,
}: {
  doc: Partial<WorkspaceDocument>;
  ownerId: string;
  onClose: () => void;
  onSaved: (savedDoc: WorkspaceDocument) => void;
  onDeleted: (docId: string) => void;
}) {
  const [title, setTitle] = useState(doc.title || "Untitled Document");
  const [body, setBody] = useState(doc.body || "");
  const [emoji, setEmoji] = useState(doc.emoji || "📄");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVisibility, setShareVisibility] = useState<"private" | "public">(doc.visibility as "private" | "public" || "private");
  const [shareCopied, setShareCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" && doc.id
    ? `${window.location.origin}/workspace?doc=${doc.id}`
    : "";

  async function handleShare() {
    if (!doc.id) {
      // Save first
      await handleSave();
    }
    setShowShareModal(true);
  }

  async function handleCopyLink() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  async function handleToggleVisibility(vis: "private" | "public") {
    setShareVisibility(vis);
    // Save with updated visibility
    if (doc.id) {
      try {
        await dataService.saveDoc(ownerId, {
          id: doc.id,
          title,
          body,
          emoji,
          visibility: vis,
        });
      } catch (err) {
        console.error("Failed to update visibility:", err);
      }
    }
  }

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaveStatus("saving");
    try {
      const saved = await dataService.saveDoc(ownerId, {
        id: doc.id,
        title: title.trim(),
        body,
        emoji,
      });
      setSaveStatus("saved");
      onSaved(saved);
    } catch (err) {
      console.error("Failed to save doc:", err);
      setSaveStatus("unsaved");
    }
  }, [ownerId, doc.id, title, body, emoji, onSaved]);

  const handleDelete = async () => {
    if (!doc.id) {
      onClose();
      return;
    }
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeleting(true);
    try {
      await dataService.deleteDoc(doc.id, ownerId);
      onDeleted(doc.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete doc:", err);
      setIsDeleting(false);
    }
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C1E] bg-[#0A0A0C]">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[#A1A1A6] hover:text-white text-[14px] transition-colors"
        >
          <ChevronLeft size={18} />
          <span>Docs</span>
        </button>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="text-xl p-1 hover:bg-[#1C1C1E] rounded-lg transition-colors"
            title="Change icon"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-[#1C1C1E] border border-[#2A2A2D] rounded-xl flex gap-1 shadow-2xl z-20">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                    setSaveStatus("unsaved");
                  }}
                  className="w-8 h-8 rounded hover:bg-[#2A2A2D] text-lg flex items-center justify-center transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus("unsaved");
            }}
            placeholder="Untitled Document"
            className="text-white font-semibold text-[15px] bg-transparent outline-none border-b border-transparent focus:border-[#A24BFF] px-1 py-0.5 max-w-[200px] sm:max-w-md truncate"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#6E6E73] text-[12px] hidden sm:inline flex items-center gap-1">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && (
              <>
                <Check size={12} className="text-emerald-400" /> Saved
              </>
            )}
            {saveStatus === "unsaved" && "Unsaved"}
          </span>

          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {doc.id && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2A2A2D] text-[#A1A1A6] hover:text-white text-xs font-semibold transition-colors border border-[#2A2A2D]"
              title="Share document"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
          {doc.id && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-[#6E6E73] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1C1C1E] transition-colors"
              title="Delete document"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-[#121214] border border-[#222226] rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-[16px] flex items-center gap-2"><Share2 size={16} /> Share Document</h3>
              <button onClick={() => setShowShareModal(false)} className="text-[#6E6E73] hover:text-white p-1"><X size={18} /></button>
            </div>

            {/* Visibility toggle */}
            <div>
              <p className="text-[#8E8E93] text-[12px] mb-2">Who can view?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVisibility("private")}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 border ${shareVisibility === "private" ? "bg-[#A24BFF]/15 border-[#A24BFF]/40 text-[#A24BFF]" : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"}`}
                >
                  <Lock size={13} /> Private
                </button>
                <button
                  onClick={() => handleToggleVisibility("public")}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 border ${shareVisibility === "public" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-[#1C1C1E] border-[#2A2A2D] text-[#8E8E93] hover:text-white"}`}
                >
                  <Globe size={13} /> Public
                </button>
              </div>
            </div>

            {/* Copy link */}
            {shareVisibility === "public" && shareUrl && (
              <div>
                <p className="text-[#8E8E93] text-[12px] mb-2">Share link</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#1C1C1E] border border-[#2A2A2D] rounded-xl px-3 py-2 text-[12px] text-[#A1A1A6] truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1.5 ${shareCopied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#A24BFF] text-white hover:bg-[#8D34F0]"}`}
                  >
                    {shareCopied ? <Check size={13} /> : <Copy size={13} />}
                    {shareCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[#6E6E73] text-[11px]">
              {shareVisibility === "public" ? "Anyone with the link can view this document." : "Only you can see this document."}
            </p>
          </div>
        </div>
      )}

      {/* Editor area */}
      <textarea
        value={body}
        onChange={(e) => {
          const val = e.target.value;
          startTransition(() => {
            setBody(val);
            setSaveStatus("unsaved");
          });
        }}
        placeholder="Start writing your thoughts, product specs, or meeting notes here…"
        className="flex-1 bg-black text-white text-[15px] leading-relaxed px-6 py-6 outline-none resize-none font-sans placeholder:text-[#6E6E73]"
        spellCheck
        autoFocus
      />

      {/* Word count status bar */}
      <div className="px-6 py-3 border-t border-[#1C1C1E] bg-[#0A0A0C] flex justify-between items-center text-[12px] text-[#6E6E73]">
        <p>{wordCount.toLocaleString("en-IN")} words</p>
        <p>{title.trim() || "Untitled"}</p>
      </div>
    </div>
  );
}

// ── Doc card ──────────────────────────────────────────────────
function DocCard({
  doc,
  onClick,
}: {
  doc: WorkspaceDocument;
  onClick: () => void;
}) {
  const visIcon = doc.visibility === "public" ? <Globe size={11} /> : <Lock size={11} />;
  const visColor = doc.visibility === "public" ? "text-emerald-400" : "text-[#6E6E73]";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-start gap-3 bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 text-left hover:border-[#2A2A2D] transition-colors h-full"
    >
      <span className="text-2xl shrink-0 mt-0.5">{doc.emoji ?? "📄"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[15px] truncate">{doc.title}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[#6E6E73] text-[12px]">
            <Clock size={11} />
            {fmtDate(new Date(doc.updated_at), { day: "numeric", month: "short" })}
          </span>
          <span className="text-[#6E6E73] text-[12px]">
            {(doc.word_count || 0).toLocaleString("en-IN")} words
          </span>
          <span className={cn("flex items-center gap-1 text-[12px]", visColor)}>
            {visIcon}
            {doc.visibility}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

const FILTER_TABS = ["All", "Private", "Public"];

function WorkspacePageContent() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const docParam = searchParams?.get("doc");

  const [docs, setDocs] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [openDoc, setOpenDoc] = useState<Partial<WorkspaceDocument> | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDocs() {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const fetched = await dataService.fetchUserDocs(user.id);
        if (isMounted) {
          setDocs(fetched);
          if (docParam) {
            const found = fetched.find((d) => d.id === docParam);
            if (found) setOpenDoc(found);
          }
        }
      } catch (err) {
        console.error("Failed to load workspace docs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDocs();
    return () => {
      isMounted = false;
    };
  }, [user?.id, docParam]);

  const handleSaved = (savedDoc: WorkspaceDocument) => {
    setDocs((prev) => {
      const idx = prev.findIndex((d) => d.id === savedDoc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedDoc;
        return copy;
      }
      return [savedDoc, ...prev];
    });
    setOpenDoc(savedDoc);
  };

  const handleDeleted = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const filtered = docs.filter((d) => {
    if (filter === "All") return true;
    if (filter === "Private") return d.visibility === "private";
    if (filter === "Public") return d.visibility === "public";
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {openDoc && user?.id && (
          <DocEditor
            doc={openDoc}
            ownerId={user.id}
            onClose={() => setOpenDoc(null)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>

      <div className="min-h-dvh bg-black flex flex-col">
        <TopBar />

        <div className="px-4 pt-4 w-full">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white font-bold text-[20px] flex items-center gap-2">
              <FileText size={20} className="text-[#A24BFF]" />
              Workspace
            </h1>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowTemplateMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2A2A2D] text-[#A1A1A6] hover:text-white text-[12px] font-semibold transition-colors"
              >
                <Sparkles size={13} className="text-[#A24BFF]" /> Templates
              </button>
              {showTemplateMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#141416] border border-[#2A2A2E] rounded-2xl p-2 shadow-2xl z-30 space-y-1">
                  <p className="text-[11px] font-semibold text-[#8E8E93] px-2 py-1 uppercase tracking-wider">Startup Templates</p>
                  {STARTUP_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.title}
                      onClick={() => {
                        setOpenDoc({ title: tmpl.title, body: tmpl.body, emoji: tmpl.emoji, visibility: "private" });
                        setShowTemplateMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-white text-[13px] hover:bg-white/10 transition-colors"
                    >
                      <span className="text-base">{tmpl.emoji}</span>
                      <span className="truncate">{tmpl.title}</span>
                    </button>
                  ))}
                </div>
              )}
              <GradientRingButton
                size="sm"
                onClick={() =>
                  setOpenDoc({
                    title: "Untitled Document",
                    body: "",
                    emoji: "📄",
                    visibility: "private",
                  })
                }
              >
                <Plus size={14} /> New Doc
              </GradientRingButton>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {FILTER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                  filter === t
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
          <div className="px-4 w-full">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1C1C1E] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-[#1C1C1E] rounded w-3/4" />
                      <div className="h-3 bg-[#18181A] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-[#0C0C0C]/50 border border-[#1C1C1E] rounded-3xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#18181A] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] mb-4">
                  <FileText size={26} className="text-[#A24BFF]" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">Workspace empty</h3>
                <p className="text-sm text-[#8E8E93] mb-6 leading-relaxed">
                  Write meeting memos or product specs.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {STARTUP_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.title}
                      onClick={() => setOpenDoc({ title: tmpl.title, body: tmpl.body, emoji: tmpl.emoji, visibility: "private" })}
                      className="flex items-center justify-start gap-2 px-4 py-2 rounded-xl bg-[#1C1C1E] hover:bg-[#2A2A2D] text-white text-xs font-semibold border border-[#2A2A2D] transition-colors w-full"
                    >
                      <span className="text-base">{tmpl.emoji}</span> {tmpl.title}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setOpenDoc({
                        title: "Untitled Document",
                        body: "",
                        emoji: "📄",
                        visibility: "private",
                      })
                    }
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold transition-colors w-full"
                  >
                    <Plus size={13} /> Blank Document
                  </button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <FileText size={32} className="text-[#2A2A2D]" />
                <p className="text-[#6E6E73] text-[15px]">No match for &ldquo;{filter}&rdquo;</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((doc) => (
                  <DocCard key={doc.id} doc={doc} onClick={() => setOpenDoc(doc)} />
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomDock activeTab="workspace" userName={user?.userHandle || "user"} />
      </div>
    </>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<DocGridSkeleton />}>
      <WorkspacePageContent />
    </Suspense>
  );
}
