import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section D: My Company Audit", () => {
  test("D1 - Tabs: Preview, Dashboard, Projects, Edit page, Jobs, Applications, Team, Photos, Mail", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.waitForLoadState("networkidle");

    const tabs = ["Preview", "Dashboard", "Projects", "Edit Page", "Jobs", "Applications", "Team", "Photos", "Mail"];
    for (const t of tabs) {
      const tabEl = page.locator(`button:has-text('${t}')`);
      console.log(`D1 Tab '${t}' visible:`, await tabEl.isVisible().catch(() => false));
    }
    await takeAuditScreenshot(page, "D1");
  });

  test("D2 - Mandatory fields: Name, about, email, phone", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Edit Page')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D2");
  });

  test("D3 - Publish blocked until logo, name, about (20+ chars), valid email and phone are present", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    const pubBtn = page.locator("button:has-text('Publish')");
    console.log("D3 Publish button visible in UI:", await pubBtn.isVisible().catch(() => false));
    await takeAuditScreenshot(page, "D3");

    // Test API validation for missing fields
    const res = await callSupabaseRest("companies", "POST", {
      name: "Short",
      about: "Too short",
      email: "invalid-email",
      phone: "123",
      published: true,
    });
    console.log("D3 API response for invalid publish insert:", res.status, res.data);
  });

  test("D4 - Publish/unpublish controls visibility in Discover; stable URL", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await takeAuditScreenshot(page, "D4");
  });

  test("D5 - Dashboard numbers are real (views, jobs, applications, team)", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Dashboard')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D5");
  });

  test("D6 - Projects add/edit/delete and show on the page", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Projects')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D6");
  });

  test("D7 - Jobs posting and Apply guard", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Jobs')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D7");
  });

  test("D8 - Applications status and resume access", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Applications')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D8");
  });

  test("D9 - Team add/edit/remove", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Team')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D9");
  });

  test("D10 - Photos upload and lightbox", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Photos')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D10");
  });

  test("D11 - Mail sending & Sent list", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Mail')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D11");
  });

  test("D12 - Only the owner can edit", async ({ page }) => {
    // Attempt to update another company via API directly
    const res = await callSupabaseRest("companies?id=eq.00000000-0000-0000-0000-000000000001", "PATCH", {
      name: "Hacked Corp Name",
    });
    console.log("D12 Tamper update company status:", res.status);
    await takeAuditScreenshot(page, "D12");
  });

  test("D13 - Free = default look only. Pro = 9 company layouts, 9 profile layouts, 10 colour schemes", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await page.click("button:has-text('Edit Page')");
    await page.waitForTimeout(300);
    await takeAuditScreenshot(page, "D13");
  });
});
