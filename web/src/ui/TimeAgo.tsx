"use client";

import { useSyncExternalStore } from "react";
import { relativeTime } from "@/lib/utils";

interface TimeAgoProps {
  date: Date | string | number;
  fallback?: string;
  className?: string;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

export function TimeAgo({ date, fallback = "now", className }: TimeAgoProps) {
  const formatted = useSyncExternalStore(
    subscribe,
    () => relativeTime(date),
    () => fallback
  );

  return <span className={className}>{formatted || fallback}</span>;
}
