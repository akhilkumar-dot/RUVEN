"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/ui/SplashScreen";

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  // After splash, check auth → redirect to home or sign-in
  function handleSplashFinish() {
    setShowSplash(false);
    // Phase 1: check for valid access token in memory / refresh cookie
    // For now, always go to sign-in
    router.replace("/sign-in");
  }

  // Skip splash on second visit (access token present)
  useEffect(() => {
    // Phase 1 will check auth state here
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return null;
}
