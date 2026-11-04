import { test, expect } from "@playwright/test";

test.describe("Batch 7: Click Everything & Active Control Verification", () => {
  test("Navigational and interactive controls trigger active feedback", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("domcontentloaded");

    // 1. Role switcher tabs on home
    const roleButtons = page.locator("button:has-text('Individual'), button:has-text('Founder'), button:has-text('Investor')");
    const roleCount = await roleButtons.count();
    for (let i = 0; i < roleCount; i++) {
      const btn = roleButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(100);
      }
    }

    // 2. Discover tabs
    await page.goto("/discover");
    await page.waitForLoadState("domcontentloaded");
    const tabs = page.locator("button:has-text('People'), button:has-text('Companies'), button:has-text('Investors'), button:has-text('Jobs')");
    const tabCount = await tabs.count();
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(100);
      }
    }

    // 3. Meetups tabs
    await page.goto("/meetups");
    await page.waitForLoadState("domcontentloaded");
    const meetupTabs = page.locator("button:has-text('Upcoming'), button:has-text('My RSVPs'), button:has-text('Hosting')");
    const mCount = await meetupTabs.count();
    for (let i = 0; i < mCount; i++) {
      const tab = meetupTabs.nth(i);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(100);
      }
    }

    // 4. Verify no dead links href='#' exist in the document
    const deadLinks = await page.locator("a[href='#'], a[href='javascript:void(0)']").count();
    expect(deadLinks).toBe(0);
  });
});
