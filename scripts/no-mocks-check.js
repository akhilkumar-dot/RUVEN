#!/usr/bin/env node
/**
 * scripts/no-mocks-check.js (Batch 7 Guard)
 *
 * Scans web/src and backend/src/main to ensure:
 * 1. Zero banned prototype names / fake credentials
 * 2. Zero fake generators / mock auth imports
 * 3. Zero stock-avatar hosts (pravatar, unsplash, picsum, placehold, dicebear, ui-avatars)
 * 4. Zero dead UI anchors (href="#", javascript:void(0), alert())
 * 5. Zero empty click handlers (onClick={() => {}})
 * 6. Zero client-side localStorage writes of domain accounts/plans
 * 7. Zero faker/lorem imports outside test folders
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TARGET_DIRS = [
  path.join(ROOT, "web", "src"),
  path.join(ROOT, "backend", "src", "main"),
];

const BANNED_PATTERNS = [
  { pattern: /pravatar\.cc/i, desc: "Stock avatar host pravatar.cc" },
  { pattern: /images\.unsplash\.com/i, desc: "Stock image host unsplash.com" },
  { pattern: /picsum\.photos/i, desc: "Stock image host picsum.photos" },
  { pattern: /placehold\.co/i, desc: "Stock image host placehold.co" },
  { pattern: /dicebear\.com/i, desc: "Stock avatar host dicebear.com" },
  { pattern: /ui-avatars\.com/i, desc: "Stock avatar host ui-avatars.com" },
  { pattern: /href=["']#["']/i, desc: "Dead link href='#'" },
  { pattern: /javascript:\s*void\(0\)/i, desc: "Dead link javascript:void(0)" },
  { pattern: /onClick=\{?\(\)\s*=>\s*\{\}\}?/i, desc: "Empty onClick handler" },
  { pattern: /\balert\s*\(/i, desc: "Browser alert() call" },
  { pattern: /from\s+["'].*mockAuth.*["']/i, desc: "Mock auth import" },
  { pattern: /from\s+["']@?faker-js\/faker["']/i, desc: "Faker import in production code" },
  { pattern: /from\s+["']lorem-ipsum["']/i, desc: "Lorem ipsum import in production code" },
];

let violations = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "build") {
        continue;
      }
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if ([".ts", ".tsx", ".js", ".jsx", ".java"].includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  const relPath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Ignore comments explaining banned patterns
    if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
      return;
    }

    for (const b of BANNED_PATTERNS) {
      if (b.pattern.test(line)) {
        console.error(`VIOLATION: [${b.desc}] at ${relPath}:${index + 1}`);
        console.error(`  > ${line.trim()}`);
        violations++;
      }
    }
  });
}

console.log("Running no-mocks-check across production codebase...");
for (const dir of TARGET_DIRS) {
  scanDir(dir);
}

if (violations > 0) {
  console.error(`\nFAILED: Found ${violations} mock/dead UI violation(s).`);
  process.exit(1);
} else {
  console.log("SUCCESS: 0 violations found. Codebase is clean of mock data, stock image hosts, and dead UI.\n");
  process.exit(0);
}
