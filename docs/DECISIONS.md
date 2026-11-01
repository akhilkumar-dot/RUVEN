# FounderBridge — Architecture Decisions

| ID | Decision | Rationale | Date |
|---|---|---|---|
| D-001 | Gradle Kotlin DSL over Maven | Faster incremental builds, better IDE support. User chose Gradle. | 2026-11-01 |
| D-002 | GST-inclusive pricing | User confirmed: Rs.199 is all-in; GST extracted server-side at 18%. | 2026-11-01 |
| D-003 | Google + LinkedIn OAuth; X + GitHub feature-flagged off | User chose this. Reduces 3rd-party deps at launch. | 2026-11-01 |
| D-004 | Railway as default deploy target | User chose Railway. Managed Postgres + Redis, Docker deploy, free dev tier. | 2026-11-01 |
| D-005 | Resend as production email provider | Clean API, good deliverability, free tier for dev. Swappable via EmailProvider interface. | 2026-11-01 |
| D-006 | MinIO for local object storage, Cloudflare R2 for prod | R2 is S3-compatible, free egress, cheap. MinIO mimics it locally. | 2026-11-01 |
| D-007 | Modular monolith (not microservices) | Team size, ops complexity, and the feature set do not justify microservices at launch. Package boundaries enforce modularity. | 2026-11-01 |
| D-008 | Next.js App Router (not Pages Router) | App Router is the current default, supports RSC for SSR SEO pages, streaming. | 2026-11-01 |
| D-009 | Tailwind CSS | Prompt requires it. Works well with Radix primitives and dark-mode-first design. | 2026-11-01 |
| D-010 | Storybook 8 | Latest stable, works with Next.js 14 and Tailwind. | 2026-11-01 |
| D-011 | pg_trgm for full-text search | Keeps search in-process, no extra service. Interface written so OpenSearch can replace later. | 2026-11-01 |
| D-012 | ShedLock for distributed scheduling | Prevents duplicate job runs when multiple instances are deployed (e.g. meetup reminders). | 2026-11-01 |
| D-013 | Plus Jakarta Sans as primary typeface | Closest geometric grotesque to the reference image with friendly feel. Available via next/font. | 2026-11-01 |
