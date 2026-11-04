import { supabase } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────

export interface PostAuthor {
  id: string;
  name: string;
  user_handle: string;
  avatar_url?: string | null;
  type?: string;
  headline?: string | null;
}

export interface FeedPost {
  id: string;
  author_id: string;
  body: string;
  media_ids?: string | null;
  visibility: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author: PostAuthor;
  hasLiked?: boolean;
}

export interface UserStats {
  connectionsCount: number;
  postsCount: number;
  profileCompleteness: number;
  upcomingMeetupsCount: number;
}

export interface DiscoverPerson {
  id: string;
  name: string;
  user_handle: string;
  type: string;
  avatar_url?: string | null;
  headline?: string | null;
  location?: string | null;
  skills?: string | null;
  connectionStatus?: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED" | "PENDING" | "ACCEPTED";
}

export interface DiscoverCompany {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  status: string;
  founded_year?: number | null;
  verified: boolean;
}

export interface DiscoverInvestor {
  user_id: string;
  firm_name?: string | null;
  thesis?: string | null;
  min_ticket_lakh?: number | null;
  max_ticket_lakh?: number | null;
  sectors?: string | null;
  stages?: string | null;
  portfolio_companies?: string | null;
  calendly_url?: string | null;
  name: string;
  user_handle: string;
  location?: string | null;
  avatar_url?: string | null;
  connectionStatus?: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED" | "PENDING" | "ACCEPTED";
}

export interface DiscoverJob {
  id: string;
  company_id: string;
  company_name: string;
  company_location?: string | null;
  poster_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  is_remote: boolean;
  salary_min_lakh?: number | null;
  salary_max_lakh?: number | null;
  employment_type?: string | null;
  status: string;
  created_at: string;
  hasApplied?: boolean;
}

export interface StartupIdea {
  id: string;
  author_id: string;
  title: string;
  description: string;
  looking_for?: string | null;
  upvote_count: number;
  comment_count: number;
  tags?: string | null;
  created_at: string;
  author: PostAuthor;
  hasUpvoted?: boolean;
}

export interface MeetupEvent {
  id: string;
  organiser_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  is_online: boolean;
  event_at: string;
  max_attendees?: number | null;
  attendee_count: number;
  tags?: string | null;
  link?: string | null;
  status: string;
  organiser: PostAuthor;
  hasRsvped?: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  msg_type: string;
  status: string;
  created_at: string;
}

export interface ChatRoomSummary {
  id: string;
  name?: string | null;
  type: string;
  created_at: string;
  counterpart: PostAuthor;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
}

export interface WorkspaceDocument {
  id: string;
  owner_id: string;
  title: string;
  body?: string | null;
  emoji?: string | null;
  visibility: string;
  word_count: number;
  updated_at: string;
  created_at: string;
}

export interface AdItem {
  id: string;
  business_name: string;
  website: string;
  headline: string;
  description: string;
  button_text?: string | null;
  status: string;
  expires_at: string;
  // Extended display fields (may be missing in older rows)
  sponsor_name?: string | null;
  title?: string | null;
  tag?: string | null;
  cta_link?: string | null;
  cta_text?: string | null;
}

// ── Data Service ───────────────────────────────────────────────────

export const dataService = {
  // ── Global & Unread Badges ────────────────────────────────────────
  fetchUnreadCounts: async (userId: string) => {
    try {
      const [messagesRes, notifRes] = await Promise.all([
        supabase
          .from("chat_room_members")
          .select("room_id")
          .eq("user_id", userId),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("addressee_id", userId)
          .eq("status", "PENDING"),
      ]);

      let unreadMessages = 0;
      if (messagesRes.data && messagesRes.data.length > 0) {
        const roomIds = messagesRes.data.map((r) => r.room_id);
        const { count } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .in("room_id", roomIds)
          .neq("sender_id", userId);
        unreadMessages = count || 0;
      }

      return {
        messages: unreadMessages,
        notifications: notifRes.count || 0,
      };
    } catch (e) {
      console.warn("Failed to fetch unread counts:", e);
      return { messages: 0, notifications: 0 };
    }
  },

  // ── Home Screen ───────────────────────────────────────────────────
  fetchDailyQuote: async (roleType: string) => {
    try {
      const { data } = await supabase
        .from("system_quotes")
        .select("quote, author")
        .eq("role_type", roleType)
        .limit(1)
        .maybeSingle();

      if (data) return data;
      return {
        quote: "The best way to predict the future is to invent it.",
        author: "Alan Kay",
      };
    } catch {
      return {
        quote: "The best way to predict the future is to invent it.",
        author: "Alan Kay",
      };
    }
  },

  fetchUserStats: async (userId: string): Promise<UserStats> => {
    try {
      const [connectionsReq, connectionsAdd, postsCountRes, profileRes, rsvpsRes] =
        await Promise.all([
          supabase
            .from("connections")
            .select("id", { count: "exact", head: true })
            .eq("requester_id", userId)
            .eq("status", "ACCEPTED"),
          supabase
            .from("connections")
            .select("id", { count: "exact", head: true })
            .eq("addressee_id", userId)
            .eq("status", "ACCEPTED"),
          supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("author_id", userId)
            .is("deleted_at", null),
          supabase
            .from("profiles")
            .select("bio, headline, location, skills, photo_url, education, experience")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("meetup_rsvps")
            .select("meetup_id", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

      const connCount =
        (connectionsReq.count || 0) + (connectionsAdd.count || 0);
      const postCount = postsCountRes.count || 0;
      const upcomingMeetups = rsvpsRes.count || 0;

      let completeness = 20; // baseline for created account
      if (profileRes.data) {
        const p = profileRes.data;
        if (p.headline) completeness += 20;
        if (p.bio) completeness += 20;
        if (p.location) completeness += 10;
        if (p.skills) completeness += 15;
        if (p.photo_url) completeness += 15;
      }
      completeness = Math.min(100, completeness);

      return {
        connectionsCount: connCount,
        postsCount: postCount,
        profileCompleteness: completeness,
        upcomingMeetupsCount: upcomingMeetups,
      };
    } catch (e) {
      console.warn("Failed to fetch user stats:", e);
      return {
        connectionsCount: 0,
        postsCount: 0,
        profileCompleteness: 30,
        upcomingMeetupsCount: 0,
      };
    }
  },

  fetchActiveAd: async (): Promise<AdItem | null> => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("id, business_name, website, headline, description, button_text, status, expires_at")
        .eq("status", "ACTIVE")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return data || null;
    } catch {
      return null;
    }
  },

  fetchTodayMeetups: async (): Promise<MeetupEvent[]> => {
    try {
      const todayIso = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("meetups")
        .select(`
          id, organiser_id, title, description, location, is_online,
          event_at, max_attendees, attendee_count, tags, link, status,
          organiser:users!organiser_id (id, name, user_handle, avatar_url, type)
        `)
        .gte("event_at", todayIso)
        .order("event_at", { ascending: true })
        .limit(2);

      if (!data) return [];
      return (data as unknown as MeetupEvent[]).map((m) => {
        const rawOrg = Array.isArray(m.organiser) ? m.organiser[0] : m.organiser;
        return {
          ...m,
          organiser: rawOrg || {
            id: m.organiser_id,
            name: "Organizer",
            user_handle: "organizer",
          },
        };
      });
    } catch {
      return [];
    }
  },

  fetchFeedPosts: async (currentUserId?: string): Promise<FeedPost[]> => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, author_id, body, media_ids, visibility, like_count, comment_count, created_at,
          author:users!author_id (
            id, name, user_handle, avatar_url, type
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error || !data) {
        console.warn("Error fetching feed posts:", error);
        return [];
      }

      // Check user liked posts
      let likedIds = new Set<string>();
      if (currentUserId && data.length > 0) {
        const postIds = data.map((p) => p.id);
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", currentUserId)
          .in("post_id", postIds);

        if (likes) {
          likedIds = new Set(likes.map((l) => l.post_id));
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((p) => {
        const rawAuthor = (Array.isArray(p.author) ? p.author[0] : p.author) as PostAuthor | undefined;
        return {
          id: p.id as string,
          author_id: p.author_id as string,
          body: p.body as string,
          media_ids: p.media_ids as string | null | undefined,
          visibility: p.visibility as string,
          like_count: (p.like_count as number) || 0,
          comment_count: (p.comment_count as number) || 0,
          created_at: p.created_at as string,
          hasLiked: likedIds.has(p.id as string),
          author: {
            id: rawAuthor?.id || (p.author_id as string),
            name: rawAuthor?.name || rawAuthor?.user_handle || "Community Member",
            user_handle: rawAuthor?.user_handle || "member",
            avatar_url: rawAuthor?.avatar_url || null,
            type: rawAuthor?.type || "INDIVIDUAL",
            headline: rawAuthor?.headline || null,
          },
        };
      });
    } catch (e) {
      console.warn("Exception in fetchFeedPosts:", e);
      return [];
    }
  },

  createPost: async (authorId: string, body: string): Promise<FeedPost | null> => {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: authorId,
        body,
        visibility: "PUBLIC",
        like_count: 0,
        comment_count: 0,
      })
      .select(`
        id, author_id, body, media_ids, visibility, like_count, comment_count, created_at,
        author:users!author_id (id, name, user_handle, avatar_url, type)
      `)
      .single();

    if (error || !data) throw error;
    const rawAuthor = Array.isArray(data.author) ? data.author[0] : data.author;
    return {
      ...data,
      hasLiked: false,
      author: rawAuthor || { id: authorId, name: "Me", user_handle: "me" },
    };
  },

  togglePostLike: async (postId: string, userId: string, currentlyLiked: boolean) => {
    if (currentlyLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      // Attempt counter decrement; ignore error if RPC doesn't exist
      try { await supabase.rpc("decrement_post_likes", { p_id: postId }); } catch { /* noop */ }
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
      try { await supabase.rpc("increment_post_likes", { p_id: postId }); } catch { /* noop */ }
    }
  },

  // ── Discover Screen ───────────────────────────────────────────────
  fetchDiscoverPeople: async (currentUserId?: string, search?: string): Promise<DiscoverPerson[]> => {
    try {
      let query = supabase
        .from("users")
        .select(`
          id, name, user_handle, type, avatar_url,
          profiles!inner (headline, location, skills)
        `)
        .eq("status", "ACTIVE")
        .limit(40);

      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }

      if (search && search.trim().length > 0) {
        query = query.or(`name.ilike.%${search}%,user_handle.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      // Check connection status
      const userIds = data.map((u) => u.id);
      const connMap = new Map<string, "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED">();
      if (currentUserId && userIds.length > 0) {
        const { data: conns } = await supabase
          .from("connections")
          .select("id, requester_id, addressee_id, status")
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

        if (conns) {
          for (const c of conns) {
            const otherId = c.requester_id === currentUserId ? c.addressee_id : c.requester_id;
            if (c.status === "ACCEPTED") {
              connMap.set(otherId, "CONNECTED");
            } else if (c.status === "PENDING") {
              if (c.requester_id === currentUserId) {
                connMap.set(otherId, "REQUESTED");
              } else {
                connMap.set(otherId, "RESPOND");
              }
            }
          }
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((u) => {
        const rawProfiles = u.profiles as unknown as { headline?: string; location?: string; skills?: string }[] | { headline?: string; location?: string; skills?: string } | undefined;
        const prof = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;
        return {
          id: u.id as string,
          name: (u.name as string) || (u.user_handle as string) || "User",
          user_handle: u.user_handle as string,
          type: u.type as string,
          avatar_url: u.avatar_url as string | null,
          headline: prof?.headline || null,
          location: prof?.location || null,
          skills: prof?.skills || null,
          connectionStatus: connMap.get(u.id as string) || "NONE",
        };
      });
    } catch {
      return [];
    }
  },

  fetchDiscoverCompanies: async (search?: string): Promise<DiscoverCompany[]> => {
    try {
      let query = supabase
        .from("companies")
        .select("id, name, slug, tagline, description, industry, location, website, status, founded_year, verified")
        .or("status.eq.PUBLISHED,status.eq.ACTIVE")
        .order("created_at", { ascending: false })
        .limit(30);

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`);
      }

      const { data } = await query;
      return (data as DiscoverCompany[]) || [];
    } catch {
      return [];
    }
  },

  fetchDiscoverInvestors: async (currentUserId?: string, search?: string): Promise<DiscoverInvestor[]> => {
    try {
      let query = supabase
        .from("investor_profiles")
        .select(`
          user_id, firm_name, thesis, min_ticket_lakh, max_ticket_lakh, sectors, stages, portfolio_companies, calendly_url,
          user:users!user_id (id, name, user_handle, avatar_url),
          profile:profiles!user_id (location)
        `)
        .limit(30);

      if (search && search.trim()) {
        query = query.or(`firm_name.ilike.%${search}%,thesis.ilike.%${search}%,sectors.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const connMap = new Map<string, "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED">();
      if (currentUserId && data.length > 0) {
        const { data: conns } = await supabase
          .from("connections")
          .select("id, requester_id, addressee_id, status")
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

        if (conns) {
          for (const c of conns) {
            const otherId = c.requester_id === currentUserId ? c.addressee_id : c.requester_id;
            if (c.status === "ACCEPTED") {
              connMap.set(otherId, "CONNECTED");
            } else if (c.status === "PENDING") {
              if (c.requester_id === currentUserId) {
                connMap.set(otherId, "REQUESTED");
              } else {
                connMap.set(otherId, "RESPOND");
              }
            }
          }
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((inv) => {
        const rawUser = inv.user as unknown as { name?: string; user_handle?: string; avatar_url?: string }[] | { name?: string; user_handle?: string; avatar_url?: string } | undefined;
        const u = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        const rawProfile = inv.profile as unknown as { location?: string }[] | { location?: string } | undefined;
        const p = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
        return {
          user_id: inv.user_id as string,
          firm_name: inv.firm_name as string | null,
          thesis: inv.thesis as string | null,
          min_ticket_lakh: inv.min_ticket_lakh as number | null,
          max_ticket_lakh: inv.max_ticket_lakh as number | null,
          sectors: inv.sectors as string | null,
          stages: inv.stages as string | null,
          portfolio_companies: inv.portfolio_companies as string | null,
          calendly_url: inv.calendly_url as string | null,
          name: u?.name || u?.user_handle || "Investor",
          user_handle: u?.user_handle || "investor",
          avatar_url: u?.avatar_url || null,
          location: p?.location || null,
          connectionStatus: connMap.get(inv.user_id as string) || "NONE",
        };
      });
    } catch {
      return [];
    }
  },

  fetchDiscoverJobs: async (currentUserId?: string, search?: string): Promise<DiscoverJob[]> => {
    try {
      let query = supabase
        .from("jobs")
        .select(`
          id, company_id, poster_id, title, description, location, is_remote,
          salary_min_lakh, salary_max_lakh, employment_type, status, created_at,
          company:companies!company_id (name, location)
        `)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(30);

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      let appliedJobIds = new Set<string>();
      if (currentUserId && data.length > 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("job_id")
          .eq("applicant_id", currentUserId);

        if (apps) {
          appliedJobIds = new Set(apps.map((a) => a.job_id));
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((j) => {
        const rawComp = j.company as unknown as { name?: string; location?: string }[] | { name?: string; location?: string } | undefined;
        const comp = Array.isArray(rawComp) ? rawComp[0] : rawComp;
        return {
          id: j.id as string,
          company_id: j.company_id as string,
          company_name: comp?.name || "Company",
          company_location: comp?.location || null,
          poster_id: j.poster_id as string,
          title: j.title as string,
          description: j.description as string | null,
          location: j.location as string | null,
          is_remote: Boolean(j.is_remote),
          salary_min_lakh: j.salary_min_lakh as number | null,
          salary_max_lakh: j.salary_max_lakh as number | null,
          employment_type: j.employment_type as string | null,
          status: j.status as string,
          created_at: j.created_at as string,
          hasApplied: appliedJobIds.has(j.id as string),
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Get the connection state between current user and target user:
   * NONE: No active request or connection
   * REQUESTED: Current user sent request, pending acceptance by target
   * RESPOND: Target user sent request to current user, pending our acceptance
   * CONNECTED: Connection is ACCEPTED
   */
  getConnectionState: async (
    currentUserId: string,
    targetUserId: string
  ): Promise<{
    status: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED";
    connectionId?: string;
  }> => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return { status: "NONE" };
    }
    const { data: row } = await supabase
      .from("connections")
      .select("id, requester_id, addressee_id, status")
      .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return { status: "NONE" };

    if (row.status === "ACCEPTED") {
      return { status: "CONNECTED", connectionId: row.id };
    }
    if (row.status === "PENDING") {
      if (row.requester_id === currentUserId) {
        return { status: "REQUESTED", connectionId: row.id };
      }
      return { status: "RESPOND", connectionId: row.id };
    }
    return { status: "NONE", connectionId: row.id };
  },

  sendConnectionRequest: async (requesterId: string, addresseeId: string, note?: string) => {
    if (!requesterId || !addresseeId || requesterId === addresseeId) {
      throw new Error("Cannot connect with yourself");
    }

    // Check existing
    const { data: existing } = await supabase
      .from("connections")
      .select("id, requester_id, addressee_id, status, declined_cooldown_until")
      .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return; // already connected
      }
      if (existing.status === "PENDING") {
        if (existing.requester_id === requesterId) {
          return; // already sent
        } else {
          // Mutual request case: if target already requested me, auto-accept!
          const { error: acceptErr } = await supabase
            .from("connections")
            .update({ status: "ACCEPTED", responded_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (acceptErr) throw acceptErr;
          return;
        }
      }
      if (existing.status === "DECLINED") {
        if (existing.declined_cooldown_until && new Date(existing.declined_cooldown_until) > new Date()) {
          const days = Math.ceil((new Date(existing.declined_cooldown_until).getTime() - Date.now()) / (86400000));
          throw new Error(`Cannot send request. Cooldown active for ${days} more day(s).`);
        }
        // Cooldown passed: re-activate as PENDING
        const { error } = await supabase
          .from("connections")
          .update({
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: "PENDING",
            note: note || null,
            created_at: new Date().toISOString(),
            responded_at: null,
            declined_cooldown_until: null,
          })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }
      // If WITHDRAWN or REMOVED, delete old record first so unique index doesn't conflict
      await supabase.from("connections").delete().eq("id", existing.id);
    }

    const { error } = await supabase.from("connections").insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: "PENDING",
      note: note || null,
    });
    if (error) throw error;
  },

  withdrawConnectionRequest: async (connectionId: string): Promise<void> => {
    const { error } = await supabase.from("connections").delete().eq("id", connectionId);
    if (error) throw error;
  },

  acceptConnectionRequest: async (connectionId: string): Promise<void> => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "ACCEPTED", responded_at: new Date().toISOString() })
      .eq("id", connectionId)
      .eq("status", "PENDING");
    if (error) throw error;
  },

  declineConnectionRequest: async (connectionId: string): Promise<void> => {
    const cooldown = new Date(Date.now() + 7 * 86400000).toISOString();
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

  toggleConnection: async (currentUserId: string, targetUserId: string, currentlyConnected?: boolean) => {
    const state = await dataService.getConnectionState(currentUserId, targetUserId);

    if (state.status === "CONNECTED" || currentlyConnected === true) {
      if (state.connectionId) {
        await supabase.from("connections").delete().eq("id", state.connectionId);
      }
      return false;
    }

    if (state.status === "REQUESTED") {
      if (state.connectionId) {
        await dataService.withdrawConnectionRequest(state.connectionId);
      }
      return false;
    }

    if (state.status === "RESPOND") {
      if (state.connectionId) {
        await dataService.acceptConnectionRequest(state.connectionId);
      }
      return true;
    }

    // state is NONE
    await dataService.sendConnectionRequest(currentUserId, targetUserId);
    return true;
  },

  fetchConnectionRequests: async (userId: string) => {
    const { data: incoming } = await supabase
      .from("connections")
      .select(`
        id, created_at, note,
        user:users!requester_id (id, name, user_handle, avatar_url, type)
      `)
      .eq("addressee_id", userId)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    const { data: sent } = await supabase
      .from("connections")
      .select(`
        id, created_at, note,
        user:users!addressee_id (id, name, user_handle, avatar_url, type)
      `)
      .eq("requester_id", userId)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    return {
      incoming: (incoming || []).map((r) => {
        const u = Array.isArray(r.user) ? r.user[0] : r.user;
        return {
          id: r.id as string,
          created_at: r.created_at as string,
          note: r.note as string | null,
          user: u as { id: string; name: string; user_handle: string; avatar_url: string | null; type: string } | null,
        };
      }),
      sent: (sent || []).map((r) => {
        const u = Array.isArray(r.user) ? r.user[0] : r.user;
        return {
          id: r.id as string,
          created_at: r.created_at as string,
          note: r.note as string | null,
          user: u as { id: string; name: string; user_handle: string; avatar_url: string | null; type: string } | null,
        };
      }),
    };
  },

  requestInvestorIntro: async (requesterId: string, targetUserId: string, note?: string) => {
    return dataService.sendConnectionRequest(requesterId, targetUserId, note);
  },

  applyForJob: async (jobId: string, applicantId: string, coverNote?: string) => {
    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      applicant_id: applicantId,
      cover_note: coverNote || null,
      status: "PENDING",
    });
    if (error) throw error;
  },

  applyToJob: async (jobId: string, applicantId: string, coverNote?: string) => {
    return dataService.applyForJob(jobId, applicantId, coverNote);
  },

  createDirectChat: async (userId: string, targetUserId: string, initialMessage?: string) => {
    const roomId = await dataService.getOrCreateDirectRoom(userId, targetUserId);
    if (initialMessage) {
      await dataService.sendMessage(roomId, userId, initialMessage);
    }
    return roomId;
  },

  // ── Hub Screen ────────────────────────────────────────────────────
  fetchFounders: async (currentUserId?: string, search?: string) => {
    return dataService.fetchHubFounders(currentUserId, search);
  },

  fetchHubFounders: async (currentUserId?: string, search?: string): Promise<DiscoverPerson[]> => {
    try {
      let query = supabase
        .from("users")
        .select(`
          id, name, user_handle, type, avatar_url,
          profiles!inner (headline, location, skills)
        `)
        .eq("status", "ACTIVE")
        .limit(50);

      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,user_handle.ilike.%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const userIds = data.map((u) => u.id);
      const connMap = new Map<string, "PENDING" | "ACCEPTED">();
      if (currentUserId && userIds.length > 0) {
        const { data: conns } = await supabase
          .from("connections")
          .select("requester_id, addressee_id, status")
          .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

        if (conns) {
          for (const c of conns) {
            const otherId = c.requester_id === currentUserId ? c.addressee_id : c.requester_id;
            connMap.set(otherId, c.status as "PENDING" | "ACCEPTED");
          }
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((u) => {
        const rawProf = u.profiles as unknown as { headline?: string; location?: string; skills?: string }[] | { headline?: string; location?: string; skills?: string } | undefined;
        const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf;
        return {
          id: u.id as string,
          name: (u.name as string) || (u.user_handle as string) || "Founder",
          user_handle: u.user_handle as string,
          type: u.type as string,
          avatar_url: u.avatar_url as string | null,
          headline: prof?.headline || null,
          location: prof?.location || null,
          skills: prof?.skills || null,
          connectionStatus: connMap.get(u.id as string) || "NONE",
        };
      });
    } catch {
      return [];
    }
  },

  // ── Ideas Screen ──────────────────────────────────────────────────
  fetchIdeas: async (currentUserId?: string): Promise<StartupIdea[]> => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          id, author_id, title, description, looking_for, upvote_count, comment_count, tags, created_at,
          author:users!author_id (id, name, user_handle, avatar_url, type)
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      let upvotedIds = new Set<string>();
      if (currentUserId && data.length > 0) {
        const ideaIds = data.map((i) => i.id);
        const { data: upvotes } = await supabase
          .from("idea_upvotes")
          .select("idea_id")
          .eq("user_id", currentUserId)
          .in("idea_id", ideaIds);

        if (upvotes) {
          upvotedIds = new Set(upvotes.map((u) => u.idea_id));
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((i) => {
        const rawAuthor = (Array.isArray(i.author) ? i.author[0] : i.author) as { id?: string; name?: string; user_handle?: string; avatar_url?: string; type?: string } | undefined;
        const authorId = i.author_id as string;
        return {
          id: i.id as string,
          author_id: authorId,
          title: i.title as string,
          description: i.description as string,
          looking_for: i.looking_for as string | null,
          upvote_count: (i.upvote_count as number) || 0,
          comment_count: (i.comment_count as number) || 0,
          tags: (i.tags as string) || "",
          created_at: i.created_at as string,
          hasUpvoted: upvotedIds.has(i.id as string),
          author: {
            id: rawAuthor?.id || authorId,
            name: rawAuthor?.name || "Founder",
            user_handle: rawAuthor?.user_handle || "founder",
            avatar_url: rawAuthor?.avatar_url || null,
            type: rawAuthor?.type,
          },
        };
      });
    } catch {
      return [];
    }
  },

  createIdea: async (
    authorId: string,
    title: string,
    description: string,
    lookingFor: string,
    tags: string
  ): Promise<StartupIdea | null> => {
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        author_id: authorId,
        title,
        description,
        looking_for: lookingFor,
        tags,
        upvote_count: 0,
        comment_count: 0,
      })
      .select(`
        id, author_id, title, description, looking_for, upvote_count, comment_count, tags, created_at,
        author:users!author_id (id, name, user_handle, avatar_url, type)
      `)
      .single();

    if (error || !data) throw error;
    const rawAuthor = Array.isArray(data.author) ? data.author[0] : data.author;
    return {
      ...data,
      hasUpvoted: false,
      author: rawAuthor || { id: authorId, name: "Me", user_handle: "me" },
    };
  },

  toggleIdeaUpvote: async (ideaId: string, userId: string, currentlyUpvoted: boolean) => {
    if (currentlyUpvoted) {
      await supabase
        .from("idea_upvotes")
        .delete()
        .eq("idea_id", ideaId)
        .eq("user_id", userId);
    } else {
      await supabase.from("idea_upvotes").insert({ idea_id: ideaId, user_id: userId });
    }
  },

  // ── Meetups Screen ────────────────────────────────────────────────
  fetchMeetups: async (currentUserId?: string): Promise<MeetupEvent[]> => {
    try {
      const { data, error } = await supabase
        .from("meetups")
        .select(`
          id, organiser_id, title, description, location, is_online,
          event_at, max_attendees, attendee_count, tags, link, status,
          organiser:users!organiser_id (id, name, user_handle, avatar_url, type)
        `)
        .order("event_at", { ascending: true });

      if (error || !data) return [];

      let rsvpedIds = new Set<string>();
      if (currentUserId && data.length > 0) {
        const meetupIds = data.map((m) => m.id);
        const { data: rsvps } = await supabase
          .from("meetup_rsvps")
          .select("meetup_id")
          .eq("user_id", currentUserId)
          .in("meetup_id", meetupIds);

        if (rsvps) {
          rsvpedIds = new Set(rsvps.map((r) => r.meetup_id));
        }
      }

      return (data as unknown as Record<string, unknown>[]).map((m) => {
        const rawOrg = Array.isArray(m.organiser) ? m.organiser[0] : m.organiser;
        return {
          ...(m as unknown as MeetupEvent),
          hasRsvped: rsvpedIds.has(m.id as string),
          organiser: rawOrg || { id: m.organiser_id as string, name: "Host", user_handle: "host" },
        };
      });
    } catch {
      return [];
    }
  },

  fetchUserRsvps: async (userId: string): Promise<MeetupEvent[]> => {
    try {
      const { data, error } = await supabase
        .from("meetup_rsvps")
        .select(`
          meetup:meetups!meetup_id (
            id, organiser_id, title, description, location, is_online,
            event_at, max_attendees, attendee_count, tags, link, status,
            organiser:users!organiser_id (id, name, user_handle, avatar_url, type)
          )
        `)
        .eq("user_id", userId);

      if (error || !data) return [];
      return (data as unknown as Record<string, unknown>[])
        .map((r) => {
          const m = (Array.isArray(r.meetup) ? r.meetup[0] : r.meetup) as Record<string, unknown> | undefined;
          if (!m) return null;
          const rawOrg = Array.isArray(m.organiser) ? m.organiser[0] : m.organiser;
          return {
            ...(m as unknown as MeetupEvent),
            hasRsvped: true,
            organiser: rawOrg || { id: m.organiser_id as string, name: "Host", user_handle: "host" },
          };
        })
        .filter(Boolean) as MeetupEvent[];
    } catch {
      return [];
    }
  },

  fetchUserOrganisedMeetups: async (userId: string): Promise<MeetupEvent[]> => {
    try {
      const { data, error } = await supabase
        .from("meetups")
        .select(`
          id, organiser_id, title, description, location, is_online,
          event_at, max_attendees, attendee_count, tags, link, status,
          organiser:users!organiser_id (id, name, user_handle, avatar_url, type)
        `)
        .eq("organiser_id", userId)
        .order("event_at", { ascending: true });

      if (error || !data) return [];
      return (data as unknown as Record<string, unknown>[]).map((m) => {
        const rawOrg = Array.isArray(m.organiser) ? m.organiser[0] : m.organiser;
        return {
          ...(m as unknown as MeetupEvent),
          hasRsvped: true,
          organiser: rawOrg || { id: m.organiser_id as string, name: "Host", user_handle: "host" },
        };
      });
    } catch {
      return [];
    }
  },

  createMeetup: async (organiserId: string, payload: {
    title: string;
    description: string;
    location: string;
    isOnline: boolean;
    eventAt: string;
    link?: string;
  }): Promise<MeetupEvent | null> => {
    const { data, error } = await supabase
      .from("meetups")
      .insert({
        organiser_id: organiserId,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        is_online: payload.isOnline,
        event_at: payload.eventAt,
        link: payload.link || null,
        status: "SCHEDULED",
        attendee_count: 1,
      })
      .select(`
        id, organiser_id, title, description, location, is_online,
        event_at, max_attendees, attendee_count, tags, link, status,
        organiser:users!organiser_id (id, name, user_handle, avatar_url, type)
      `)
      .single();

    if (error || !data) throw error;
    // Auto RSVP the organiser
    await supabase.from("meetup_rsvps").insert({
      meetup_id: data.id,
      user_id: organiserId,
    });

    const rawOrg = Array.isArray(data.organiser) ? data.organiser[0] : data.organiser;
    return {
      ...data,
      hasRsvped: true,
      organiser: rawOrg || { id: organiserId, name: "Me", user_handle: "me" },
    };
  },

  toggleRsvp: async (meetupId: string, userId: string, currentlyRsvped: boolean) => {
    if (currentlyRsvped) {
      await supabase
        .from("meetup_rsvps")
        .delete()
        .eq("meetup_id", meetupId)
        .eq("user_id", userId);
    } else {
      await supabase.from("meetup_rsvps").insert({
        meetup_id: meetupId,
        user_id: userId,
      });
    }
  },

  // ── Messages Screen ───────────────────────────────────────────────
  fetchUserRooms: async (userId: string): Promise<ChatRoomSummary[]> => {
    try {
      const { data: memberRows, error } = await supabase
        .from("chat_room_members")
        .select(`
          room_id,
          room:chat_rooms!room_id (id, name, type, created_at)
        `)
        .eq("user_id", userId);

      if (error || !memberRows) return [];

      const summaries: ChatRoomSummary[] = [];

      for (const row of memberRows) {
        const room = Array.isArray(row.room) ? row.room[0] : row.room;
        if (!room) continue;

        // Fetch counterpart member
        const { data: counterparts } = await supabase
          .from("chat_room_members")
          .select(`
            user:users!user_id (id, name, user_handle, avatar_url, type)
          `)
          .eq("room_id", room.id)
          .neq("user_id", userId)
          .limit(1);

        // Fetch last message
        const { data: lastMsgs } = await supabase
          .from("chat_messages")
          .select("id, room_id, sender_id, body, msg_type, status, created_at")
          .eq("room_id", room.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1);

        const counterpart = counterparts?.[0]?.user;
        const rawCounterpart = Array.isArray(counterpart) ? counterpart[0] : counterpart;

        summaries.push({
          id: room.id,
          name: room.name,
          type: room.type,
          created_at: room.created_at,
          counterpart: rawCounterpart || {
            id: "unknown",
            name: room.name || "Chat Room",
            user_handle: "chat",
          },
          lastMessage: lastMsgs?.[0] || null,
          unreadCount: 0,
        });
      }

      return summaries;
    } catch {
      return [];
    }
  },

  fetchRoomMessages: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, room_id, sender_id, body, msg_type, status, created_at")
        .eq("room_id", roomId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  sendMessage: async (roomId: string, senderId: string, body: string): Promise<ChatMessage | null> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: senderId,
        body,
        msg_type: "TEXT",
        status: "SENT",
      })
      .select("id, room_id, sender_id, body, msg_type, status, created_at")
      .single();

    if (error || !data) throw error;
    return data;
  },

  getOrCreateDirectRoom: async (userId: string, targetUserId: string): Promise<string> => {
    // Check if a direct room already exists between these 2 users
    const { data: myRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    if (myRooms && myRooms.length > 0) {
      const roomIds = myRooms.map((r) => r.room_id);
      const { data: existingTarget } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", targetUserId)
        .in("room_id", roomIds)
        .limit(1);

      if (existingTarget && existingTarget.length > 0) {
        return existingTarget[0].room_id;
      }
    }

    // Create new direct room
    const { data: newRoom, error: roomErr } = await supabase
      .from("chat_rooms")
      .insert({
        type: "DIRECT",
        name: null,
      })
      .select("id")
      .single();

    if (roomErr || !newRoom) throw roomErr;

    // Add both members
    await supabase.from("chat_room_members").insert([
      { room_id: newRoom.id, user_id: userId },
      { room_id: newRoom.id, user_id: targetUserId },
    ]);

    return newRoom.id;
  },

  // ── Workspace Screen ──────────────────────────────────────────────
  fetchUserDocs: async (userId: string): Promise<WorkspaceDocument[]> => {
    try {
      const { data, error } = await supabase
        .from("workspace_docs")
        .select("id, owner_id, title, body, emoji, visibility, word_count, updated_at, created_at")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  saveDoc: async (
    ownerId: string,
    doc: { id?: string; title: string; body: string; emoji?: string }
  ): Promise<WorkspaceDocument> => {
    const wordCount = doc.body.trim() ? doc.body.trim().split(/\s+/).length : 0;
    if (doc.id) {
      const { data, error } = await supabase
        .from("workspace_docs")
        .update({
          title: doc.title,
          body: doc.body,
          emoji: doc.emoji || "📄",
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", doc.id)
        .eq("owner_id", ownerId)
        .select()
        .single();

      if (error || !data) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("workspace_docs")
        .insert({
          owner_id: ownerId,
          title: doc.title,
          body: doc.body,
          emoji: doc.emoji || "📄",
          visibility: "private",
          word_count: wordCount,
        })
        .select()
        .single();

      if (error || !data) throw error;
      return data;
    }
  },

  deleteDoc: async (docId: string, ownerId: string) => {
    const { error } = await supabase
      .from("workspace_docs")
      .delete()
      .eq("id", docId)
      .eq("owner_id", ownerId);
    if (error) throw error;
  },

  // ── Profile Screen ────────────────────────────────────────────────
  fetchProfileData: async (userId: string) => {
    const [userRes, profileRes] = await Promise.all([
      supabase.from("users").select("id, name, user_handle, email, type, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    return {
      user: userRes.data,
      profile: profileRes.data,
    };
  },

  updateProfileData: async (
    userId: string,
    profileUpdates: {
      headline?: string;
      bio?: string;
      location?: string;
      skills?: string;
      education?: string;
      experience?: string;
      links?: string;
      photo_url?: string;
    },
    userUpdates?: {
      name?: string;
    }
  ) => {
    const profileResult = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        ...profileUpdates,
        updated_at: new Date().toISOString(),
      });

    if (profileResult.error) throw profileResult.error;

    if (userUpdates && Object.keys(userUpdates).length > 0) {
      const userResult = await supabase
        .from("users")
        .update({
          ...userUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (userResult.error) throw userResult.error;
    }
  },

  fetchUserByHandle: async (handle: string) => {
    const { data: u } = await supabase
      .from("users")
      .select("id, name, user_handle, avatar_url, type, created_at")
      .eq("user_handle", handle)
      .maybeSingle();

    if (!u) return null;

    const { data: p } = await supabase
      .from("profiles")
      .select("headline, bio, location, skills, education, experience, links, photo_url")
      .eq("user_id", u.id)
      .maybeSingle();

    return {
      user: u,
      profile: p,
    };
  },

  // ── Company Screen ────────────────────────────────────────────────
  fetchOwnerCompany: async (ownerId: string) => {
    const { data: comp } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (!comp) return null;

    const [jobsRes, appsRes] = await Promise.all([
      supabase.from("jobs").select("*").eq("company_id", comp.id),
      supabase
        .from("applications")
        .select(`
          id, job_id, applicant_id, cover_note, status, created_at,
          job:jobs!job_id (title),
          applicant:users!applicant_id (id, name, user_handle, avatar_url, type)
        `)
        .eq("job:jobs.company_id", comp.id),
    ]);

    const rawApps = (appsRes.data || []) as unknown as Record<string, unknown>[];
    const applications = rawApps.map((a) => {
      const job = Array.isArray(a.job) ? a.job[0] : a.job;
      const applicant = Array.isArray(a.applicant) ? a.applicant[0] : a.applicant;
      return {
        ...a,
        job: job || null,
        applicant: applicant || null,
      };
    });

    return {
      company: comp,
      jobs: jobsRes.data || [],
      applications,
    };
  },

  fetchCompanyBySlug: async (slug: string) => {
    const { data: comp, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();

    if (error || !comp) return null;

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", comp.id)
      .eq("status", "ACTIVE");

    return {
      company: comp,
      jobs: jobs || [],
    };
  },

  saveCompany: async (ownerId: string, companyData: Record<string, unknown>) => {
    if (companyData.id) {
      const { data, error } = await supabase
        .from("companies")
        .update({
          ...companyData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyData.id as string)
        .eq("owner_id", ownerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const slug = (companyData.slug as string) || (companyData.name as string).toLowerCase().replace(/[^a-z0-9]/g, "-");
      const { data, error } = await supabase
        .from("companies")
        .insert({
          owner_id: ownerId,
          ...companyData,
          slug,
          status: "DRAFT",
          verified: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  createJob: async (
    companyId: string,
    job: {
      title: string;
      description?: string;
      role_type?: string;
      location?: string;
      salary_min?: number;
      salary_max?: number;
    }
  ) => {
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        company_id: companyId,
        title: job.title,
        description: job.description || null,
        role_type: job.role_type || "FULL_TIME",
        location: job.location || "Remote",
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) throw error;
  },
};
