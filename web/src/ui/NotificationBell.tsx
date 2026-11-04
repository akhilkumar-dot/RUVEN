"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  X,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  Users,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService } from "@/lib/api/dataService";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/ui/TimeAgo";

interface PendingRequestItem {
  id: string;
  created_at: string;
  note?: string | null;
  user: {
    id: string;
    name: string;
    user_handle: string;
    avatar_url: string | null;
    type: string;
  } | null;
}

export function NotificationBell() {
  const panelRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);

  const panelOpen = useNotificationStore((s) => s.panelOpen);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const acceptRequest = useNotificationStore((s) => s.acceptRequest);
  const declineRequest = useNotificationStore((s) => s.declineRequest);
  const markRead = useNotificationStore((s) => s.markRead);

  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [requestTab, setRequestTab] = useState<"incoming" | "sent">("incoming");
  const [incomingRequests, setIncomingRequests] = useState<PendingRequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Close panel on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [panelOpen, setPanelOpen]);

  async function loadRequests() {
    if (!user?.id) return;
    setLoadingRequests(true);
    try {
      const res = await dataService.fetchConnectionRequests(user.id);
      setIncomingRequests(res.incoming);
      setSentRequests(res.sent);
    } catch (e) {
      console.error("Failed to load connection requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  }

  function handleOpen() {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next && activeTab === "requests") {
      loadRequests();
    }
  }

  async function handleAccept(notifId: string, connectionId: string) {
    await acceptRequest(connectionId, notifId);
    if (activeTab === "requests") {
      loadRequests();
    }
  }

  async function handleDecline(notifId: string, connectionId: string) {
    await declineRequest(connectionId, notifId);
    if (activeTab === "requests") {
      loadRequests();
    }
  }

  async function handleWithdraw(connectionId: string) {
    try {
      await dataService.withdrawConnectionRequest(connectionId);
      setSentRequests((prev) => prev.filter((r) => r.id !== connectionId));
    } catch (e) {
      console.error("Failed to withdraw request:", e);
    }
  }

  async function handleMarkAllRead() {
    await markAllRead();
  }

  function iconForType(type: string) {
    if (type === "CONNECTION_REQUEST") return <UserPlus size={15} className="text-[#A24BFF]" />;
    if (type === "CONNECTION_ACCEPTED") return <CheckCircle2 size={15} className="text-emerald-400" />;
    return <Bell size={15} className="text-[#8E8E93]" />;
  }

  function labelForNotif(n: { type: string; payload: Record<string, unknown> }) {
    if (n.type === "CONNECTION_REQUEST") {
      const name = (n.payload.requester_name as string) || (n.payload.requester_handle as string) || "Someone";
      return `${name} sent you a connection request`;
    }
    if (n.type === "CONNECTION_ACCEPTED") {
      const name = (n.payload.accepter_name as string) || (n.payload.accepter_handle as string) || "Someone";
      return `${name} accepted your connection request`;
    }
    return "New notification";
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        id="btn-notification-bell"
        className={cn(
          "relative w-9 h-9 rounded-full flex items-center justify-center transition-colors",
          panelOpen ? "bg-[#1C1C1E]" : "hover:bg-[#1C1C1E]"
        )}
      >
        <Bell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#A24BFF] text-white text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="absolute right-0 top-11 w-[calc(100vw-32px)] sm:w-[360px] bg-[#131316] border border-[#2A2A2D] rounded-2xl shadow-2xl z-[200] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 border-b border-[#1E1E21]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-[14px]">Notifications</h3>
                {activeTab === "all" && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[#A24BFF] text-[12px] font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Top View Switcher */}
              <div className="flex gap-1 bg-[#1A1A1E] p-0.5 rounded-lg">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "flex-1 py-1 text-[12px] font-medium rounded-md transition-colors",
                    activeTab === "all"
                      ? "bg-[#2A2A2E] text-white shadow-sm"
                      : "text-[#8E8E93] hover:text-white"
                  )}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("requests");
                    loadRequests();
                  }}
                  className={cn(
                    "flex-1 py-1 text-[12px] font-medium rounded-md transition-colors flex items-center justify-center gap-1.5",
                    activeTab === "requests"
                      ? "bg-[#2A2A2E] text-white shadow-sm"
                      : "text-[#8E8E93] hover:text-white"
                  )}
                >
                  <Users size={12} />
                  Requests
                  {incomingRequests.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A24BFF]" />
                  )}
                </button>
              </div>

              {/* Sub-tabs for Requests */}
              {activeTab === "requests" && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-[#222]">
                  <button
                    onClick={() => setRequestTab("incoming")}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors",
                      requestTab === "incoming"
                        ? "bg-[#A24BFF]/20 text-[#A24BFF] border border-[#A24BFF]/40"
                        : "text-[#8E8E93] hover:text-white"
                    )}
                  >
                    Incoming ({incomingRequests.length})
                  </button>
                  <button
                    onClick={() => setRequestTab("sent")}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors",
                      requestTab === "sent"
                        ? "bg-[#A24BFF]/20 text-[#A24BFF] border border-[#A24BFF]/40"
                        : "text-[#8E8E93] hover:text-white"
                    )}
                  >
                    Sent ({sentRequests.length})
                  </button>
                </div>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-[420px] overflow-y-auto overscroll-contain">
              {activeTab === "all" ? (
                notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell size={28} className="text-[#3A3A3D] mb-3" />
                    <p className="text-[#6E6E73] text-[13px]">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1A1A1D]">
                    {notifications.map((n) => {
                      const isRequest = n.type === "CONNECTION_REQUEST";
                      const isAccepted = n.type === "CONNECTION_ACCEPTED";
                      const connectionId = n.payload.connection_id as string | undefined;
                      const roomId = n.payload.room_id as string | undefined;
                      const handle =
                        (n.payload.requester_handle as string) ||
                        (n.payload.accepter_handle as string);

                      return (
                        <div
                          key={n.id}
                          className={cn(
                            "px-4 py-3 flex gap-3 transition-colors hover:bg-[#1A1A1D]",
                            !n.read_at && "bg-[#1A1020]"
                          )}
                        >
                          <Avatar
                            name={handle || "?"}
                            size="sm"
                            className="shrink-0 mt-0.5"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-1.5 mb-1">
                              {iconForType(n.type)}
                              <p className="text-white text-[13px] leading-snug line-clamp-2">
                                {labelForNotif(n)}
                              </p>
                            </div>

                            <p className="text-[#6E6E73] text-[11px] mb-2">
                              <TimeAgo date={n.created_at} />
                            </p>

                            {/* Pending Connection Request actions */}
                            {isRequest && connectionId && !n.read_at && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAccept(n.id, connectionId)}
                                  id={`btn-accept-${n.id}`}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A24BFF] text-white text-[12px] font-semibold hover:bg-[#8E3FE0] transition-colors"
                                >
                                  <Check size={12} />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDecline(n.id, connectionId)}
                                  id={`btn-decline-${n.id}`}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2A2A2D] text-[#8E8E93] text-[12px] font-medium hover:bg-[#3A3A3D] transition-colors"
                                >
                                  <X size={12} />
                                  Decline
                                </button>
                              </div>
                            )}

                            {/* Accepted Request in-place message unlock */}
                            {isRequest && n.read_at && (
                              <div className="flex items-center gap-2 text-[12px] text-emerald-400 font-medium">
                                <Check size={12} /> Connected ·
                                <Link
                                  href="/messages"
                                  onClick={() => setPanelOpen(false)}
                                  className="text-[#A24BFF] hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <MessageSquare size={12} /> Message
                                </Link>
                              </div>
                            )}

                            {/* Connection Accepted notification item */}
                            {isAccepted && (
                              <div className="mt-1">
                                <Link
                                  href={roomId ? `/messages?room=${roomId}` : "/messages"}
                                  onClick={() => setPanelOpen(false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A24BFF]/20 text-[#A24BFF] hover:bg-[#A24BFF]/30 text-[12px] font-semibold transition-colors"
                                >
                                  <MessageSquare size={12} /> Message
                                </Link>
                              </div>
                            )}
                          </div>

                          {!n.read_at && (
                            <div
                              onClick={() => markRead(n.id)}
                              className="w-2 h-2 rounded-full bg-[#A24BFF] shrink-0 mt-1 cursor-pointer"
                              title="Mark as read"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Requests Tab */
                <div className="p-2">
                  {loadingRequests ? (
                    <div className="py-8 text-center text-[#6E6E73] text-[13px]">
                      Loading requests…
                    </div>
                  ) : requestTab === "incoming" ? (
                    incomingRequests.length === 0 ? (
                      <div className="py-8 text-center text-[#6E6E73] text-[13px]">
                        No incoming connection requests
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {incomingRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-3 bg-[#18181B] rounded-xl border border-[#222] flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar name={req.user?.name || "?"} size="sm" />
                              <div className="min-w-0">
                                <Link
                                  href={`/u/${req.user?.user_handle}`}
                                  onClick={() => setPanelOpen(false)}
                                  className="text-white text-[13px] font-semibold hover:underline truncate block"
                                >
                                  {req.user?.name || req.user?.user_handle}
                                </Link>
                                <p className="text-[#8E8E93] text-[11px] truncate">
                                  @{req.user?.user_handle}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={async () => {
                                  await dataService.acceptConnectionRequest(req.id);
                                  loadRequests();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#A24BFF] text-white text-[11px] font-semibold hover:bg-[#8D34F0]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={async () => {
                                  await dataService.declineConnectionRequest(req.id);
                                  loadRequests();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#2A2A2E] text-[#8E8E93] text-[11px] font-medium hover:text-white"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : sentRequests.length === 0 ? (
                    <div className="py-8 text-center text-[#6E6E73] text-[13px]">
                      No outgoing requests
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sentRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3 bg-[#18181B] rounded-xl border border-[#222] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={req.user?.name || "?"} size="sm" />
                            <div className="min-w-0">
                              <Link
                                href={`/u/${req.user?.user_handle}`}
                                onClick={() => setPanelOpen(false)}
                                className="text-white text-[13px] font-semibold hover:underline truncate block"
                              >
                                {req.user?.name || req.user?.user_handle}
                              </Link>
                              <p className="text-[#8E8E93] text-[11px] truncate">
                                Pending response
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleWithdraw(req.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={11} /> Withdraw
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
