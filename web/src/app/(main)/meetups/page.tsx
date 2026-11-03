"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Clock, ExternalLink, Plus, Video, Coffee } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { fmtDate, fmtTime, googleCalendarUrl, cn } from "@/lib/utils";

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
  rsvp?: boolean;
}

const now = new Date();
const MOCK_MEETUPS: Meetup[] = [
  {
    id: "1",
    title: "Bangalore Founders Breakfast — Nov Edition",
    organiserHandle: "priya_founder",
    location: "The Lalit Ashok, Bangalore",
    isOnline: false,
    date: new Date(now.getTime() + 3 * 86400000 + 8 * 3600000),
    maxAttendees: 40,
    attendeeCount: 28,
    tags: ["Networking", "Founders", "Bangalore"],
  },
  {
    id: "2",
    title: "Online: AI for India — Product & Engineering AMA",
    organiserHandle: "deepstack_ai",
    location: "Zoom (link on RSVP)",
    isOnline: true,
    date: new Date(now.getTime() + 5 * 86400000 + 17 * 3600000),
    attendeeCount: 143,
    tags: ["AI/ML", "Online", "AMA"],
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
  },
  {
    id: "4",
    title: "Chennai Tech Founders Sundowner",
    organiserHandle: "rohan_das",
    location: "The Park Hotel, Chennai",
    isOnline: false,
    date: new Date(now.getTime() + 14 * 86400000 + 18 * 3600000),
    attendeeCount: 35,
    tags: ["Networking", "Chennai", "Tech"],
  },
];

function MeetupCard({ meetup }: { meetup: Meetup }) {
  const [rsvpd, setRsvpd] = useState(meetup.rsvp ?? false);
  const [count, setCount] = useState(meetup.attendeeCount);
  const spotsLeft = meetup.maxAttendees ? meetup.maxAttendees - count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const calUrl = googleCalendarUrl({ title: meetup.title, start: meetup.date });

  function toggleRsvp() {
    if (isFull && !rsvpd) return;
    setRsvpd(v => !v);
    setCount(c => rsvpd ? c - 1 : c + 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl",
          meetup.isOnline ? "bg-[#A24BFF]/15 text-[#A24BFF]" : "bg-[#FF8A3D]/15 text-[#FF8A3D]"
        )}>
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
        {meetup.tags.map(t => (
          <span key={t} className="px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[11px] text-[#6E6E73]">{t}</span>
        ))}
      </div>

      {/* Attendees + capacity */}
      <div className="flex items-center gap-2">
        <Users size={13} className="text-[#6E6E73]" />
        <span className="text-[#A1A1A6] text-[13px]">{count} attending</span>
        {spotsLeft !== null && (
          <span className={cn("ml-auto text-[12px] font-semibold",
            spotsLeft <= 3 ? "text-[#FF3D81]" : "text-[#6E6E73]")}>
            {isFull ? "Full" : `${spotsLeft} spots left`}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleRsvp}
          disabled={isFull && !rsvpd}
          className={cn(
            "flex-1 py-2.5 rounded-full text-[14px] font-semibold border transition-colors",
            rsvpd
              ? "border-[#2A2A2D] text-[#6E6E73] bg-transparent"
              : isFull
                ? "border-[#2A2A2D] text-[#6E6E73] opacity-40 cursor-not-allowed"
                : "border-[#A24BFF] text-[#A24BFF] bg-[#A24BFF]/10 hover:bg-[#A24BFF]/20"
          )}
        >
          {rsvpd ? "✓ RSVP'd" : isFull ? "Full" : "RSVP"}
        </motion.button>
        {rsvpd && (
          <a href={calUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#2A2A2D] text-[#6E6E73] text-[13px] hover:text-white hover:border-[#444] transition-colors">
            <ExternalLink size={13} /> Cal
          </a>
        )}
      </div>
    </motion.div>
  );
}

const VIEW_TABS = [
  { key: "upcoming",   label: "Upcoming" },
  { key: "my_rsvps",  label: "My RSVPs" },
  { key: "organising", label: "I'm Hosting" },
];

export default function MeetupsPage() {
  const [view, setView] = useState("upcoming");
  const [navTab, setNavTab] = useState("meet");

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar unreadCount={3} />

      <div className="px-4 pt-3 max-w-[430px] mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-[20px] flex items-center gap-2">
            <MapPin size={20} className="text-[#FF8A3D]" />Meetups
          </h1>
          <GradientRingButton size="sm">
            <Plus size={14} /> Host
          </GradientRingButton>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {VIEW_TABS.map(t => (
            <button key={t.key} onClick={() => setView(t.key)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors shrink-0",
                view === t.key ? "bg-[#FF8A3D] text-black" : "bg-[#1C1C1E] text-[#6E6E73] border border-[#2A2A2D] hover:text-white"
              )}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="px-4 max-w-[430px] mx-auto space-y-3">
          {view === "upcoming" && MOCK_MEETUPS.map(m => <MeetupCard key={m.id} meetup={m} />)}
          {view !== "upcoming" && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Calendar size={32} className="text-[#2A2A2D]" />
              <p className="text-[#6E6E73] text-[15px]">
                {view === "my_rsvps" ? "No RSVPs yet" : "You're not hosting any meetups yet"}
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomDock
        activeTab={navTab}
        tabs={[{ key: "meet", label: "Meetups" }]}
        onTabChange={setNavTab}
        userName="Aarav Reddy"
      />
    </div>
  );
}
