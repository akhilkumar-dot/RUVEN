"use client";

import { cn } from "@/lib/utils";

interface BridgeLogoProps {
  size?: number;
  strokeColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * Ruven App Logo
 */
export function BridgeLogo({
  size = 32,
  className,
}: BridgeLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ruven-logo.png"
      alt="Ruven"
      width={size}
      height={size}
      className={cn("rounded-xl object-contain shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
