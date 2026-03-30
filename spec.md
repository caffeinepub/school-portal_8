# Lord's International School Group

## Current State
Fresh rebuild — no existing source files. Previous version had ICP backend with 503 errors and data not persisting. All data was falling back to localStorage. Rebuilding with a properly structured Motoko backend that actually stores and retrieves data.

## Requested Changes (Diff)

### Add
- Motoko backend with stable storage for all school data (students, marks, fees, attendance, syllabus, diary, notices, exam timetable, test marks, doubt chat, media metadata, school info)
- Multi-principal support: 5 principals with isolated data stores
- Google account sign-in on landing page (email-based, no Internet Identity)
- Permanent principal and parent sessions (persisted in localStorage, cleared only on explicit logout)
- Logout buttons in both Principal and Parent panels
- Fast broadcast messaging: principals send notices/diary/announcements that all parents of that school can read instantly via polling
- ICP Canister ID display in Server section with direct link to backend
- All principal dashboard features: student management, marks, fees, attendance, syllabus (class-wise), diary (class-wise), exam timetable, test marks, notices, doubt chat, profile pictures, school info editor
- All parent dashboard features: view-only child info, marks, fees, attendance, syllabus, diary, exam timetable, test marks, notices, media, doubt chat
- Server section: Data Server (CSV download), Data Backup (auto-save/download/restore), Storage & Backup, Error Fix, Class Records archive
- Auto CSV download when principal sends data to parents
- Class Records archive auto-saving all sent data organized by class
- Rank by Marks feature with leaderboard
- Parent password: 10-digit numeric, unlimited edits, set by principal
- Profile pictures for students

### Modify
- N/A (fresh build)

### Remove
- Internet Identity login (replaced with Google/email sign-in)
- Example/demo students

## Implementation Plan
1. Motoko backend: stable vars for all data, update/query functions for students, marks, fees, attendance, syllabus, diary, notices, exam timetable, test marks, doubt chat, school info, media metadata — keyed by principalId
2. Frontend: Google-style email sign-in → portal → principal login (password) or parent login (10-digit code) → respective dashboards
3. All data reads/writes go through backend canister calls
4. Notices and diary use a simple append-only list per school+class, parents poll every 5s for fast updates
5. Server section shows process.env canister ID and links
6. Auto CSV download on all send-to-parents actions
