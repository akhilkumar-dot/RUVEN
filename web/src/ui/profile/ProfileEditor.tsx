"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, X, Check, Edit3, ExternalLink, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { BridgeLogo } from "@/ui/BridgeLogo";
import { cn, truncate } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ProfileData {
  userId: string;
  userHandle: string;
  type: string;
  headline?: string;
  bio?: string;
  location?: string;
  education?: string;
  experience?: string;
  interests?: string;
  lookingFor?: string;
  links?: string;
  themeId?: string;
  photoUrl?: string;
  skills: string[];
}

// ── Skill chip ────────────────────────────────────────────────
function SkillChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-[13px] text-white"
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-[#6E6E73] hover:text-white ml-0.5" aria-label={`Remove ${label}`}>
          <X size={12} />
        </button>
      )}
    </motion.span>
  );
}

// ── Section card ──────────────────────────────────────────────
function Section({ title, icon, children, className }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E]", className)}>
      <div className="flex items-center gap-2 text-[#A1A1A6] text-[13px] font-semibold mb-3">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

// ── Editable field ────────────────────────────────────────────
function EditableText({ value, placeholder, multiline = false, onChange }: {
  value?: string;
  placeholder: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <Tag
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={multiline ? 4 : undefined}
      className={cn(
        "w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-[15px]",
        "border border-[#2A2A2D] placeholder:text-[#6E6E73]",
        "outline-none focus:border-[#A24BFF] transition-colors resize-none"
      )}
    />
  );
}

// ── Main component ────────────────────────────────────────────
interface ProfileEditorProps {
  initialData: ProfileData;
  isOwner?: boolean;
  onSave?: (data: Partial<ProfileData>) => Promise<void>;
}

export function ProfileEditor({ initialData, isOwner = false, onSave }: ProfileEditorProps) {
  const [data, setData] = useState<ProfileData>(initialData);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const skillRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof ProfileData, value: string) =>
    setData(d => ({ ...d, [key]: value }));

  function addSkill() {
    const s = newSkill.trim();
    if (s && !data.skills.includes(s)) {
      setData(d => ({ ...d, skills: [...d.skills, s] }));
    }
    setNewSkill("");
    skillRef.current?.focus();
  }

  function removeSkill(skill: string) {
    setData(d => ({ ...d, skills: d.skills.filter(s => s !== skill) }));
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-black pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]"
           style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <BridgeLogo size={22} strokeColor="#000" accentColor="#000" />
        </div>
        <h1 className="text-white font-semibold text-[16px]">My Profile</h1>
        {isOwner && (
          editing ? (
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
                className="w-10 h-10 rounded-full bg-[#1C1C1E] text-[#A1A1A6] flex items-center justify-center">
                <X size={16} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} disabled={saving}
                className="w-10 h-10 rounded-full bg-[#A24BFF]/20 text-[#A24BFF] flex items-center justify-center border border-[#A24BFF]/40">
                {saving ? <span className="text-[10px]">…</span> : <Check size={16} />}
              </motion.button>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)}
              className="w-10 h-10 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center">
              <Edit3 size={16} />
            </motion.button>
          )
        )}
      </div>

      <div className="px-4 max-w-[430px] mx-auto space-y-3 mt-4">
        {/* ── Hero ── */}
        <div className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E]">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar name={data.userHandle} photoUrl={data.photoUrl} size="xl" />
              {editing && (
                <button
                  aria-label="Change photo"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60"
                >
                  <Camera size={20} className="text-white" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[20px] leading-tight">
                @{data.userHandle}
              </p>
              <p className="text-[#6E6E73] text-[12px] mt-0.5 capitalize">
                {data.type.replace(/_/g, " ").toLowerCase()}
              </p>
              {editing ? (
                <EditableText
                  value={data.headline}
                  placeholder="Your headline (e.g. Building AI for India)"
                  onChange={v => set("headline", v)}
                />
              ) : (
                <p className="text-[#A1A1A6] text-[14px] mt-2 leading-snug">
                  {data.headline || "No headline yet"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        <Section title="About" icon={<Briefcase size={13} />}>
          {editing ? (
            <EditableText multiline value={data.bio} placeholder="Tell founders what you're about…" onChange={v => set("bio", v)} />
          ) : (
            <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
              {data.bio || <span className="text-[#6E6E73]">No bio yet</span>}
            </p>
          )}
        </Section>

        {/* ── Location ── */}
        <Section title="Location" icon={<MapPin size={13} />}>
          {editing ? (
            <EditableText value={data.location} placeholder="City, State, India" onChange={v => set("location", v)} />
          ) : (
            <p className="text-white text-[15px]">{data.location || <span className="text-[#6E6E73]">Not set</span>}</p>
          )}
        </Section>

        {/* ── Skills ── */}
        <Section title="Skills" icon={<span className="text-[11px]">✦</span>}>
          <AnimatePresence mode="popLayout">
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <SkillChip key={s} label={s} onRemove={editing ? () => removeSkill(s) : undefined} />
              ))}
            </div>
          </AnimatePresence>
          {editing && (
            <div className="flex gap-2 mt-3">
              <input
                ref={skillRef}
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add skill…"
                className="flex-1 bg-[#1C1C1E] text-white rounded-full px-4 py-2.5 text-[14px] border border-[#2A2A2D] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF]"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={addSkill}
                className="w-10 h-10 rounded-full bg-[#A24BFF]/20 text-[#A24BFF] flex items-center justify-center">
                <Plus size={16} />
              </motion.button>
            </div>
          )}
        </Section>

        {/* ── Experience ── */}
        <Section title="Experience" icon={<Briefcase size={13} />}>
          {editing ? (
            <EditableText multiline value={data.experience} placeholder="Your work history…" onChange={v => set("experience", v)} />
          ) : (
            <p className="text-white text-[15px] whitespace-pre-wrap leading-relaxed">
              {data.experience || <span className="text-[#6E6E73]">Not set</span>}
            </p>
          )}
        </Section>

        {/* ── Education ── */}
        <Section title="Education" icon={<GraduationCap size={13} />}>
          {editing ? (
            <EditableText multiline value={data.education} placeholder="Your educational background…" onChange={v => set("education", v)} />
          ) : (
            <p className="text-white text-[15px] whitespace-pre-wrap leading-relaxed">
              {data.education || <span className="text-[#6E6E73]">Not set</span>}
            </p>
          )}
        </Section>

        {/* ── Looking For ── */}
        <Section title="Looking For" icon={<span className="text-[11px]">🔍</span>}>
          {editing ? (
            <EditableText multiline value={data.lookingFor} placeholder="Co-founder, funding, hires, customers…" onChange={v => set("lookingFor", v)} />
          ) : (
            <p className="text-white text-[15px] whitespace-pre-wrap leading-relaxed">
              {data.lookingFor || <span className="text-[#6E6E73]">Not set</span>}
            </p>
          )}
        </Section>

        {/* ── Links ── */}
        <Section title="Links" icon={<ExternalLink size={13} />}>
          {editing ? (
            <EditableText multiline value={data.links} placeholder="https://twitter.com/you&#10;https://linkedin.com/in/you" onChange={v => set("links", v)} />
          ) : (
            <div className="space-y-1">
              {(data.links ?? "").split("\n").filter(Boolean).map(l => (
                <a key={l} href={l} target="_blank" rel="noopener noreferrer"
                  className="block text-[#A24BFF] text-[14px] hover:underline truncate">
                  {truncate(l, 50)}
                </a>
              ))}
              {!data.links && <span className="text-[#6E6E73] text-[14px]">No links yet</span>}
            </div>
          )}
        </Section>

        {/* ── CTA ── */}
        {!isOwner && (
          <GradientRingButton size="lg" className="w-full">
            Connect
          </GradientRingButton>
        )}
      </div>
    </div>
  );
}
