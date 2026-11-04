/**
 * notificationService.ts
 * Real-time notifications backed by Supabase.
 *
 * Notification types used in Phase 2:
 *  - CONNECTION_REQUEST  : Sent to addressee when a new PENDING connection is inserted
 *  - CONNECTION_ACCEPTED : Sent to requester when addressee accepts
 */

import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface AppNotification {
  id: string;
  user_id: string;
  type: "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ── CRUD ───────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch all notifications for the current user (newest first).
   * RLS ensures only the owner can read their rows.
   */
  fetchAll: async (): Promise<AppNotification[]> => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },

  /** Count unread notifications */
  countUnread: async (): Promise<number> => {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null);
    if (error) throw error;
    return count ?? 0;
  },

  /** Mark a single notification as read */
  markRead: async (id: string): Promise<void> => {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .is("read_at", null);
  },

  /** Mark all unread notifications as read */
  markAllRead: async (): Promise<void> => {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  },

  // ── Connection request actions ────────────────────────────────

  /**
   * Accept a connection request.
   * Updates the row status to ACCEPTED — the DB trigger fires
   * and inserts a CONNECTION_ACCEPTED notification for the requester.
   */
  acceptConnectionRequest: async (connectionId: string): Promise<void> => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "ACCEPTED", responded_at: new Date().toISOString() })
      .eq("id", connectionId)
      .eq("status", "PENDING");
    if (error) throw error;
  },

  /**
   * Decline a connection request.
   * Sets a 7-day cooldown until which the requester cannot re-send.
   */
  declineConnectionRequest: async (connectionId: string): Promise<void> => {
    const cooldown = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("connections")
      .update({
        status: "DECLINED",
        responded_at: new Date().toISOString(),
        declined_cooldown_until: cooldown,
      })
      .eq("id", connectionId)
      .eq("status", "PENDING");
    if (error) throw error;
  },

  // ── Realtime subscription ─────────────────────────────────────

  /**
   * Subscribe to new notifications for a given user.
   * Calls `onNew` with each inserted row.
   * Returns a cleanup function.
   */
  subscribe: (
    userId: string,
    onNew: (n: AppNotification) => void
  ): (() => void) => {
    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNew(payload.new as AppNotification);
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  },
};
