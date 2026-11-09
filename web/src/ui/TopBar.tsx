"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { BridgeLogo } from "./BridgeLogo";
import { NotificationBell } from "./NotificationBell";
import { dataService } from "@/lib/api/dataService";
import { useAuthStore } from "@/lib/store/authStore";

interface TopBarProps {
  className?: string;
}

/**
 * TopBar:
 *  Left:  White circular bridge-logo (links home)
 *  Right: Messages shortcut + notification bell with gradient-ring unread badge
 */
export function TopBar({ className }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    
    async function loadUnread() {
      try {
        const counts = await dataService.fetchUnreadCounts(user!.id);
        setUnreadMessages(counts.messages);
      } catch (e) {
        console.warn("Failed to fetch unread counts in TopBar:", e);
      }
    }

    loadUnread();
    const interval = setInterval(loadUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-topbar)] w-full",
        "px-5 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3",
        "bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]/50",
        className
      )}
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <div className="w-full flex items-center justify-between">
        {/* Logo — links home */}
        <Link
          href="/home"
          aria-label="COLLAB home"
          className="w-10 h-10 rounded-2xl bg-black border border-[#2A2A2E] flex items-center justify-center shrink-0 shadow-lg hover:border-[#A24BFF]/50 transition-colors overflow-hidden"
        >
          <BridgeLogo size={36} />
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Messages shortcut */}
          <Link
            href="/messages"
            aria-label="Messages"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative"
          >
            <MessageSquare size={18} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A24BFF] text-white text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-black">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          {/* Notifications bell — real, with Accept/Decline dropdown */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
