# Lord's International School Group

## Current State
Parent panel has tabs: Profile, Marks, Fees, Attendance, Syllabus, Notices, Media.
Principal panel has: All Students, Add Student, Edit School Info, Holidays, Syllabus, Announcements.

## Requested Changes (Diff)

### Add
- "Doubt Chat" tab in the Parent panel
- Parents can type and send messages (doubts) to the principal
- Parents can edit their already-sent messages
- Principal panel gets a "Doubt Chat" section to view all messages from all parents
- Messages stored in localStorage keyed by student id

### Modify
- ParentView: add Doubt Chat tab
- App.tsx: pass doubt chat messages state, add principal page for doubts
- PrincipalLayout: add Doubt Chat nav item

### Remove
- Nothing

## Implementation Plan
1. Create `ParentDoubtChat.tsx` - chat UI for parents to send/edit messages
2. Create `PrincipalDoubtChat.tsx` - view for principal to see all parent messages
3. Update `ParentView.tsx` to include Doubt Chat tab
4. Update `App.tsx` to add doubt chat page to principal nav
5. Update `PrincipalLayout.tsx` to add Doubt Chat nav link
