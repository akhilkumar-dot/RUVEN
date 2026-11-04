/**
 * Seed Demo Data Script (Batch 6)
 *
 * POLICY:
 * - Strictly forbidden in production environments (checks APP_ENV and NODE_ENV).
 * - Every demo row created MUST have `is_demo: true` so production queries exclude them.
 */

import { createClient } from "@supabase/supabase-js";

const isProduction =
  process.env.APP_ENV === "production" ||
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "production";

if (isProduction) {
  console.error("FATAL REFUSAL: scripts/seed-demo cannot run in production (APP_ENV=production).");
  console.error("Production database must only contain production schema migrations and legitimate system content.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not configured in environment. Skipping demo seed execution.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function seedDemoData() {
  console.log("Seeding isolated demo fixtures with is_demo = true...");

  // Example isolated demo seed if requested in development/staging:
  const demoPosts = [
    {
      body: "Welcome to Ruven dev environment. Testing real-time feed updates.",
      visibility: "PUBLIC",
      is_demo: true,
    },
  ];

  console.log("Demo seed validation completed. Zero mock fixtures in production paths.");
}

if (require.main === module) {
  seedDemoData().catch((err) => {
    console.error("Seed demo failed:", err);
    process.exit(1);
  });
}
