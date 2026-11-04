"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ChevronLeft,
  Search,
  MessageSquare,
  User,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { TimeAgo } from "@/ui/TimeAgo";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import {
  dataService,
  ChatRoomSummary,
  ChatMessage,
} from "@/lib/api/dataService";

// ── Skeletons ─────────────────────────────────────────────────
function ConvoListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
          <div className="w-10 h-10 rounded-full bg-[#1C1C1E] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#1C1C1E] rounded w-1/3" />
            <div className="h-3 bg-[#18181A] rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-[#1C1C1E] shrink-0" />
        <div className="h-10 bg-[#1C1C1E] rounded-2xl w-48" />
      </div>
      <div className="flex items-end justify-end">
        <div className="h-12 bg-[#2A2A2E] rounded-2xl w-56" />
      </div>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-[#1C1C1E] shrink-0" />
        <div className="h-14 bg-[#1C1C1E] rounded-2xl w-64" />
      </div>
    </div>
  );
}

// ── Conversation List Component ───────────────────────────────
function ConvoList({
  convos,
  loading,
  selected,
  onSelect,
}: {
  convos: ChatRoomSummary[];
  loading: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = convos.filter((c) => {
    const handle = c.counterpart.user_handle?.toLowerCase() || "";
    const name = c.counterpart.name?.toLowerCase() || "";
    const query = q.toLowerCase();
    return handle.includes(query) || name.includes(query);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pb-3 pt-1">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-[#1C1C1E] text-white rounded-full pl-9 pr-4 py-2.5 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] transition-colors"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ConvoListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-[#8E8E93]">
            {q ? (
              <p className="text-sm">No conversations match &ldquo;{q}&rdquo;</p>
            ) : (
              <div className="py-8 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#18181A] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] mb-3">
                  <MessageSquare size={20} className="text-[#A24BFF]" />
                </div>
                <p className="text-white font-medium text-sm mb-1">No messages yet</p>
                <p className="text-xs text-[#6E6E73] max-w-[200px] mb-4">
                  Connect with founders or collaborate on ideas to start chatting.
                </p>
                <Link
                  href="/hub"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A24BFF]/20 text-[#A24BFF] text-xs font-semibold hover:bg-[#A24BFF]/30 transition-colors"
                >
                  Explore Founders Hub <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = selected === c.id;
            const displayName = c.counterpart.name || `@${c.counterpart.user_handle}`;
            const lastText = c.lastMessage?.body || "Started a conversation";

            return (
              <motion.button
                key={c.id}
                onClick={() => onSelect(c.id)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#141416]",
                  isSelected ? "bg-[#1C1C1E]" : "hover:bg-[#0C0C0C]"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar name={c.counterpart.name || c.counterpart.user_handle} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-[14px] truncate">
                      {displayName}
                    </p>
                    {c.lastMessage?.created_at && (
                      <TimeAgo
                        date={new Date(c.lastMessage.created_at)}
                        fallback="now"
                        className="text-[#6E6E73] text-[11px] shrink-0 ml-2"
                      />
                    )}
                  </div>
                  <p className="text-[13px] truncate mt-0.5 text-[#6E6E73]">
                    {lastText}
                  </p>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Chat Thread Component ─────────────────────────────────────
function ChatThread({
  convo,
  onBack,
  onMessageSent,
}: {
  convo: ChatRoomSummary;
  onBack: () => void;
  onMessageSent?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Load real messages
  useEffect(() => {
    let isMounted = true;

    async function loadThread() {
      try {
        const msgs = await dataService.fetchRoomMessages(convo.id);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load thread:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadThread();

    // Realtime Postgres subscription
    const channel = supabase
      .channel(`room_${convo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${convo.id}`,
        },
        (payload) => {
          const newRow = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [...prev, newRow];
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [convo.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const t = text.trim();
    if (!t || !user?.id || isSubmitting) return;

    setIsSubmitting(true);
    setText("");

    try {
      const inserted = await dataService.sendMessage(convo.id, user.id, t);
      if (inserted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === inserted.id)) return prev;
          return [...prev, inserted];
        });
        if (onMessageSent) onMessageSent();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const counterpartHandle = convo.counterpart.user_handle;
  const counterpartName = convo.counterpart.name || `@${counterpartHandle}`;

  return (
    <div className="flex flex-col h-full relative bg-black">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1C1C1E] bg-[#0A0A0C]">
        <button
          onClick={onBack}
          className="text-[#A1A1A6] hover:text-white transition-colors"
          aria-label="Back to conversations"
        >
          <ChevronLeft size={20} />
        </button>

        <Avatar name={convo.counterpart.name || counterpartHandle} size="md" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[15px] truncate">{counterpartName}</p>
          <p className="text-[12px] text-[#8E8E93] truncate">@{counterpartHandle}</p>
        </div>

        {counterpartHandle && (
          <Link
            href={`/u/${counterpartHandle}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs text-[#A1A1A6] hover:text-white hover:bg-[#2A2A2D] transition-colors"
          >
            <User size={13} />
            <span>Profile</span>
          </Link>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {loading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6E6E73]">
            <div className="w-12 h-12 rounded-full bg-[#18181A] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] mb-3">
              <MessageSquare size={20} className="text-[#A24BFF]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">Say hello!</p>
            <p className="text-xs text-[#8E8E93] max-w-xs">
              Beginning of your conversation.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                  className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}
                >
                  {!isMe && (
                    <Avatar
                      name={convo.counterpart.name || convo.counterpart.user_handle}
                      size="sm"
                      className="shrink-0 mt-auto mb-1"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                      isMe
                        ? "bg-[#A24BFF] text-white rounded-br-sm"
                        : "bg-[#1C1C1E] text-white rounded-bl-sm border border-[#26262A]"
                    )}
                  >
                    {msg.body}
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1 text-[10px]",
                        isMe ? "justify-end text-white/70" : "justify-start text-[#8E8E93]"
                      )}
                    >
                      <TimeAgo date={new Date(msg.created_at)} fallback="now" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Composer */}
      <div className="px-4 py-3 border-t border-[#1C1C1E] flex gap-2 items-end bg-[#0A0A0C]">
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
          className="flex-1 bg-[#1C1C1E] text-white rounded-2xl px-4 py-3 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] resize-none transition-colors max-h-[120px] overflow-y-auto"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={send}
          disabled={!text.trim() || isSubmitting}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0",
            text.trim() && !isSubmitting
              ? "bg-[#A24BFF] text-white hover:bg-[#8D34F0]"
              : "bg-[#1C1C1E] text-[#6E6E73] cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Page Content ─────────────────────────────────────────
function MessagesPageContent() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");

  const [convos, setConvos] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(roomParam);

  const fetchRooms = async () => {
    if (!user?.id) return;
    try {
      const rooms = await dataService.fetchUserRooms(user.id);
      setConvos(rooms);
    } catch (err) {
      console.error("Failed to refresh user rooms:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const rooms = await dataService.fetchUserRooms(user.id);
        if (isMounted) {
          setConvos(rooms);
        }
      } catch (err) {
        console.error("Failed to load user rooms:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [user?.id, roomParam]);

  const activeConvo = convos.find((c) => c.id === selectedId) || null;

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {!selectedId && <TopBar unreadCount={0} />}

      <main
        className="flex-1 flex overflow-hidden w-full"
        style={{
          height: "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 64px)",
        }}
      >
        <div className="flex-1 flex overflow-hidden bg-[#09090B]">
          {/* Conversation list pane */}
          <div
            className={cn(
              "flex flex-col w-full shrink-0 bg-black",
              selectedId ? "hidden" : "flex"
            )}
          >
            <div className="px-4 pt-4 pb-2">
              <h1 className="text-white font-bold text-[22px]">Messages</h1>
            </div>
            <ConvoList
              convos={convos}
              loading={loading}
              selected={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Active Chat */}
          {selectedId && activeConvo && (
            <div className="flex flex-col flex-1 min-w-0 bg-black">
              <ChatThread
                convo={activeConvo}
                onBack={() => setSelectedId(null)}
                onMessageSent={fetchRooms}
              />
            </div>
          )}
        </div>
      </main>

      {!selectedId && (
        <BottomDock
          activeTab="messages"
          userName={user?.userHandle || "user"}
        />
      )}
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
