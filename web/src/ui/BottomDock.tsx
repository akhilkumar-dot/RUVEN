"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "./Avatar";
import { NavDrawer } from "./NavDrawer";


// ── Route map for bottom nav ──────────────────────────────────
export const NAV_TABS = [
  { key: "home",      label: "Home",      href: "/home"      },
  { key: "discover",  label: "Discover",  href: "/discover"  },
  { key: "hub",       label: "Hub",       href: "/hub"       },
  { key: "ideas",     label: "Ideas",     href: "/ideas"     },
  { key: "meetups",   label: "Meetups",   href: "/meetups"   },
  { key: "messages",  label: "Messages",  href: "/messages"  },
  { key: "workspace", label: "Docs",      href: "/workspace" },
  { key: "company",   label: "Company",   href: "/company"   },
  { key: "profile",   label: "Profile",   href: "/profile"   },
  { key: "plans",     label: "Plans",     href: "/plans"     },
] as const;

interface BottomDockProps {
  /** Override active tab — defaults to current pathname */
  activeTab?: string;
  /** Override visible tabs — defaults to 5 primary tabs */
  tabs?: Array<{ key: string; label: string }>;
  onTabChange?: (key: string) => void;
  onMenuOpen?: () => void;
  onCreateOpen?: () => void;
  userPhotoUrl?: string | null;
  userName?: string;
  onProfileOpen?: () => void;
  className?: string;
}

const PRIMARY_TABS = NAV_TABS.filter(t =>
  ["home", "discover", "hub", "ideas", "meetups"].includes(t.key)
);

export function BottomDock({
  activeTab: activeTabOverride,
  tabs,
  onTabChange,
  onMenuOpen,
  userPhotoUrl,
  userName = "Me",
  onProfileOpen,
  className,
}: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derive active tab from route if not overridden
  const activeTab =
    activeTabOverride ??
    NAV_TABS.find(t => pathname?.startsWith(t.href))?.key ??
    "home";

  const visibleTabs = tabs ?? PRIMARY_TABS;

  function handleTabChange(key: string) {
    onTabChange?.(key);
    const route = NAV_TABS.find(t => t.key === key);
    if (route) router.push(route.href);
  }

  function handleArrowClick() {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      setIsDrawerOpen(true);
    }
  }

  return (
    <>
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <nav
        aria-label="Main navigation"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[var(--z-dock)]",
          "flex items-center gap-1 sm:gap-2 px-2 sm:px-3",
          "pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 sm:pt-3",
          "bg-black/90 backdrop-blur-xl border-t border-[#1C1C1E]",
          "md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:max-w-xl",
          "md:rounded-full md:border md:border-[#2A2A2E] md:shadow-2xl md:shadow-black/90 md:px-4 md:py-2 md:pb-2",
          className
        )}
      >
        {/* Arrow button to open sidebar */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={handleArrowClick}
          aria-label="Open sidebar menu"
          title="Open sidebar"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-[2px] shrink-0 group"
          style={{ background: "linear-gradient(135deg, #A24BFF, #FF3D81, #FF8A3D)" }}
        >
          <span className="flex items-center justify-center w-full h-full rounded-full bg-black text-white group-hover:text-[#A24BFF] transition-colors">
            <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </span>
        </motion.button>

        {/* Segmented tabs */}
        <div
          className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide px-0.5"
          role="tablist"
        >
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "relative px-2 sm:px-3 py-1 sm:py-1.5 text-[11.5px] sm:text-[13px] font-medium rounded-full whitespace-nowrap transition-colors shrink-0",
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

        {/* Avatar → Profile */}
        <button
          onClick={onProfileOpen ?? (() => router.push("/profile"))}
          aria-label="Open profile"
          className="shrink-0 p-0.5"
        >
          <Avatar name={userName} photoUrl={userPhotoUrl} size="sm" />
        </button>
      </nav>
  </>
  );
}
