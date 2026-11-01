"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Zap, Shield, Clock } from "lucide-react";
import { Avatar } from "./Avatar";

interface FloatingActionStackProps {
  className?: string;
  onTodayMeetups?: () => void;
  onQuickPost?: () => void;
  onVerifiedStatus?: () => void;
  verifiedCount?: number;
}

/**
 * FloatingActionStack — the vertical cluster of round buttons
 * on the right edge of the screen, as seen in the reference image.
 *
 * Three buttons:
 *  1. Clock  — Today's meetups
 *  2. Bolt   — Quick post
 *  3. Shield — Verified/Pro status (with small badge count)
 */
export function FloatingActionStack({
  className,
  onTodayMeetups,
  onQuickPost,
  onVerifiedStatus,
  verifiedCount,
}: FloatingActionStackProps) {
  const buttons = [
    { icon: <Clock size={18} />, label: "Today's meetups", onClick: onTodayMeetups },
    { icon: <Zap size={18} />,   label: "Quick post",      onClick: onQuickPost,
      badge: verifiedCount && verifiedCount > 0 ? String(verifiedCount) : undefined },
    { icon: <Shield size={18} />, label: "Verified status", onClick: onVerifiedStatus },
  ];

  return (
    <div
      className={cn(
        "fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom,0px))]",
        "flex flex-col gap-3 z-[var(--z-dock)]",
        className
      )}
    >
      {buttons.map(({ icon, label, onClick, badge }, i) => (
        <motion.button
          key={label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 22 }}
          whileTap={{ scale: 0.88 }}
          onClick={onClick}
          aria-label={label}
          className="relative w-11 h-11 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] hover:text-white hover:border-[#A24BFF]/40 transition-colors shadow-lg"
        >
          {icon}
          {badge && (
            <span
              className="absolute -top-1 -left-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-black"
              style={{ background: "linear-gradient(135deg, #A24BFF, #FF3D81)" }}
            >
              {badge}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

interface BottomDockProps {
  activeTab: string;
  tabs: Array<{ key: string; label: string }>;
  onTabChange: (key: string) => void;
  onCreateOpen?: () => void;
  userPhotoUrl?: string | null;
  userName?: string;
  onProfileOpen?: () => void;
  className?: string;
}

/**
 * BottomDock — matches the reference image:
 *  Left:  Gradient "+" Create button
 *  Center: Segmented text tabs
 *  Right: User avatar (opens profile)
 */
export function BottomDock({
  activeTab,
  tabs,
  onTabChange,
  onCreateOpen,
  userPhotoUrl,
  userName = "Me",
  onProfileOpen,
  className,
}: BottomDockProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[var(--z-dock)]",
        "flex items-center gap-2 px-3",
        "pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-3",
        "bg-black/90 backdrop-blur-xl border-t border-[#1C1C1E]",
        className
      )}
    >
      {/* "+" Create button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={onCreateOpen}
        aria-label="Create"
        className="w-11 h-11 rounded-full p-[2px] shrink-0"
        style={{ background: "linear-gradient(135deg, #A24BFF, #FF3D81, #FF8A3D)" }}
      >
        <span className="flex items-center justify-center w-full h-full rounded-full bg-black text-white text-xl font-light">
          +
        </span>
      </motion.button>

      {/* Segmented tabs — scrollable */}
      <div
        className="flex-1 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "relative px-3 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap transition-colors",
              activeTab === tab.key
                ? "text-white"
                : "text-[#6E6E73] hover:text-[#A1A1A6]"
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.span
                layoutId="active-tab-pill"
                className="absolute inset-0 rounded-full bg-[#1C1C1E]"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Avatar */}
      <button
        onClick={onProfileOpen}
        aria-label="Open profile"
        className="shrink-0"
      >
        <Avatar name={userName} photoUrl={userPhotoUrl} size="sm" />
      </button>
    </nav>
  );
}
