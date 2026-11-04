import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic pastel colour for an entity (name/id based). */
const PASTELS = [
  "#C48E69", // tan-peach
  "#D68FA6", // dusty pink
  "#5E9C8A", // sage teal
  "#D8BF4A", // mustard
  "#D9694A", // coral
  "#9A6BB8", // lavender
] as const;

export type PastelColour = (typeof PASTELS)[number];

export function getPastel(seed: string): PastelColour {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PASTELS[hash % PASTELS.length];
}

/** Relative time: "now", "5m", "2h", "3d" (safe for SSR & Client) */
export function relativeTime(date: Date | string | number): string {
  if (typeof window === "undefined") {
    // Avoid reading Date.now() during server prerender
    return "";
  }
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

/** Format date in en-IN locale */
export function fmtDate(
  date: Date | string,
  opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }
) {
  return new Date(date).toLocaleDateString("en-IN", opts);
}

/** Format time in en-IN locale (h:mm a) */
export function fmtTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Format ₹ amounts */
export function fmtINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** Ensure a URL starts with https:// */
export function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Get initials from a full name (up to 2 chars) */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Generate Google Calendar link from meetup data */
export function googleCalendarUrl(opts: {
  title: string;
  start: Date;
  end?: Date | null;
  details?: string | null;
  location?: string | null;
}) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const end = opts.end ?? new Date(opts.start.getTime() + 3_600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Truncate text to max chars */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

/**
 * Read an image File, downscale it to fit `maxSize` and return a compressed
 * data URL. Used for profile photo uploads so no storage bucket is required.
 */
export function fileToDataUrl(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not load the image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        // Flatten transparency onto white so JPEG output looks correct.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
