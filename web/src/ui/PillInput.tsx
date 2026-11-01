"use client";

import { cn } from "@/lib/utils";

interface PillInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  className?: string;
}

/**
 * PillInput — centered label above a dark pill input field.
 * Matches the reference Sign In screen exactly.
 */
export function PillInput({
  label,
  error,
  className,
  id,
  ...props
}: PillInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col items-center gap-1.5 w-full", className)}>
      <label
        htmlFor={inputId}
        className="text-[#A1A1A6] text-[13px] font-medium tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className={cn(
          "w-full bg-[#1C1C1E] text-white text-center",
          "rounded-full px-5 py-3.5 text-[15px]",
          "border border-[#2A2A2D]",
          "placeholder:text-[#6E6E73]",
          "outline-none transition-all duration-200",
          "focus:border-[#A24BFF] focus:shadow-[0_0_0_2px_rgba(162,75,255,0.2)]",
          // Override browser autofill white background
          "[&:-webkit-autofill]:shadow-[0_0_0_1000px_#1C1C1E_inset]",
          "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]",
          error && "border-red-500/50"
        )}
      />
      {error && (
        <p className="text-red-400 text-[12px] text-center">{error}</p>
      )}
    </div>
  );
}
