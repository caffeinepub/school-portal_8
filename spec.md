# Lord's International School Group

## Current State
Full school management portal with Principal and Parent panels. Both panels have logout buttons at the top of the sidebar. Parent login uses a 10-digit password set by the principal per student. Parent sessions persist. Real-time sync via localStorage events with 3-second polling backup. App has a Server section with Data Server, Data Backup, Storage & Backup, Error Fix, and Class Records.

## Requested Changes (Diff)

### Add
- Refresh button in the top header bar (top-right area) of both Principal panel and Parent panel. Shows a spinner while refreshing. Displays a "Last updated" timestamp after refresh.
- "Copy Password" button next to each student's parent password field in the Student Management / Student Edit page (Profile tab). One click copies the password to clipboard for easy WhatsApp/SMS sharing.

### Modify
- Parent login: ensure the same 10-digit password works from multiple devices simultaneously (no device restriction). Currently this should already be the case since passwords are stored in localStorage keyed by student, but verify login logic doesn't block concurrent logins.
- Parent panel header: add the Refresh button alongside the page title.
- Principal panel header: add the Refresh button alongside the page title.

### Remove
- Nothing removed.

## Implementation Plan
1. Add a `RefreshButton` component (inline or small reusable) to PrincipalLayout and ParentLayout headers — top-right area. On click, reload student data from localStorage (and ICP backend if available), show spinner, then update "Last updated" timestamp.
2. In StudentEditPage Profile tab, add a "Copy Password" button (copy icon + "Copy") next to the parent password input. Use `navigator.clipboard.writeText()` with a brief "Copied!" confirmation state.
3. Verify parent login in Login.tsx allows same password from any device (no device fingerprinting or single-session lock) — fix if needed.
4. Keep all existing features intact.
