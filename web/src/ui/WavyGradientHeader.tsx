"use client";

/**
 * WavyGradientHeader — the orange→pink→purple wavy SVG line
 * that sweeps behind the "Sign In" title in the reference image.
 */
export function WavyGradientHeader({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 60"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FF8A3D" />
          <stop offset="50%"  stopColor="#FF3D81" />
          <stop offset="100%" stopColor="#A24BFF" />
        </linearGradient>
      </defs>
      {/* Main wavy path — styled to match the reference image */}
      <path
        d="M0 30 C40 10, 80 50, 120 30 S200 10, 240 30 S300 50, 320 30"
        stroke="url(#wave-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Subtle second wave for depth */}
      <path
        d="M0 38 C50 18, 90 58, 130 38 S210 18, 250 38 S310 58, 320 38"
        stroke="url(#wave-grad)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
