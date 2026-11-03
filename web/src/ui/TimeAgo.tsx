"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/utils";

interface TimeAgoProps {
  date: Date | string | number;
  fallback?: string;
  className?: string;
}

export function TimeAgo({ date, fallback = "now", className }: TimeAgoProps) {
  const [formatted, setFormatted] = useState<string>(fallback);

  useEffect(() => {
    // Only read Date.now() inside useEffect after mount to prevent prerender blocking
    setFormatted(relativeTime(date));
    const interval = setInterval(() => {
      setFormatted(relativeTime(date));
    }, 60_000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{formatted}</span>;
}
