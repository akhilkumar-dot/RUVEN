"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { SplashScreen } from "@/ui/SplashScreen";

function RootPageContent() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  async function handleSplashFinish() {
    if (isPreview) return;
    setShowSplash(false);

    // Check for an active Supabase session before choosing where to send the user.
    // getSession() reads from the persisted cookie/localStorage — no network call needed.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      router.replace("/onboarding");
    } else {
      router.replace("/sign-in");
    }
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} persistent={isPreview} />;
  }

  return null;
}

export default function RootPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-black" />}>
      <RootPageContent />
    </Suspense>
  );
}
