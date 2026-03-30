# Lord's International School Group

## Current State
- PrincipalLayout: logout button is at the BOTTOM of sidebar (after all nav items)
- ParentLayout: logout button is in the top header bar on the right side
- Messaging: Uses localStorage events + 5-second auto-refresh, works but could be more instant
- Parent password login: 10-digit number matching, but may have string/number type mismatch bugs
- All features live: students, marks, diary, exam timetable, test marks, syllabus, doubt chat, notices, server section, auto CSV downloads

## Requested Changes (Diff)

### Add
- Logout button at the very TOP of the Principal sidebar (above all navigation sections, as the first element after the logo/school name)
- Robust instant messaging: dispatch StorageEvent immediately on every data save/send action (diary, timetable, test marks, notices, marks edits) for sub-1-second parent panel updates

### Modify
- PrincipalLayout: Move logout button from bottom footer area to top of nav (right after the logo/principal name block, before Students/School/Communication sections)
- ParentLayout: Keep logout button in header but also ensure it is visible and prominent
- Parent login password matching: fix to use strict string comparison with .toString().trim() on both sides to prevent type mismatch failures; show clear feedback on wrong password
- StudentEditPage parent password field: ensure save triggers immediate storage event broadcast so parent can log in instantly after principal saves

### Remove
- Nothing removed

## Implementation Plan
1. Edit `src/frontend/src/components/PrincipalLayout.tsx`: Move the logout button/section to the top of the Sidebar component, right after the logo block, before the nav sections
2. Edit `src/frontend/src/pages/Login.tsx`: Fix `handleParentLogin` to compare passwords as trimmed strings (`.toString().trim()`) to prevent numeric/string type mismatch
3. Edit `src/frontend/src/pages/StudentEditPage.tsx` (or wherever parent password is saved): After saving, dispatch a StorageEvent for the students key so parent login works instantly
4. Ensure all send-to-parents actions (diary, timetable, test marks, notices) fire `window.dispatchEvent(new StorageEvent(...))` immediately for instant cross-tab delivery
5. Run validation
