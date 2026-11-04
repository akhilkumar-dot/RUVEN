"use client";

import { useEffect, useState } from "react";
import { ProfileEditor } from "@/ui/profile/ProfileEditor";
import { useAuthStore } from "@/lib/store/authStore";
import { dataService } from "@/lib/api/dataService";
import { BridgeLogo } from "@/ui/BridgeLogo";

interface ProfileState {
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

function ProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-black p-4 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1E]">
        <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] animate-pulse" />
        <div className="h-5 bg-[#1C1C1E] rounded w-28 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-[#1C1C1E] animate-pulse" />
      </div>

      <div className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E] animate-pulse flex items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-[#1C1C1E] shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-[#1C1C1E] rounded w-1/3" />
          <div className="h-4 bg-[#18181A] rounded w-1/4" />
          <div className="h-4 bg-[#18181A] rounded w-3/4" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#121212] rounded-2xl p-5 border border-[#1C1C1E] animate-pulse space-y-3"
          >
            <div className="h-4 bg-[#1C1C1E] rounded w-1/4" />
            <div className="h-12 bg-[#18181A] rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const [profileData, setProfileData] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await dataService.fetchProfileData(user.id);
        if (isMounted) {
          const rawSkills = res.profile?.skills;
          let skillsArray: string[] = [];
          if (Array.isArray(rawSkills)) {
            skillsArray = rawSkills;
          } else if (typeof rawSkills === "string") {
            skillsArray = rawSkills
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }

          setProfileData({
            userId: user.id,
            userHandle: res.user?.user_handle || user.userHandle || "user",
            type: res.user?.type || user.type || "STARTUP_FOUNDER",
            headline: res.profile?.headline || "",
            bio: res.profile?.bio || "",
            location: res.profile?.location || "",
            education: res.profile?.education || "",
            experience: res.profile?.experience || "",
            interests: (res.profile?.interests as string) || "",
            lookingFor: (res.profile?.looking_for as string) || "",
            links: res.profile?.links || "",
            photoUrl: res.profile?.photo_url || res.user?.avatar_url || undefined,
            skills: skillsArray,
          });
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profileData && !user) {
    return (
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-black border border-[#2A2A2E] flex items-center justify-center mb-4">
          <BridgeLogo size={32} />
        </div>
        <p className="text-white font-semibold text-lg mb-1">Please sign in</p>
        <p className="text-sm text-[#8E8E93]">Sign in to view and edit your profile.</p>
      </div>
    );
  }

  const initial = profileData || {
    userId: user?.id || "me",
    userHandle: user?.userHandle || "user",
    type: user?.type || "STARTUP_FOUNDER",
    headline: "",
    bio: "",
    location: "",
    education: "",
    experience: "",
    interests: "",
    lookingFor: "",
    links: "",
    skills: [],
  };

  return (
    <ProfileEditor
      initialData={initial}
      isOwner={true}
      onSave={async (data) => {
        if (!user?.id) return;
        await dataService.updateProfileData(
          user.id,
          {
            headline: data.headline,
            bio: data.bio,
            location: data.location,
            skills: data.skills?.join(", "),
            education: data.education,
            experience: data.experience,
            links: data.links,
            photo_url: data.photoUrl,
          }
        );
        if (data.photoUrl) setAvatarUrl(data.photoUrl);
      }}
    />
  );
}
