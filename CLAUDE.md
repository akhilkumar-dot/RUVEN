# FounderBridge — Agent Memory (CLAUDE.md)

> Keep this file up to date after every phase. It is the primary context for the next session.

## 1. Project Overview

**FounderBridge** is a networking + collaboration platform for the Indian startup ecosystem.
Currency: INR. Locale: en-IN. Timezone: IST (Asia/Kolkata).

Four account types: Individual, Investor, Startup founder, Company owner.

Prototype: /legacy/founderbridge_v10.html (read-only). Design ref: /design/reference.png

## 2. Monorepo Layout

/backend     Spring Boot 3 + Java 21 (Gradle Kotlin DSL)
/web         Next.js 14 App Router + TypeScript PWA
/infra       Docker, CI, Kubernetes manifests
/docs        Architecture, OpenAPI, Feature Matrix, Security, etc.
/legacy      Original prototype HTML (DO NOT MODIFY)
/design      Reference PNG and brand assets
/scripts     Seed scripts, migration helpers
CLAUDE.md    This file
Makefile     make dev / make test / make e2e / make build
docker-compose.yml  One-command local stack
.env.example All required environment variables with placeholders

## 3. Build / Run / Test Commands

  make dev           Boot full stack (postgres, redis, minio, mailhog, backend, web)
  make test          Run all backend + frontend tests
  make test-backend  Backend tests (Testcontainers, JUnit 5)
  make test-web      Frontend tests (Vitest, Testing Library)
  make e2e           Playwright E2E (requires running stack)
  make storybook     Design system Storybook
  make lint          Lint and typecheck
  make build         Production images

## 4. Key Tech Decisions

  Build tool:   Gradle Kotlin DSL (faster than Maven)
  GST:          Inclusive (Rs.199 all-in; GST extracted server-side)
  OAuth:        Google + LinkedIn (required); X + GitHub (feature-flagged off by default)
  Deploy:       Railway (managed Postgres + Redis, Docker images)
  Password:     Argon2id server-side only - never client hash
  Auth tokens:  JWT 15min access (in-memory) + rotating refresh in HttpOnly Secure cookie
  DB:           PostgreSQL 16 + Flyway migrations (never ddl-auto=update in prod)
  Real-time:    STOMP over WebSocket
  Search:       Postgres full-text + pg_trgm (OpenSearch-ready interface)
  Storage:      S3-compatible - MinIO local, Cloudflare R2 prod

## 5. Coding Conventions

Backend:
  - Package root: com.founderbridge.<module>
  - Sub-packages: .api .domain .service .dto .mapper
  - Use record for DTOs, MapStruct for mapping
  - All controller methods @PreAuthorize
  - Migrations in: backend/src/main/resources/db/migration/V{n}__{description}.sql

Frontend:
  - strict TypeScript
  - Design system: web/src/ui/
  - Pages/routes: web/src/app/
  - API via generated typed client from docs/openapi.yaml
  - No innerHTML without sanitization
  - All user URLs: https:// only with rel="noopener noreferrer"

Git: conventional commits (feat: fix: test: chore: docs:)

## 6. Phase Status

  Phase 0 - Foundation (scaffold, docs, design system, 3 reference screens)  IN PROGRESS
  Phase 1 - Auth & onboarding                                                PENDING
  Phase 2 - Media, profiles, themes                                          PENDING
  Phase 3 - Companies                                                        PENDING
  Phase 4 - Social graph & feed                                              PENDING
  Phase 5 - Ideas, Meetups, Workspace                                        PENDING
  Phase 6 - Real-time                                                        PENDING
  Phase 7 - Money & trust                                                    PENDING
  Phase 8 - Hardening & launch                                               PENDING

## 7. Still Needed from User (before Phase 7)

  1. Razorpay key_id + key_secret (test and live)
  2. Razorpay Plan ID for Rs.199/month Pro subscription
  3. Google OAuth Client ID + Secret
  4. LinkedIn OAuth Client ID + Secret
  5. Email provider API key (Resend default)
  6. Domain name
  7. Object storage credentials (R2 or S3)
  8. Legal copy: Terms, Privacy Policy, Refund Policy, Grievance Officer
  9. Ad pricing per day for 7/14/30-day slots
  10. VAPID keys (web push, Phase 6)
