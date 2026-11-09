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
  about?: string | null;
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

export const SEED_COMPANIES: DiscoverCompany[] = [
  {
    id: "co-seed-1",
    name: "HyperLoop India",
    slug: "hyperloop-india",
    tagline: "Ultra high-speed green freight and passenger transit networks",
    description: "Building indigenous vacuum-tube levitation pods connecting industrial clusters across Karnataka, Maharashtra and Telangana.",
    industry: "Deeptech",
    location: "Bengaluru",
    website: "https://hyperloopindia.tech",
    status: "PUBLISHED",
    founded_year: 2023,
    verified: true,
  },
  {
    id: "co-seed-2",
    name: "FinPulse Labs",
    slug: "finpulse-labs",
    tagline: "Autonomous UPI reconciliation and cross-border settlement API",
    description: "Empowering 100k+ D2C merchants with real-time treasury management, zero-chargeback processing, and GST auto-compliance.",
    industry: "Fintech",
    location: "Mumbai",
    website: "https://finpulselabs.in",
    status: "PUBLISHED",
    founded_year: 2022,
    verified: true,
  },
  {
    id: "co-seed-3",
    name: "KisanAI Robotics",
    slug: "kisanai-robotics",
    tagline: "Precision farming drones & vernacular soil health diagnostics",
    description: "Multispectral crop health monitoring, precision fertilizer spraying, and regional weather forecast in 12 Indian languages.",
    industry: "Agriculture",
    location: "Hyderabad",
    website: "https://kisanai.ag",
    status: "PUBLISHED",
    founded_year: 2021,
    verified: true,
  },
  {
    id: "co-seed-4",
    name: "MedSutra Health",
    slug: "medsutra-health",
    tagline: "Edge-AI handheld pathology diagnostics for Tier-2/3 hospitals",
    description: "Point-of-care CBC and blood biomarker analysis in under 4 minutes with cloud synchronization and tele-radiology review.",
    industry: "Healthcare",
    location: "Delhi NCR",
    website: "https://medsutra.health",
    status: "PUBLISHED",
    founded_year: 2023,
    verified: true,
  },
  {
    id: "co-seed-5",
    name: "Apex Cloud Orchestration",
    slug: "apex-cloud",
    tagline: "Kubernetes GPU auto-scaler and inference cost optimizer",
    description: "Cut cloud inference costs by 65% across multi-cloud GPU instances with automated model quantization and workload routing.",
    industry: "B2B SaaS",
    location: "Pune",
    website: "https://apexcloud.dev",
    status: "PUBLISHED",
    founded_year: 2024,
    verified: true,
  },
];

export const SEED_INVESTORS: DiscoverInvestor[] = [
  {
    user_id: "inv-seed-1",
    firm_name: "Bharat Seed Ventures",
    name: "Siddharth Rao",
    user_handle: "siddharth_vc",
    avatar_url: null,
    thesis: "Backing technical Indian founders building deeptech, AI infrastructure, and B2B SaaS for global markets.",
    min_ticket_lakh: 25,
    max_ticket_lakh: 150,
    sectors: "B2B SaaS, AI/ML, Deeptech",
    stages: "Pre-seed, Seed",
    portfolio_companies: "HyperLoop India, Pixxel, Sarvam AI",
    calendly_url: "https://calendly.com/bharatseed",
    location: "Bengaluru",
    connectionStatus: "NONE",
  },
  {
    user_id: "inv-seed-2",
    firm_name: "Deccan Angels",
    name: "Pooja Varma",
    user_handle: "pooja_invests",
    avatar_url: null,
    thesis: "Early stage investments in high-velocity Fintech, payments infrastructure, and consumer internet startups.",
    min_ticket_lakh: 10,
    max_ticket_lakh: 75,
    sectors: "Fintech, E-commerce, Payments",
    stages: "Angel, Seed",
    portfolio_companies: "FinPulse Labs, OneCard, Slice",
    calendly_url: "https://calendly.com/pooja-varma",
    location: "Mumbai",
    connectionStatus: "NONE",
  },
  {
    user_id: "inv-seed-3",
    firm_name: "Khosla Impact Capital",
    name: "Anand Murthy",
    user_handle: "anand_capital",
    avatar_url: null,
    thesis: "Mission-driven investments in Agritech, climate tech, and affordable healthtech transforming Bharat.",
    min_ticket_lakh: 50,
    max_ticket_lakh: 300,
    sectors: "Agritech, Climate, Healthcare",
    stages: "Seed, Series A",
    portfolio_companies: "KisanAI, MedSutra, DeHaat",
    calendly_url: "https://calendly.com/anand-impact",
    location: "Delhi NCR",
    connectionStatus: "NONE",
  },
];

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

      if (data) {
        return {
          ...data,
          sponsor_name: data.business_name,
          title: data.headline,
          cta_link: data.website,
          cta_text: data.button_text,
          tag: "Featured Deal",
        };
      }
      return null;
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
      if (error || !data || data.length === 0) {
        return [
          {
            id: "f-seed-1",
            name: "Arjun Reddy",
            user_handle: "arjun_founder",
            type: "STARTUP_FOUNDER",
            headline: "Founder & CEO @ NeuralPulse · Building offline LLMs for rural health",
            location: "Bengaluru",
            skills: "AI/ML, Deeptech, Healthcare",
            connectionStatus: "NONE",
          },
          {
            id: "f-seed-2",
            name: "Pooja Singhania",
            user_handle: "pooja_fintech",
            type: "STARTUP_FOUNDER",
            headline: "Co-Founder @ PayBridge · Automated B2B credit & invoice factoring",
            location: "Mumbai",
            skills: "Fintech, B2B SaaS",
            connectionStatus: "NONE",
          },
          {
            id: "f-seed-3",
            name: "Vikramaditya Bose",
            user_handle: "vikram_agri",
            type: "STARTUP_FOUNDER",
            headline: "Founder @ KisanGrid · Smart solar microgrids & cold chains",
            location: "Hyderabad",
            skills: "Agritech, Logistics",
            connectionStatus: "NONE",
          },
        ];
      }

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
        .select("id, name, slug, tagline, description, about, industry, location, website, status, founded_year, verified")
        .order("created_at", { ascending: false })
        .limit(30);

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%,tagline.ilike.%${search}%`);
      }

      const { data, error } = await query;
      let list = ((data as unknown) as DiscoverCompany[]) || [];
      if (list.length === 0) {
        list = SEED_COMPANIES;
        if (search && search.trim()) {
          const s = search.toLowerCase();
          list = list.filter(c => c.name.toLowerCase().includes(s) || (c.industry && c.industry.toLowerCase().includes(s)));
        }
      }
      return list;
    } catch {
      return SEED_COMPANIES;
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
      if (error || !data || data.length === 0) {
        let list = SEED_INVESTORS;
        if (search && search.trim()) {
          const s = search.toLowerCase();
          list = list.filter(i => (i.firm_name && i.firm_name.toLowerCase().includes(s)) || (i.thesis && i.thesis.toLowerCase().includes(s)));
        }
        return list;
      }

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
      return SEED_INVESTORS;
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
        .eq("type", "STARTUP_FOUNDER")
        .limit(50);

      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,user_handle.ilike.%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return [
          {
            id: "f-seed-1",
            name: "Arjun Reddy",
            user_handle: "arjun_founder",
            type: "STARTUP_FOUNDER",
            headline: "Founder & CEO @ NeuralPulse · Building offline LLMs for rural health",
            location: "Bengaluru",
            skills: "AI/ML, Deeptech, Healthcare",
            connectionStatus: "NONE",
          },
          {
            id: "f-seed-2",
            name: "Pooja Singhania",
            user_handle: "pooja_fintech",
            type: "STARTUP_FOUNDER",
            headline: "Co-Founder @ PayBridge · Automated B2B credit & invoice factoring",
            location: "Mumbai",
            skills: "Fintech, B2B SaaS",
            connectionStatus: "NONE",
          },
          {
            id: "f-seed-3",
            name: "Vikramaditya Bose",
            user_handle: "vikram_agri",
            type: "STARTUP_FOUNDER",
            headline: "Founder @ KisanGrid · Smart solar microgrids & cold chains",
            location: "Hyderabad",
            skills: "Agritech, Logistics",
            connectionStatus: "NONE",
          },
        ];
      }

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

  createIdeaCollaborationRequest: async (ideaId: string, userId: string, message: string) => {
    try {
      const { data: idea } = await supabase
        .from("ideas")
        .select("id, title, author_id")
        .eq("id", ideaId)
        .maybeSingle();

      const authorId = idea?.author_id;
      if (!authorId) return;

      const { data: requester } = await supabase
        .from("users")
        .select("id, name, user_handle, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      await supabase.from("notifications").insert({
        user_id: authorId,
        type: "COLLABORATE_REQUEST",
        payload: {
          idea_id: ideaId,
          idea_title: idea.title,
          requester_id: userId,
          requester_name: requester?.name || requester?.user_handle || "Founder",
          requester_handle: requester?.user_handle || "founder",
          requester_avatar: requester?.avatar_url || null,
          message: message.trim(),
          status: "PENDING",
        },
      });

      await dataService.createDirectChat(
        userId,
        authorId,
        `[Collaboration Request for "${idea.title}"]\n${message.trim()}`
      );
    } catch (e) {
      console.warn("createIdeaCollaborationRequest error:", e);
    }
  },

  fetchIdeaRequestsForAuthor: async (authorId: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, payload, read_at, created_at")
        .eq("user_id", authorId)
        .eq("type", "COLLABORATE_REQUEST")
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map((n) => {
        const payload = (n.payload || {}) as Record<string, unknown>;
        return {
          id: n.id,
          idea_id: (payload.idea_id as string) || "",
          user_id: (payload.requester_id as string) || "",
          message: (payload.message as string) || "",
          status: (payload.status as string) || (n.read_at ? "ACCEPTED" : "PENDING"),
          created_at: n.created_at,
          idea: { title: (payload.idea_title as string) || "Startup Idea" },
          user: {
            id: (payload.requester_id as string) || "",
            name: (payload.requester_name as string) || "Founder",
            user_handle: (payload.requester_handle as string) || "founder",
            avatar_url: (payload.requester_avatar as string) || null,
            type: "STARTUP_FOUNDER",
          },
        };
      });
    } catch {
      return [];
    }
  },

  respondToCollaborationRequest: async (
    notificationId: string,
    authorId: string,
    requesterId: string,
    ideaTitle: string,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      await supabase
        .from("notifications")
        .update({
          read_at: new Date().toISOString(),
          payload: { status },
        })
        .eq("id", notificationId);

      if (status === "ACCEPTED" && requesterId) {
        await supabase.from("notifications").insert({
          user_id: requesterId,
          type: "COLLABORATE_ACCEPTED",
          payload: {
            author_id: authorId,
            idea_title: ideaTitle,
            message: `Your collaboration application for "${ideaTitle}" was accepted!`,
          },
        });
        await dataService.createDirectChat(
          authorId,
          requesterId,
          `Hi! I have accepted your collaboration request for "${ideaTitle}". Let's team up and discuss next steps.`
        );
      }
    } catch (e) {
      console.warn("respondToCollaborationRequest error:", e);
    }
  },

  updateIdeaRequestStatus: async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    const { error } = await supabase
      .from("idea_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) throw error;
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
    doc: { id?: string; title: string; body: string; emoji?: string; visibility?: "private" | "public" }
  ): Promise<WorkspaceDocument> => {
    const wordCount = doc.body.trim() ? doc.body.trim().split(/\s+/).length : 0;
    if (doc.id) {
      const { data, error } = await supabase
        .from("workspace_docs")
        .update({
          title: doc.title,
          body: doc.body,
          emoji: doc.emoji || "📄",
          visibility: doc.visibility || "private",
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
          visibility: doc.visibility || "private",
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

    // Mirror the profile photo onto users.avatar_url so it also shows up
    // everywhere avatars are rendered (nav dock, feed, discover, other users).
    const userSyncUpdates: { name?: string; avatar_url?: string; updated_at: string } = {
      ...userUpdates,
      updated_at: new Date().toISOString(),
    };
    if (profileUpdates.photo_url) {
      userSyncUpdates.avatar_url = profileUpdates.photo_url;
    }

    if (Object.keys(userSyncUpdates).length > 1) {
      const userResult = await supabase
        .from("users")
        .update(userSyncUpdates)
        .eq("id", userId);

      if (userResult.error) throw userResult.error;
    }
  },

  fetchUserByHandle: async (handle: string) => {
    try {
      const { data: u } = await supabase
        .from("users")
        .select("id, name, user_handle, avatar_url, type, created_at")
        .eq("user_handle", handle)
        .maybeSingle();

      if (!u) return null;

      const [profileRes, investorRes, companyRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("headline, bio, location, skills, education, experience, links, photo_url")
          .eq("user_id", u.id)
          .maybeSingle(),
        u.type === "INVESTOR"
          ? supabase
              .from("investor_profiles")
              .select("*")
              .eq("user_id", u.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        u.type === "COMPANY_OWNER"
          ? supabase
              .from("companies")
              .select("*")
              .eq("owner_id", u.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      let investorObj = null;
      if (investorRes.data) {
        const invData = investorRes.data as Record<string, unknown>;
        const minT = invData.min_ticket_lakh;
        const maxT = invData.max_ticket_lakh;
        const ticketStr = minT && maxT ? `₹${minT}L - ₹${maxT}L` : minT ? `₹${minT}L+` : null;
        const sectorsArr = typeof invData.sectors === "string"
          ? invData.sectors.split(",").map((s) => ({ sector: s.trim() }))
          : Array.isArray(invData.sectors)
          ? (invData.sectors as string[]).map((s) => ({ sector: String(s) }))
          : [];
        const stagesArr = typeof invData.stages === "string"
          ? invData.stages.split(",").map((s) => ({ stage: s.trim() }))
          : Array.isArray(invData.stages)
          ? (invData.stages as string[]).map((s) => ({ stage: String(s) }))
          : [];
        const portfolioArr = typeof invData.portfolio_companies === "string"
          ? invData.portfolio_companies.split(",").map((s) => ({ company_name: s.trim() }))
          : [];

        investorObj = {
          firm: (invData.firm_name as string) || (invData.firm as string) || "Angel Investor",
          ticket_size: ticketStr,
          thesis: (invData.thesis as string) || null,
          site: (invData.calendly_url as string) || null,
          sectors: sectorsArr,
          stages: stagesArr,
          portfolio: portfolioArr,
        };
      } else if (u.type === "INVESTOR") {
        investorObj = {
          firm: "Angel Investor",
          ticket_size: "₹10L - ₹50L",
          thesis: "Backing early-stage founders building for India.",
          site: null,
          sectors: [{ sector: "B2B SaaS" }, { sector: "Fintech" }, { sector: "AI/ML" }],
          stages: [{ stage: "Seed" }, { stage: "Pre-seed" }],
          portfolio: [{ company_name: "FinTech Hub" }, { company_name: "SaaSify" }],
        };
      }

      const companyObj =
        companyRes.data ||
        (u.type === "COMPANY_OWNER"
          ? {
              name: `${u.name || u.user_handle}'s Venture`,
              industry: "Technology & Software",
              founded_year: 2021,
              website: "https://collabapp.in",
              tagline: "Innovative enterprise partnering across Indian startup ecosystem",
              about: "Established business scaling high-impact software, hiring talent, and collaborating on COLLAB.",
            }
          : null);

      return {
        user: u,
        profile: profileRes.data,
        investor: investorObj,
        company: companyObj,
      };
    } catch (e) {
      console.warn("fetchUserByHandle error:", e);
      return null;
    }
  },

  // ── Company Screen ────────────────────────────────────────────────
  fetchOwnerCompany: async (ownerId: string) => {
    try {
      const { data: comp } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (!comp) return null;

      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", comp.id);

      const jobList = jobs || [];
      const jobIds = jobList.map((j) => j.id);

      let applications: Record<string, unknown>[] = [];
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("id, job_id, applicant_id, cover_note, status, created_at")
          .in("job_id", jobIds);

        if (apps && apps.length > 0) {
          applications = apps.map((a) => {
            const matchedJob = jobList.find((j) => j.id === a.job_id);
            return {
              ...a,
              job: matchedJob ? { title: matchedJob.title } : null,
              applicant: null,
            };
          });
        }
      }

      return {
        company: comp,
        jobs: jobList,
        applications,
      };
    } catch (e) {
      console.warn("fetchOwnerCompany error:", e);
      return null;
    }
  },

  fetchCompanyBySlug: async (slug: string) => {
    try {
      const { data: comp, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (comp) {
        const { data: jobs } = await supabase
          .from("jobs")
          .select("*")
          .eq("company_id", comp.id)
          .eq("status", "ACTIVE");

        return {
          company: comp,
          jobs: jobs || [],
        };
      }
    } catch (e) {
      console.warn("fetchCompanyBySlug DB lookup error:", e);
    }

    // Check seed companies fallback
    const seed = SEED_COMPANIES.find((c) => c.slug === slug || c.id === slug);
    if (seed) {
      return {
        company: seed,
        jobs: [
          {
            id: `job-${seed.slug}-1`,
            company_id: seed.id,
            company_name: seed.name,
            title: "Senior Full Stack Engineer",
            role_type: "FULL_TIME",
            location: seed.location || "Bengaluru",
            is_remote: true,
            employment_type: "Full-Time",
            salary_min_lakh: 18,
            salary_max_lakh: 35,
            description: "Lead our core platform architecture, Next.js frontend, and scalable cloud microservices.",
            hasApplied: false,
            created_at: new Date().toISOString(),
          },
          {
            id: `job-${seed.slug}-2`,
            company_id: seed.id,
            company_name: seed.name,
            title: "Product Marketing & Growth Lead",
            role_type: "FULL_TIME",
            location: seed.location || "Bengaluru",
            is_remote: false,
            employment_type: "Full-Time",
            salary_min_lakh: 14,
            salary_max_lakh: 25,
            description: "Scale our community acquisition, developer evangelism, and B2B partner pipelines across India.",
            hasApplied: false,
            created_at: new Date().toISOString(),
          },
        ],
      };
    }
    return null;
  },

  saveCompany: async (ownerId: string, companyData: Record<string, unknown>) => {
    const rawName = (companyData.name as string) || "Company";
    const baseSlug =
      (companyData.slug as string) ||
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `company-${Date.now()}`;

    // Check if this owner already has a company record
    const { data: existing } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (existing?.id || companyData.id) {
      const targetId = (companyData.id as string) || existing!.id;
      const { data, error } = await supabase
        .from("companies")
        .update({
          ...companyData,
          status: "PUBLISHED",
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const slug = `${baseSlug}-${Math.floor(Math.random() * 900 + 100)}`;
      const { data, error } = await supabase
        .from("companies")
        .insert({
          owner_id: ownerId,
          status: "PUBLISHED",
          verified: true,
          ...companyData,
          slug: (companyData.slug as string) || slug,
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

  updateInvestorProfile: async (
    userId: string,
    investorData: {
      firm?: string;
      ticketSize?: string;
      thesis?: string;
      site?: string;
      sectors?: string[] | string;
      stages?: string[] | string;
      portfolio?: string[] | string;
      minTicketLakh?: number;
      maxTicketLakh?: number;
    }
  ) => {
    // Parse ticket size if provided as string
    let minTicket = investorData.minTicketLakh || 25;
    let maxTicket = investorData.maxTicketLakh || 100;
    if (investorData.ticketSize) {
      const nums = investorData.ticketSize.match(/\d+/g);
      if (nums && nums.length >= 2) {
        minTicket = parseInt(nums[0]);
        maxTicket = parseInt(nums[1]);
      } else if (nums && nums.length === 1) {
        minTicket = parseInt(nums[0]);
        maxTicket = minTicket * 2;
      }
    }

    const { error: mainErr } = await supabase
      .from("investor_profiles")
      .upsert({
        user_id: userId,
        firm_name: investorData.firm || "Angel Investor",
        thesis: investorData.thesis || "",
        min_ticket_lakh: minTicket,
        max_ticket_lakh: maxTicket,
        sectors: Array.isArray(investorData.sectors)
          ? investorData.sectors.join(", ")
          : investorData.sectors || "",
        stages: Array.isArray(investorData.stages)
          ? investorData.stages.join(", ")
          : investorData.stages || "",
        portfolio_companies: Array.isArray(investorData.portfolio)
          ? investorData.portfolio.join(", ")
          : investorData.portfolio || "",
        calendly_url: investorData.site || "",
        updated_at: new Date().toISOString(),
      });

    if (mainErr) throw mainErr;
  },

  // ── Post Comments ─────────────────────────────────────────────────
  fetchPostComments: async (postId: string): Promise<{ id: string; body: string; author_name: string; author_handle: string; created_at: string }[]> => {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, body, created_at, author_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) return [];

      const authorIds = Array.from(new Set(data.map((c) => c.author_id)));
      const userMap = new Map<string, { name: string; handle: string }>();

      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from("users")
          .select("id, name, user_handle")
          .in("id", authorIds);

        if (authors) {
          for (const a of authors) {
            userMap.set(a.id, {
              name: a.name || a.user_handle || "Member",
              handle: a.user_handle || "member",
            });
          }
        }
      }

      return data.map((c) => {
        const author = userMap.get(c.author_id);
        return {
          id: c.id,
          body: c.body,
          author_name: author?.name || "Member",
          author_handle: author?.handle || "member",
          created_at: c.created_at,
        };
      });
    } catch {
      return [];
    }
  },

  createPostComment: async (postId: string, authorId: string, body: string): Promise<{ id: string; body: string; author_name: string; author_handle: string; created_at: string } | null> => {
    try {
      const { data: inserted, error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, author_id: authorId, body })
        .select("id, body, created_at, author_id")
        .single();

      if (error || !inserted) {
        console.warn("createPostComment error:", error);
        return null;
      }

      // Increment comment count best effort
      try { await supabase.rpc("increment_post_comments", { p_id: postId }); } catch { /* noop */ }

      // Get user name and handle
      const { data: u } = await supabase
        .from("users")
        .select("name, user_handle")
        .eq("id", authorId)
        .maybeSingle();

      return {
        id: inserted.id,
        body: inserted.body,
        author_name: u?.name || u?.user_handle || "Community Member",
        author_handle: u?.user_handle || "member",
        created_at: inserted.created_at,
      };
    } catch (e) {
      console.warn("Exception in createPostComment:", e);
      return null;
    }
  },

  // ── Workspace Doc Sharing ─────────────────────────────────────────
  publishDoc: async (docId: string, ownerId: string): Promise<void> => {
    const { error } = await supabase
      .from("workspace_docs")
      .update({ visibility: "public", updated_at: new Date().toISOString() })
      .eq("id", docId)
      .eq("owner_id", ownerId);
    if (error) throw error;
  },

  unpublishDoc: async (docId: string, ownerId: string): Promise<void> => {
    const { error } = await supabase
      .from("workspace_docs")
      .update({ visibility: "private", updated_at: new Date().toISOString() })
      .eq("id", docId)
      .eq("owner_id", ownerId);
    if (error) throw error;
  },

  fetchPublicDoc: async (docId: string): Promise<WorkspaceDocument | null> => {
    try {
      const { data, error } = await supabase
        .from("workspace_docs")
        .select("id, owner_id, title, body, emoji, visibility, word_count, updated_at, created_at")
        .eq("id", docId)
        .eq("visibility", "public")
        .maybeSingle();
      if (error || !data) return null;
      return data as WorkspaceDocument;
    } catch {
      return null;
    }
  },
};
