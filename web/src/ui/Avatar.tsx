"use client";

import Image from "next/image";
import { cn, getInitials, getPastel } from "@/lib/utils";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const tickSizeMap = {
  sm: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 text-[6px]",
  md: "w-4 h-4 -bottom-0.5 -right-0.5 text-[7px]",
  lg: "w-5 h-5 -bottom-0.5 -right-0.5 text-[8px]",
  xl: "w-6 h-6 -bottom-1 -right-1 text-[10px]",
};

/**
 * Avatar component — shows a circular photo or coloured initial fallback.
 * Shows a verified checkmark badge when `verified` is true.
 */
export function Avatar({
  name,
  photoUrl,
  size = "md",
  verified = false,
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const pastel = getPastel(name);

  return (
    <span className={cn("relative inline-flex shrink-0", sizeMap[size], className)}>
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="rounded-full object-cover"
          sizes="80px"
        />
      ) : (
        <span
          className="flex items-center justify-center w-full h-full rounded-full font-bold text-white select-none"
          style={{ backgroundColor: pastel }}
          aria-label={name}
        >
          {initials}
        </span>
      )}

      {verified && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-blue-500 text-white font-bold border-2 border-black",
            tickSizeMap[size]
          )}
          aria-label="Verified"
          role="img"
        >
          ✓
        </span>
      )}
    </span>
  );
}
