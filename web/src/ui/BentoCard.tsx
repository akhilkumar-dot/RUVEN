"use client";

import { motion } from "framer-motion";
import { cn, getPastel } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { StatPill } from "./StatPill";
import { Users } from "lucide-react";

export type BentoVariant = "hero" | "half" | "wide" | "detail";

interface BentoCardProps {
  variant?: BentoVariant;
  /** Seed string for deterministic pastel colour */
  colorSeed?: string;
  /** Override colour directly */
  color?: string;
  name?: string;
  photoUrl?: string | null;
  statValue?: string | number;
  statLabel?: string;
  headline?: string;
  meta?: string;
  sponsored?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<BentoVariant, string> = {
  hero:   "col-span-2 min-h-[200px]",
  half:   "col-span-1 min-h-[160px]",
  wide:   "col-span-2 min-h-[140px]",
  detail: "col-span-2 min-h-[280px]",
};

/**
 * BentoCard — the core visual building block of FounderBridge.
 * Pure-black rounded pastel card matching the reference image.
 *
 * Variants:
 *  hero   — full-width, large avatar, big name, stat pill
 *  half   — half-width grid cell, avatar top, name + stat
 *  wide   — full-width, side-by-side content
 *  detail — full-width, big headline, meta, action area
 */
export function BentoCard({
  variant = "half",
  colorSeed,
  color,
  name,
  photoUrl,
  statValue,
  statLabel,
  headline,
  meta,
  sponsored,
  children,
  onClick,
  className,
}: BentoCardProps) {
  const bg = color ?? (colorSeed ? getPastel(colorSeed) : "#1C1C1E");

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "relative rounded-[28px] overflow-hidden p-4 cursor-default",
        "texture-overlay", // subtle line-art pattern
        onClick && "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A24BFF]",
        variantClasses[variant],
        className
      )}
      style={{ backgroundColor: bg }}
    >
      {/* Sponsored tag */}
      {sponsored && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold text-black/60 bg-white/30 px-2 py-0.5 rounded-full">
          Sponsored
        </span>
      )}

      {variant === "hero" && (
        <div className="flex flex-col gap-3 h-full justify-between">
          {name && (
            <Avatar
              name={name}
              photoUrl={photoUrl}
              size="xl"
            />
          )}
          <div>
            {name && (
              <h2 className="text-display text-white leading-tight">{name}</h2>
            )}
            {statValue !== undefined && (
              <StatPill
                icon={<Users size={13} />}
                value={statValue}
                label={statLabel}
                className="mt-1"
              />
            )}
          </div>
        </div>
      )}

      {variant === "half" && (
        <div className="flex flex-col gap-2 h-full justify-between">
          {name && (
            <Avatar
              name={name}
              photoUrl={photoUrl}
              size="lg"
            />
          )}
          <div>
            {name && (
              <p className="text-white font-semibold text-[15px] leading-tight">{name}</p>
            )}
            {statValue !== undefined && (
              <StatPill
                icon={<Users size={11} />}
                value={statValue}
                label={statLabel}
                className="mt-0.5"
              />
            )}
          </div>
        </div>
      )}

      {variant === "wide" && (
        <div className="flex items-center gap-3 h-full">
          {name && <Avatar name={name} photoUrl={photoUrl} size="md" />}
          <div className="flex-1 min-w-0">
            {name && <p className="text-white font-semibold truncate">{name}</p>}
            {headline && (
              <p className="text-white/70 text-sm truncate">{headline}</p>
            )}
          </div>
          {statValue !== undefined && (
            <StatPill icon={<Users size={11} />} value={statValue} />
          )}
        </div>
      )}

      {variant === "detail" && (
        <div className="flex flex-col gap-3 h-full justify-between">
          {/* Author row */}
          {name && (
            <div className="flex items-center gap-2">
              <Avatar name={name} photoUrl={photoUrl} size="sm" />
              <div>
                <p className="text-white text-sm font-semibold leading-none">{name}</p>
                {statValue !== undefined && (
                  <StatPill
                    icon={<Users size={10} />}
                    value={statValue}
                    className="mt-0.5"
                  />
                )}
              </div>
            </div>
          )}
          {/* Big headline */}
          {headline && (
            <h2 className="text-hero text-white leading-tight font-medium flex-1">
              {headline}
            </h2>
          )}
          {/* Meta */}
          {meta && (
            <p className="text-white/60 text-sm">{meta}</p>
          )}
        </div>
      )}

      {/* Escape hatch for custom content */}
      {!variant && children}
      {children && variant && <div className="mt-2">{children}</div>}
    </motion.div>
  );
}

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/** 2-column bento grid container */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}
