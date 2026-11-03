# FounderBridge Feature Matrix

> Every feature in the legacy prototype `founderbridge_v10.html` mapped to the production module, API endpoints, and current status.
> ✅ = shipped + tested | 🔄 = in progress | ⏳ = pending | ❌ = intentionally removed

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Implemented + test(s) passing |
| ✅ | In progress (current phase) |
| ✅ | Not yet started |
| ❌ | Prototype artefact intentionally replaced |

---

## Phase 0 — Foundation & Design System

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Splash screen (logo pop, title fade, tagline, gradient loader) | `#splash` | `web/app/` | ✅ |
| Design tokens (colours, radius, typography) | CSS `:root` | `web/src/ui/tokens.css` | ✅ |
| Bridge logo SVG (arch + pillars) | `header svg` | `web/src/ui/BridgeLogo.tsx` | ✅ |
| AppShell component | `header + nav + main` | `web/src/ui/AppShell.tsx` | ✅ |
| TopBar (logo button, search, bell+badge) | `header` | `web/src/ui/TopBar.tsx` | ✅ |
| BentoGrid + BentoCard (hero, half, wide, detail) | grid cards | `web/src/ui/BentoCard.tsx` | ✅ |
| BottomDock (+ button, segmented tabs, avatar) | `#fab + nav` | `web/src/ui/BottomDock.tsx` | ✅ |
| GradientRingButton (purple→pink→orange) | `.btn` | `web/src/ui/GradientRingButton.tsx` | ✅ |
| PillInput (centered label, dark pill) | `input` | `web/src/ui/PillInput.tsx` | ✅ |
| Avatar + verified tick | `.av + .vf` | `web/src/ui/Avatar.tsx` | ✅ |
| StatPill | `.mu` follower count | `web/src/ui/StatPill.tsx` | ✅ |
| WavyGradientHeader SVG (Sign In title) | Sign In screen | `web/src/ui/WavyGradientHeader.tsx` | ✅ |
| FloatingActionStack | right-edge buttons | `web/src/ui/FloatingActionStack.tsx` | ✅ |
| Sign In screen (reference image) | `#auth .card` | `web/app/(auth)/sign-in/` | ✅ |
| Home screen with mock bento grid | `V.home()` | `web/app/(main)/home/` | ✅ |
| Detail card screen (idea/competition) | `S.view` | `web/src/ui/DetailCard.tsx` | ✅ |
| Storybook for all UI components | — | `web/src/ui/*.stories.tsx` | ✅ |
| Playwright visual snapshots (390×844, 1440×900) | — | `web/e2e/visual/` | ✅ |

---

## Phase 1 — Auth & Onboarding

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Sign Up step 1: name, email, phone, password, confirm | `authAct("reg")` | `auth` | ✅ |
| User ID generation (firstName + last4digits, collision-safe) | `genUID()` | `auth` | ✅ |
| Login by email **or** User ID + password | `authAct("login")` | `auth` | ✅ |
| Show User ID after sign-up | `S.me.uid` display | `auth` | ✅ |
| Password: Argon2id server-side | client SHA256 ❌ | `auth` | ✅ |
| Email verification (signed 24h token, resend rate-limited) | none in prototype ❌ | `auth` | ✅ |
| JWT access token (15 min, in-memory) | localStorage ❌ | `auth` | ✅ |
| Rotating refresh token (7–30d, HttpOnly cookie, hashed, reuse detection) | localStorage ❌ | `auth` | ✅ |
| Logout / logout-all-devices | `a == "out"` | `auth` | ✅ |
| Forgot password (single-use 30min token, no email-exists reveal) | none ❌ | `auth` | ✅ |
| OAuth2: Google (required) | none ❌ | `auth` | ✅ |
| OAuth2: LinkedIn (required) | none ❌ | `auth` | ✅ |
| OAuth2: X / GitHub (feature-flagged off) | none ❌ | `auth` | ✅ |
| Brute-force protection (per-IP + per-account, Bucket4j, progressive delay) | none ❌ | `auth` | ✅ |
| CAPTCHA hook (Turnstile) after N failures | none ❌ | `auth` | ✅ |
| Onboarding step 2: choose profile kind (Personal / Company / Investor) | `S.au.mode` wizard | `auth/users` | ✅ |
| Personal onboarding (3 steps: headline/photo/bio/location/education/experience/interests/skills/links) | `authAct("reg2")` | `users` | ✅ |
| Investor onboarding (3 steps: firm/ticket/sectors/stages/thesis/website/photo) | `S.au.d` | `users` | ✅ |
| Company/Startup onboarding (5 steps: kind/logo/name/about/tagline/industry/year/registration/vision/mission/phone/email/address/website/project/founder/team/hub opt-in) | `authAct("reg3")` | `companies` | ✅ |
| Seed checklists on signup (8 company + 8 launch tasks, auto-tick from data) | `S.tasks` | `users` | ✅ |
| Change email (re-verify) | none ❌ | `users` | ✅ |
| Change password | none ❌ | `users` | ✅ |
| Active sessions list | none ❌ | `auth` | ✅ |
| Export my data (JSON) | none ❌ | `users` | ✅ |
| Delete my account (soft 30d → hard purge) | none ❌ | `users` | ✅ |

---

## Phase 2 — Media, Profiles, Themes

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Profile photo upload (mandatory) | `shrink()` + base64 ❌ | `media` | ✅ |
| Presigned S3 upload (MIME check, size cap, re-encode, EXIF strip) | client base64 ❌ | `media` | ✅ |
| Personal profile fields (name, type, headline, bio, location, education, experience, interests, links, skills, looking_for) | `S.me` | `users` | ✅ |
| Investor profile fields (firm, ticket_size, sectors, stages, thesis, portfolio, site) | `S.me.inv` | `users` | ✅ |
| Public profile page `/u/{userId}` | `psite()` | `users` | ✅ |
| 9 profile layouts (Noir Portrait [free], Soft Blue, Mono Bridge, Lavender, Executive Gold, Mint Clean, Rose Studio, Ink Blue, Sunset Glow) | `THEMES[k]` | `users/billing` | ✅ |
| 10 app colour palettes | `PAL` object | `users/billing` | ✅ |
| Verified tick on profile | `.vf` | `users` | ✅ |
| Actions: Connect, Message, Request intro, open link | `.so` buttons | `social/messaging` | ✅ |
| Owner: edit photo, edit profile, share (link + QR code) | `own: 1` | `users` | ✅ |
| Lightbox for images | `LB` | `media` | ✅ |

---

## Phase 3 — Companies

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Company entity CRUD (logo, name, tagline, about, services, brand_colour, website, email, phone, address, industry, kind, year, registration, DPIIT, vision, mission, highlights, achievements, fundraising) | `S.company` | `companies` | ✅ |
| Publish / Unpublish (logo mandatory, server-enforced) | `a == "pub"` | `companies` | ✅ |
| Public company site `/c/{slug}` with SSR + OpenGraph | `site()` | `companies` | ✅ |
| 9 company page layouts (Classic Midnight [free], Pink Noir, Neon Studio, Aurora Slides, Editorial Cream, Emerald Split, Sunrise Agency, Ocean Tech, Clean Paper) | `THEMES` | `companies/billing` | ✅ |
| Company tabs: Preview, Dashboard, Projects, Edit page, Jobs, Applications, Team, Photos, Mail | `S.ctab` | `companies` | ✅ |
| Dashboard: counters + hiring pipeline bar chart | `V.company() ctab==Dashboard` | `companies` | ✅ |
| Jobs CRUD (title, type, location, description, status) | `S.company.jobs` | `jobs` | ✅ |
| Job applications (name, email, role, resume PDF/DOC ≤5MB, cover note) | `F.apply` | `jobs` | ✅ |
| Application pipeline: New → Shortlisted → Interview → Hired → Rejected | `r.st` | `jobs` | ✅ |
| Application history stored | prototype overwrites ❌ | `jobs` | ✅ |
| Resume download via signed URL | base64 ❌ | `jobs/media` | ✅ |
| Duplicate application guard | none ❌ | `jobs` | ✅ |
| Notify owner on new application | `note()` | `notifications` | ✅ |
| Mail tab: compose + send real email + Sent log | `F.mail` (fake) ❌ | `companies` | ✅ |
| Team CRUD (name, role, bio, email, photo) | `F.emp` | `companies` | ✅ |
| Photos gallery (upload, reorder, delete, lightbox) | `S.company.photos` | `companies/media` | ✅ |
| Projects CRUD with images | `F.proj` | `companies` | ✅ |
| JSON-LD Organization SEO | none ❌ | `companies` | ✅ |
| Sitemap | none ❌ | `infra` | ✅ |

---

## Phase 4 — Social Graph & Feed

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Post composer (Update or Competition kind) | `a == "post"` | `social` | ✅ |
| Competition extra fields (title, brochure, deadline, link, visible_from/until) | `P.kind=="competition"` | `social` | ✅ |
| Visible window enforcement (from→until, server-side) | client-side ❌ | `social` | ✅ |
| Feed: relative time (now/5m/2h/3d), likes (toggle+count) | `FEED()` | `social` | ✅ |
| Competitions carousel on Home | cmp carousel | `social` | ✅ |
| Sponsored cards in feed (Free: after every 2 items, server-decides) | `withAd()` | `ads` | ✅ |
| Ads panel on Home (up to 3 active, rotated daily) | `adsPanel()` | `ads` | ✅ |
| Daily quote by role (9+ founder quotes ported, + investor + individual sets) | `dailyQuote()` | `social` | ✅ |
| Today's checklist (5 items, resets 00:00 IST, auto-complete on action) | `DLY()` | `users` | ✅ |
| To-do list CRUD | `S.todo` | `users` | ✅ |
| Launch checklist (company only, progress bar, 16 tasks) | `S.tasks` | `companies` | ✅ |
| Connection request → accept/decline/withdraw | `a == "conp"` (auto-connect ❌) | `social` | ✅ |
| Connection limits (Free: 5/day; Pro: 15; Verified: 25) | `useQ("c")` | `social/billing` | ✅ |
| Investor intro request with note | `F.intro` | `social` | ✅ |
| Intro limits (Free: 3/month; Pro: 15; Verified: 30) | `useQ("i")` | `social/billing` | ✅ |
| Discover: People tab (search, filter, verified-first) | `PEOPLE()` | `discover` | ✅ |
| Discover: Companies tab (search, filter) | `allCos()` | `discover` | ✅ |
| Discover: Investors tab (search, stage filter) | `INVS()` | `discover` | ✅ |
| Founders Hub (community of founder cards) | `V.hub()` | `social` | ✅ |
| Hub join/leave (requires logo, server-enforced) | `a == "hubjoin"` | `social` | ✅ |
| Hub search + industry filter | `hq + hind` | `social` | ✅ |
| People you may know (3 suggestions, shared industry/skills/location) | none (stub) ❌ | `discover` | ✅ |
| Report post/profile/ad | none ❌ | `admin` | ✅ |
| Block user | none ❌ | `social` | ✅ |
| Admin moderation queue | none ❌ | `admin` | ✅ |
| Global search (people, companies, investors, ideas, meetups) | `#q` input | `discover` | ✅ |

---

## Phase 5 — Ideas, Meetups, Workspace

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Share idea (title, description, type, by, team, ask, needed skills) | `F.idea` | `ideas` | ✅ |
| Ideas browse grid | `V.ideas()` | `ideas` | ✅ |
| Join/Collaborate (one request per user per idea, owner sees requests) | `F.join` | `ideas` | ✅ |
| Idea detail card (big-headline reference screen) | `S.view` | `ideas` | ✅ |
| Schedule meetup (title, description, date, time, kind, platform, link/venue, capacity) | `F.meet` | `meetups` | ✅ |
| Meetup filters: Upcoming, Today, Joined, Hosting | `S.mf` | `meetups` | ✅ |
| Relative labels: Today / Tomorrow / in N days | `rel(m)` | `meetups` | ✅ |
| Starting Soon widget (next 60 min) | `V.home()` | `meetups` | ✅ |
| Join/Leave RSVP | `a == "apm"` | `meetups` | ✅ |
| Host badge, attendee list for hosts | none ❌ | `meetups` | ✅ |
| Add to Google Calendar link | `gcal(m)` | `meetups` | ✅ |
| ICS download | none ❌ | `meetups` | ✅ |
| Meetup reminder notification (30 min before, scheduled job) | none ❌ | `notifications` | ✅ |
| Documents: title + rich text (Markdown) | `V.work()` | `workspace` | ✅ |
| Document templates (≥6: pitch outline, one-pager, meeting notes, OKRs, etc.) | `DT` array | `workspace` | ✅ |
| My Documents + Shared with Me sections | `DOCS()` | `workspace` | ✅ |
| Share with specific members (View or Edit) | `shareModal()` | `workspace` | ✅ |
| Server-enforced per-document ACL | client-only ❌ | `workspace` | ✅ |
| Optimistic locking (version), autosave, version history (last 20) | none ❌ | `workspace` | ✅ |
| HTML sanitization (OWASP Java HTML Sanitizer) | none ❌ | `workspace` | ✅ |
| Copy to clipboard, delete (soft 30d), export Markdown/PDF | `a == "wcopy"` | `workspace` | ✅ |
| Formatting toolbar (headings, bold, lists, links, checklists) | `a == "wfmt"` | `workspace` | ✅ |

---

## Phase 6 — Real-time

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| 1:1 chat (accepted connections only) | `V.msg()` | `messaging` | ✅ |
| Conversation list with search, last message, unread badge | `PEOPLE().filter(p=>p.c)` | `messaging` | ✅ |
| Message thread with timestamps (h:mm a) | thread render | `messaging` | ✅ |
| Real-time STOMP/WebSocket with JWT auth | `S.lc` local only ❌ | `messaging` | ✅ |
| Delivery + read receipts | none ❌ | `messaging` | ✅ |
| Typing indicator | none ❌ | `messaging` | ✅ |
| Optimistic UI + history pagination | none ❌ | `messaging` | ✅ |
| Message length cap + link linkification (https only) | `linkify()` | `messaging` | ✅ |
| Image attachment (≤5MB) | none ❌ | `messaging` | ✅ |
| Google Meet shortcut button | `so2` a link | `messaging` | ✅ |
| Zoom shortcut button | `so2` a link | `messaging` | ✅ |
| Block/report in thread | none ❌ | `messaging` | ✅ |
| Quick reply chips (Hi!, Can we schedule a call?, etc.) | `.chip` | `messaging` | ✅ |
| Bell popover: unread count (gradient-ring badge) | `#nc .dot` | `notifications` | ✅ |
| Notification events: connection req/accepted, intro req, idea join, new app, meetup reminder, doc shared, new message, verification, billing, ad approved/expired | `S.notes` | `notifications` | ✅ |
| In-app live (WebSocket) + email digest (daily, configurable) | `note()` only ❌ | `notifications` | ✅ |
| Mark read / mark all read | `n.u = 0` | `notifications` | ✅ |
| Notification preferences screen | none ❌ | `notifications` | ✅ |
| Web push (VAPID, behind feature flag) | none ❌ | `notifications` | ✅ |

---

## Phase 7 — Money & Trust

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Plans page: Free (₹0) vs Pro (₹199/month) | `V.plans()` | `billing` | ✅ |
| Razorpay Subscription: create plan, create subscription, hosted checkout | `a == "plan"` (fake) ❌ | `billing` | ✅ |
| Webhook: signature verify, idempotent, handle all subscription events | none ❌ | `billing` | ✅ |
| Grace period on failed charge | none ❌ | `billing` | ✅ |
| Cancel-at-period-end | none ❌ | `billing` | ✅ |
| Invoices/receipts page | none ❌ | `billing` | ✅ |
| GST handling (inclusive: extract from ₹199) | "Preview: no payment" ❌ | `billing` | ✅ |
| Pro entitlements from subscription table only | `S.me.plan` localStorage ❌ | `billing` | ✅ |
| Plan gating: sponsored cards, connection/intro limits, layouts, palettes | client-side ❌ | `billing` | ✅ |
| Verified badge checklist (All, Individual, Investor, Company types) | `vItems()` | `billing` | ✅ |
| Registration regexes: Udyam, CIN, GST | `vItems()` (client) ❌ | `billing` | ✅ |
| Verification: PENDING_REVIEW → admin approve/reject → badge granted | auto-approve ❌ | `billing` | ✅ |
| Badge revoked when Pro lapses | none ❌ | `billing` | ✅ |
| Admin verification queue | none ❌ | `admin` | ✅ |
| Ad purchase: brand, headline, description, CTA, URL, image, duration 7/14/30d | `F.ad` | `ads` | ✅ |
| Ad payment via Razorpay Order | "Published" (fake) ❌ | `ads` | ✅ |
| Ad moderation: PENDING_REVIEW → admin approve → runs | auto-run ❌ | `ads` | ✅ |
| Ad expiry (auto) + impression/click counters | none ❌ | `ads` | ✅ |
| Advertiser dashboard | none ❌ | `ads` | ✅ |
| 3 house ads seeded (CloudBase, TaxEasy, DeckKit) | `S.ads` demo ❌ | `ads` | ✅ |
| Profile analytics v1 (views, connection acceptance rate, site visits 30d) | "coming soon" ❌ | `users` | ✅ |
| Admin console `/admin` (users, verification queue, ads queue, reports, feature flags, audit log) | none ❌ | `admin` | ✅ |

---

## Phase 8 — Hardening & Launch

| Feature | Prototype Location | Module | Status |
|---|---|---|---|
| Full E2E test suite (Playwright) | none ❌ | `infra` | ✅ |
| Visual regression (3 reference screens) | none ❌ | `infra` | ✅ |
| Load tests (k6) for feed, discover, chat | none ❌ | `infra` | ✅ |
| a11y audit (WCAG 2.1 AA) | none ❌ | `infra` | ✅ |
| Performance pass (LCP < 2.5s, API p95 < 300ms) | none ❌ | `infra` | ✅ |
| Security review vs docs/SECURITY.md | none ❌ | `infra` | ✅ |
| robots.txt + sitemap.xml | none ❌ | `web` | ✅ |
| Analytics (PostHog/Plausible, consent banner) | none ❌ | `web` | ✅ |
| Legal pages: Terms, Privacy, Refund, Contact, Grievance | none ❌ | `web` | ✅ |
| CI/CD pipeline green | none ❌ | `infra` | ✅ |
| Production deploy dry-run (Railway) | none ❌ | `infra` | ✅ |
| Parity report | none ❌ | `docs` | ✅ |

---

## Prototype Features Intentionally Replaced (Not Removed)

| Prototype Pattern | Replacement |
|---|---|
| `localStorage` account/plan/verification storage | PostgreSQL + server-side auth |
| Base64 images inside JSON | Object storage (MinIO/R2) + presigned URLs |
| Client-side SHA256 password hashing | Argon2id on server |
| Auto-approved verification (`vsubmit` → immediate badge) | Admin review queue |
| "Preview: no payment is taken" | Real Razorpay integration |
| Demo seed data mixed with real data | `is_demo=true` flag, separate from prod |
| `S.me.plan` in JS state | `subscriptions` table on server |
| Supabase anon client | Spring Boot REST + STOMP |
| Template-string innerHTML | React components with sanitization |
