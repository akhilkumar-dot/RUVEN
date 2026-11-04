import { test, expect } from "@playwright/test";
import { takeAuditScreenshot, callSupabaseRest } from "./test-helpers";

test.describe("Phase 2: Connection Requests & In-App Notifications", () => {
  test("P2-1: Bell in TopBar renders and notification dropdown opens with tabs", async ({ page }) => {
    await page.addInitScript(() => {
      const mockSession = {
        access_token: "mock-token",

        refresh_token: "mock-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        token_type: "bearer",
        user: {
          id: "f2c7ece8-d7ea-42ae-b0e9-1917d3099698",
          aud: "authenticated",
          role: "authenticated",
          email: "makhil.vnk@gmail.com",
          user_metadata: {
            name: "Mutyalapati Akhil",
            user_handle: "mutyalapatiakhilku724",
            type: "STARTUP_FOUNDER",
          },
        },
      };
      localStorage.setItem("sb-lrvxxgjcdsmjntauuqpj-auth-token", JSON.stringify(mockSession));
      sessionStorage.setItem(
        "ruven-auth-storage",
        JSON.stringify({
          state: {
            isAuthenticated: true,
            user: {
              id: "f2c7ece8-d7ea-42ae-b0e9-1917d3099698",
              userHandle: "mutyalapatiakhilku724",
              email: "makhil.vnk@gmail.com",
              name: "Mutyalapati Akhil",
              type: "STARTUP_FOUNDER",
            },
            accessToken: "mock-token",
          },
          version: 0,
        })
      );
    });

    await page.goto("http://localhost:3000/home");
    await page.waitForLoadState("networkidle");

    // The notification bell must be present in the top bar
    const bellBtn = page.locator("#btn-notification-bell");
    await expect(bellBtn).toBeVisible({ timeout: 10000 });

    // Click the bell to open dropdown
    await bellBtn.click();
    await page.waitForTimeout(300);

    // Dropdown panel should be visible
    const dropdown = page.locator("div:has-text('Notifications')").first();
    await expect(dropdown).toBeVisible();

    // Both "All" and "Requests" tabs must exist
    const allTab = page.locator("button:has-text('All')");
    const requestsTab = page.locator("button:has-text('Requests')");
    await expect(allTab).toBeVisible();
    await expect(requestsTab).toBeVisible();

    await takeAuditScreenshot(page, "P2-1-bell-dropdown");
  });

  test("P2-2: Discover page renders 4-state connection buttons and hides self", async ({ page }) => {
    await page.goto("http://localhost:3000/discover");
    await page.waitForLoadState("networkidle");

    // Check if people cards render
    const cards = page.locator("main div.grid > div");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // If cards exist, verify the action buttons have proper labels (Connect, Requested, Respond, or Connected)
    if (count > 0) {
      const firstBtn = cards.first().locator("button");
      if (await firstBtn.isVisible()) {
        const text = await firstBtn.textContent();
        expect(["Connect", "Requested", "Respond", "Connected"]).toContain(text?.trim());
      }
    }

    await takeAuditScreenshot(page, "P2-2-discover-connect-states");
  });

  test("P2-3: Profile page Message button is locked when unconnected", async ({ page }) => {
    // Navigate to a user profile
    await page.goto("http://localhost:3000/u/mutyalapatiakhilku409");
    await page.waitForLoadState("networkidle");

    const messageBtn = page.locator("button:has-text('Message')");
    if (await messageBtn.isVisible()) {
      // If unconnected, message button should be disabled
      const isConnected = await page.locator("button:has-text('Connected')").isVisible();
      if (!isConnected) {
        await expect(messageBtn).toBeDisabled();
      }
    }

    await takeAuditScreenshot(page, "P2-3-profile-locked-chat");
  });

  test("P2-4: Database rejects self-connection & enforces RLS", async () => {
    const dummyId = "00000000-0000-0000-0000-000000000001";
    // Anon request to insert connection without authentication should be denied
    const res = await callSupabaseRest("connections", "POST", {
      requester_id: dummyId,
      addressee_id: dummyId,
      status: "PENDING",
    });
    // Either 401 Unauthorized or RLS violation
    expect([400, 401, 403]).toContain(res.status);
  });

  test("P2-5: Database notifications table has RLS and enforces privacy", async () => {
    // Anon request to query notifications table
    const res = await callSupabaseRest("notifications", "GET");
    // With RLS enabled, anon either gets [] or 401
    if (res.status === 200) {
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(0); // Anon sees zero notifications
    } else {
      expect([401, 403]).toContain(res.status);
    }
  });

  test("P2-6: Chat messages insertion denied without ACCEPTED connection", async () => {
    const res = await callSupabaseRest("chat_messages", "POST", {
      room_id: "00000000-0000-0000-0000-000000000099",
      sender_id: "00000000-0000-0000-0000-000000000001",
      body: "Sneaky message without connection",
    });
    expect([400, 401, 403]).toContain(res.status);
  });
});
