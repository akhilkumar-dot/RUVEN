"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ExternalLink,
  Plus,
  Video,
  Coffee,
  X,
  Send,
  CheckCircle2,
  Lock,
  UserCheck
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { fmtDate, fmtTime, googleCalendarUrl, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

interface Meetup {
  id: string;
  title: string;
  organiserHandle: string;
  location: string;
  isOnline: boolean;
  date: Date;
  maxAttendees?: number;
  attendeeCount: number;
  tags: string[];
  status?: "pending_review" | "accepted" | "rejected" | "none";
  link?: string;
}

const now = new Date();
const SEED_MEETUPS: Meetup[] = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    title: "Bengaluru AI Founders Mixer",
    organiserHandle: "priya_founder",
    location: "Koramangala, Bengaluru",
    isOnline: false,
    date: new Date(now.getTime() + 2 * 86400000 + 18 * 3600000),
    maxAttendees: 25,
    attendeeCount: 18,
    tags: ["Networking", "AI/ML", "Founders"],
    status: "none",
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    title: "Angel Syndicate Pitch: SaaS & Fintech",
    organiserHandle: "rohan_investor",
    location: "Virtual (Google Meet)",
    isOnline: true,
    date: new Date(now.getTime() + 5 * 86400000 + 17 * 3600000),
    maxAttendees: 15,
    attendeeCount: 9,
    tags: ["Pitch", "Angels", "SaaS"],
    status: "none",
    link: "https://meet.google.com/xyz-founderbridge",
  },
  {
    id: "3",
    title: "Mumbai VC Speed-Dating — Seed Stage",
    organiserHandle: "arjun_vc",
    location: "WeWork BKC, Mumbai",
    isOnline: false,
    date: new Date(now.getTime() + 10 * 86400000 + 14 * 3600000),
    maxAttendees: 20,
    attendeeCount: 18,
    tags: ["Funding", "Seed", "Mumbai"],
    status: "none",
  },
];

// ── Application to Attend Modal (PDF Spec Page 8) ─────────────
function ApplyModal({
  meetup,
  onClose,
  onApplied,
}: {
  meetup: Meetup;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [role, setRole] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim() || !note.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onApplied();
      onClose();
    }, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121214] border border-[#222226] rounded-2xl p-5 max-w-[420px] w-full text-white space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[16px]">Apply to Attend Meetup</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white"><X size={18} /></button>
        </div>

        <div>
          <p className="text-[14px] font-semibold text-[#FF8A3D]">{meetup.title}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Host: @{meetup.organiserHandle}</p>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto animate-bounce" />
            <p className="font-bold text-white text-[15px]">Application Submitted!</p>
            <p className="text-[#8E8E93] text-[12px]">
              The host will review your request. Meeting links & venue access are granted upon acceptance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Your Startup / Role</label>
              <input
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Co-founder @ FinPilot (Seed stage)"
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#FF8A3D]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Why do you want to attend?</label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What are you currently building or looking to connect about?"
                className="w-full bg-[#1A1A1E] text-white rounded-xl p-3 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#FF8A3D] resize-none"
              />
            </div>
            <GradientRingButton size="md" type="submit" className="w-full" disabled={!role.trim() || !note.trim()}>
              <Send size={14} /> Submit Application
            </GradientRingButton>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Host a Meetup Modal ───────────────────────────────────────
function HostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (m: Meetup) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState("Virtual (Google Meet)");
  const [maxAttendees, setMaxAttendees] = useState(25);
  const [dateStr, setDateStr] = useState("2026-11-08T18:00");
  const [submitting, setSubmitting] = useState(false);

  async function handleHostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const newMeetup: Meetup = {
      id: "meet-" + Date.now(),
      title: title.trim(),
      organiserHandle: user?.userHandle || "founder",
      location: isOnline ? "Virtual (Google Meet)" : location,
      isOnline,
      date: new Date(dateStr),
      maxAttendees,
      attendeeCount: 1,
      tags: ["Networking", isOnline ? "Online" : "In-Person"],
      status: "none",
    };

    if (user?.id) {
      try {
        const { data } = await supabase.from("meetups").insert({
          organiser_id: user.id,
          title: newMeetup.title,
          description: "FounderBridge community meetup",
          location: newMeetup.location,
          is_online: newMeetup.isOnline,
          event_at: newMeetup.date.toISOString(),
          max_attendees: newMeetup.maxAttendees,
          attendee_count: 1,
          tags: newMeetup.tags.join(", "),
          status: "UPCOMING",
          link: isOnline ? "https://meet.google.com/founderbridge" : null,
        }).select("id").single();
        if (data?.id) newMeetup.id = data.id;
      } catch (err) {
        console.error("Failed to insert meetup in Supabase:", err);
      }
    }

    onCreated(newMeetup);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121214] border border-[#222226] rounded-2xl p-5 max-w-[420px] w-full text-white space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[16px]">Host a Meetup</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleHostSubmit} className="space-y-3">
          <div>
            <label className="text-[12px] text-[#8E8E93] mb-1 block">Meetup Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bangalore AI Founders Coffee"
              className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#FF8A3D]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIsOnline(true); setLocation("Virtual (Google Meet)"); }}
              className={cn("flex-1 py-2 text-[12px] rounded-xl font-semibold border transition-colors",
                isOnline ? "border-[#A24BFF] bg-[#A24BFF]/10 text-white" : "border-[#222] text-[#8E8E93]")}
            >
              Online Call
            </button>
            <button
              type="button"
              onClick={() => { setIsOnline(false); setLocation("Indiranagar, Bengaluru"); }}
              className={cn("flex-1 py-2 text-[12px] rounded-xl font-semibold border transition-colors",
                !isOnline ? "border-[#FF8A3D] bg-[#FF8A3D]/10 text-white" : "border-[#222] text-[#8E8E93]")}
            >
              In-Person
            </button>
          </div>

          {!isOnline && (
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Venue & City</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Third Wave Coffee, Indiranagar"
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Max Capacity</label>
              <input
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Date & Time</label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-2 py-2 text-[12px] border border-[#2A2A2E] outline-none"
              />
            </div>
          </div>

          <GradientRingButton size="md" type="submit" className="w-full mt-2" disabled={!title.trim() || submitting}>
            {submitting ? "Publishing…" : "Publish Meetup"}
          </GradientRingButton>
        </form>
      </motion.div>
    </div>
  );
}

function MeetupCard({
  meetup,
  onApply,
}: {
  meetup: Meetup;
  onApply: (m: Meetup) => void;
}) {
  const appStatus = meetup.status ?? "none";
  const count = meetup.attendeeCount;
  const spotsLeft = meetup.maxAttendees ? meetup.maxAttendees - count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const calUrl = googleCalendarUrl({ title: meetup.title, start: meetup.date });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 h-full flex flex-col justify-between hover:border-[#2A2A2E] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl",
            meetup.isOnline ? "bg-[#A24BFF]/15 text-[#A24BFF]" : "bg-[#FF8A3D]/15 text-[#FF8A3D]"
          )}
        >
          {meetup.isOnline ? <Video size={20} /> : <Coffee size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-[16px] leading-snug">{meetup.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Avatar name={meetup.organiserHandle} size="sm" />
            <span className="text-[#6E6E73] text-[12px]">@{meetup.organiserHandle}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3">
        <div className="flex items-center gap-1.5 text-[#A1A1A6] text-[13px]">
          <Calendar size={13} className="text-[#A24BFF]" />
          <span>{fmtDate(meetup.date, { day: "numeric", month: "short" })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#A1A1A6] text-[13px]">
          <Clock size={13} className="text-[#A24BFF]" />
          <span>{fmtTime(meetup.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#A1A1A6] text-[13px] col-span-2">
          <MapPin size={13} className="text-[#FF8A3D]" />
          <span className="truncate">{meetup.location}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {meetup.tags.map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#6E6E73]"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Attendees + capacity */}
      <div className="flex items-center gap-2">
        <Users size={13} className="text-[#6E6E73]" />
        <span className="text-[#A1A1A6] text-[13px]">{count} attending</span>
        {spotsLeft !== null && (
          <span
            className={cn(
              "ml-auto text-[12px] font-semibold",
              spotsLeft <= 3 ? "text-[#FF3D81]" : "text-[#6E6E73]"
            )}
          >
            {isFull ? "Full" : `${spotsLeft} spots left`}
          </span>
        )}
      </div>

      {/* Actions matching PDF Spec: Application review modal + RSVP guard */}
      <div className="flex gap-2 pt-1">
        {appStatus === "none" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onApply(meetup)}
            disabled={isFull}
            className={cn(
              "flex-1 py-2.5 rounded-full text-[14px] font-semibold border transition-colors flex items-center justify-center gap-1.5",
              isFull
                ? "border-[#2A2A2D] text-[#6E6E73] opacity-40 cursor-not-allowed"
                : "border-[#FF8A3D] text-[#FF8A3D] bg-[#FF8A3D]/10 hover:bg-[#FF8A3D]/20"
            )}
          >
            {isFull ? "Full" : "RSVP · Apply to Attend"}
          </motion.button>
        )}

        {appStatus === "pending_review" && (
          <div className="flex-1 py-2 px-3 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] text-[#8E8E93] text-[12px] flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-[#FF8A3D]" />
            <span>Application Pending Host Review</span>
          </div>
        )}

        {appStatus === "accepted" && (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 py-2 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] flex items-center justify-center gap-1.5">
              <UserCheck size={14} />
              <span>Accepted! Access Granted</span>
            </div>
            {meetup.link && (
              <a
                href={meetup.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#A24BFF] text-white text-[12px] font-semibold hover:bg-[#8e3eee] flex items-center gap-1"
              >
                Join Call <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#2A2A2D] text-[#6E6E73] text-[13px] hover:text-white hover:border-[#444] transition-colors"
        >
          <ExternalLink size={13} /> Cal
        </a>
      </div>
    </motion.div>
  );
}

const VIEW_TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "my_rsvps", label: "My RSVPs" },
  { key: "organising", label: "I'm Hosting" },
];

function MeetupsPageContent() {
  const [view, setView] = useState("upcoming");
  const [meetups, setMeetups] = useState<Meetup[]>(SEED_MEETUPS);
  const [selectedForApply, setSelectedForApply] = useState<Meetup | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);

  // Load from Supabase
  useEffect(() => {
    async function loadMeetups() {
      try {
        const { data, error } = await supabase
          .from("meetups")
          .select("id, organiser_id, title, description, location, is_online, event_at, max_attendees, attendee_count, tags, status, link")
          .order("event_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const dbMeetups: Meetup[] = data.map((r) => ({
            id: r.id,
            title: r.title,
            organiserHandle: "host",
            location: r.location || (r.is_online ? "Virtual" : "Bengaluru"),
            isOnline: Boolean(r.is_online),
            date: new Date(r.event_at),
            maxAttendees: r.max_attendees || 25,
            attendeeCount: r.attendee_count || 1,
            tags: r.tags ? r.tags.split(",").map((t: string) => t.trim()) : ["Networking"],
            status: "none",
            link: r.link,
          }));

          setMeetups((prev) => {
            const ids = new Set(dbMeetups.map((m) => m.id));
            return [...dbMeetups, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch {
        // fallback
      }
    }
    loadMeetups();
  }, []);

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-[20px] flex items-center gap-2">
            <MapPin size={20} className="text-[#FF8A3D]" /> Meetups
          </h1>
          <button
            onClick={() => setShowHostModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF8A3D] text-black font-semibold text-[13px] hover:bg-[#ff7a24] transition-colors"
          >
            <Plus size={14} /> Host
          </button>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {VIEW_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shrink-0",
                view === t.key
                  ? "bg-[#FF8A3D] text-black font-semibold"
                  : "bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2D] hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-24">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-4">
          {view === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetups.map((m) => (
                <MeetupCard
                  key={m.id}
                  meetup={m}
                  onApply={(selected) => setSelectedForApply(selected)}
                />
              ))}
            </div>
          )}

          {view === "my_rsvps" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 col-span-full">
                <p className="text-[12px] text-[#8E8E93]">My Meetup RSVPs & Applications (1)</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0F0F12] border border-[#1E1E22] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold text-[14px]">Bengaluru AI Founders Mixer</h4>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Confirmed
                  </span>
                </div>
                <p className="text-[#8E8E93] text-[12px]">Thursday, 6:30 PM · Koramangala, Bengaluru</p>
              </div>
            </div>
          )}

          {view === "organising" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[#8E8E93]">Meetups You&apos;re Hosting (1)</p>
                <button
                  onClick={() => setShowHostModal(true)}
                  className="text-[11px] text-[#A24BFF] hover:underline"
                >
                  + Create Another
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-[#0F0F12] border border-[#1E1E22] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-[15px] truncate">Angel Syndicate Pitch: SaaS & Fintech</h4>
                    <p className="text-[#8E8E93] text-[12px]">Sunday, 5:00 PM · 9 / 15 Confirmed</p>
                  </div>
                  <span className="text-[11px] text-[#D4FF3A] bg-[#D4FF3A]/10 px-2.5 py-1 rounded-full border border-[#D4FF3A]/20 font-semibold shrink-0">
                    3 Applicants Pending
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1C1C1E] space-y-2">
                  <p className="text-[11px] text-[#A1A1A6] uppercase tracking-wider font-semibold">Pending Review:</p>
                  {[
                    { name: "Aditi Rao", role: "CTO @ VernacAI", id: "ap1" },
                    { name: "Rahul Deshmukh", role: "Founder @ NeoLedger", id: "ap2" },
                  ].map((cand) => (
                    <div key={cand.id} className="flex items-center justify-between p-2 rounded-xl bg-[#141416] border border-[#222]">
                      <div className="flex items-center gap-2">
                        <Avatar name={cand.name} size="sm" />
                        <div>
                          <p className="text-white text-[13px] font-medium">{cand.name}</p>
                          <p className="text-[#6E6E73] text-[11px]">{cand.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => alert(`Accepted ${cand.name}! They now have access to the link.`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-500/30"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => alert(`Declined ${cand.name}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#222] text-[#8E8E93] text-[11px] hover:text-white"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedForApply && (
        <ApplyModal
          meetup={selectedForApply}
          onClose={() => setSelectedForApply(null)}
          onApplied={() => {
            setMeetups((prev) =>
              prev.map((m) =>
                m.id === selectedForApply.id ? { ...m, status: "pending_review" } : m
              )
            );
          }}
        />
      )}

      {/* Host Modal */}
      {showHostModal && (
        <HostModal
          onClose={() => setShowHostModal(false)}
          onCreated={(newM) => {
            setMeetups((prev) => [newM, ...prev]);
            setView("organising");
          }}
        />
      )}

      <BottomDock
        activeTab="meetups"
        userName="Aarav Reddy"
      />
    </div>
  );
}

export default function MeetupsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF8A3D] border-t-transparent animate-spin" />
        </div>
      }
    >
      <MeetupsPageContent />
    </Suspense>
  );
}
