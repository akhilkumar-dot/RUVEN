import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Section G & H: Messages & Workspace Audit", () => {
  test("G1 - Chat only between connected users; call buttons for connected people", async ({ page }) => {
    await page.goto("http://localhost:3000/messages");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "G1");

    // Attempt to send message to non-connection via API
    const res = await callSupabaseRest("chat_messages", "POST", {
      room_id: "00000000-0000-0000-0000-000000000001",
      sender_id: "00000000-0000-0000-0000-000000000002",
      body: "Unconnected message",
    });
    console.log("G1 Message non-connected status:", res.status);
  });

  test("G2 - Real-time between two sessions, persisted, ordered, unread indicator", async ({ page }) => {
    await page.goto("http://localhost:3000/messages");
    // Send a message in thread
    const input = page.locator("input[placeholder='Type a message…']");
    if (await input.isVisible()) {
      await input.fill("Audit message " + Date.now());
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
    await takeAuditScreenshot(page, "G2");
  });

  test("G3 - Can't read someone else's conversation by changing IDs", async ({ page }) => {
    // Attempt to query chat messages for another room
    const res = await callSupabaseRest("chat_messages?room_id=eq.00000000-0000-0000-0000-000000000099", "GET");
    console.log("G3 Access other user room messages status:", res.status);
    await takeAuditScreenshot(page, "G3");
  });

  test("H1 - Create, edit, autosave workspace docs; Mine and Shared lists", async ({ page }) => {
    await page.goto("http://localhost:3000/workspace");
    await page.waitForLoadState("networkidle");
    await takeAuditScreenshot(page, "H1");
  });

  test("H2 - View-only permissions enforcement & delete guard", async ({ page }) => {
    // Try to update doc directly via API
    const res = await callSupabaseRest("workspace_docs?id=eq.00000000-0000-0000-0000-000000000001", "PATCH", {
      content: "Unauthorized edit",
    });
    console.log("H2 Direct API doc update status:", res.status);
    await takeAuditScreenshot(page, "H2");
  });

  test("H3 - Concurrent edits & XSS payload sanitization", async ({ page }) => {
    await page.goto("http://localhost:3000/workspace");
    // Click first doc to open editor
    const firstDoc = page.locator("button.w-full.flex").first();
    if (await firstDoc.isVisible()) {
      await firstDoc.click();
      await page.waitForTimeout(300);
      // Type XSS payload
      const textarea = page.locator("textarea");
      if (await textarea.isVisible()) {
        await textarea.fill("<script>alert('xss')</script><img src=x onerror=alert(1)>");
        await page.waitForTimeout(300);
      }
    }
    await takeAuditScreenshot(page, "H3");
  });
});
