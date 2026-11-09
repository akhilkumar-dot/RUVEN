"use client";

import { cn } from "@/lib/utils";

interface BridgeLogoProps {
  size?: number;
  strokeColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * COLLAB App Logo — chain-links icon
 */
export function BridgeLogo({
  size = 32,
  className,
}: BridgeLogoProps) {
  return (
    <img
      src="/collab-logo.svg"
      alt="COLLAB"
      width={size}
      height={size}
      className={cn("rounded-xl object-contain shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
