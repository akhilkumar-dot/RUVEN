import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section I, J, K: Hub, Plans, & Security Audit", () => {
  test("I1 - Founder card fields in Founders Hub", async ({ page }) => {
    await page.goto("http://localhost:3000/hub");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "I1");
  });

  test("I2 - Founders Hub Join/leave, industry filter, startup/company owner only", async ({ page }) => {
    await page.goto("http://localhost:3000/hub");
    await takeAuditScreenshot(page, "I2");
  });

  test("J1 - Plans page matches PDF table (Free ₹0 / Pro ₹199 per month)", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "J1");

    const freeText = page.locator("h3:has-text('Free')").first();
    const proText = page.locator("h3:has-text('Pro')").first();
    const priceText = page.locator("text=₹199").first();

    await expect(freeText).toBeVisible();
    await expect(proText).toBeVisible();
    await expect(priceText).toBeVisible();
  });

  test("J2 - Real payment gateway in test mode vs mock checkout", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    const upgradeBtn = page.locator("button:has-text('Upgrade to Pro')");
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
      await page.waitForTimeout(300);
      const payBtn = page.locator("button:has-text('Pay ₹199')");
      console.log("J2 Payment modal pay button visible:", await payBtn.isVisible().catch(() => false));
    }
    await takeAuditScreenshot(page, "J2");
  });

  test("J3 - Pro features come from server subscription state", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    await takeAuditScreenshot(page, "J3");
  });

  test("J4 - Verified badge needs Pro + Udyam, CIN, GST regex formats", async ({ page }) => {
    const udyamRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
    const cinRegex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    console.log("J4 Udyam test valid:", udyamRegex.test("UDYAM-KR-03-0123456"));
    console.log("J4 Udyam test invalid:", udyamRegex.test("INVALID_UDYAM"));
    console.log("J4 CIN test valid:", cinRegex.test("U72200KA2020PTC134567"));
    console.log("J4 CIN test invalid:", cinRegex.test("12345"));
    console.log("J4 GSTIN test valid:", gstRegex.test("29ABCDE1234F1Z5"));
    console.log("J4 GSTIN test invalid:", gstRegex.test("123"));

    await page.goto("http://localhost:3000/company");
    await takeAuditScreenshot(page, "J4");
  });

  test("J5 - Ad purchase flow from Plans to Advertise", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    await takeAuditScreenshot(page, "J5");
  });

  test("J6 - Profile analytics clearly labelled", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    await takeAuditScreenshot(page, "J6");
  });

  test("K1 - Own app data readable/editable only by owner", async ({ page }) => {
    const res = await callSupabaseRest("profiles?user_id=eq.00000000-0000-0000-0000-000000000001", "GET");
    console.log("K1 Read profile directly with anon key:", res.status);
    await takeAuditScreenshot(page, "K1");
  });

  test("K2 - Profiles, company sites editable only by owner", async ({ page }) => {
    const res = await callSupabaseRest("companies", "POST", { name: "Unauthorized Company" });
    console.log("K2 Anon key insert company status:", res.status);
    await takeAuditScreenshot(page, "K2");
  });

  test("K3 - Posts, ideas, meetups edit rules", async ({ page }) => {
    const res = await callSupabaseRest("posts", "POST", { body: "Anon test post" });
    console.log("K3 Anon key insert post status:", res.status);
    await takeAuditScreenshot(page, "K3");
  });

  test("K4 - Documents & chats permissions", async ({ page }) => {
    const res = await callSupabaseRest("workspace_docs", "GET");
    console.log("K4 Anon key get docs status:", res.status, "records count:", res.data?.length ?? 0);
    await takeAuditScreenshot(page, "K4");
  });

  test("K5 - 401 when signed out / RLS policies check", async ({ page }) => {
    const tables = ["users", "profiles", "companies", "jobs", "applications", "posts", "ideas", "meetups", "chat_messages", "workspace_docs"];
    for (const t of tables) {
      const res = await callSupabaseRest(t, "GET");
      console.log(`K5 Anon query ${t}: status ${res.status}`);
    }
    await takeAuditScreenshot(page, "K5");
  });

  test("K6 - Storage objects vs Base64 in DB", async ({ page }) => {
    // Check if media_assets table exists or files use S3/Supabase Storage
    const res = await callSupabaseRest("media_assets?select=*&limit=5", "GET");
    console.log("K6 Supabase media_assets query:", res.status);
    await takeAuditScreenshot(page, "K6");
  });
});
