# Lord's International School Group

## Current State

- App has a two-step login: (1) Welcome/email screen, (2) Portal screen with Principal or Parent choice.
- Parent login validates 10 digits only - no letters or special characters allowed.
- Critical bug: On a fresh/new device, parent login fails silently because student rosters in localStorage are empty until a principal logs in on that device first. ICP sync only runs when a principal is active.
- Session persists via lords_session localStorage key across browser restarts.
- No Google OAuth - just a cosmetic email field on the welcome screen.
- Logout buttons exist at top of both sidebars. Refresh button in both panel headers.

## Requested Changes (Diff)

### Add
- On parent login, after local lookup fails, fetch student roster from ICP backend for all principals before failing - so parent login works on any fresh device.
- Strong password support for parent passwords: allow letters, digits, special characters.

### Modify
- Remove the Welcome/email screen entirely. App opens directly to portal (Principal or Parent login). Delete welcome step, remove lords_user references.
- Parent login works independently of principal ever having logged in on the same device. After localStorage check fails, fetch from ICP and retry.
- Parent password field: accept any string (letters, digits, special chars), minimum 6 characters. Remove 10-digit numeric-only restriction.
- Mobile number login: keep working, remains numeric-only (phone numbers).
- When principal saves a student's parent password, sync to ICP backend immediately so fresh-device parent login works.
- Auto Password Manager: generate passwords mixing letters, digits, special characters (e.g. Lords@1234567 format).

### Remove
- Remove the Welcome/email step entirely (welcome state, email form, lords_user localStorage key).
- Remove the 10-digit regex validation for parent password on login form.
- Remove any UI hinting parent password must be exactly 10 digits.

## Implementation Plan

1. Login.tsx: Delete welcome step. Initial state = portal. Remove lords_user. Parent login: remove 10-digit regex, accept any 6+ char string. After localStorage lookup fails, call ICP actor.getData for each principal and retry match. Mobile login stays numeric.
2. StudentEditPage.tsx: Change parent password field to accept any string. Update label/placeholder. On save, sync credentials to ICP immediately.
3. App.tsx: Remove lords_user references, remove welcome-screen guard logic. Session still persists via lords_session.
4. Auto Password Manager: update generated passwords to include letters + digits + special characters.
5. Validate TypeScript build compiles cleanly.
