import { test, expect } from "@playwright/test";
import path from "path";
import { SCREENSHOT_DIR } from "./test-helpers";

test.describe("Design Fidelity Audit (V1 - V11)", () => {
  const viewports = [
    { name: "mobile-390", width: 390, height: 844 },
    { name: "desktop-1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`V1 & V3 - Home Screen (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/home");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `V3_home_${vp.name}.png`), fullPage: true });
    });

    test(`V2 - Sign In Screen (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/sign-in");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `V2_signin_${vp.name}.png`), fullPage: true });
    });

    test(`V4 - Bottom Dock & Floating Action Stack (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/home");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `V4_dock_${vp.name}.png`) });
    });

    test(`V5 - Detail Card / Competition Screen (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/ideas");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `V5_detail_${vp.name}.png`), fullPage: true });
    });
  }

  test("V9 - Responsive Overflow Check (360, 390, 768, 1024, 1440)", async ({ page }) => {
    const widths = [360, 390, 768, 1024, 1440];
    const routes = ["/home", "/discover", "/company", "/ideas", "/meetups", "/plans"];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of routes) {
        await page.goto(`http://localhost:3000${route}`);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        const hasOverflow = scrollWidth > clientWidth;
        if (hasOverflow) {
          console.warn(`V9 Horizontal overflow on ${route} at width ${width}px (scroll: ${scrollWidth}, client: ${clientWidth})`);
        }
      }
    }
  });

  test("V10 - Text contrast measurement on cards", async ({ page }) => {
    await page.goto("http://localhost:3000/home");
    // Check contrast of text on bento cards
    const cardTextColors = await page.evaluate(() => {
      const els = document.querySelectorAll(".bento-card p, .bento-card h3, [style*='background'] p");
      return Array.from(els).slice(0, 10).map(el => {
        const style = window.getComputedStyle(el);
        return { color: style.color, bg: style.backgroundColor };
      });
    });
    console.log("V10 Sample card text colors:", cardTextColors);
  });
});
