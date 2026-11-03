"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Lightbulb,
  Zap,
  Coffee,
  Building2,
  MessageSquare,
  FileText,
  Crown,
  User,
  X,
  ChevronRight,
  LogOut
} from "lucide-react";
import { BridgeLogo } from "./BridgeLogo";
import { Avatar } from "./Avatar";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { key: "home", label: "Home & Feed", href: "/home", icon: <Home size={18} /> },
  { key: "discover", label: "Discover Ecosystem", href: "/discover", icon: <Compass size={18} />, badge: "Explore" },
  { key: "ideas", label: "Ideas & Co-founders", href: "/ideas", icon: <Lightbulb size={18} /> },
  { key: "hub", label: "Founders Hub", href: "/hub", icon: <Zap size={18} /> },
  { key: "meetups", label: "Meetups & Pitch", href: "/meetups", icon: <Coffee size={18} /> },
  { key: "company", label: "My Company", href: "/company", icon: <Building2 size={18} /> },
  { key: "messages", label: "Messages", href: "/messages", icon: <MessageSquare size={18} />, count: 3 },
  { key: "workspace", label: "Workspace Docs", href: "/workspace", icon: <FileText size={18} /> },
  { key: "plans", label: "Pro & Verification", href: "/plans", icon: <Crown size={18} />, highlight: true },
  { key: "profile", label: "My Profile", href: "/profile", icon: <User size={18} /> },
];

export function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.userHandle ? `@${user.userHandle}` : "Aarav Reddy";
  const userType = user?.type ? user.type.replace(/_/g, " ") : "Startup Founder";

  function handleLogout() {
    logout();
    onClose();
    router.replace("/sign-in");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Drawer sheet */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-[#0E0E10] border-r border-[#1C1C1E] z-[101] flex flex-col p-5"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <BridgeLogo size={18} strokeColor="#000" accentColor="#000" />
                </div>
                <span className="text-white font-bold text-[17px] tracking-tight">FounderBridge</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile summary card */}
            <div
              onClick={() => { onClose(); router.push("/profile"); }}
              className="mt-4 p-3 rounded-2xl bg-[#161618] border border-[#232326] flex items-center gap-3 cursor-pointer hover:border-[#A24BFF]/50 transition-colors"
            >
              <Avatar name={displayName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-[14px] truncate">{displayName}</p>
                <p className="text-[#8E8E93] text-[11px] uppercase tracking-wider">{userType}</p>
              </div>
              <ChevronRight size={16} className="text-[#6E6E73]" />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto mt-4 space-y-1 pr-1 -mr-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-white text-black font-semibold shadow"
                        : item.highlight
                        ? "text-[#A24BFF] bg-[#A24BFF]/10 hover:bg-[#A24BFF]/20"
                        : "text-[#A1A1A6] hover:text-white hover:bg-[#1C1C1E]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? "text-black" : item.highlight ? "text-[#A24BFF]" : "text-[#8E8E93]")}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.count && (
                      <span className="min-w-[20px] h-5 rounded-full bg-[#A24BFF] text-white text-[11px] font-bold flex items-center justify-center px-1.5">
                        {item.count}
                      </span>
                    )}

                    {item.badge && !item.count && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer / Logout */}
            <div className="pt-4 border-t border-[#1C1C1E] flex items-center justify-between text-[#8E8E93] text-[13px]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-1.5 px-2 rounded-lg"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
              <span className="text-[11px] text-[#555]">v1.0 · India 🇮🇳</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
