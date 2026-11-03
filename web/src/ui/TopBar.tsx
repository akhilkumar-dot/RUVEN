"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { BridgeLogo } from "./BridgeLogo";
import { NavDrawer } from "./NavDrawer";

interface TopBarProps {
  onMenuOpen?: () => void;
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
  unreadCount?: number;
  className?: string;
}

/**
 * TopBar:
 *  Left:  White circular bridge-logo button (opens navigation drawer)
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
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  function handleLogoClick() {
    if (onMenuOpen) {
      onMenuOpen();
    }
    setInternalDrawerOpen(true);
  }

  return (
    <>
      <NavDrawer
        isOpen={internalDrawerOpen}
        onClose={() => setInternalDrawerOpen(false)}
      />

      <header
        className={cn(
          "sticky top-0 z-[var(--z-topbar)] flex items-center justify-between",
          "px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3",
          "bg-black/80 backdrop-blur-xl",
          className
        )}
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        {/* Logo button — opens nav drawer */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLogoClick}
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

          {/* Notifications bell */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNotificationsOpen}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-black"
                style={{ background: "linear-gradient(135deg, #A24BFF, #FF3D81)" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        </div>
      </header>
    </>
  );
}
