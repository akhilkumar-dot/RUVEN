"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Plus,
  Video,
  Coffee,
  X,
  CheckCircle2
} from "lucide-react";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { fmtDate, fmtTime, googleCalendarUrl, cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService, type MeetupEvent } from "@/lib/api/dataService";

// ── Application to Attend Modal ───────────────────────────────
function ApplyModal({
  meetup,
  onClose,
  onRsvp,
}: {
  meetup: MeetupEvent;
  onClose: () => void;
  onRsvp: (meetupId: string) => void;
}) {
  const [role, setRole] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim() || !note.trim()) return;
    setSubmitted(true);
    onRsvp(meetup.id);
    setTimeout(() => {
      onClose();
    }, 1400);
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
          <h3 className="font-bold text-[16px]">RSVP to Meetup</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-[13px] text-[#A24BFF] font-semibold">{meetup.title}</p>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">
            Hosted by @{meetup.organiser.user_handle} · {meetup.location}
          </p>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-[15px]">RSVP Confirmed!</p>
            <p className="text-[#8E8E93] text-[12px]">
              You are on the attendee list. The meetup details and link are unlocked.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Your Current Startup / Role</label>
              <input
                autoFocus
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Co-founder @ HealthTech SaaS"
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">What are you hoping to connect about?</label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Brief intro for the host and fellow attendees…"
                className="w-full bg-[#1A1A1E] text-white rounded-xl p-3 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF] resize-none"
              />
            </div>
            <GradientRingButton size="md" type="submit" className="w-full" disabled={!role.trim() || !note.trim()}>
              Confirm RSVP
            </GradientRingButton>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Host Meetup Modal ─────────────────────────────────────────
function HostModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (newMeetup: MeetupEvent) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("18:30");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleHostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !dateStr || !user?.id || submitting) return;
    setSubmitting(true);

    try {
      const combinedDateTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      const created = await dataService.createMeetup(user.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        isOnline,
        eventAt: combinedDateTime,
        link: isOnline ? link.trim() : undefined,
      });

      if (created) {
        onCreated(created);
      }
      onClose();
    } catch (err) {
      console.error("Failed to host meetup:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121214] border border-[#222226] rounded-2xl p-5 max-w-[440px] w-full text-white space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[16px] text-white">Host a City Meetup or Mixer</h3>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleHostSubmit} className="space-y-3">
          <div>
            <label className="text-[12px] text-[#8E8E93] mb-1 block">Meetup Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bengaluru AI Founders Breakfast"
              className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#8E8E93] mb-1 block">Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsOnline(false)}
                className={cn(
                  "py-2 rounded-xl text-[12px] font-semibold border flex items-center justify-center gap-1.5 transition-colors",
                  !isOnline
                    ? "bg-[#A24BFF]/20 border-[#A24BFF] text-white"
                    : "bg-[#1A1A1E] border-[#2A2A2E] text-[#8E8E93]"
                )}
              >
                <Coffee size={14} /> In-person
              </button>
              <button
                type="button"
                onClick={() => setIsOnline(true)}
                className={cn(
                  "py-2 rounded-xl text-[12px] font-semibold border flex items-center justify-center gap-1.5 transition-colors",
                  isOnline
                    ? "bg-[#A24BFF]/20 border-[#A24BFF] text-white"
                    : "bg-[#1A1A1E] border-[#2A2A2E] text-[#8E8E93]"
                )}
              >
                <Video size={14} /> Virtual / Meet
              </button>
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#8E8E93] mb-1 block">
              {isOnline ? "Virtual Platform / Meeting Note" : "Venue / City Area"}
            </label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isOnline ? "Google Meet" : "Koramangala, Bengaluru"}
              className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
            />
          </div>

          {isOnline && (
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Meeting URL (visible to RSVP&apos;d attendees)</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/xyz"
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Date</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[12px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#8E8E93] mb-1 block">Time</label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full bg-[#1A1A1E] text-white rounded-xl px-3 py-2 text-[12px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#8E8E93] mb-1 block">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will founders discuss or collaborate on? Agenda details…"
              className="w-full bg-[#1A1A1E] text-white rounded-xl p-3 text-[13px] border border-[#2A2A2E] outline-none focus:border-[#A24BFF] resize-none"
            />
          </div>

          <GradientRingButton size="md" type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish Meetup to Ecosystem"}
          </GradientRingButton>
        </form>
      </motion.div>
    </div>
  );
}

// ── Meetup Card Component ─────────────────────────────────────
function MeetupCard({
  meetup,
  currentUserId,
  onApply,
  onToggleRsvp,
}: {
  meetup: MeetupEvent;
  currentUserId?: string;
  onApply: (meetup: MeetupEvent) => void;
  onToggleRsvp: (meetupId: string) => void;
}) {
  const isRsvped = Boolean(meetup.hasRsvped);
  const eventDate = new Date(meetup.event_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2A2A2E] transition-colors h-full space-y-3"
    >
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#8E8E93] mb-2">
          <span className="flex items-center gap-1.5 text-white font-medium">
            {meetup.is_online ? <Video size={13} className="text-[#38bdf8]" /> : <Coffee size={13} className="text-[#f59e0b]" />}
            {meetup.is_online ? "Virtual" : "In-Person"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {meetup.attendee_count} attending
          </span>
        </div>

        <h3 className="text-white font-semibold text-[16px] leading-snug">{meetup.title}</h3>
        <p className="text-[#8E8E93] text-[13px] mt-1 line-clamp-2">{meetup.description}</p>

        <div className="space-y-1 mt-3 text-[12px] text-[#A1A1A6]">
          <p className="flex items-center gap-1.5 truncate">
            <Calendar size={13} className="text-[#A24BFF] shrink-0" />
            <span>{fmtDate(eventDate)} · {fmtTime(eventDate)}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-[#10b981] shrink-0" />
            <span className="truncate">{meetup.location}</span>
          </p>
        </div>

        {/* Unlocked Meeting link for RSVP attendees */}
        {isRsvped && meetup.link && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] flex items-center justify-between">
            <span className="truncate">Meeting link unlocked</span>
            <a
              href={meetup.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold underline text-[11px] shrink-0"
            >
              Join Meet →
            </a>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#1C1C1E] flex items-center justify-between gap-2">
        <a
          href={googleCalendarUrl({
            title: meetup.title,
            details: meetup.description,
            location: meetup.location,
            start: eventDate,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8E8E93] hover:text-white text-[12px] flex items-center gap-1 transition-colors"
        >
          <ExternalLink size={12} /> Calendar
        </a>

        {isRsvped ? (
          <button
            onClick={() => onToggleRsvp(meetup.id)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            ✓ Confirmed RSVP
          </button>
        ) : (
          <button
            onClick={() => onApply(meetup)}
            disabled={!currentUserId}
            className="px-4 py-1.5 rounded-xl bg-[#A24BFF] text-white text-[12px] font-semibold hover:bg-[#8e3eee] transition-colors"
          >
            RSVP Now
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page Content ─────────────────────────────────────────
function MeetupsPageContent() {
  const user = useAuthStore((s) => s.user);

  const [view, setView] = useState<"upcoming" | "my_rsvps" | "organising">("upcoming");
  const [meetups, setMeetups] = useState<MeetupEvent[]>([]);
  const [myRsvps, setMyRsvps] = useState<MeetupEvent[]>([]);
  const [myOrganising, setMyOrganising] = useState<MeetupEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedForApply, setSelectedForApply] = useState<MeetupEvent | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadAllMeetups() {
      setLoading(true);
      try {
        if (view === "upcoming") {
          const list = await dataService.fetchMeetups(user?.id);
          if (!isCancelled) setMeetups(list);
        } else if (view === "my_rsvps" && user?.id) {
          const list = await dataService.fetchUserRsvps(user.id);
          if (!isCancelled) setMyRsvps(list);
        } else if (view === "organising" && user?.id) {
          const list = await dataService.fetchUserOrganisedMeetups(user.id);
          if (!isCancelled) setMyOrganising(list);
        }
      } catch (err) {
        console.error("Meetup load error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadAllMeetups();
    return () => {
      isCancelled = true;
    };
  }, [view, user?.id]);

  async function handleToggleRsvp(meetupId: string) {
    if (!user?.id) return;
    const target = meetups.find((m) => m.id === meetupId) || myRsvps.find((m) => m.id === meetupId);
    if (!target) return;

    const willBeRsvped = !target.hasRsvped;
    const newCount = willBeRsvped ? target.attendee_count + 1 : Math.max(0, target.attendee_count - 1);

    // Optimistic update
    setMeetups((prev) =>
      prev.map((m) => (m.id === meetupId ? { ...m, hasRsvped: willBeRsvped, attendee_count: newCount } : m))
    );
    setMyRsvps((prev) =>
      willBeRsvped
        ? [...prev, { ...target, hasRsvped: true, attendee_count: newCount }]
        : prev.filter((m) => m.id !== meetupId)
    );

    try {
      await dataService.toggleRsvp(meetupId, user.id, !willBeRsvped);
    } catch (err) {
      console.error("RSVP error:", err);
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar />

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-4 pt-4 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#A24BFF] flex items-center gap-1.5">
                <Coffee size={13} /> Gatherings
              </span>
              <h1 className="text-white font-bold text-[22px] tracking-tight mt-0.5">
                Meetups
              </h1>
            </div>
            <GradientRingButton size="sm" onClick={() => setShowHostModal(true)}>
              <Plus size={14} /> Host
            </GradientRingButton>
          </div>

          {/* Sub-Tabs: Upcoming, My RSVPs, Organising */}
          <div className="flex gap-2 mb-4 border-b border-[#1C1C1E] pb-3 overflow-x-auto scrollbar-hide">
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "my_rsvps", label: "My RSVPs" },
              { key: "organising", label: "Hosting" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setView(t.key as typeof view)}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap",
                  view === t.key
                    ? "bg-[#A24BFF] text-white"
                    : "bg-[#141416] text-[#8E8E93] hover:text-white border border-[#222]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Skeletons while loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="h-4 w-28 bg-[#1C1C1E] rounded" />
                  <div className="h-5 w-3/4 bg-[#1C1C1E] rounded" />
                  <div className="h-12 w-full bg-[#1C1C1E] rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Events View */}
          {!loading && view === "upcoming" && (
            meetups.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#A24BFF]">
                  <Coffee size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No meetups yet</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  Host an informal breakfast or virtual pitch session.
                </p>
                <button
                  onClick={() => setShowHostModal(true)}
                  className="px-4 py-2 bg-[#A24BFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
                >
                  Host Meetup
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {meetups.map((m) => (
                  <MeetupCard
                    key={m.id}
                    meetup={m}
                    currentUserId={user?.id}
                    onApply={(selected) => setSelectedForApply(selected)}
                    onToggleRsvp={handleToggleRsvp}
                  />
                ))}
              </div>
            )
          )}

          {/* My RSVPs View */}
          {!loading && view === "my_rsvps" && (
            myRsvps.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#38bdf8]">
                  <Calendar size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">No RSVPs yet</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  You have not registered for any upcoming mixers.
                </p>
                <button
                  onClick={() => setView("upcoming")}
                  className="px-4 py-2 bg-[#A24BFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
                >
                  Explore Events
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myRsvps.map((m) => (
                  <MeetupCard
                    key={m.id}
                    meetup={m}
                    currentUserId={user?.id}
                    onApply={(selected) => setSelectedForApply(selected)}
                    onToggleRsvp={handleToggleRsvp}
                  />
                ))}
              </div>
            )
          )}

          {/* Hosting View */}
          {!loading && view === "organising" && (
            myOrganising.length === 0 ? (
              <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-amber-400">
                  <Users size={20} />
                </div>
                <h3 className="text-white font-bold text-[16px]">Not hosting</h3>
                <p className="text-[#8E8E93] text-[13px]">
                  Host a session for your city.
                </p>
                <button
                  onClick={() => setShowHostModal(true)}
                  className="px-4 py-2 bg-[#A24BFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#8e3eee] transition-colors"
                >
                  Create Meetup
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myOrganising.map((m) => (
                  <MeetupCard
                    key={m.id}
                    meetup={m}
                    currentUserId={user?.id}
                    onApply={(selected) => setSelectedForApply(selected)}
                    onToggleRsvp={handleToggleRsvp}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {selectedForApply && (
        <ApplyModal
          meetup={selectedForApply}
          onClose={() => setSelectedForApply(null)}
          onRsvp={handleToggleRsvp}
        />
      )}

      {/* Host Modal */}
      {showHostModal && (
        <HostModal
          onClose={() => setShowHostModal(false)}
          onCreated={(newM) => {
            setMeetups((prev) => [newM, ...prev]);
            setMyOrganising((prev) => [newM, ...prev]);
            setView("organising");
          }}
        />
      )}

      <BottomDock
        activeTab="meetups"
        userName={user?.name || user?.userHandle || ""}
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
