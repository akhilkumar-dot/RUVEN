# FounderBridge Specification Audit Report

**Date**: November 3, 2026  
**Auditor**: Antigravity Automated E2E & Production Verification Suite  
**Application URL**: `http://localhost:3000`  
**Database**: Supabase PostgreSQL (`lrvxxgjcdsmjntauuqpj.supabase.co`)  
**Design Reference**: `design/reference.png`  
**Specification Source**: `docs/FounderBridge_App_Workflow.pdf` (precedence: PDF > legacy HTML > build prompt)

---

## 1. Verdict

### **Launch-Ready**: **NO**

### **Top 3 Reasons**:
1. **Critical Security Vulnerabilities & Missing Row-Level Security (RLS)**:  
   Unauthenticated clients using the public Supabase anonymous key can directly query `public.users` and extract user emails and phone numbers (`PROD-SEC-2`). Furthermore, all core database tables (`users`, `profiles`, `companies`, `jobs`, `applications`, `posts`, `ideas`, `meetups`, `chat_messages`, `workspace_docs`) return status `200` to anonymous queries instead of `401 Unauthorized`, and unauthenticated clients can update company records (`PATCH /rest/v1/companies` returned `204`).
2. **UI Disconnected from Database (Mock State Prevalent)**:  
   While the database schema has been provisioned in Supabase, the majority of frontend views (`Discover`, `My Company`, `Ideas`, `Meetups`, `Messages`, `Workspace`, `Profile`) still operate on static in-memory arrays and mock functions. Actions like posting a feed update, creating a job, liking a post, connecting with founders, RSVPing to a meetup, and upgrading to Pro only modify local React state or simulate delays with `setTimeout`.
3. **Missing Core Features & Spec Mismatches**:  
   Founders Hub (`/hub`) was implemented as a generic social post feed instead of the specified directory of founder cards; the Daily Quote, Ads Panel, and Launch Checklist on Home are missing; and Payment processing is a client-side mock modal with no webhook verification.

---

## 2. Scoreboard

### Overall Status Breakdown

| Status | Count | Percentage |
| :--- | :---: | :---: |
| **PASS** | 13 | 17.6% |
| **PARTIAL** | 24 | 32.4% |
| **FAIL** | 17 | 23.0% |
| **MISSING** | 20 | 27.0% |
| **TOTAL** | **74** | **100.0%** |

### Breakdown by Section

| Section | Area | Total Items | PASS | PARTIAL | FAIL | MISSING | Section Pass Rate |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Accounts & Onboarding | 10 | 2 | 4 | 4 | 0 | 20.0% |
| **B** | Home | 10 | 0 | 2 | 1 | 7 | 0.0% |
| **C** | Discover & Connections | 8 | 0 | 4 | 0 | 4 | 0.0% |
| **D** | My Company | 13 | 1 | 2 | 4 | 6 | 7.7% |
| **E** | Ideas & Projects | 2 | 0 | 1 | 0 | 1 | 0.0% |
| **F** | Meetups & Calls | 4 | 0 | 1 | 2 | 1 | 0.0% |
| **G** | Messages | 3 | 0 | 1 | 2 | 0 | 0.0% |
| **H** | Workspace | 3 | 0 | 2 | 0 | 1 | 0.0% |
| **I** | Founders Hub | 2 | 0 | 0 | 1 | 1 | 0.0% |
| **J** | Plans, Verification & Payments | 6 | 2 | 0 | 1 | 3 | 33.3% |
| **K** | Data & Access Rules | 6 | 0 | 2 | 4 | 0 | 0.0% |
| **V** | Design Fidelity (V1–V11) | 11 | 6 | 5 | 0 | 0 | 54.5% |
| **PROD**| Production Checks | 6 | 2 | 1 | 3 | 0 | 33.3% |

### Design Score vs `design/reference.png`
- **Total Points**: 18 / 22 (81.8% Fidelity)
  - V1 (Black screens, no blue theme): 2/2 (Faithful)
  - V2 (Sign In screen): 1/2 (Approximate — signup wizard has wavy line/pill inputs; `/sign-in` has Google-only button)
  - V3 (Home layout): 1/2 (Approximate — circular top buttons faithful; bento grid layout differs from reference)
  - V4 (Bottom dock + floating buttons): 2/2 (Faithful)
  - V5 (Detail card screen): 1/2 (Approximate — ideas screen has cards, lacks large headline modal format)
  - V6 (Typography): 2/2 (Faithful)
  - V7 (Motion & animations): 2/2 (Faithful)
  - V8 (Unstyled screens): 1/2 (Approximate — company tabs contain placeholder icons)
  - V9 (Responsive zero-overflow): 2/2 (Faithful — 0 horizontal scroll at 360, 390, 768, 1024, 1440px)
  - V10 (Text contrast ≥ 4.5:1): 2/2 (Faithful — measured > 7:1)
  - V11 (Accessibility): 1/2 (Approximate — form inputs labelled, some icon buttons need ARIA)

---

## 3. BLOCKERS with Reproduction Steps

### BLOCKER 1: Unauthenticated Leaking of User Phone & Email (`PROD-SEC-2`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Open a terminal or API client (without any Supabase user session or auth token).
  2. Send a GET request:  
     `curl -H "apikey: <NEXT_PUBLIC_SUPABASE_ANON_KEY>" "https://lrvxxgjcdsmjntauuqpj.supabase.co/rest/v1/users?select=id,name,email,phone"`
  3. Notice HTTP `200 OK` is returned with full plaintext emails and mobile numbers of all registered users.
- **Root Cause**: `public.users` table lacks an RLS policy restricting public SELECT on sensitive personal identifiable information (`email`, `phone`).

### BLOCKER 2: Anonymous Modification of Company Records (`D12`, `K2`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Pick any company ID from `public.companies`.
  2. Send a PATCH request without authentication:  
     `curl -X PATCH -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" -d '{"name":"Hacked Company"}' "https://lrvxxgjcdsmjntauuqpj.supabase.co/rest/v1/companies?id=eq.<COMPANY_ID>"`
  3. Notice HTTP `204 No Content` is returned and the company record is updated in the database.
- **Root Cause**: Row-Level Security on `public.companies` is either disabled or configured with permissive update rules.

### BLOCKER 3: Chat Messages & Documents Publicly Readable (`K4`, `G3`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Run GET request:  
     `curl -H "apikey: <ANON_KEY>" "https://lrvxxgjcdsmjntauuqpj.supabase.co/rest/v1/chat_messages"`  
     `curl -H "apikey: <ANON_KEY>" "https://lrvxxgjcdsmjntauuqpj.supabase.co/rest/v1/workspace_docs"`
  2. Notice HTTP `200 OK` is returned for all chat messages and docs without requiring the user to be a member of the room or document owner.
- **Root Cause**: Missing RLS policies verifying `auth.uid() IN (SELECT user_id FROM chat_room_members WHERE room_id = ...)`.

### BLOCKER 4: Missing Schema Column `about` on `companies` Breaks Company Publishing (`D3`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Attempt to insert/publish a company with `about` field via API:  
     `POST /rest/v1/companies` with `{ "name": "Test", "about": "Description" }`
  2. API returns: `PGRST204: Could not find the 'about' column of 'companies' in the schema cache`.
- **Root Cause**: Schema mismatch between backend migration / frontend expectation (`about`) and database column (`description`).

### BLOCKER 5: Founders Hub (`/hub`) Implemented as Post Feed Instead of Founder Directory (`I1`, `I2`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Navigate to `http://localhost:3000/hub`.
  2. The page displays a generic feed of posts (`MOCK_POSTS`) rather than directory cards of startup founders and company owners with roles, company name, industry, stage, location, bio, LinkedIn, and photo.
  3. No join/leave toggle, role gating, or industry filter exists.
- **Root Cause**: Page was built using feed template rather than the specified directory specification in PDF Page 9.

### BLOCKER 6: Payment Flow is Client-Side Mock (`J2`)
- **Severity**: BLOCKER
- **Reproduction Steps**:
  1. Navigate to `/plans` and click "Upgrade to Pro".
  2. Click "Pay ₹199".
  3. Modal displays a 2-second spinner and instantly shows "Success", without initiating Razorpay checkout or verifying webhooks.
- **Root Cause**: No server-side payment order creation or webhook handler in place.

---

## 4. Findings Table by Section

| ID | Section | Severity | Status | Finding Description & Evidence |
| :--- | :--- | :---: | :---: | :--- |
| **A3** | Accounts | HIGH | FAIL | Profile photo is optional in DB (`photo_url NULL`); API allows saving profiles without a photo. |
| **A4** | Accounts | HIGH | FAIL | Company logo is optional in DB (`logo_url NULL`); API allows saving companies without a logo. |
| **A5** | Accounts | HIGH | PARTIAL | Onboarding step 3 does not persist company details to database (`onboarding/page.tsx:86`). |
| **A6** | Accounts | HIGH | PARTIAL | Investor thesis, ticket size, and sectors not collected during onboarding or saved to `investor_profiles`. |
| **A7** | Accounts | MEDIUM | PARTIAL | Startup launch checklist is missing on `/home` after onboarding. |
| **A8** | Accounts | BLOCKER | PARTIAL | `authStore.ts:176` stores auth token/user in localStorage; app feeds and cards read from mock arrays. |
| **A9** | Accounts | HIGH | PARTIAL | Email verification is not enforced before granting app access; password reset token workflow missing. |
| **A10** | Accounts | HIGH | FAIL | "My Company" link in `NavDrawer.tsx:75` is displayed to Individual and Investor accounts. |
| **B1** | Home | MEDIUM | MISSING | Daily quote and date matching profile type missing on Home (`b-home.spec.ts:5`). |
| **B2** | Home | HIGH | PARTIAL | Creating a feed post only appends to React state; `public.posts` table remains empty. |
| **B3** | Home | HIGH | FAIL | Like toggle operates purely in client state; `public.post_likes` table remains empty. |
| **B4** | Home | MEDIUM | MISSING | Ads panel component missing from Home page (`b-home.spec.ts:56`). |
| **B5** | Home | HIGH | MISSING | Ad publication flow and `ads` database table do not exist (`DB status 404`). |
| **B6** | Home | MEDIUM | MISSING | Sponsored card insertion after every 2 updates for Free users is missing. |
| **B7** | Home | MEDIUM | MISSING | Private to-do list widget missing from Home. |
| **B8** | Home | MEDIUM | PARTIAL | Stat tiles display static mock strings instead of real counts from database. |
| **B9** | Home | MEDIUM | MISSING | Today's meetups widget missing on Home. |
| **B10**| Home | HIGH | MISSING | Launch checklist with auto-ticking items missing on Home. |
| **C1** | Discover | HIGH | PARTIAL | Discover search operates on hardcoded client arrays without server pagination. |
| **C2** | Discover | HIGH | PARTIAL | Clicking "Connect" toggles button state locally; no row added to `connections`. |
| **C3** | Discover | MEDIUM | PARTIAL | Companies list is static mock data; no `published = true` filter or link to company page. |
| **C4** | Discover | MEDIUM | PARTIAL | Investor cards lack "Request Intro" and "View Portfolio" actions. |
| **C5** | Discover | HIGH | MISSING | Daily connection request counting and syncing accepted connections to Messages missing. |
| **C6** | Discover | HIGH | MISSING | Connection request tier limits (Free 5/day, Pro 15/day) not enforced server-side. |
| **C7** | Discover | LOW | MISSING | Verified accounts are not prioritized at the top of Discover results. |
| **D2** | Company | HIGH | PARTIAL | Edit Page form lacks email and phone fields; "Save Changes" does not call API. |
| **D3** | Company | BLOCKER | FAIL | Publish button missing from Company page; API query fails with `column about does not exist`. |
| **D4** | Company | HIGH | MISSING | Public company route `/c/[slug]` and unpublish visibility toggle missing. |
| **D5** | Company | HIGH | FAIL | Dashboard analytics display hardcoded numbers (4,210 views, 89 connections, 34 applications). |
| **D6** | Company | MEDIUM | MISSING | Projects tab displays "Projects coming soon" placeholder. |
| **D7** | Company | HIGH | PARTIAL | "+ Post a Job" has no creation form or DB persistence; no duplicate-apply guard. |
| **D8** | Company | HIGH | FAIL | Applications use non-spec status `REVIEWING`; status updates not saved; resumes not downloadable. |
| **D9** | Company | MEDIUM | MISSING | Team management tab displays placeholder. |
| **D10**| Company | MEDIUM | MISSING | Photo gallery tab displays placeholder. |
| **D11**| Company | MEDIUM | MISSING | Mail campaigns tab displays placeholder. |
| **D12**| Company | BLOCKER | FAIL | Anon clients can PATCH company records without ownership validation (`status: 204`). |
| **D13**| Company | HIGH | FAIL | Free accounts can select Pro themes in UI; no server-side restriction. |
| **E1** | Ideas | HIGH | PARTIAL | "Post Idea" and "Collaborate" buttons have no event handlers or DB wiring. |
| **E2** | Ideas | HIGH | MISSING | Collaborator review and chat creation on accept missing. |
| **F1** | Meetups | HIGH | PARTIAL | "+ Host" button has no form or scheduling action. |
| **F2** | Meetups | HIGH | FAIL | Uses simple 1-click RSVP instead of the PDF-specified application form. |
| **F3** | Meetups | HIGH | FAIL | Join link exposed directly in text; `meetups.link` column missing in DB. |
| **F4** | Meetups | MEDIUM | MISSING | Host applicant list view missing; past meetups not filtered. |
| **G1** | Messages | HIGH | PARTIAL | Messages page renders hardcoded chats without checking connection status. |
| **G2** | Messages | HIGH | FAIL | Real-time chat messages not persisted in Supabase `chat_messages` table. |
| **G3** | Messages | BLOCKER | FAIL | `chat_messages` table is publicly readable with anon key without room membership check. |
| **H1** | Workspace| HIGH | PARTIAL | Documents edited in memory only; `workspace_docs` table not synced. |
| **H2** | Workspace| HIGH | MISSING | Document sharing permissions and view-only enforcement missing. |
| **I1** | Hub | BLOCKER | FAIL | Hub is implemented as a post feed instead of a directory of founder cards. |
| **I2** | Hub | BLOCKER | MISSING | Join/leave toggle, role gating, and industry filter missing from Founders Hub. |
| **J2** | Plans | BLOCKER | FAIL | Payment checkout is simulated via `setTimeout`; no Razorpay gateway or webhook. |
| **J3** | Plans | HIGH | MISSING | Pro subscription status not tracked or verified in database. |
| **J4** | Plans | HIGH | MISSING | Verification workflow (Udyam, CIN, GST) and admin approval panel missing. |
| **K1** | Security | BLOCKER | FAIL | Profiles table readable by unauthenticated anon client (`status: 200`). |
| **K2** | Security | BLOCKER | FAIL | Companies table writable by unauthenticated anon client (`status: 204`). |
| **K4** | Security | BLOCKER | FAIL | Chat messages and workspace docs accessible without authentication. |
| **K5** | Security | BLOCKER | FAIL | Core database tables lack RLS enforcement for unauthenticated requests. |
| **PROD-SEC-1** | Prod | HIGH | FAIL | Missing security headers (`X-Frame-Options`, `Content-Security-Policy`, `HSTS`). |
| **PROD-SEC-2** | Prod | BLOCKER | FAIL | Anon query on `public.users` leaks email and phone numbers of users. |
| **PROD-SEC-3** | Prod | HIGH | FAIL | `/terms` and `/privacy` legal routes return HTTP 404. |
| **PROD-ENG-1** | Prod | MEDIUM | PARTIAL | `/api/health` health check endpoint returns 500 / 404. |
| **PROD-PROTO-1**| Prod | BLOCKER | FAIL | `authStore.ts:176` stores user tokens in `localStorage`. |

---

## 5. Specification Conflicts

| Conflict Area | Source 1 (Workflow PDF) | Source 2 (Legacy HTML) | Current Build | Resolution (Precedence Rule) |
| :--- | :--- | :--- | :--- | :--- |
| **Meetup Joining** | Requires application form with name, email, background, why attending (Page 8) | Simple 1-click RSVP | Simple 1-click RSVP (`meetups/page.tsx:78`) | **PDF Wins**: Build must implement an application modal for meetups with host review. |
| **Job Application Statuses** | `New`, `Shortlisted`, `Hired`, `Rejected` | `Interview`, `Shortlisted`, `Hired`, `Rejected` | `APPLIED`, `REVIEWING`, `SHORTLISTED` (`company/page.tsx:151`) | **PDF Wins**: Statuses must be `New`, `Shortlisted`, `Hired`, `Rejected`. |
| **Company Description Length** | Minimum 20 characters required to publish | 40 characters for verification | No client or DB minimum validation | **PDF Wins**: Minimum 20 characters for publish; 40 characters for verification. |
| **Founders Hub** | Directory of startup founders and company owners with search, industry filter, join/leave | Single account field `m.hub = 1/0` with founder directory | Generic social post feed (`MOCK_POSTS`) | **PDF Wins**: Hub must be a directory of founder cards with join/leave and industry filters. |
| **Single Account Class** | Four classes: Startup founder, Company owner, Individual, Investor | Profile modes (personal, company, investor) | Single account class chosen at signup (`AccountType`) | **PDF Wins / Build Aligned**: Single account class architecture is preserved. |

---

## 6. Features in the App That Are in No Spec

1. **Ecosystem / Community Feed Dual Tabs on Home**:  
   The current Home page contains an "Ecosystem" tab with tailored role dashboards and a "Community Feed" tab with social posts. The PDF describes Home as an ecosystem hub containing daily quote, stats, feed, to-do list, ads panel, today's meetups, and launch checklist.
2. **Demo Quick Switch Buttons on Login**:  
   Quick login buttons for Freelancer, Startup Founder, Company Owner, and Investor exist in `sign-up/page.tsx:360-407`. These are helpful development artifacts and should be restricted to development mode (`NODE_ENV !== 'production'`).

---

## 7. What Couldn't Be Tested & Needs from User

To complete full live end-to-end integration for the remaining external services, the following credentials and decisions are required:
1. **Razorpay Gateway Keys**:  
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (in test mode) and a Razorpay Plan ID for the ₹199/month Pro subscription, to wire the real checkout session and verify incoming webhook signatures (`J2`).
2. **Google OAuth Client Credentials**:  
   Google Client ID and Secret in Supabase dashboard to enable live Google One-Tap sign-in without developer consent warning.
3. **Transactional Email Provider API Key**:  
   Resend / SendGrid / MailHog SMTP credentials to verify email verification delivery (`A9`) and company outbound email campaigns (`D11`).
4. **Object Storage (S3 / Cloudflare R2 / Supabase Storage)**:  
   Bucket name and credentials for uploading profile photos, company logos, and applicant resumes (`A3`, `A4`, `K6`).

---

## Next Steps (Autonomous Fix Plan)
We now proceed to fix the findings systematically in order of severity:
1. **Fix BLOCKERS**:
   - `PROD-SEC-2` & `K1`/`K2`/`K4`/`K5`: Implement strict PostgreSQL Row-Level Security (RLS) policies on Supabase so `public.users` never leaks emails/phones to anon clients, and only owners/members can read or write documents, chats, and company data.
   - `PROD-PROTO-1` & `A8`: Remove auth tokens from `localStorage` in `authStore.ts` and use secure session handling.
   - `D3`: Fix column name schema mismatch in `companies` (`description` vs `about`) and add Publish button with validation.
   - `I1` / `I2`: Rebuild `hub/page.tsx` as the specified Founders Hub directory with founder cards, join/leave toggle, and industry filters.
   - `D12` / `G3`: Enforce owner/recipient authorization on company and message endpoints.
2. **Fix HIGH Severity**:
   - Connect `home/page.tsx` feed and likes to Supabase `posts` and `post_likes`.
   - Implement `NavDrawer.tsx` role-gating to hide "My Company" for Individual and Investor accounts (`A10`).
   - Add Terms (`/terms`) and Privacy Policy (`/privacy`) legal pages (`PROD-SEC-3`).
   - Add HTTP security headers in Next.js config (`PROD-SEC-1`).
   - Add Health check endpoint at `/api/health` (`PROD-ENG-1`).
3. **Fix MEDIUM & LOW Severity**:
   - Daily quote & To-do list on Home (`B1`, `B7`).
   - Meetups application modal (`F2`).
   - Design refinements on Sign In and Home to increase score to 100%.
