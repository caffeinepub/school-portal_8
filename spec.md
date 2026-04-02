# Lord's International School Group

## Current State
The Principal panel's Student Management (PrincipalDashboard) shows a list of students with edit, rank, and filter options. Each student has a `parentPassword` field (10-digit numeric) and a `password` field. Principals currently must open each student's edit page individually to set or change their parent login password.

## Requested Changes (Diff)

### Add
- A prominent "Auto Generate Passwords" button in the Student Management list header (near the existing Rank by Marks button).
- Clicking this button generates a unique random 10-digit numeric password for EVERY student in the current principal's student list (no two students get the same password).
- A confirmation dialog before running, showing how many students will be updated.
- After generation, a success toast showing "Passwords generated for X students".
- All generated passwords are saved to localStorage immediately (same as manual save).
- A download/export button (optional) to get a CSV list of student names + generated passwords for easy sharing.

### Modify
- PrincipalDashboard component: add the Auto Generate Passwords button and its handler.
- App.tsx: expose `onAutoGeneratePasswords` prop to PrincipalDashboard so it can update all students at once.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `generateUniquePasswords(count: number): string[]` utility — generates `count` unique random 10-digit numeric strings.
2. Add `onAutoGeneratePasswords` callback prop to PrincipalDashboard.
3. Add "Auto Generate Passwords" button with confirmation AlertDialog in the PrincipalDashboard header toolbar.
4. On confirm: call the callback which updates all students with new unique passwords and saves to storage.
5. Show success toast with count + option to download a CSV of name/password pairs.
6. In App.tsx: wire up the handler to update students state and persist to localStorage + ICP backend.
