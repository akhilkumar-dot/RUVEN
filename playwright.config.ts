import { defineConfig } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.resolve(__dirname, "audit/e2e"),
  timeout: 45000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: path.resolve(__dirname, "audit/test-results.json") }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
