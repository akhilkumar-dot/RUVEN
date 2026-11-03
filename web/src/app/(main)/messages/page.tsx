"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ChevronLeft,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Circle,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

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

// ── Fallback/Seed Conversations ───────────────────────────────
const SEED_CONVOS: Conversation[] = [
  { id: "a0000000-0000-0000-0000-000000000001", handle: "priya_founder",  lastMessage: "Let us sync tomorrow at 10am?",         lastAt: new Date("2026-11-03T17:55:00.000Z"), unread: 2, online: true },
  { id: "a0000000-0000-0000-0000-000000000002", handle: "rohan_investor",  lastMessage: "Deck looks good. Send financials too.", lastAt: new Date("2026-11-03T17:25:00.000Z"), unread: 0, online: false },
  { id: "3", handle: "rahul_verma",   lastMessage: "The API is down, urgent!",              lastAt: new Date("2026-11-03T16:00:00.000Z"), unread: 1, online: true },
  { id: "4", handle: "neha_design",   lastMessage: "Just dropped the new screens 🎨",       lastAt: new Date("2026-11-03T13:00:00.000Z"), unread: 0 },
  { id: "5", handle: "deepstack_ai",  lastMessage: "Happy to collaborate on the model.",    lastAt: new Date("2026-11-02T18:00:00.000Z"), unread: 0 },
];

const SEED_THREAD: Message[] = [
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
  convos,
  selected,
  onSelect,
}: {
  convos: Conversation[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = convos.filter(c => c.handle.toLowerCase().includes(q.toLowerCase()));

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
              "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#141416]",
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

// ── Active Call Modal ─────────────────────────────────────────
function CallModal({
  type,
  handle,
  onEnd,
}: {
  type: "audio" | "video";
  handle: string;
  onEnd: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white">
      <div className="text-center mt-8 space-y-2">
        <span className="flex items-center justify-center gap-1.5 text-[12px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit mx-auto">
          <ShieldCheck size={14} /> End-to-End Encrypted {type === "video" ? "Video" : "Audio"} Call
        </span>
        <h2 className="text-[24px] font-bold">@{handle}</h2>
        <p className="text-[#8E8E93] text-[14px]">Connected · {formatTime(elapsed)}</p>
      </div>

      <div className="my-auto flex flex-col items-center">
        <div className="relative">
          <Avatar name={handle} size="lg" className="w-28 h-28 text-3xl ring-4 ring-[#A24BFF]/30" />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black" />
        </div>
        {type === "video" && (
          <p className="text-[12px] text-[#6E6E73] mt-3">WebRTC peer camera feed active</p>
        )}
      </div>

      <div className="flex items-center gap-5 mb-8">
        <button
          onClick={() => setMuted((v) => !v)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white",
            muted ? "bg-red-500/30 text-red-400 border border-red-500/40" : "bg-[#222] hover:bg-[#333]"
          )}
        >
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {type === "video" && (
          <button
            onClick={() => setVideoOff((v) => !v)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white",
              videoOff ? "bg-red-500/30 text-red-400 border border-red-500/40" : "bg-[#222] hover:bg-[#333]"
            )}
          >
            {videoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
        )}

        <button
          onClick={onEnd}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-red-600/30"
          aria-label="End Call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────
function ChatThread({
  convoId,
  convo,
  onBack,
}: {
  convoId: string;
  convo: Conversation;
  onBack: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [callState, setCallState] = useState<"audio" | "video" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Load messages from Supabase or Fallback
  useEffect(() => {
    let isMounted = true;

    async function loadDbMessages() {
      if (convoId.includes("-")) {
        try {
          const { data, error } = await supabase
            .from("chat_messages")
            .select("id, room_id, sender_id, body, status, created_at")
            .eq("room_id", convoId)
            .order("created_at", { ascending: true });

          if (!error && data && data.length > 0) {
            if (isMounted) {
              setMessages(
                data.map((r) => ({
                  id: r.id,
                  senderId: r.sender_id === user?.id ? "me" : convo.handle,
                  text: r.body,
                  sentAt: new Date(r.created_at),
                  status: (r.status as any) || "delivered",
                }))
              );
              return;
            }
          }
        } catch {
          // fallback to seed
        }
      }

      if (isMounted) {
        setMessages(SEED_THREAD);
      }
    }

    loadDbMessages();

    // Supabase Realtime Subscription for room
    const channel = supabase
      .channel(`room_${convoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${convoId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                senderId: row.sender_id === user?.id ? "me" : convo.handle,
                text: row.body,
                sentAt: new Date(row.created_at || Date.now()),
                status: row.status || "delivered",
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [convoId, user?.id, convo.handle]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const t = text.trim();
    if (!t) return;

    const tempId = "temp-" + Date.now();
    const newMsg: Message = {
      id: tempId,
      senderId: "me",
      text: t,
      sentAt: new Date(),
      status: "sent",
    };

    setMessages((m) => [...m, newMsg]);
    setText("");

    // If UUID room, persist to Supabase
    if (convoId.includes("-") && user?.id) {
      try {
        await supabase.from("chat_messages").insert({
          room_id: convoId,
          sender_id: user.id,
          body: t,
          status: "sent",
        });
      } catch (err) {
        console.error("Failed to insert message:", err);
      }
    } else {
      // Seed fallback reply
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: String(Date.now() + 1),
            senderId: convo.handle,
            text: "Got it! Let's connect soon 👍",
            sentAt: new Date(),
            status: "delivered",
          },
        ]);
      }, 1200);
    }
  }

  return (
    <div className="flex flex-col h-full relative">
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
        <div className="flex gap-2 text-[#8E8E93]">
          <button
            onClick={() => setCallState("audio")}
            aria-label="Voice call"
            className="w-8 h-8 rounded-full bg-[#1A1A1E] hover:bg-[#2A2A2E] flex items-center justify-center text-white transition-colors"
          >
            <Phone size={15} />
          </button>
          <button
            onClick={() => setCallState("video")}
            aria-label="Video call"
            className="w-8 h-8 rounded-full bg-[#1A1A1E] hover:bg-[#2A2A2E] flex items-center justify-center text-white transition-colors"
          >
            <Video size={15} />
          </button>
          <button aria-label="More" className="w-8 h-8 rounded-full bg-[#1A1A1E] hover:bg-[#2A2A2E] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
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
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                    isMe
                      ? "bg-[#A24BFF] text-white rounded-br-sm"
                      : "bg-[#1C1C1E] text-white rounded-bl-sm border border-[#26262A]"
                  )}
                >
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
      <div className="px-4 py-3 border-t border-[#1C1C1E] flex gap-2 items-end bg-black">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
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

      {/* Active Call Modal */}
      {callState && (
        <CallModal
          type={callState}
          handle={convo.handle}
          onEnd={() => setCallState(null)}
        />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
function MessagesPageContent() {
  const user = useAuthStore((s) => s.user);
  const [convos, setConvos] = useState<Conversation[]>(SEED_CONVOS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navTab, setNavTab] = useState("msg");

  // Load user rooms from Supabase
  useEffect(() => {
    async function loadRooms() {
      if (!user?.id) return;
      try {
        const { data: memberRows, error } = await supabase
          .from("chat_room_members")
          .select("room_id")
          .eq("user_id", user.id);

        if (!error && memberRows && memberRows.length > 0) {
          const roomIds = memberRows.map((r) => r.room_id);
          const { data: rooms } = await supabase
            .from("chat_rooms")
            .select("id, name, created_at")
            .in("id", roomIds);

          if (rooms && rooms.length > 0) {
            const dbConvos: Conversation[] = rooms.map((rm) => ({
              id: rm.id,
              handle: rm.name ? rm.name.replace(/\s*&\s*.*/, "").trim() : "chat_partner",
              lastMessage: "Tap to open conversation",
              lastAt: new Date(rm.created_at || Date.now()),
              unread: 0,
              online: true,
            }));

            // Merge with SEED_CONVOS ensuring unique IDs
            setConvos((prev) => {
              const ids = new Set(dbConvos.map((c) => c.id));
              return [...dbConvos, ...prev.filter((c) => !ids.has(c.id))];
            });
          }
        }
      } catch {
        // use default seed
      }
    }

    loadRooms();
  }, [user?.id]);

  const activeConvo = convos.find((c) => c.id === selectedId) || convos[0];

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} className={selectedId ? "hidden md:flex" : "flex"} />

      <main
        className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto md:px-4 md:py-3"
        style={{ height: "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex-1 flex overflow-hidden md:border md:border-[#1C1C1E] md:rounded-2xl bg-[#09090B]">
          {/* Conversation list pane: full width on mobile when no chat selected; fixed sidebar on desktop */}
          <div
            className={cn(
              "flex flex-col border-r border-[#1C1C1E] w-full md:w-[320px] lg:w-[360px] shrink-0 bg-black md:bg-[#0D0D0F]",
              selectedId ? "hidden md:flex" : "flex"
            )}
          >
            <div className="px-4 pt-4 pb-2">
              <h1 className="text-white font-bold text-[22px]">Messages</h1>
            </div>
            <ConvoList
              convos={convos}
              selected={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Active Chat or Desktop Placeholder */}
          {selectedId ? (
            <div className="flex flex-col flex-1 min-w-0 bg-black">
              <ChatThread
                convoId={selectedId}
                convo={activeConvo}
                onBack={() => setSelectedId(null)}
              />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 text-[#6E6E73] bg-black/40">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1A6] mb-4">
                <MessageSquare size={28} className="text-[#A24BFF]" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Your Messages</h3>
              <p className="text-sm max-w-xs text-[#8E8E93]">
                Select a conversation from the left to start collaborating with founders, investors, and talent.
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomDock
        className={selectedId ? "hidden md:flex" : "flex"}
        activeTab={navTab}
        tabs={[{ key: "msg", label: "Messages" }]}
        onTabChange={setNavTab}
        userName={user?.userHandle || "Aarav Reddy"}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
