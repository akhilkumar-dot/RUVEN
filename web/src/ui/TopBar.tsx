"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BridgeLogo } from "./BridgeLogo";
import { NavDrawer } from "./NavDrawer";
import { NotificationBell } from "./NotificationBell";

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
          "sticky top-0 z-[var(--z-topbar)] w-full",
          "px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3",
          "bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]/50",
          className
        )}
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo button — opens nav drawer */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogoClick}
            aria-label="Open navigation menu"
            className="w-10 h-10 rounded-2xl bg-black border border-[#2A2A2E] flex items-center justify-center shrink-0 shadow-lg hover:border-[#A24BFF]/50 transition-colors overflow-hidden"
          >
            <BridgeLogo size={36} />
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

            {/* Notifications bell — real, with Accept/Decline dropdown */}
            <NotificationBell />
          </div>
        </div>
      </header>
    </>
  );
}
