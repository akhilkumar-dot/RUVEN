import { Page } from "@playwright/test";
import path from "path";
import fs from "fs";

export const SCREENSHOT_DIR = path.resolve(__dirname, "../screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export async function takeAuditScreenshot(page: Page, id: string) {
  const file = path.join(SCREENSHOT_DIR, `${id}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lrvxxgjcdsmjntauuqpj.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydnh4Z2pjZHNtam50YXV1cXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDA1NzAsImV4cCI6MjEwOTI3NjU3MH0.-9D4gSFy3CdSPrZ15S9Y9U6P79B9NsLDLwSa3Umk_hk";

export async function callSupabaseRest(table: string, method: string = "GET", body?: any, token?: string) {
  const headers: Record<string, string> = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}
