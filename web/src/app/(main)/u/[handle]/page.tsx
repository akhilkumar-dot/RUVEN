"use client";

import { use, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  UserPlus,
  Check,
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { GradientRingButton } from "@/ui/GradientRingButton";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService } from "@/lib/api/dataService";
import { cn } from "@/lib/utils";

interface PublicUserPageProps {
  params: Promise<{ handle: string }>;
}

interface LoadedUserProfile {
  user: {
    id: string;
    name: string;
    user_handle: string;
    avatar_url?: string | null;
    type: string;
    created_at?: string;
  };
  profile: {
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    skills?: string | null;
    education?: string | null;
    experience?: string | null;
    links?: string | null;
    photo_url?: string | null;
  } | null;
}

function UserProfileContent({ params }: PublicUserPageProps) {
  const resolvedParams = use(params);
  const handle = decodeURIComponent(resolvedParams.handle);
  const router = useRouter();

  const currentUser = useAuthStore((s) => s.user);
  const [data, setData] = useState<LoadedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connState, setConnState] = useState<{
    status: "NONE" | "REQUESTED" | "RESPOND" | "CONNECTED";
    connectionId?: string;
  }>({ status: "NONE" });
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      try {
        const res = await dataService.fetchUserByHandle(handle);
        if (isMounted) {
          const profileData = res as LoadedUserProfile | null;
          setData(profileData);
          if (currentUser?.id && profileData?.user?.id && currentUser.id !== profileData.user.id) {
            const cs = await dataService.getConnectionState(currentUser.id, profileData.user.id);
            if (isMounted) setConnState(cs);
          }
        }
      } catch (err) {
        console.error("Failed to load user by handle:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [handle, currentUser?.id]);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator.share({ title: `@${handle} on Ruven`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    if (!currentUser?.id || !data?.user.id || connecting) return;
    setConnecting(true);
    try {
      if (connState.status === "REQUESTED") {
        if (connState.connectionId) {
          await dataService.withdrawConnectionRequest(connState.connectionId);
        } else {
          await dataService.toggleConnection(currentUser.id, data.user.id);
        }
        setConnState({ status: "NONE" });
      } else if (connState.status === "RESPOND") {
        if (connState.connectionId) {
          await dataService.acceptConnectionRequest(connState.connectionId);
        } else {
          await dataService.toggleConnection(currentUser.id, data.user.id);
        }
        setConnState({ status: "CONNECTED" });
      } else if (connState.status === "NONE") {
        await dataService.sendConnectionRequest(currentUser.id, data.user.id);
        setConnState({ status: "REQUESTED" });
      }
    } catch (err) {
      console.error("Failed to toggle connection:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleStartMessage = async () => {
    if (!currentUser?.id || !data?.user.id || connState.status !== "CONNECTED") return;
    try {
      const roomId = await dataService.getOrCreateDirectRoom(currentUser.id, data.user.id);
      router.push(`/messages?room=${roomId}`);
    } catch (err) {
      console.error("Failed to start direct message:", err);
    }
  };

  const isSelf = currentUser?.id && data?.user.id === currentUser.id;

  const rawSkills = data?.profile?.skills;
  const skillsArray =
    typeof rawSkills === "string"
      ? rawSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      <TopBar unreadCount={0} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/discover"
            className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-[#1C1C1E] hover:bg-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] hover:text-white transition-colors relative"
              aria-label="Share profile"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
            </button>
            {copied && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Copied!
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="bg-[#121212] rounded-3xl p-6 border border-[#1C1C1E] flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-[#1C1C1E] shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-[#1C1C1E] rounded w-1/3" />
                <div className="h-4 bg-[#18181A] rounded w-1/4" />
                <div className="h-4 bg-[#18181A] rounded w-3/4" />
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0C0C0C] border border-[#1C1C1E] rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#18181A] border border-[#2A2A2D] flex items-center justify-center text-[#A1A1A6] mb-4">
              <ShieldCheck size={26} className="text-[#A24BFF]" />
            </div>
            <h2 className="text-white font-bold text-xl mb-1">User Not Found</h2>
            <p className="text-sm text-[#8E8E93] max-w-sm mb-6">
              No member with the handle @{handle} was found on Ruven.
            </p>
            <Link
              href="/discover"
              className="px-5 py-2.5 rounded-full bg-[#A24BFF] hover:bg-[#8D34F0] text-white text-xs font-semibold transition-colors"
            >
              Explore Discover
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hero Card */}
            <div
              className="rounded-3xl p-6 relative overflow-hidden border border-[#222]"
              style={{
                background: "linear-gradient(135deg, #0e0e12 0%, #1a162b 100%)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <Avatar
                  name={data.user.name || data.user.user_handle}
                  photoUrl={data.profile?.photo_url || data.user.avatar_url}
                  size="xl"
                />
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs capitalize">
                  {data.user.type.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl font-bold text-white">{data.user.name}</h1>
                <p className="text-[#A24BFF] font-semibold text-sm">@{data.user.user_handle}</p>
                {data.profile?.headline && (
                  <p className="text-[#D4FF3A] text-sm font-medium mt-1">
                    {data.profile.headline}
                  </p>
                )}
                {data.profile?.bio && (
                  <p className="text-[#B3B3BA] text-sm leading-relaxed mt-3">
                    {data.profile.bio}
                  </p>
                )}
              </div>

              {data.profile?.location && (
                <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] mt-4">
                  <MapPin size={13} /> {data.profile.location}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-6">
                {isSelf ? (
                  <Link href="/profile" className="w-full">
                    <GradientRingButton size="md" className="w-full flex items-center justify-center">
                      Edit My Profile
                    </GradientRingButton>
                  </Link>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConnect}
                      disabled={connecting}
                      className={cn(
                        "flex-1 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                        connState.status === "CONNECTED"
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : connState.status === "REQUESTED"
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                          : connState.status === "RESPOND"
                          ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                          : "bg-[#A24BFF] hover:bg-[#8D34F0] text-white"
                      )}
                    >
                      {connecting ? (
                        "..."
                      ) : connState.status === "CONNECTED" ? (
                        <>
                          <Check size={14} /> Connected
                        </>
                      ) : connState.status === "REQUESTED" ? (
                        <>
                          <Clock size={14} /> Requested
                        </>
                      ) : connState.status === "RESPOND" ? (
                        <>
                          <CheckCircle2 size={14} /> Respond
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Connect
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartMessage}
                      disabled={connState.status !== "CONNECTED"}
                      title={connState.status !== "CONNECTED" ? "Connect with this member first to message" : "Message"}
                      className={cn(
                        "flex-1 py-2.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors",
                        connState.status === "CONNECTED"
                          ? "bg-[#1C1C1E] hover:bg-[#2A2A2D] text-white border-[#2A2A2D] cursor-pointer"
                          : "bg-[#141416] text-[#555] border-[#1C1C1E] cursor-not-allowed opacity-50"
                      )}
                    >
                      <MessageSquare size={14} /> Message
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Skills */}
            {skillsArray.length > 0 && (
              <div className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E]">
                <h2 className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-3">
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2D] text-xs text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {data.profile?.experience && (
              <div className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E]">
                <div className="flex items-center gap-2 text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Briefcase size={14} /> Experience
                </div>
                <p className="text-sm text-white/90 whitespace-pre-line leading-relaxed">
                  {data.profile.experience}
                </p>
              </div>
            )}

            {/* Education */}
            {data.profile?.education && (
              <div className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E]">
                <div className="flex items-center gap-2 text-[#8E8E93] text-xs font-semibold uppercase tracking-wider mb-3">
                  <GraduationCap size={14} /> Education
                </div>
                <p className="text-sm text-white/90 whitespace-pre-line leading-relaxed">
                  {data.profile.education}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomDock activeTab="profile" userName={currentUser?.userHandle || "user"} />
    </div>
  );
}

export default function PublicUserPage({ params }: PublicUserPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <UserProfileContent params={params} />
    </Suspense>
  );
}
