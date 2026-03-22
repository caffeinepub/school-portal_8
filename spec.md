# Lord's International School Group

## Current State
Single principal login with password `principal123`. All students, notifications, and syllabus data are stored in shared localStorage keys (`lords_students`, `lords_notifications`, `lords_syllabus`). One principal controls everything.

## Requested Changes (Diff)

### Add
- 5 separate principal accounts, each with a unique name, ID, and password
- On clicking "Login as Principal", show a list of 5 principals to choose from
- Each principal gets their own isolated data namespace in localStorage (e.g. `lords_students_p1`, `lords_students_p2`, etc.)
- Each principal only sees and manages their own students, syllabus, notifications, doubt chats, and school info
- Principal accounts: Principal 1 (pass: `principal1`), Principal 2 (pass: `principal2`), Principal 3 (pass: `principal3`), Principal 4 (pass: `principal4`), Principal 5 (pass: `principal5`)

### Modify
- Login page: "Login as Principal" expands to show 5 principal options, each requiring their own password
- App.tsx: all state hooks (students, notifications, syllabus) must be keyed by active principal ID
- PrincipalDoubtChat must read/write to the correct principal's chat namespace

### Remove
- Single shared `PRINCIPAL_PASSWORD` constant replaced by per-principal passwords

## Implementation Plan
1. Define PRINCIPALS array with id, name, password (e.g. `[{id:'p1', name:'Principal 1', password:'principal1'}, ...]`)
2. In Login.tsx: expand principal login UI to show dropdown/list of 5 principals, then password entry for chosen one
3. In App.tsx: track `activePrincipalId` in state; use it to namespace all localStorage keys and pass to all principal pages
4. Ensure PrincipalDoubtChat uses the principal-scoped namespace for messages
5. Ensure each principal starts with their own copy of mock data (or empty if no data saved yet)
