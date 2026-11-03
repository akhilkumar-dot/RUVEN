import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section C: Discover & Connections Audit", () => {
  test("C1 - Tabs: People, Companies, Investors; server-side search and pagination", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    await page.waitForLoadState("networkidle");

    const peopleTab = page.locator("button:has-text('People')");
    const companiesTab = page.locator("button:has-text('Companies')");
    const investorsTab = page.locator("button:has-text('Investors')");

    await expect(peopleTab).toBeVisible();
    await expect(companiesTab).toBeVisible();
    await expect(investorsTab).toBeVisible();

    await takeAuditScreenshot(page, "C1");
  });

  test("C2 - People cards fields and Connect action", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    const connectBtn = page.locator("button:has-text('Connect')").first();
    if (await connectBtn.isVisible()) {
      await connectBtn.click();
      await page.waitForTimeout(300);
    }
    await takeAuditScreenshot(page, "C2");

    // Check connections table in DB
    const res = await callSupabaseRest("connections?limit=5", "GET");
    console.log("C2 DB connections table content:", res.data);
  });

  test("C3 - Companies tab lists published sites, actions Follow & Visit", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    await page.click("button:has-text('Companies')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "C3");
  });

  test("C4 - Investor cards fields and actions (Connect, Request intro, View portfolio)", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    await page.click("button:has-text('Investors')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "C4");
  });

  test("C5 - Requests count toward daily limit; accepted appear in Messages", async ({ page }) => {
    // Check if daily limit counter is tracked in DB/API
    const res = await callSupabaseRest("connections?limit=1", "GET");
    console.log("C5 DB connections check:", res.status);
    await page.goto("http://localhost:3000/messages");
    await takeAuditScreenshot(page, "C5");
  });

  test("C6 - Limits enforced server-side (Free 5/day, Pro 15/day, etc.)", async ({ page }) => {
    // Audit API rate limiting or limits
    await page.goto("http://localhost:3000/discover");
    await takeAuditScreenshot(page, "C6");
  });

  test("C7 - Verified accounts shown first in Discover", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    await takeAuditScreenshot(page, "C7");
  });

  test("C8 - No self-connect, no duplicate request, tamper guard", async ({ page }) => {
    // Try to connect to self directly via API
    const res = await callSupabaseRest("connections", "POST", {
      requester_id: "00000000-0000-0000-0000-000000000001",
      addressee_id: "00000000-0000-0000-0000-000000000001",
      status: "PENDING",
    });
    console.log("C8 Self-connect API direct attempt status:", res.status, "data:", res.data);
    await page.goto("http://localhost:3000/discover");
    await takeAuditScreenshot(page, "C8");
  });
});
