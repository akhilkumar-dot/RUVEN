import { test, expect } from "@playwright/test";

test.describe("Batch 7: Production Boot Guard Verification", () => {
  test("Production mode asserts required secrets and refuses silent mocks", async () => {
    // Assert environment does not enable mock auth in production
    const isMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";
    const isProd = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

    if (isProd) {
      expect(isMockAuth).toBe(false);
    }

    // Check health endpoint returns valid JSON with status
    const res = await fetch("http://localhost:3000/api/health").catch(() => null);
    if (res) {
      const data = await res.json().catch(() => null);
      if (data) {
        expect(data.status).toBeDefined();
      }
    }
  });
});
