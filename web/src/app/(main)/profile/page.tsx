"use client";

import { ProfileEditor } from "@/ui/profile/ProfileEditor";

// Mock data — wired to real API via useQuery in next sprint
const MOCK_PROFILE = {
  userId: "me",
  userHandle: "aarav1234",
  type: "STARTUP_FOUNDER",
  headline: "Building AI infrastructure for Indian SMEs",
  bio: "Passionate about making AI accessible to every Indian small business. Ex-Razorpay, IIT-Bombay CS '21.",
  location: "Bangalore, Karnataka",
  education: "B.Tech Computer Science\nIIT Bombay, 2017–2021",
  experience: "Senior Engineer @ Razorpay (2021–2023)\nFounding Engineer @ Sarvam AI (2023–2024)",
  interests: "LLMs, vernacular tech, B2B SaaS",
  lookingFor: "Co-founder (GTM / Sales), early customers, seed funding",
  links: "https://twitter.com/aarav\nhttps://linkedin.com/in/aarav",
  themeId: "noir",
  photoUrl: undefined,
  skills: ["TypeScript", "Java", "Spring Boot", "LLM Fine-tuning", "B2B SaaS", "Fundraising"],
};

export default function ProfilePage() {
  return (
    <ProfileEditor
      initialData={MOCK_PROFILE}
      isOwner={true}
      onSave={async (data) => {
        // Phase 2 wiring: PATCH /api/v1/me/profile
        console.log("Saving profile", data);
        await new Promise(r => setTimeout(r, 500));
      }}
    />
  );
}
