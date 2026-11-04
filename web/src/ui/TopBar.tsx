"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { BridgeLogo } from "./BridgeLogo";
import { NotificationBell } from "./NotificationBell";

interface TopBarProps {
  unreadCount?: number;
  className?: string;
}

/**
 * TopBar:
 *  Left:  White circular bridge-logo (links home)
 *  Right: Messages shortcut + notification bell with gradient-ring unread badge
 */
export function TopBar({ className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-topbar)] w-full",
        "px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3",
        "bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]/50",
        className
      )}
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo — links home */}
        <Link
          href="/home"
          aria-label="Ruven home"
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
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <MessageSquare size={18} />
          </Link>

          {/* Notifications bell — real, with Accept/Decline dropdown */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
