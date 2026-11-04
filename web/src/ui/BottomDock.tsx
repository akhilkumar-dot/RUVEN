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

const PRIMARY_TABS = NAV_TABS.filter(t =>
  ["home", "discover", "hub", "ideas", "meetups"].includes(t.key)
);

interface BottomDockProps {
  /** Override visible tabs — defaults to the 5 primary tabs */
  tabs?: Array<{ key: string; label: string }>;
  onMenuOpen?: () => void;
  userPhotoUrl?: string | null;
  userName?: string;
  onProfileOpen?: () => void;
  className?: string;
}

export function BottomDock({
  tabs,
  onMenuOpen,
  userPhotoUrl,
  userName = "Me",
  onProfileOpen,
  className,
}: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derive active tab from the current route (single source of truth)
  const activeTab =
    NAV_TABS.find((t) => pathname?.startsWith(t.href))?.key ?? "home";

  const visibleTabs = tabs ?? PRIMARY_TABS;

  function handleTabChange(key: string) {
    const route = NAV_TABS.find((t) => t.key === key);
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
          // Full-width fixed dock at the bottom, clears the home indicator
          "fixed bottom-0 inset-x-0 z-50 pointer-events-none",
          "pb-[max(12px,env(safe-area-inset-bottom))]",
          "bg-black/90 backdrop-blur-xl border-t border-[#1C1C1E]",
          className
        )}
      >
        {/* Subtle gradient fade so cards scroll out cleanly underneath the dock */}
        <div
          className="inset-x-0 top-[-96px] bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div
          className={cn(
            // Centered pill; pointer-events restored so the pill is clickable
            "mx-auto max-w-xl flex items-center gap-1.5 px-2 sm:px-3 pt-2 sm:pt-3",
            "pointer-events-auto",
            "md:px-4 md:py-2",
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
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full p-[2px] shrink-0 group"
            style={{ background: "linear-gradient(135deg, #A24BFF, #FF3D81, #FF8A3D)" }}
          >
            <span className="flex items-center justify-center w-full h-full rounded-full bg-black text-white group-hover:text-[#A24BFF] transition-colors">
              <ArrowRight className="w-3 h-3 sm:w-[16px] sm:h-[16px]" />
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
                  "relative px-1 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[12px] font-medium rounded-full whitespace-nowrap transition-colors shrink-0",
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
        </div>
      </nav>
    </>
  );
}
