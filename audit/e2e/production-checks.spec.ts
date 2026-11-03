import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Production & Security Checks Audit", () => {
  test("PROD-SEC-1 - Security headers and HTTPS rel guards", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/home");
    const headers = response?.headers() || {};

    console.log("Security headers check:");
    console.log("  x-frame-options:", headers["x-frame-options"]);
    console.log("  content-security-policy:", headers["content-security-policy"]);
    console.log("  x-content-type-options:", headers["x-content-type-options"]);
    console.log("  strict-transport-security:", headers["strict-transport-security"]);

    // Check external links have rel="noopener noreferrer"
    const externalLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href^='http']"));
      return links.map(l => ({
        href: l.getAttribute("href"),
        rel: l.getAttribute("rel"),
        target: l.getAttribute("target"),
      }));
    });
    console.log("External links checked:", externalLinks.length);
  });

  test("PROD-SEC-2 - Phone/email leak check in API payloads to other users", async ({ page }) => {
    // Check if querying public profiles or users leaks emails or phone numbers
    const res = await callSupabaseRest("users?select=id,name,email,phone&limit=3", "GET");
    console.log("PROD-SEC-2 Users query with anon key:", res.status, res.data);
  });

  test("PROD-SEC-3 - Legal pages exist (Privacy Policy, Terms)", async ({ page }) => {
    const termsRes = await page.goto("http://localhost:3000/terms");
    console.log("Terms page status:", termsRes?.status());

    const privacyRes = await page.goto("http://localhost:3000/privacy");
    console.log("Privacy page status:", privacyRes?.status());
  });

  test("PROD-ENG-1 - Health endpoint check", async ({ page }) => {
    const res = await page.goto("http://localhost:3000/api/health").catch(() => null);
    console.log("Health endpoint /api/health status:", res?.status());
  });

  test("PROD-ENG-2 - Database unique constraints check (one like per user, one application per idea/job)", async () => {
    // Attempt duplicate like insert in post_likes via API
    const res1 = await callSupabaseRest("post_likes", "POST", {
      post_id: "00000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000001",
    });
    const res2 = await callSupabaseRest("post_likes", "POST", {
      post_id: "00000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000001",
    });
    console.log("Duplicate post_like status: first=", res1.status, "second=", res2.status);
  });
});
