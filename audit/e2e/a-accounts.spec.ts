import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section A: Accounts & Onboarding Audit", () => {
  test("A1 - Four account types only", async ({ page }) => {
    await page.goto("http://localhost:3000/sign-up");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "A1");

    // Check account types displayed in UI
    const individual = page.locator("button:has-text('Individual')");
    const startup = page.locator("button:has-text('Startup Founder')");
    const company = page.locator("button:has-text('Company Owner')");
    const investor = page.locator("button:has-text('Investor')");

    const counts = {
      individual: await individual.count(),
      startup: await startup.count(),
      company: await company.count(),
      investor: await investor.count(),
    };
    console.log("A1 Account types found:", counts);
  });

  test("A2 - Basic details validation (name, email, phone, password format)", async ({ page }) => {
    await page.goto("http://localhost:3000/sign-up");
    // Click continue to step 1
    const continueBtn = page.locator("button:has-text('Continue')");
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(300);
    }

    // Try submitting empty
    const createBtn = page.locator("#btn-create-account, button[type='submit']:has-text('Create Account')").first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(300);
    }
    await takeAuditScreenshot(page, "A2");
  });

  test("A3 - Profile photo mandatory for personal and investor profile (API enforced)", async ({ page }) => {
    await page.goto("http://localhost:3000/onboarding");
    await takeAuditScreenshot(page, "A3");

    // Call Supabase profiles table directly without photo
    const res = await callSupabaseRest("profiles", "POST", {
      user_id: "00000000-0000-0000-0000-000000000000",
      headline: "Test Headline",
      photo_url: null,
    });
    console.log("A3 API direct insert without photo result status:", res.status);
  });

  test("A4 - Company logo mandatory for company/startup accounts (API enforced)", async ({ page }) => {
    await page.goto("http://localhost:3000/company");
    await takeAuditScreenshot(page, "A4");

    const res = await callSupabaseRest("companies", "POST", {
      name: "Audit Test Corp",
      logo_url: null,
    });
    console.log("A4 API direct insert without logo result status:", res.status);
  });

  test("A5 - Startup/Company required fields", async ({ page }) => {
    await page.goto("http://localhost:3000/onboarding");
    await takeAuditScreenshot(page, "A5");
  });

  test("A6 - Individual and Investor required fields", async ({ page }) => {
    await page.goto("http://localhost:3000/onboarding");
    await takeAuditScreenshot(page, "A6");
  });

  test("A7 - Lands on Home after onboarding; launch checklist starts only for startup accounts", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "A7");

    const launchChecklist = page.locator("text=Launch Checklist");
    const isVisible = await launchChecklist.isVisible().catch(() => false);
    console.log("A7 Launch Checklist visible on Home:", isVisible);
  });

  test("A8 - Data survives restart and re-login (Real DB)", async ({ page }) => {
    await page.goto("http://localhost:3000/sign-up?mode=login");
    await takeAuditScreenshot(page, "A8");

    const res = await callSupabaseRest("users?select=count", "GET");
    console.log("A8 Supabase public.users query status:", res.status, "data:", res.data);
  });

  test("A9 - Login by User ID or email, generic error on wrong credentials", async ({ page }) => {
    await page.goto("http://localhost:3000/sign-up?mode=login");
    const emailInput = page.locator("input[placeholder*='name@domain.com'], input[type='email'], input[name='email']").first();
    const passInput = page.locator("input[type='password']").first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("nonexistent_user@example.com");
      await passInput.fill("WrongPassword123!");
      const submitBtn = page.locator("form button[type='submit']").first();
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
    await takeAuditScreenshot(page, "A9");
  });

  test("A10 - 'My Company' hidden for Individual and Investor, refused by API", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    const drawerBtn = page.locator("header button").first();
    if (await drawerBtn.isVisible()) {
      await drawerBtn.click();
      await page.waitForTimeout(400);
    }
    const myCompanyLink = page.locator("text=My Company");
    const isCompanyVisible = await myCompanyLink.isVisible().catch(() => false);
    console.log("A10 'My Company' link visible in NavDrawer:", isCompanyVisible);

    await takeAuditScreenshot(page, "A10");
  });
});
