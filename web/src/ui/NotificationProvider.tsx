"use client";

/**
 * NotificationProvider
 *
 * Mounts when the user is authenticated. Responsibilities:
 *  1. Load existing notifications from the database on mount.
 *  2. Subscribe to Supabase Realtime INSERT events on the notifications table
 *     (filtered to the current user), so new notifications appear instantly
 *     without polling.
 *  3. Unsubscribe cleanly when the user signs out or the component unmounts.
 *
 * Renders nothing — this is a pure side-effect component.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { notificationService } from "@/lib/api/notificationService";

export function NotificationProvider() {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const load = useNotificationStore((s) => s.load);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const activeToast = useNotificationStore((s) => s.activeToast);
  const dismissToast = useNotificationStore((s) => s.dismissToast);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      unsubRef.current?.();
      unsubRef.current = null;
      return;
    }

    load();

    unsubRef.current = notificationService.subscribe(userId, (n) => {
      addNotification(n);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [isAuthenticated, userId, load, addNotification]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  function handleToastClick() {
    setPanelOpen(true);
    dismissToast();
  }

  function getToastMessage() {
    if (!activeToast) return "";
    if (activeToast.type === "CONNECTION_REQUEST") {
      const name =
        (activeToast.payload.requester_name as string) ||
        (activeToast.payload.requester_handle as string) ||
        "Someone";
      return `${name} sent you a connection request`;
    }
    if (activeToast.type === "CONNECTION_ACCEPTED") {
      const name =
        (activeToast.payload.accepter_name as string) ||
        (activeToast.payload.accepter_handle as string) ||
        "Someone";
      return `${name} accepted your connection request`;
    }
    if (activeToast.type === "COLLABORATE_REQUEST") {
      const name =
        (activeToast.payload.requester_name as string) ||
        (activeToast.payload.requester_handle as string) ||
        "Someone";
      const title = (activeToast.payload.idea_title as string) || "your idea";
      return `${name} wants to collaborate on "${title}"`;
    }
    if (activeToast.type === "COLLABORATE_ACCEPTED") {
      const title = (activeToast.payload.idea_title as string) || "your idea";
      return `Your collaboration on "${title}" was accepted! 🎉`;
    }
    return "New notification received";
  }

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-[#18181B] border border-[#A24BFF]/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 backdrop-blur-xl cursor-pointer hover:border-[#A24BFF] transition-colors"
          onClick={handleToastClick}
        >
          <div className="w-10 h-10 rounded-full bg-[#A24BFF]/20 border border-[#A24BFF]/40 flex items-center justify-center shrink-0">
            {activeToast.type === "CONNECTION_REQUEST" ? (
              <UserPlus size={18} className="text-[#A24BFF]" />
            ) : activeToast.type === "CONNECTION_ACCEPTED" ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : activeToast.type === "COLLABORATE_REQUEST" ? (
              <UserPlus size={18} className="text-[#FF8A3D]" />
            ) : activeToast.type === "COLLABORATE_ACCEPTED" ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <Bell size={18} className="text-[#A24BFF]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-medium leading-snug">
              {getToastMessage()}
            </p>
            <p className="text-[#A24BFF] text-[11px] font-semibold mt-0.5">
              Tap to view
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissToast();
            }}
            className="p-1 rounded-full text-[#8E8E93] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
