interface BridgeLogoProps {
  size?: number;
  strokeColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * BridgeLogo — the FounderBridge bridge SVG mark (arch + four pillars).
 * Used in TopBar (on white circle), Splash screen, and Sign In.
 */
export function BridgeLogo({
  size = 32,
  strokeColor = "#fff",
  accentColor = "#60a5fa",
  className,
}: BridgeLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke={strokeColor}
      strokeWidth="3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {/* Arch — accent colour */}
      <path d="M6 44Q32 8 58 44" stroke={accentColor} />
      {/* Deck */}
      <path d="M4 48h56" />
      {/* Pillars */}
      <path d="M16 34v14M26 24v24M38 24v24M48 34v14" />
    </svg>
  );
}
