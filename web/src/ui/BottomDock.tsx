"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  Zap,
  Lightbulb,
  Coffee,
  MessageSquare,
  FileText,
  Building2,
  User,
  Crown,
  Plus,
  LayoutDashboard,
  Rss
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "./Avatar";

// ── Route map for bottom nav ──────────────────────────────────
export const NAV_TABS = [
  { key: "home",      label: "Home",      href: "/home",      icon: Home },
  { key: "dashboard", label: "Ecosystem", href: "/home",      icon: LayoutDashboard },
  { key: "feed",      label: "Feed",      href: "/home",      icon: Rss },
  { key: "discover",  label: "Discover",  href: "/discover",  icon: Compass },
  { key: "hub",       label: "Hub",       href: "/hub",       icon: Zap },
  { key: "ideas",     label: "Ideas",     href: "/ideas",     icon: Lightbulb },
  { key: "meetups",   label: "Meetups",   href: "/meetups",   icon: Coffee },
  { key: "messages",  label: "Messages",  href: "/messages",  icon: MessageSquare },
  { key: "workspace", label: "Docs",      href: "/workspace", icon: FileText },
  { key: "company",   label: "Company",   href: "/company",   icon: Building2 },
  { key: "profile",   label: "Profile",   href: "/profile",   icon: User },
  { key: "plans",     label: "Plans",     href: "/plans",     icon: Crown },
] as const;

const PRIMARY_TABS = NAV_TABS.filter(t =>
  ["home", "discover", "hub", "ideas", "meetups"].includes(t.key)
);

interface BottomDockProps {
  /** Override visible tabs — defaults to the 5 primary tabs */
  tabs?: Array<{ key: string; label: string }>;
  userPhotoUrl?: string | null;
  userName?: string;
  onProfileOpen?: () => void;
  className?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  onCreateOpen?: () => void;
}

export function BottomDock({
  tabs,
  userPhotoUrl,
  userName = "Me",
  onProfileOpen,
  className,
  activeTab: controlledActiveTab,
  onTabChange,
  onCreateOpen,
}: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from controlled prop or current route
  const activeTab = controlledActiveTab ?? 
    (NAV_TABS.find((t) => pathname?.startsWith(t.href))?.key ?? "home");

  const visibleTabs = tabs ?? PRIMARY_TABS;

  function handleTabChange(key: string) {
    if (onTabChange) {
      onTabChange(key);
    } else {
      const route = NAV_TABS.find((t) => t.key === key);
      if (route) router.push(route.href);
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {/* Subtle gradient fade behind the dock */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full px-4 pb-8">
        <div
          className={cn(
            "flex items-center justify-between gap-2 p-2",
            "bg-[#0E0E10]/80 backdrop-blur-3xl border border-white/5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
            "pointer-events-auto",
            className
          )}
        >
          {/* Main Tabs */}
          <div className="flex-1 flex items-center justify-around gap-1 px-1">
            {visibleTabs.map((tab) => {
              const navTab = NAV_TABS.find(t => t.key === tab.key);
              const Icon = navTab?.icon || Home;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 px-3 lg:px-4 h-11 rounded-2xl transition-all duration-300",
                    isActive ? "text-white" : "text-[#8E8E93] hover:text-[#A1A1A6] hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "scale-100")} />

                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.span 
                      layoutId="active-dot"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-[#A24BFF] to-[#FF3D81] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Create / Action Button or Avatar */}
          <div className="flex items-center gap-2 pr-1">
            {onCreateOpen && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onCreateOpen}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A24BFF] to-[#FF3D81] flex items-center justify-center text-white shadow-lg shadow-[#A24BFF]/20 transition-all"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            )}
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={onProfileOpen ?? (() => router.push("/profile"))}
              className="w-10 h-10 rounded-full border border-white/10 overflow-hidden transition-all shrink-0"
            >
              <Avatar name={userName} photoUrl={userPhotoUrl} size="sm" className="w-full h-full" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
