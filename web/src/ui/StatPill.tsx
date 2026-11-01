"use client";

import { cn } from "@/lib/utils";

interface StatPillProps {
  icon?: React.ReactNode;
  value: string | number;
  label?: string;
  className?: string;
}

/**
 * StatPill — small icon + count display used on bento cards.
 * e.g. 👥 10.3M  or  🔗 245 connections
 */
export function StatPill({ icon, value, label, className }: StatPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-white/70 text-[13px] font-medium",
        className
      )}
    >
      {icon && <span className="text-white/50">{icon}</span>}
      <span className="text-white font-semibold">{value}</span>
      {label && <span className="text-white/50">{label}</span>}
    </span>
  );
}
