import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section B: Home Audit", () => {
  test("B1 - Date + new quote each day matching profile type", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "B1");

    const quote = page.locator("[data-testid='daily-quote']").or(page.locator("blockquote"));
    const hasQuote = (await quote.count()) > 0;
    console.log("B1 Daily quote present:", hasQuote);
  });

  test("B2 - Post text + optional photo; appears in everyone's feed", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await takeAuditScreenshot(page, "B2");

    const feedTab = page.locator("button:has-text('Community Feed')").first();
    if (await feedTab.isVisible()) {
      await feedTab.click();
      await page.waitForTimeout(300);
    }

    const shareBtn = page.locator("button:has-text('Share an update')").first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.fill("textarea", "Audit test feed post at " + Date.now());
      await page.click("button:has-text('Post Update')");
      await page.waitForTimeout(500);
    }

    const dbPosts = await callSupabaseRest("posts?select=id,body,created_at&limit=5", "GET");
    console.log("B2 Supabase posts table content:", dbPosts.data);
  });

  test("B3 - Like toggle, one per user, enforced server-side", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    const feedTab = page.locator("button:has-text('Community Feed')").first();
    if (await feedTab.isVisible()) {
      await feedTab.click();
      await page.waitForTimeout(300);
    }

    const likeBtn = page.locator("button:has(svg.lucide-heart)").first();
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      await page.waitForTimeout(300);
    }
    await takeAuditScreenshot(page, "B3");

    const dbLikes = await callSupabaseRest("post_likes?limit=5", "GET");
    console.log("B3 Supabase post_likes table content:", dbLikes.data);
  });

  test("B4 - Ads panel replaces 'People you may know' and shows only active ads", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await takeAuditScreenshot(page, "B4");
    const adsPanel = page.locator("[data-testid='ads-panel']").or(page.locator("text='Sponsored'"));
    const hasAds = (await adsPanel.count()) > 0;
    console.log("B4 Ads panel present:", hasAds);
  });

  test("B5 - Publish ad flow & server-side expiration", async ({ page }) => {
    await page.goto("http://localhost:3000/plans");
    await takeAuditScreenshot(page, "B5");
    const res = await callSupabaseRest("ads?select=*", "GET");
    console.log("B5 DB ads table query status:", res.status);
  });

  test("B6 - Free user sponsored card after every 2 updates", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    const feedTab = page.locator("button:has-text('Community Feed')").first();
    if (await feedTab.isVisible()) {
      await feedTab.click();
      await page.waitForTimeout(300);
    }

    const sponsoredCards = page.locator("text='Sponsored'").or(page.locator("text='Promoted'"));
    console.log("B6 Sponsored cards count:", await sponsoredCards.count());
    await takeAuditScreenshot(page, "B6");
  });

  test("B7 - Private to-do list (add, tick, delete)", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await takeAuditScreenshot(page, "B7");
    const todoList = page.locator("[data-testid='todo-list']").or(page.locator("text='To-do'"));
    console.log("B7 To-do list count:", await todoList.count());
  });

  test("B8 - Stat tiles show real counts & quick buttons navigation", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "B8");
    const statCards = page.locator(".grid .bg-\\[\\#0F0F12\\]");
    console.log("B8 Stat tiles found:", await statCards.count());
  });

  test("B9 - Today's meetups block on Home", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await takeAuditScreenshot(page, "B9");
    const meetupsBlock = page.locator("text='Today\'s Meetups'").or(page.locator("text='Meetups Today'"));
    console.log("B9 Today's meetups block present:", (await meetupsBlock.count()) > 0);
  });

  test("B10 - Launch checklist with progress bar auto-ticking on actions", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    await takeAuditScreenshot(page, "B10");
    const checklist = page.locator("text='Launch Checklist'").or(page.locator("text='Startup Checklist'"));
    console.log("B10 Launch checklist present:", (await checklist.count()) > 0);
  });
});
