import { test, expect } from "@playwright/test";
import { callSupabaseRest } from "./test-helpers";

test.describe("Batch 7: API Contract & Scoped Access Verification", () => {
  test("Private tables deny unauthenticated requests or scope strictly", async () => {
    // 1. Direct messages query without valid session token
    const msgsRes = await callSupabaseRest("chat_messages?select=*&limit=5", "GET");
    // With Supabase RLS enabled, anonymous access either returns 401/403 or an empty array []
    if (msgsRes.status === 200 && Array.isArray(msgsRes.data)) {
      expect(msgsRes.data.length).toBe(0);
    } else {
      expect([401, 403]).toContain(msgsRes.status);
    }

    // 2. Private workspace documents query
    const docsRes = await callSupabaseRest("workspace_docs?select=*&limit=5", "GET");
    if (docsRes.status === 200 && Array.isArray(docsRes.data)) {
      expect(docsRes.data.length).toBe(0);
    } else {
      expect([401, 403]).toContain(docsRes.status);
    }

    // 3. Private applications query
    const appsRes = await callSupabaseRest("applications?select=*&limit=5", "GET");
    if (appsRes.status === 200 && Array.isArray(appsRes.data)) {
      expect(appsRes.data.length).toBe(0);
    } else {
      expect([401, 403]).toContain(appsRes.status);
    }
  });
});
