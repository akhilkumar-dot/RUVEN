"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  UserPlus,
  ShieldCheck,
  Sparkles,
  MapPin,
  Check
} from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { TopBar } from "@/ui/TopBar";
import { BottomDock } from "@/ui/BottomDock";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { dataService, type DiscoverPerson } from "@/lib/api/dataService";

const INDUSTRIES = ["All", "AI/ML", "Fintech", "Healthtech", "Logistics", "Agritech", "B2B SaaS"];

export default function FoundersHubPage() {
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [founders, setFounders] = useState<DiscoverPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"founders" | "updates">("founders");
  const [founderPosts, setFounderPosts] = useState<{id: string; authorName: string; authorHandle: string; body: string; likeCount: number; createdAt: string}[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadFounders() {
      setLoading(true);
      try {
        const res = await dataService.fetchFounders(user?.id, search);
        if (!isCancelled) setFounders(res);
      } catch (err) {
        console.error("Failed to load founders:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadFounders();
    return () => {
      isCancelled = true;
    };
  }, [user?.id, search]);

  useEffect(() => {
    if (activeSection !== "updates") return;
    let isCancelled = false;
    async function loadFounderFeed() {
      setFeedLoading(true);
      try {
        const { dataService } = await import("@/lib/api/dataService");
        const posts = await dataService.fetchFeedPosts(user?.id);
        if (!isCancelled) {
          // Only show posts from STARTUP_FOUNDERs
          const founderOnly = posts.filter(p => p.author.type === "STARTUP_FOUNDER");
          setFounderPosts(founderOnly.map(p => ({
            id: p.id,
            authorName: p.author.name || p.author.user_handle || "Founder",
            authorHandle: p.author.user_handle,
            body: p.body,
            likeCount: p.like_count,
            createdAt: p.created_at,
          })));
        }
      } catch (err) {
        console.error("Failed to load founder feed:", err);
      } finally {
        if (!isCancelled) setFeedLoading(false);
      }
    }
    loadFounderFeed();
    return () => { isCancelled = true; };
  }, [activeSection, user?.id]);

  const filteredFounders = founders.filter((f) => {
    // Founders Hub only allows Startup Founders
    if (f.type !== "STARTUP_FOUNDER") return false;
    if (selectedIndustry === "All") return true;
    const text = `${f.headline || ""} ${f.skills || ""}`.toLowerCase();
    return text.includes(selectedIndustry.toLowerCase());
  });

  async function handleToggleConnect(founderId: string) {
    if (!user?.id) return;
    const target = founders.find((f) => f.id === founderId);
    const nextStatus = target?.connectionStatus === "PENDING" ? "NONE" : "PENDING";

    // Optimistic update
    setFounders((prev) =>
      prev.map((f) => (f.id === founderId ? { ...f, connectionStatus: nextStatus } : f))
    );

    try {
      await dataService.toggleConnection(user.id, founderId);
    } catch (err) {
      console.error("Connect toggle error:", err);
      // Revert on error
      setFounders((prev) =>
        prev.map((f) =>
          f.id === founderId ? { ...f, connectionStatus: target?.connectionStatus } : f
        )
      );
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <TopBar />

      <main className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        {/* Sticky Page Header */}
        <div 
          className="sticky top-0 z-20 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-[#1C1C1E]/50"
          style={{ paddingTop: "12px" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#A24BFF] flex items-center gap-1.5">
                <Sparkles size={13} /> Founders Directory
              </span>
              <h1 className="text-white font-bold text-[20px] tracking-tight mt-0.5">
                Founders Hub
              </h1>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A1A1E] text-[#8E8E93] border border-[#222]">
              Verified
            </span>
          </div>
        </div>

        <div className="px-4 pt-2 w-full">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveSection("founders")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                activeSection === "founders"
                  ? "bg-[#A24BFF] text-white"
                  : "bg-[#141416] text-[#8E8E93] border border-[#222226] hover:text-white"
              )}
            >
              Founders
            </button>
            <button
              onClick={() => setActiveSection("updates")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                activeSection === "updates"
                  ? "bg-[#A24BFF] text-white"
                  : "bg-[#141416] text-[#8E8E93] border border-[#222226] hover:text-white"
              )}
            >
              Founder Convos
            </button>
          </div>

          {activeSection === "founders" && (<>
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search founders, company, city…"
              className="w-full bg-[#121214] text-white rounded-2xl pl-10 pr-4 py-2.5 text-[14px] border border-[#222226] placeholder:text-[#6E6E73] outline-none focus:border-[#A24BFF] transition-colors"
            />
          </div>

          {/* Industry Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-4">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors shrink-0",
                  selectedIndustry === ind
                    ? "bg-[#A24BFF] text-white"
                    : "bg-[#141416] text-[#8E8E93] border border-[#222226] hover:text-white"
                )}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Skeletons while loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-[#0D0D10] border border-[#1E1E22] rounded-2xl p-4.5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C1C1E]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-[#1C1C1E] rounded" />
                      <div className="w-20 h-2.5 bg-[#1C1C1E] rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-3/4 bg-[#1C1C1E] rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredFounders.length === 0 && (
            <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3 mx-auto my-8">
              <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center mx-auto text-[#A24BFF]">
                <Sparkles size={20} />
              </div>
              <h3 className="text-white font-bold text-[16px]">No founders found</h3>
              <p className="text-[#8E8E93] text-[13px]">
                {search ? `No founders match "${search}".` : "No other founders registered yet."}
              </p>
            </div>
          )}

          {/* Founders Card List */}
          {!loading && (
            <div className="flex flex-col gap-4">
              {filteredFounders.map((founder) => {
                const isConnected = founder.connectionStatus === "ACCEPTED";
                const isPending = founder.connectionStatus === "PENDING";

                return (
                  <motion.div
                    key={founder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0D0D10] border border-[#1E1E22] rounded-2xl p-4.5 space-y-3 hover:border-[#2C2C32] transition-colors flex flex-col justify-between min-w-0"
                  >
                    {/* Top: Avatar, Name, Handle, Headline */}
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={founder.name} size="md" className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Link href={`/u/${founder.user_handle}`} className="text-white font-semibold text-[15px] truncate hover:underline flex-1">
                              {founder.name}
                            </Link>
                            <ShieldCheck size={14} className="text-[#A24BFF] shrink-0" />
                          </div>
                          <p className="text-[#8E8E93] text-[12px] truncate mt-0.5">
                            @{founder.user_handle} · <span className="text-[#D4FF3A] font-medium">{founder.type.replace(/_/g, " ")}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Headline / Skills / Location */}
                    <div className="space-y-1.5">
                      <p className="text-[#B3B3BA] text-[13px] leading-relaxed line-clamp-2">
                        {founder.headline || "Verified founder on the COLLAB ecosystem."}
                      </p>
                      {founder.location && (
                        <p className="text-[#8E8E93] text-[11px] flex items-center gap-1">
                          <MapPin size={10} /> {founder.location}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#1C1C20]">
                      <button
                        onClick={() => handleToggleConnect(founder.id)}
                        disabled={isConnected}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all border flex items-center justify-center gap-1.5",
                          isConnected
                            ? "bg-transparent border-[#26262C] text-[#8E8E93] cursor-default"
                            : isPending
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-[#A24BFF]/15 border-[#A24BFF]/40 text-[#A24BFF] hover:bg-[#A24BFF]/25"
                        )}
                      >
                        {isConnected ? <Check size={14} /> : <UserPlus size={14} />}
                        {isConnected ? "Connected" : isPending ? "Pending" : "Connect"}
                      </button>
                      <Link
                        href={`/messages?user=${founder.id}`}
                        className="px-4 py-2 rounded-xl bg-[#16161A] border border-[#26262C] text-[#A1A1A6] hover:text-white hover:border-[#3A3A42] text-[13px] font-medium transition-colors flex items-center gap-1.5"
                        onClick={async (e) => {
                          if (!user?.id) return;
                          e.preventDefault();
                          try {
                            const { dataService } = await import("@/lib/api/dataService");
                            const roomId = await dataService.getOrCreateDirectRoom(user.id, founder.id);
                            window.location.href = `/messages?room=${roomId}`;
                          } catch {
                            window.location.href = `/messages`;
                          }
                        }}
                      >
                        <MessageSquare size={14} />
                        Chat
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          </>)}

          {/* Founder Convos & Updates */}
          {activeSection === "updates" && (
            <div className="space-y-3">
              {feedLoading && [1,2,3].map(n => (
                <div key={n} className="bg-[#0D0D10] border border-[#1E1E22] rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C1C1E]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-[#1C1C1E] rounded" />
                      <div className="w-20 h-2.5 bg-[#1C1C1E] rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-full bg-[#1C1C1E] rounded" />
                </div>
              ))}
              {!feedLoading && founderPosts.length === 0 && (
                <div className="bg-[#0C0C0C] border border-[#1C1C1E] rounded-2xl p-8 text-center space-y-3">
                  <p className="text-[#8E8E93] text-[14px]">No founder updates yet.</p>
                </div>
              )}
              {!feedLoading && founderPosts.map(post => (
                <div key={post.id} className="bg-[#0D0D10] border border-[#1E1E22] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={post.authorName} size="sm" className="shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-[14px]">{post.authorName}</p>
                      <p className="text-[#8E8E93] text-[11px]">@{post.authorHandle}</p>
                    </div>
                  </div>
                  <p className="text-[#D1D1D6] text-[13px] leading-relaxed whitespace-pre-wrap">{post.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomDock
        activeTab="hub"
        userName={user?.userHandle ? `@${user.userHandle}` : "Founder"}
      />
    </div>
  );
}
