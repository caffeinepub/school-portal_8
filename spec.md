# Lord's International School Group

## Current State
- Principal can edit student info and it saves to localStorage under `lords_students_${principalId}`
- Parent panel reads student data at login time via `loadStorage` in App.tsx render, but once logged in there is no live refresh — changes made by principal are NOT reflected in parent panel without a page refresh
- Notifications exist but there is no quick "Send Message to Parents" UI in principal panel for common topics (fees, marks, syllabus, announcements, holidays)
- Syllabus page is class-wise but requires manually adding each class via a dialog — no pre-populated class list

## Requested Changes (Diff)

### Add
- **Live parent data refresh**: parent panel auto-refreshes student data from localStorage every 5 seconds using `setInterval`, so changes by principal appear in parent panel without manual page reload
- **Storage event listener**: also listen for `window.storage` events to catch cross-tab updates instantly
- **Quick Message / Send to Parents panel** in Principal sidebar (new page `send-message`): principal can compose a message with a category (Fees, Marks, Syllabus, Announcement, Holiday, General) and send it — it stores as a notification in `lords_notifications_${principalId}` and parents see it in the Notices tab instantly
- **Pre-populated class list in Syllabus**: classes 1 through 12 (Class 1, Class 2 ... Class 12) plus standard secondary classes (9-A, 9-B, 10-A, 10-B, 11-A, 11-B, 11-Science, 11-Commerce, 12-A, 12-B, 12-Science, 12-Commerce) are pre-listed so principal just selects a class and writes the syllabus — no need to "Add Class" first (Add Class button can still exist to add custom classes)

### Modify
- `App.tsx`: in the parent role section, replace the one-time `loadStorage` student lookup with reactive state that auto-refreshes every 5 seconds from localStorage, so when principal edits a student the parent sees updates live
- `PrincipalLayout`: add "Send Message" to the sidebar navigation under a "Communication" section
- `PrincipalSyllabusPage`: pre-populate `syllabus` state with all standard class keys (Class 1 through 12 + 9-A, 10-A etc.) if they don't already exist, so they appear immediately in the dropdown without manually adding
- `App.tsx` `loadSyllabus`: initialize with standard class keys if no data exists (instead of falling back to mockSyllabus which may not have class-wise structure)

### Remove
- Nothing removed

## Implementation Plan
1. In `App.tsx`, add a `useEffect` inside the parent role branch that sets up a `setInterval` (5s) and `storage` event listener to reload the student from `lords_students_${parentPrincipalId}` and update local state
2. Create `src/frontend/src/pages/PrincipalSendMessagePage.tsx` — a form with: message title, message body (textarea), category selector (Fees/Marks/Syllabus/Announcement/Holiday/General), send button. On send: prepend to `lords_notifications_${principalId}` in localStorage and call the parent setState
3. Add `send-message` to the `PrincipalPage` type and sidebar nav in `PrincipalLayout.tsx`
4. Wire `send-message` page in `App.tsx` principal routing
5. In `App.tsx` `loadSyllabus`, after loading, merge in default class keys for classes that don't exist yet
6. In `PrincipalSyllabusPage`, ensure all standard classes are shown in the dropdown by pre-seeding via `setSyllabus` on mount if missing
