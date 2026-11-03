"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft, Search, Phone, Video, MoreHorizontal, Circle } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface Conversation {
  id: string;
  handle: string;
  lastMessage: string;
  lastAt: Date;
  unread: number;
  online?: boolean;
}

interface Message {
  id: string;
  senderId: "me" | string;
  text: string;
  sentAt: Date;
  status?: "sent" | "delivered" | "read";
}

// ── Mock data ─────────────────────────────────────────────────
const CONVOS: Conversation[] = [
  { id: "1", handle: "priya_founder",  lastMessage: "Let's sync tomorrow at 10am?",         lastAt: new Date("2026-11-03T17:55:00.000Z"), unread: 2, online: true },
  { id: "2", handle: "arjun_vc",      lastMessage: "Deck looks good. Send financials too.", lastAt: new Date("2026-11-03T17:25:00.000Z"), unread: 0, online: false },
  { id: "3", handle: "rahul_verma",   lastMessage: "The API is down, urgent!",              lastAt: new Date("2026-11-03T16:00:00.000Z"), unread: 1, online: true },
  { id: "4", handle: "neha_design",   lastMessage: "Just dropped the new screens 🎨",       lastAt: new Date("2026-11-03T13:00:00.000Z"), unread: 0 },
  { id: "5", handle: "deepstack_ai",  lastMessage: "Happy to collaborate on the model.",    lastAt: new Date("2026-11-02T18:00:00.000Z"), unread: 0 },
];

const THREAD: Message[] = [
  { id: "1", senderId: "priya_founder", text: "Hey! Saw your idea on FounderBridge. Super interesting.",               sentAt: new Date("2026-11-03T17:30:00.000Z") },
  { id: "2", senderId: "me",            text: "Thanks! Yes, been working on it for 3 months now.",                    sentAt: new Date("2026-11-03T17:32:00.000Z"), status: "read" },
  { id: "3", senderId: "priya_founder", text: "The vernacular angle is 🔥 — would love to learn more.",               sentAt: new Date("2026-11-03T17:40:00.000Z") },
  { id: "4", senderId: "me",            text: "Let's do a quick call? I can show you the demo.",                      sentAt: new Date("2026-11-03T17:42:00.000Z"), status: "read" },
  { id: "5", senderId: "priya_founder", text: "100%. Are you free tomorrow? I'm in Bangalore this week.",             sentAt: new Date("2026-11-03T17:50:00.000Z") },
  { id: "6", senderId: "me",            text: "Yes! 10am works perfectly.",                                           sentAt: new Date("2026-11-03T17:52:00.000Z"), status: "delivered" },
  { id: "7", senderId: "priya_founder", text: "Let's sync tomorrow at 10am?",                                         sentAt: new Date("2026-11-03T17:55:00.000Z") },
];

// ── Conversation list ─────────────────────────────────────────
function ConvoList({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = CONVOS.filter(c => c.handle.includes(q));

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pb-3 pt-1">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search messages…"
            className="w-full bg-[#1C1C1E] text-white rounded-full pl-9 pr-4 py-2.5 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(c => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c.id)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
              selected === c.id ? "bg-[#1C1C1E]" : "hover:bg-[#0C0C0C]"
            )}
          >
            <div className="relative shrink-0">
              <Avatar name={c.handle} size="md" />
              {c.online && (
                <Circle size={10} className="absolute bottom-0 right-0 text-emerald-400 fill-emerald-400 bg-black rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-[15px]">@{c.handle}</p>
                <TimeAgo date={c.lastAt} fallback="5m" className="text-[#6E6E73] text-[11px]" />
              </div>
              <p className={cn("text-[13px] truncate mt-0.5", c.unread > 0 ? "text-white font-medium" : "text-[#6E6E73]")}>
                {c.lastMessage}
              </p>
            </div>
            {c.unread > 0 && (
              <span className="min-w-[20px] h-5 rounded-full bg-[#A24BFF] text-white text-[11px] font-bold flex items-center justify-center px-1.5 shrink-0">
                {c.unread}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────
function ChatThread({ convoId, onBack }: { convoId: string; onBack: () => void }) {
  const convo = CONVOS.find(c => c.id === convoId)!;
  const [messages, setMessages] = useState<Message[]>(THREAD);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const t = text.trim();
    if (!t) return;
    setMessages(m => [...m, {
      id: String(Date.now()),
      senderId: "me",
      text: t,
      sentAt: new Date(),
      status: "sent",
    }]);
    setText("");
    // Simulate reply after 1.5s
    setTimeout(() => {
      setMessages(m => [...m, {
        id: String(Date.now() + 1),
        senderId: convo.handle,
        text: "Got it! 👍",
        sentAt: new Date(),
      }]);
    }, 1500);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1C1C1E]">
        <button onClick={onBack} className="text-[#A1A1A6] hover:text-white transition-colors md:hidden" aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="relative">
          <Avatar name={convo.handle} size="md" />
          {convo.online && (
            <Circle size={10} className="absolute bottom-0 right-0 text-emerald-400 fill-emerald-400 bg-black rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[15px]">@{convo.handle}</p>
          <p className="text-[12px] text-emerald-400">{convo.online ? "Online" : "Offline"}</p>
        </div>
        <div className="flex gap-3 text-[#6E6E73]">
          <button aria-label="Voice call" className="hover:text-white transition-colors"><Phone size={18} /></button>
          <button aria-label="Video call" className="hover:text-white transition-colors"><Video size={18} /></button>
          <button aria-label="More" className="hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isMe = msg.senderId === "me";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}
              >
                {!isMe && <Avatar name={msg.senderId} size="sm" className="shrink-0 mt-auto mb-1" />}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                  isMe
                    ? "bg-[#A24BFF] text-white rounded-br-sm"
                    : "bg-[#1C1C1E] text-white rounded-bl-sm"
                )}>
                  {msg.text}
                  <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                    <TimeAgo date={msg.sentAt} fallback="now" className="text-[10px] opacity-60" />
                    {isMe && msg.status === "read" && <span className="text-[10px] text-sky-300">✓✓</span>}
                    {isMe && msg.status === "delivered" && <span className="text-[10px] opacity-60">✓✓</span>}
                    {isMe && msg.status === "sent" && <span className="text-[10px] opacity-60">✓</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1C1C1E] flex gap-2 items-end">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-[#1C1C1E] text-white rounded-2xl px-4 py-3 text-[15px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] resize-none transition-colors max-h-[120px] overflow-y-auto"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={send}
          disabled={!text.trim()}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
            text.trim()
              ? "bg-[#A24BFF] text-white"
              : "bg-[#1C1C1E] text-[#6E6E73]"
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
function MessagesPageContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navTab, setNavTab] = useState("msg");

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {!selectedId && <TopBar unreadCount={3} />}

      <main className="flex-1 flex overflow-hidden"
            style={{ height: "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))" }}>
        {/* Always show list on larger screens; show thread on mobile when selected */}
        <div className={cn("flex flex-col flex-1 border-r border-[#1C1C1E] max-w-[430px] mx-auto w-full",
          selectedId ? "hidden md:flex" : "flex")}>
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-white font-bold text-[22px]">Messages</h1>
          </div>
          <ConvoList selected={selectedId} onSelect={setSelectedId} />
        </div>

        {selectedId && (
          <div className="flex flex-col flex-1 max-w-[430px] mx-auto w-full">
            <ChatThread convoId={selectedId} onBack={() => setSelectedId(null)} />
          </div>
        )}
      </main>

      {!selectedId && (
        <BottomDock
          activeTab={navTab}
          tabs={[{ key: "msg", label: "Messages" }]}
          onTabChange={setNavTab}
          userName="Aarav Reddy"
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

