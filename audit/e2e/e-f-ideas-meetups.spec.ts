import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section E & F: Ideas & Meetups Audit", () => {
  test("E1 - Share idea & apply to collaborate", async ({ page }) => {
    await page.goto("http://localhost:3000/ideas");
    await page.waitForLoadState("networkidle");

    const shareBtn = page.locator("button:has-text('Share Idea')");
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
    }
    await takeAuditScreenshot(page, "E1");

    // Check ideas table in DB
    const res = await callSupabaseRest("ideas?select=*&limit=5", "GET");
    console.log("E1 Supabase ideas query:", res.status, res.data);
  });

  test("E2 - Owner reviews, accepts, chat opens on accept", async ({ page }) => {
    await page.goto("http://localhost:3000/ideas");
    await takeAuditScreenshot(page, "E2");
  });

  test("F1 - Schedule meetup (call or in-person), filters", async ({ page }) => {
    await page.goto("http://localhost:3000/meetups");
    await page.waitForLoadState("networkidle");

    const hostBtn = page.locator("button:has-text('Host')").first();
    console.log("F1 Host button visible:", await hostBtn.isVisible().catch(() => false));
    await takeAuditScreenshot(page, "F1");
  });

  test("F2 - Meetup application form vs simple RSVP", async ({ page }) => {
    await page.goto("http://localhost:3000/meetups");
    const rsvpBtn = page.locator("button:has-text('RSVP')").first();
    const isRSVP = await rsvpBtn.isVisible().catch(() => false);
    console.log("F2 Uses simple RSVP button:", isRSVP);
    await takeAuditScreenshot(page, "F2");
  });

  test("F3 - Join call button appears only after acceptance / link not exposed", async ({ page }) => {
    await page.goto("http://localhost:3000/meetups");
    await takeAuditScreenshot(page, "F3");

    // Check if meetup links are exposed in DB/API
    const res = await callSupabaseRest("meetups?select=id,title,link&limit=5", "GET");
    console.log("F3 Supabase meetups query:", res.data);
  });

  test("F4 - Host sees applicants, past meetups hidden", async ({ page }) => {
    await page.goto("http://localhost:3000/meetups");
    await page.click("button:has-text(\"I'm Hosting\")");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "F4");
  });
});
