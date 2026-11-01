"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { BridgeLogo } from "./BridgeLogo";

interface TopBarProps {
  onMenuOpen?: () => void;
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
  unreadCount?: number;
  className?: string;
}

/**
 * TopBar — matches the reference image:
 *  Left:  White circular bridge-logo button (opens nav sheet)
 *  Center: Search circle
 *  Right: Bell with gradient-ring unread badge
 */
export function TopBar({
  onMenuOpen,
  onSearchOpen,
  onNotificationsOpen,
  unreadCount = 0,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-topbar)] flex items-center justify-between",
        "px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3",
        "bg-black/80 backdrop-blur-xl",
        className
      )}
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      {/* Logo button — opens nav sheet */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg"
      >
        <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
      </motion.button>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSearchOpen}
          aria-label="Search"
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </motion.button>

        {/* Bell with gradient-ring badge */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNotificationsOpen}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative"
        >
          <Bell size={18} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #A24BFF, #FF3D81)",
                  border: "2px solid #000",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
}
