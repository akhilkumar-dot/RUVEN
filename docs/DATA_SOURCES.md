# Ruven Data Sources & Architecture Mapping (Batch 2)

> Definitive screen-by-screen contract mapping every UI element to its real API/Supabase queries, database tables and columns, user scoping rules, and empty state behaviors.
> Zero fake data, zero decorative numbers, server is the source of truth.

---

## 1. Global Navigation & Badges (`TopBar`, `NavDrawer`, `BottomDock`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| User Avatar & Display Name | `supabase.auth.getUser()` + `users` table | `users.name`, `users.avatar_url`, `users.user_handle` | Signed-in user (`id = auth.uid()`) | Fallback initials derived from `user.name` or `user.email` |
| Account Class / Role Badge | `users.type` / `users.role` | `users.type` (`INDIVIDUAL`, `STARTUP_FOUNDER`, `COMPANY_OWNER`, `INVESTOR`) | Signed-in user | Selected class from onboarding |
| Messages Unread Count | `chat_messages` count unread | `chat_messages` where `sender_id != auth.uid()` minus `chat_message_reads` | Signed-in user's active rooms | Badge hidden when count is 0 |
| Notifications Unread Count | `connections` pending requests count | `connections` where `addressee_id = auth.uid()` and `status = 'PENDING'` | Signed-in user | Badge hidden when count is 0 |
| Bottom Navigation Tabs | Static routing system | Next.js routes (`/home`, `/discover`, `/hub`, `/ideas`, `/meetups`) | All users | Persistent dock across main screens |

---

## 2. Home Screen (`/home`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Daily Role Quote | `system_quotes` | `system_quotes.quote`, `system_quotes.author`, `system_quotes.role_type` | User's role class | Curated system quote per role class |
| Network Connections Stat | `connections` count | `connections` count where (`requester_id = auth.uid()` OR `addressee_id = auth.uid()`) and `status = 'ACCEPTED'` | Signed-in user | `0` with "Build network" action |
| Feed Posts Published Stat | `posts` count | `posts` count where `author_id = auth.uid()` and `deleted_at IS NULL` | Signed-in user | `0` with "Create post" action |
| Profile Completeness Stat | `profiles` computed fields | Non-null count of (`bio`, `headline`, `location`, `skills`, `photo_url`) in `profiles` | Signed-in user | Real percentage (e.g., `20%`–`100%`) |
| Upcoming RSVPs Stat | `meetup_rsvps` count | `meetup_rsvps` joined with `meetups` where `event_at >= NOW()` | Signed-in user | `0` with "Explore meetups" action |
| Sponsored Ecosystem Ad | `ads` active query | `ads.*` where `status = 'ACTIVE'` and `expires_at > NOW()` limit 1 | Global public active ads | Widget cleanly hidden if no active ad exists |
| Today's Meetups Widget | `meetups` upcoming query | `meetups.*` where `event_at >= CURRENT_DATE` order by `event_at ASC` limit 2 | Global scheduled meetups | "No meetups scheduled today. Host one!" |
| Community Feed Posts | `posts` joined with `users` & `profiles` | `posts.*`, `users.name`, `users.user_handle`, `users.avatar_url`, `profiles.headline` | Public community posts | "No posts in the feed yet. Share an update to get started." |
| Feed Post Like Status | `post_likes` | `post_likes.id` where `user_id = auth.uid()` and `post_id = posts.id` | Signed-in user | Unliked (outline heart) |
| Create Post Action | `supabase.from('posts').insert(...)` | `posts.id`, `posts.author_id`, `posts.body`, `posts.visibility` | Signed-in user | Refreshes feed with live newly created post |

---

## 3. Discover Screen (`/discover`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| People Tab | `users` joined with `profiles` | `users.id`, `users.name`, `users.user_handle`, `users.type`, `profiles.headline`, `profiles.location`, `profiles.skills` | All users except signed-in user | "No people found matching your search." |
| Companies Tab | `companies` query | `companies.*` where `status = 'PUBLISHED'` or `status = 'ACTIVE'` | Public published companies | "No verified companies listed yet. Register yours." |
| Investors Tab | `investor_profiles` joined with `users` & `profiles` | `investor_profiles.*`, `users.name`, `users.user_handle`, `profiles.location` | Registered investors | "No investors registered in this sector yet." |
| Jobs Tab | `jobs` joined with `companies` | `jobs.*`, `companies.name`, `companies.location` where `jobs.status = 'ACTIVE'` | Active job listings | "No open positions right now. Post an opening." |
| Connect Action | `supabase.from('connections').insert(...)` | `connections.requester_id`, `connections.addressee_id`, `status: 'PENDING'` | Signed-in user to addressee | Button updates to "Pending" |
| Request Intro Action | `supabase.from('connections').insert(...)` with note | `connections.note`, `status: 'PENDING'` | Signed-in user to investor | Button updates to "Requested" |
| Apply Job Action | `supabase.from('applications').insert(...)` | `applications.job_id`, `applications.applicant_id`, `status: 'PENDING'` | Signed-in user to job | Button updates to "Applied" |

---

## 4. Founders Hub (`/hub`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Founders List | `users` joined with `profiles` | `users.*`, `profiles.*` where `users.type = 'STARTUP_FOUNDER'` (or all founders) | Community founders excluding self | "No founders found. Invite your fellow entrepreneurs." |
| Connection Status Button | `connections` lookup | `connections.status` between `auth.uid()` and target `user_id` | Signed-in user relationship | "Connect", "Pending", or "Connected" |
| Filter by City / Sector | In-memory filtering of real rows | `profiles.location`, `profiles.headline`, `profiles.skills` | Active filter selection | Empty search state with clear button |

---

## 5. Ideas Incubator (`/ideas`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Ideas Feed | `ideas` joined with `users` (author) | `ideas.id`, `ideas.title`, `ideas.description`, `ideas.looking_for`, `ideas.tags`, `ideas.upvote_count`, `ideas.created_at` | Active ideas where `deleted_at IS NULL` | "No startup ideas posted yet. Post the first idea!" |
| Upvote Status & Count | `idea_upvotes` check & `ideas.upvote_count` | `idea_upvotes` where `user_id = auth.uid()` and `idea_id = ideas.id` | Signed-in user | Upvoted state (filled icon) vs unvoted |
| Upvote / Downvote Action | `insert` or `delete` on `idea_upvotes` + increment count | `idea_upvotes`, `ideas.upvote_count` | Signed-in user | Instant optimistic update with DB sync |
| Post New Idea Action | `supabase.from('ideas').insert(...)` | `ideas.title`, `ideas.description`, `ideas.looking_for`, `ideas.tags`, `author_id: auth.uid()` | Signed-in user | Idea prepends immediately to feed |
| Collaborate Action | Direct message room creation | `chat_rooms`, `chat_room_members`, `chat_messages` | Signed-in user and idea author | Navigates directly into active chat room |

---

## 6. Meetups & Mixers (`/meetups`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Upcoming Meetups Feed | `meetups` joined with `users` (organiser) | `meetups.*`, `users.name`, `users.avatar_url` where `event_at >= NOW()` | Scheduled public meetups | "No upcoming meetups scheduled. Host a meetup!" |
| My RSVPs Tab | `meetup_rsvps` joined with `meetups` | `meetup_rsvps.*`, `meetups.*` | Signed-in user (`user_id = auth.uid()`) | "You have not RSVP'd to any meetups yet." |
| Hosting Tab | `meetups` where `organiser_id = auth.uid()` | `meetups.*` | Signed-in user's hosted meetups | "You haven't hosted any meetups yet. Host one!" |
| RSVP Action | `supabase.from('meetup_rsvps').insert(...)` | `meetup_rsvps.meetup_id`, `meetup_rsvps.user_id` | Signed-in user | Toggle RSVP state and update attendee count |
| Host Meetup Action | `supabase.from('meetups').insert(...)` | `meetups.title`, `meetups.description`, `meetups.location`, `meetups.event_at`, `meetups.link`, `organiser_id` | Signed-in user | Appears immediately in Upcoming and Hosting tabs |

---

## 7. Direct Messages (`/messages`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Conversations List | `chat_room_members` joined with `chat_rooms` and counterpart `users` | `chat_rooms.*`, `users.name`, `users.avatar_url`, `users.user_handle` | Signed-in user's member rooms | "No conversations yet. Connect with someone in the Hub." |
| Active Room Chat History | `chat_messages` ordered by `created_at ASC` | `chat_messages.id`, `chat_messages.sender_id`, `chat_messages.body`, `chat_messages.created_at` | Active room members | "Say hello! Start the conversation." |
| Send Message Action | `supabase.from('chat_messages').insert(...)` | `chat_messages.room_id`, `chat_messages.sender_id`, `chat_messages.body`, `status: 'SENT'` | Signed-in user | Live message rendered via Realtime subscription |
| Mark As Read Action | `supabase.from('chat_message_reads').upsert(...)` | `chat_message_reads.message_id`, `chat_message_reads.user_id`, `read_at: NOW()` | Signed-in user | Decrements global unread badge |

---

## 8. Workspace Docs (`/workspace`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| User Documents List | `workspace_docs` | `workspace_docs.id`, `workspace_docs.title`, `workspace_docs.body`, `workspace_docs.emoji`, `workspace_docs.updated_at` | Signed-in user (`owner_id = auth.uid()`) | "No documents yet. Create your first doc from a template." |
| Create Doc from Template | `supabase.from('workspace_docs').insert(...)` | `workspace_docs.owner_id`, `workspace_docs.title`, `workspace_docs.body`, `workspace_docs.emoji`, `word_count` | Signed-in user | Adds live doc and opens full editor modal |
| Save Doc Action | `supabase.from('workspace_docs').update(...)` | `workspace_docs.title`, `workspace_docs.body`, `workspace_docs.updated_at`, `word_count` | Owner (`owner_id = auth.uid()`) | Real-time persistence indicator |
| Delete Doc Action | `supabase.from('workspace_docs').delete(...)` | `workspace_docs.id` where `owner_id = auth.uid()` | Signed-in user | Removes from workspace list |

---

## 9. Profile & Public Pages (`/profile`, `/u/[handle]`, `/company`, `/c/[slug]`)

| UI Element | Source / Query | DB Table & Columns | Scoped To | Empty / Default State |
|---|---|---|---|---|
| Profile Editor Fields | `profiles` joined with `users` | `profiles.bio`, `headline`, `location`, `skills`, `education`, `experience`, `links`, `photo_url` | Signed-in user | Editable placeholders prompting user details |
| Save Profile Changes | `supabase.from('profiles').upsert(...)` | `profiles.user_id = auth.uid()`, updated fields | Signed-in user | Instant DB write with toast confirmation |
| Public User View (`/u/[handle]`) | `users` joined with `profiles` | `users.name`, `users.avatar_url`, `profiles.*` where `user_handle = [handle]` | Public URL | 404 Not Found if handle does not exist |
| Company Dashboard (`/company`) | `companies` where `owner_id = auth.uid()` | `companies.*` | Signed-in company owner | "No company profile created yet. Create one now." |
| Publish Company Toggle | `supabase.from('companies').update({ status: 'PUBLISHED' })` | `companies.status` | Company owner | Live status badge toggle |
| Public Company View (`/c/[slug]`) | `companies` where `slug = [slug]` and `status = 'PUBLISHED'` | `companies.*`, joined `jobs` where `status = 'ACTIVE'` | Public URL | 404 Not Found if slug does not exist or is unpublished |
