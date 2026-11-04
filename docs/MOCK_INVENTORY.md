# Ruven Mock Inventory (Batch 1: Complete Audit)

> Complete audit of all mock data, fake async, dead UI, prototype leftovers, and hardcoded values across the codebase.
> Total Findings: 94 items
> Action Legend:
> - **wire**: Connect end-to-end to Supabase/Postgres API, scoped to signed-in user, with proper empty/loading/error states.
> - **delete**: Remove completely from the codebase (fake arrays, demo bots, stock image URLs, unused mock services).
> - **flag**: Gate behind a server-side feature flag disabled by default (features not ready for production release).

---

## Inventory Table

| file:line | what it is | category | action | owner module |
|---|---|---|---|---|
| `web/src/lib/api/mockAuth.ts:1-133` | Entire dev-mode mock authentication service, fake JWT generator, and fake sleeper | Mock Services | delete | Auth |
| `web/src/lib/api/mockAuth.ts:13-15` | `fakeSleep(ms = 600)` helper creating artificial delays | Fake Async | delete | Auth |
| `web/src/lib/api/mockAuth.ts:17-27` | `mockToken` creating fake unsigned JWT tokens | Mock Services | delete | Auth |
| `web/src/lib/api/mockAuth.ts:29-34` | `DEFAULT_ACCOUNTS` dictionary with Ananya, Aarav, Vikram, Rohan demo credentials | Hardcoded Sample Data | delete | Auth |
| `web/src/lib/api/mockAuth.ts:39,53` | `sessionStorage` storing fake registered users | Client Persistence | delete | Auth |
| `web/src/lib/store/authStore.ts:4` | Import of `mockAuthApi` | Mock Services | delete | Auth |
| `web/src/lib/store/authStore.ts:62-66` | `switchAccountType` creates dummy user `aarav_reddy` / `aarav@founderbridge.in` if unauthenticated | Fallback Fake Data | delete | Auth |
| `web/src/lib/store/authStore.ts:79-82` | `setAuth` creates fallback email `${userHandle}@founderbridge.in` | Fallback Fake Data | wire | Auth |
| `web/src/lib/store/authStore.ts:94-96` | Fallback to `mockAuthApi.login(payload)` on Supabase login error | Mock Services | delete | Auth |
| `web/src/lib/store/authStore.ts:120-122` | Fallback to `mockAuthApi.register(payload)` on Supabase register error | Mock Services | delete | Auth |
| `web/src/lib/store/authStore.ts:138,145` | `mockAuthApi.logout()` and `logoutAll()` calls | Mock Services | delete | Auth |
| `web/src/lib/store/authStore.ts:158-160` | `mockAuthApi.refresh()` call | Mock Services | delete | Auth |
| `web/src/lib/api/supabaseAuth.ts:12` | Random 3-digit number appended to user handle on registration (`Math.random()`) | ID Generation | wire | Auth |
| `web/src/lib/api/supabaseAuth.ts:96` | Fallback lookup to `${emailOrHandle}@founderbridge.in` | Fallback Fake Data | wire | Auth |
| `web/src/ui/NavDrawer.tsx:38` | Messages menu item has hardcoded unread badge `count: 3` | Fake Numbers | wire | Navigation |
| `web/src/ui/NavDrawer.tsx:50` | `displayName` falls back to hardcoded prototype name `"Aarav Reddy"` | Fallback Fake Data | wire | Navigation |
| `web/src/ui/NavDrawer.tsx:51` | `userType` falls back to `"Startup Founder"` | Fallback Fake Data | wire | Navigation |
| `web/src/ui/TopBar.tsx:28` | `unreadCount` parameter defaults to 0 but callers pass hardcoded 2 and 3 | Fake Numbers | wire | Navigation |
| `web/src/ui/TopBar.tsx:70-80` | Search icon button is dead UI when `onSearchOpen` prop is not passed | Dead UI | wire | Navigation |
| `web/src/ui/TopBar.tsx:83-98` | Notification bell is dead UI when `onNotificationsOpen` prop is not passed | Dead UI | wire | Navigation |
| `web/src/app/(main)/home/page.tsx:32-49` | `ROLE_QUOTES` hardcoded daily inspirational quotes in client file | Sample Data / Content | wire | Home / Content |
| `web/src/app/(main)/home/page.tsx:128-133` | Individual dashboard hardcoded stats ("4 Proposals", "1.8k Views", "12 Intros", "98% Skill Match") | Fake Numbers | wire | Home |
| `web/src/app/(main)/home/page.tsx:134-138` | Individual dashboard quick action badges ("18 Open", "Free") | Fake Numbers / Badges | wire | Home |
| `web/src/app/(main)/home/page.tsx:139-145` | Individual dashboard featured opportunity hardcoded "Build with AI Hackathon" / "₹10L Prize" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:146-152` | Individual dashboard featured profile hardcoded "FinPilot" / "₹1.8L - ₹2.5L / mo" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:153-193` | Individual dashboard 4 hardcoded bento cards | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:194-235` | Individual dashboard 3 hardcoded feed posts (Priya Nair, Rohit Verma, Ananya Sen) | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:238-243` | Founder dashboard hardcoded stats ("14 Matches", "3.2k Views", "28 Inquiries", "94% Health") | Fake Numbers | wire | Home |
| `web/src/app/(main)/home/page.tsx:244-248` | Founder dashboard quick action badges ("48 Active", "Closing soon", "$25k") | Fake Numbers / Badges | wire | Home |
| `web/src/app/(main)/home/page.tsx:249-255` | Founder dashboard featured opportunity hardcoded "Sequoia Surge & Peak XV" / "₹1.25 Cr" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:256-262` | Founder dashboard featured profile hardcoded "Priya Nair @ FinPilot" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:263-303` | Founder dashboard 4 hardcoded bento cards (Rohan Mehta, Aarav Reddy, Vikram Malhotra) | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:304-345` | Founder dashboard 3 hardcoded feed posts | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:348-353` | Company Owner dashboard hardcoded stats ("38 Inquiries", "8.4k Views", "11 Contracts", "99% Trust") | Fake Numbers | wire | Home |
| `web/src/app/(main)/home/page.tsx:354-358` | Company Owner quick action badges ("120+") | Fake Numbers / Badges | wire | Home |
| `web/src/app/(main)/home/page.tsx:359-365` | Company Owner featured opportunity hardcoded "Tata Digital B2B Vendor" / "₹50L+ ARR" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:366-372` | Company Owner featured profile hardcoded "Vikram Malhotra @ Apex Tech" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:373-413` | Company Owner 4 hardcoded bento cards | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:414-455` | Company Owner 3 hardcoded feed posts | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:458-463` | Investor dashboard hardcoded stats ("24 Deals", "142 Pings", "3.4x IRR", "6 Syndicates") | Fake Numbers | wire | Home |
| `web/src/app/(main)/home/page.tsx:464-468` | Investor dashboard quick action badges ("8 New") | Fake Numbers / Badges | wire | Home |
| `web/src/app/(main)/home/page.tsx:469-475` | Investor dashboard featured opportunity hardcoded "FinTech & Vernacular AI Syndicate" / "₹5 Cr" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:476-482` | Investor dashboard featured profile hardcoded "Rohan Mehta @ Angel Investor" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:483-523` | Investor dashboard 4 hardcoded bento cards | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:524-565` | Investor dashboard 3 hardcoded feed posts | Hardcoded Sample Data | delete | Home |
| `web/src/app/(main)/home/page.tsx:555-574` | Private To-do list using in-memory state and fake ID `"td-" + Date.now()` | Client Persistence / Fake IDs | wire | Home |
| `web/src/app/(main)/home/page.tsx:642` | Create post generates fake ID `id: "post-" + Date.now()` | Fake IDs | wire | Home |
| `web/src/app/(main)/home/page.tsx:684` | `onSearchOpen={() => {}}` empty handler | Dead UI | wire | Home |
| `web/src/app/(main)/home/page.tsx:685` | `onNotificationsOpen={() => {}}` empty handler | Dead UI | wire | Home |
| `web/src/app/(main)/home/page.tsx:706` | Avatar falls back to hardcoded `"Founder"` | Fallback Fake Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:976-987` | Launch checklist hardcoded "60%" / "3 of 5 milestones achieved" | Fake Numbers | wire | Home |
| `web/src/app/(main)/home/page.tsx:991-995` | Launch checklist static array with hardcoded completion statuses | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:1034-1048` | Today's meetups widget renders hardcoded "Bengaluru AI Founders Mixer" / "18 founders attending" | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:1052-1079` | Sponsored ad panel renders hardcoded AWS for Startups credits | Hardcoded Sample Data | wire | Home |
| `web/src/app/(main)/home/page.tsx:1379` | `onProfileOpen={() => {}}` empty handler in BottomDock | Dead UI | wire | Home |
| `web/src/app/(main)/discover/page.tsx:21-28` | `PEOPLE` array of 6 hardcoded profiles with fake connection counts | Hardcoded Sample Data | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:30-36` | `COMPANIES` array of 5 hardcoded companies | Hardcoded Sample Data | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:38-42` | `INVESTORS` array of 3 hardcoded investors | Hardcoded Sample Data | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:44-49` | `JOBS` array of 4 hardcoded job postings | Hardcoded Sample Data | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:67` | `PersonCard` connect button: local state toggle only, no API call | Fake Async / Dead UI | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:124` | `InvestorCard` "Request Intro" button has no `onClick` handler | Dead UI | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:148` | `JobCard` "Apply Now" button has no `onClick` handler | Dead UI | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:161` | `TopBar unreadCount={3}` hardcoded unread count | Fake Numbers | wire | Discover |
| `web/src/app/(main)/discover/page.tsx:173` | Filters icon button has no `onClick` handler | Dead UI | wire | Discover |
| `web/src/app/(main)/hub/page.tsx:38-106` | `SEED_FOUNDERS` array of 6 hardcoded founders | Hardcoded Sample Data | wire | Hub |
| `web/src/app/(main)/hub/page.tsx:109` | `hasJoined` initialized to hardcoded `true` without database state | Frontend-only State | wire | Hub |
| `web/src/app/(main)/hub/page.tsx:113` | `connectedIds` local state toggle without backend persistence | Dead UI / Fake Async | wire | Hub |
| `web/src/app/(main)/hub/page.tsx:149` | `TopBar unreadCount={2}` hardcoded unread count | Fake Numbers | wire | Hub |
| `web/src/app/(main)/ideas/page.tsx:28-72` | `SEED_IDEAS` array of 4 hardcoded ideas with fake upvote and comment counts | Hardcoded Sample Data | wire | Ideas |
| `web/src/app/(main)/ideas/page.tsx:83` | `CollaborateModal` fake timer `setTimeout(() => onClose(), 1800)` | Fake Async | wire | Ideas |
| `web/src/app/(main)/ideas/page.tsx:230` | Post idea generates fake ID `id: "id-" + Date.now()` | Fake IDs | wire | Ideas |
| `web/src/app/(main)/ideas/page.tsx:378` | `TopBar unreadCount={3}` hardcoded unread count | Fake Numbers | wire | Ideas |
| `web/src/app/(main)/ideas/page.tsx:442` | `BottomDock userName="Aarav Reddy"` fallback | Fallback Fake Data | wire | Ideas |
| `web/src/app/(main)/meetups/page.tsx:42-88` | `SEED_MEETUPS` array of 3 hardcoded meetups with fake attendee numbers | Hardcoded Sample Data | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:101` | `ApplyModal` fake timer `setTimeout(() => { onApplied(); onClose(); }, 1800)` | Fake Async | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:141` | `placeholder="e.g. Co-founder @ FinPilot (Seed stage)"` | Prototype Names | delete | Meetups |
| `web/src/app/(main)/meetups/page.tsx:188` | Host meetup generates fake ID `id: "meet-" + Date.now()` | Fake IDs | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:554-563` | `my_rsvps` tab contains hardcoded "Bengaluru AI Founders Mixer", "Confirmed" | Hardcoded Sample Data | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:577-620` | `organising` tab contains hardcoded "Angel Syndicate Pitch" with fake applicants | Hardcoded Sample Data | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:603,609` | "Accept" and "Decline" buttons trigger browser `alert()` and local filter | Dead UI / Browser Alert | wire | Meetups |
| `web/src/app/(main)/meetups/page.tsx:652` | `BottomDock userName="Aarav Reddy"` fallback | Fallback Fake Data | wire | Meetups |
| `web/src/app/(main)/messages/page.tsx:46-51` | `SEED_CONVOS` array of 3 fake conversations | Hardcoded Sample Data | wire | Messages |
| `web/src/app/(main)/messages/page.tsx:54-63` | `SEED_MESSAGES` array of 7 fake messages | Hardcoded Sample Data | wire | Messages |
| `web/src/app/(main)/messages/page.tsx:150-189` | `ActiveCallOverlay` simulated video/audio call with fake timer `00:42` | Dead UI / Fake Feature | delete | Messages |
| `web/src/app/(main)/messages/page.tsx:318` | Send message generates `tempId = "temp-" + Date.now()` | Fake IDs | wire | Messages |
| `web/src/app/(main)/messages/page.tsx:344-355` | Fake automated bot echo `setTimeout` simulating replies | Fake Async / Fake Feature | delete | Messages |
| `web/src/app/(main)/messages/page.tsx:579` | `BottomDock userName={user?.userHandle || "Aarav Reddy"}` fallback | Fallback Fake Data | wire | Messages |
| `web/src/app/(main)/workspace/page.tsx:21-61` | `MOCK_DOCS` array of 5 hardcoded documents | Hardcoded Sample Data | wire | Workspace |
| `web/src/app/(main)/workspace/page.tsx:88` | `DocEditorModal` fake timer `setTimeout(() => setSaving(false), 800)` | Fake Async | wire | Workspace |
| `web/src/app/(main)/workspace/page.tsx:142-155` | Templates list buttons don't persist newly created document to DB | Dead UI | wire | Workspace |
| `web/src/app/(main)/workspace/page.tsx:171` | `BottomDock userName="Aarav Reddy"` fallback | Fallback Fake Data | wire | Workspace |
| `web/src/app/(main)/company/page.tsx:32-48` | `INITIAL_COMPANY` hardcoded "DeepStack AI", fake stats, and Unsplash logo | Hardcoded Sample Data / Stock Images | wire | Company |
| `web/src/app/(main)/company/page.tsx:58-62` | `applications` array of 3 hardcoded job applicants | Hardcoded Sample Data | wire | Company |
| `web/src/app/(main)/company/page.tsx:65-68` | `projects` array of 2 hardcoded company projects | Hardcoded Sample Data | wire | Company |
| `web/src/app/(main)/company/page.tsx:71-75` | `team` array of 3 hardcoded team members (Aarav, Dr. Arvind, Sneha) | Hardcoded Sample Data | wire | Company |
| `web/src/app/(main)/company/page.tsx:100-117` | `handleTogglePublish` only mutates local React state | Frontend-only Logic | wire | Company |
| `web/src/app/(main)/company/page.tsx:119-129` | `handleApplicationStatusChange` only mutates local React state | Frontend-only Logic | wire | Company |
| `web/src/app/(main)/company/page.tsx:399` | `setTimeout(() => setSaveSuccess(false), 2000)` fake save indicator | Fake Async | wire | Company |
| `web/src/app/(main)/company/page.tsx:411` | `onClick={() => alert("Job post modal opened")}` | Dead UI / Browser Alert | wire | Company |
| `web/src/app/(main)/company/page.tsx:494` | "Add Photos" button has no `onClick` or file input handler | Dead UI | wire | Company |
| `web/src/app/(main)/company/page.tsx:503-506` | 4 hardcoded Unsplash office photos | Stock Images | delete | Company |
| `web/src/app/(main)/company/page.tsx:517-526` | Mail tab renders static dummy inbox without backend integration | Dead UI / Fake Feature | flag | Company |
| `web/src/app/(main)/c/[slug]/page.tsx:24-37` | `company` hardcoded object with fake stats and phone | Hardcoded Sample Data | wire | Company |
| `web/src/app/(main)/c/[slug]/page.tsx:53` | `alert("Link copied to clipboard!")` browser alert | Dead UI / Browser Alert | wire | Company |
| `web/src/app/(main)/c/[slug]/page.tsx:117` | `<GradientRingButton size="sm">Apply</GradientRingButton>` has no `onClick` handler | Dead UI | wire | Company |
| `web/src/app/(main)/plans/page.tsx:128-135` | "Upgrade to Pro" / "Downgrade to Free" buttons lack server verification | Frontend-only Logic | wire | Plans |
| `web/src/app/(main)/plans/page.tsx:142-150` | `PaymentModal` fake timer `setTimeout(() => setStep("done"), 2000)` | Fake Async / Fake Payment | wire | Plans |
| `web/src/app/(main)/profile/page.tsx:6-21` | `MOCK_PROFILE` hardcoded object with fake bio, experience, and links | Hardcoded Sample Data | wire | Profile |
| `web/src/app/(main)/profile/page.tsx:30-31` | Profile save calls `console.log` and `setTimeout(r, 500)` without API call | Fake Async / Dead UI | wire | Profile |
| `web/src/ui/profile/ProfileEditor.tsx:166-172` | "Change photo" camera button has no `onClick` or `<input type="file">` | Dead UI | wire | Profile |
| `web/src/app/(auth)/sign-up/page.tsx:311,463,471` | Input placeholders use prototype names `Aarav Reddy` and `aarav@startup.in` | Prototype Names | delete | Auth |
| `web/src/app/(auth)/forgot-password/page.tsx:21` | `await new Promise((r) => setTimeout(r, 600))` fake async | Fake Async | wire | Auth |
| `web/src/app/(auth)/forgot-password/page.tsx:66` | Input placeholder uses `aarav@startup.in` | Prototype Names | delete | Auth |
| `web/src/app/(auth)/verify-email/page.tsx:18` | `await new Promise((r) => setTimeout(r, 600))` fake async | Fake Async | wire | Auth |
| `web/src/app/auth/callback/page.tsx:63` | `setTimeout(() => router.replace("/onboarding"), 400)` artificial redirect delay | Fake Async | wire | Auth |
| `backend/src/main/resources/application.properties:8,27,36,37` | Default placeholder credentials (`changeme`, `dev-secret-...`) | Backend Config | wire | Backend |
| `backend/src/test/java/com/founderbridge/auth/AuthServiceTest.java:53-73` | Test uses prototype name `"Aarav Reddy"` / `"aarav1234"` | Test Fixtures | wire | Backend / Tests |
| `backend/src/test/java/com/founderbridge/social/SocialServiceTest.java:41,56` | Test uses prototype names `"aarav1234"` and `"priya"` | Test Fixtures | wire | Backend / Tests |
| `audit/e2e/test-helpers.ts:20` | `callSupabaseRest` helper for end-to-end tests | Test Helpers | wire | Audit / Tests |
