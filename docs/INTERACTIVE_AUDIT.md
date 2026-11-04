# Ruven Interactive UI & Action Audit (Batch 4)

## Overview
This document audits every interactive element (button, link, toggle, input, modal trigger) across the Ruven web application, confirming end-to-end functionality with Supabase Postgres. Every fake delay, mock toast, and browser `alert()` has been eliminated.

---

## 1. Top Navigation & Global Elements

| Element | Location | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|---|
| Ruven Logo | TopBar (all screens) | Navigates to `/home` | Next.js `<Link href="/home">` | Verified Real |
| Unread Badge (Bell) | TopBar | Displays pending connection requests count | `dataService.fetchUnreadCounts(userId)` | Verified Real |
| Notification Drawer Toggle | TopBar | Toggles sliding notification drawer | State toggle + Supabase pending connections query | Verified Real |
| Menu (Hamburger) | TopBar | Opens full drawer navigation | Drawer overlay state | Verified Real |
| Bottom Dock Tabs | BottomDock (mobile/desktop) | Navigates to `/home`, `/discover`, `/hub`, `/ideas`, `/meetups`, `/messages`, `/workspace`, `/company`, `/profile` | Next.js `<Link>` | Verified Real |
| Sign Out Button | NavDrawer | Clears auth session and redirects | `useAuthStore.signOut()` + `supabase.auth.signOut()` | Verified Real |

---

## 2. Home Feed (`/home`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Role Switcher Tabs | Founder, Investor, Talent | Updates active role in `useAuthStore` | Verified Real |
| Daily Quote Card | Inspires founder based on chosen role | `dataService.fetchDailyQuote(role)` with fallback | Verified Real |
| Post Composer Textarea & Submit | Posts new update to feed | `dataService.createFeedPost(userId, body)` | Verified Real |
| Like Button (Heart) | Increments like count and toggles like state | `dataService.togglePostLike(postId, userId, currentlyLiked)` | Verified Real |
| Onboarding Checklist Items | Navigates to complete profile, explore discover, create meetup, etc. | Next.js router / Link | Verified Real |
| Meetup Widget Card | Direct RSVP or view meetup | `dataService.toggleRsvp` / Link to `/meetups` | Verified Real |
| Sponsored Ecosystem Ad | External or internal platform link | Real `ads` table row query | Verified Real |

---

## 3. Discover (`/discover`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Sub-tabs (People, Companies, Investors, Jobs) | Filters directory by entity type | Local state tab filter | Verified Real |
| Search Input | Queries entity name, headline, skills, industry | `dataService.fetchDiscoverPeople(search, ...)` via Supabase `.ilike` | Verified Real |
| Connect Button (People Tab) | Sends/withdraws connection request | `dataService.toggleConnection(requesterId, addresseeId, isConnected)` | Verified Real |
| View Profile Link (`/u/[handle]`) | Opens public profile of user | Next.js `<Link href="/u/${handle}">` | Verified Real |
| View Company Link (`/c/[slug]`) | Opens public company page | Next.js `<Link href="/c/${slug}">` | Verified Real |
| Request Intro Button (Investors Tab) | Opens intro modal & sends direct chat intro | `dataService.requestInvestorIntro(userId, investorId, note)` | Verified Real |
| Apply Now Button (Jobs Tab) | Submits candidate job application | `dataService.applyToJob(jobId, userId)` | Verified Real |

---

## 4. Founders Hub (`/hub`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Search Input | Searches founders by name, handle, headline, skills | `dataService.fetchFounders({ search, sector })` | Verified Real |
| Sector Filter Badges | Filters founders by sector tag | `dataService.fetchFounders({ sector })` | Verified Real |
| Connect Button | Sends/withdraws connection request | `dataService.toggleConnection` | Verified Real |
| Message Button | Opens direct chat room | `dataService.getOrCreateDirectRoom` + router push `/messages?room=${roomId}` | Verified Real |

---

## 5. Ideas Hub (`/ideas`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Category Filter Tabs | Filters ideas by industry/domain | Supabase query with category filter | Verified Real |
| Post Idea Button | Opens modal to post title, description, category, tags | `dataService.createIdea(authorId, ideaData)` | Verified Real |
| Upvote Button (Flame) | Upvotes or revokes upvote on idea | `dataService.toggleIdeaUpvote(ideaId, userId, hasUpvoted)` | Verified Real |
| Collaborate Button | Opens collaboration modal and initiates direct chat | `dataService.createDirectChat(userId, authorId, note)` | Verified Real |

---

## 6. Meetups (`/meetups`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Tab Switcher (Upcoming, My RSVPs, Hosting) | Switches between public feed, attendee list, host list | `dataService.fetchMeetups`, `fetchUserRsvps`, `fetchUserOrganisedMeetups` | Verified Real |
| Host Meetup Button | Opens host modal with title, date, location, capacity, agenda | `dataService.createMeetup(hostId, meetupData)` | Verified Real |
| RSVP / Cancel RSVP Button | Inserts or deletes row from `meetup_rsvps` | `dataService.toggleRsvp(meetupId, userId, hasRsvped)` | Verified Real |

---

## 7. Messages (`/messages`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Conversation List Item | Selects active conversation room | Sets `selectedId`, loads thread | Verified Real |
| Message Input Textarea & Send | Persists message to DB & receives via Realtime | `dataService.sendMessage(roomId, senderId, text)` + Supabase Realtime channel | Verified Real |
| View Profile Button in Header | Navigates to user profile `/u/[handle]` | Next.js `<Link href="/u/${handle}">` | Verified Real |
| Back Button (Mobile) | Returns from thread to conversation list | Clears `selectedId` | Verified Real |

---

## 8. Workspace (`/workspace`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| New Doc Button | Opens document editor for a new doc | Opens `DocEditor` | Verified Real |
| Use Template Button | Creates roadmap or architecture doc from template | Pre-fills title and markdown body | Verified Real |
| Doc Card | Opens existing document for reading and editing | Opens `DocEditor` with doc state | Verified Real |
| Doc Save Button | Persists document title, body, emoji, word count | `dataService.saveDoc(ownerId, docData)` | Verified Real |
| Doc Delete Button | Removes document from database | `dataService.deleteDoc(docId, ownerId)` | Verified Real |

---

## 9. Company Page (`/company`) & Public Page (`/c/[slug]`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Register Company Form | Creates new company profile for current user | `dataService.saveCompany(ownerId, companyData)` | Verified Real |
| Edit Page Form & Save Button | Updates company metadata | `dataService.saveCompany(ownerId, updates)` | Verified Real |
| Publish / Unpublish Toggle | Validates required fields and toggles `PUBLISHED`/`DRAFT` | `dataService.saveCompany` with validation modal | Verified Real |
| Post a Job Button & Modal | Creates new job posting in `jobs` table | `dataService.createJob(companyId, jobData)` | Verified Real |
| Application Status Dropdown | Updates candidate status (NEW, REVIEWING, ACCEPTED, REJECTED) | `dataService.updateApplicationStatus(appId, status)` | Verified Real |
| Public Apply Button (`/c/[slug]`) | Submits candidate application to job | `dataService.applyToJob(jobId, userId)` | Verified Real |

---

## 10. Profile (`/profile`) & Public User (`/u/[handle]`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Edit Profile Button | Enters edit mode on personal profile | Local state in `ProfileEditor` | Verified Real |
| Save Profile Button | Saves bio, headline, skills, location, education, experience | `dataService.updateProfileData(userId, profileUpdates)` | Verified Real |
| Public Connect Button | Connects or disconnects from target user | `dataService.toggleConnection(currentUser, targetUser)` | Verified Real |
| Public Message Button | Initiates direct chat and redirects to messages | `dataService.getOrCreateDirectRoom` + router push `/messages?room=${roomId}` | Verified Real |
| Share Profile Button | Copies public profile URL to clipboard with inline feedback | `navigator.clipboard.writeText` | Verified Real |

---

## 11. Plans & Verification (`/plans`)

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Inquire for Pro Upgrade Button | Opens direct email draft to Ruven team with user handle | `mailto:team@ruven.in?subject=...` | Verified Real |
| Back to Home Link | Navigates back to main feed | Next.js `<Link href="/home">` | Verified Real |

---

## 12. Authentication Pages

| Element | Action / Destination | API / State Handler | Real Status |
|---|---|---|---|
| Sign In Form | Signs in with email & password | `supabase.auth.signInWithPassword` | Verified Real |
| Sign Up Form | Creates account and creates `users` + `profiles` rows | `supabase.auth.signUp` | Verified Real |
| Forgot Password Form | Sends password reset email | `supabase.auth.resetPasswordForEmail` | Verified Real |
| Verify Email Resend Button | Resends verification email | `supabase.auth.resend` | Verified Real |
