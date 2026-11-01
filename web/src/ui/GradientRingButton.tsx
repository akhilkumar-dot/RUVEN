"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientRingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-base",
  lg: "h-14 px-9 text-lg",
};

/**
 * GradientRingButton — the signature CTA button with
 * a purple→pink→orange gradient outline and black fill.
 * Used for primary actions: Sign In, Join, Connect, etc.
 */
export function GradientRingButton({
  size = "md",
  className,
  children,
  disabled,
  ...props
}: GradientRingButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={disabled}
      className={cn(
        // Gradient border via background + padding trick
        "relative inline-flex items-center justify-center gap-2",
        "rounded-full font-semibold text-white",
        "bg-gradient-to-r from-[#A24BFF] via-[#FF3D81] to-[#FF8A3D]",
        "p-[2px]", // border thickness
        "transition-opacity duration-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
    >
      {/* Inner black fill */}
      <span
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-full bg-black",
          sizeClasses[size]
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  label: string;
  withGradientRing?: boolean;
  children: React.ReactNode;
}

/**
 * IconButton — circular icon button (white fill or gradient ring variant).
 */
export function IconButton({
  size = 42,
  label,
  withGradientRing = false,
  children,
  className,
  ...props
}: IconButtonProps) {
  const btn = (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        "relative flex items-center justify-center rounded-full shrink-0",
        "bg-white/10 text-white transition-colors hover:bg-white/20",
        "focus-visible:outline-2 focus-visible:outline-[#A24BFF]",
        className
      )}
      {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );

  if (withGradientRing) {
    return (
      <span
        className="rounded-full p-[2px] bg-gradient-to-r from-[#A24BFF] via-[#FF3D81] to-[#FF8A3D]"
        style={{ display: "inline-flex" }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={label}
          style={{ width: size, height: size }}
          className={cn(
            "flex items-center justify-center rounded-full bg-black text-white",
            "transition-colors hover:bg-[#111]",
            className
          )}
          {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
        >
          {children}
        </motion.button>
      </span>
    );
  }

  return btn;
}
