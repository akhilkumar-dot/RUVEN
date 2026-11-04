/**
 * notificationStore.ts — Zustand store for in-app notifications.
 *
 * Keeps an in-memory list of the user's latest notifications and
 * an unread count. The AuthBootstrap / NotificationProvider sets up
 * the Supabase Realtime subscription.
 */

import { create } from "zustand";
import {
  notificationService,
  type AppNotification,
} from "@/lib/api/notificationService";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  activeToast: AppNotification | null;
  panelOpen: boolean;

  // Actions
  load: () => Promise<void>;
  addNotification: (n: AppNotification) => void;
  setPanelOpen: (open: boolean) => void;
  dismissToast: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  acceptRequest: (connectionId: string, notifId: string) => Promise<void>;
  declineRequest: (connectionId: string, notifId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  activeToast: null,
  panelOpen: false,

  setPanelOpen: (open) => set({ panelOpen: open }),
  dismissToast: () => set({ activeToast: null }),

  load: async () => {
    set({ loading: true });
    try {
      const notifications = await notificationService.fetchAll();
      const unreadCount = notifications.filter((n) => !n.read_at).length;
      set({ notifications, unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addNotification: (n) => {
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: n.read_at ? state.unreadCount : state.unreadCount + 1,
      activeToast: n,
    }));
  },

  markRead: async (id) => {
    await notificationService.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationService.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  acceptRequest: async (connectionId, notifId) => {
    await notificationService.acceptConnectionRequest(connectionId);
    // Mark the notification as read after acting on it
    await get().markRead(notifId);
  },

  declineRequest: async (connectionId, notifId) => {
    await notificationService.declineConnectionRequest(connectionId);
    await get().markRead(notifId);
  },
}));
