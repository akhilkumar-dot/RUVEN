"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SplashScreen } from "@/ui/SplashScreen";

function RootPageContent() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  function handleSplashFinish() {
    if (isPreview) return;
    setShowSplash(false);
    router.replace("/sign-in");
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
