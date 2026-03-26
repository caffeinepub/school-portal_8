# Lord's International School Group

## Current State
The app has a Student interface in mockData.ts with fields: id, name, class, rollNo, dob, address, phone, email, parentName, parentPhone, bloodGroup, admissionYear, marks, fees, attendance, rank, password, parentPassword. No profilePicture field exists. Students are stored per-principal in localStorage as `lords_students_${principalId}`.

StudentEditPage.tsx already handles media (photos/videos) for students stored separately in `lords_media_${studentId}`. It has tabs including Profile, Media, Marks, etc.

ParentView.tsx shows the parent dashboard with tabs for student info, marks, fees, attendance, media, diary, doubt chat, exam timetable, test marks.

## Requested Changes (Diff)

### Add
- `profilePicture?: string` field to Student interface in mockData.ts (stored as base64 data URL)
- Profile picture upload/edit UI in StudentEditPage.tsx Profile tab: circular avatar with a camera/edit icon overlay, clicking opens file input
- Profile picture display at the top of ParentView.tsx dashboard as a large circular avatar with student name below it
- Small circular thumbnail in PrincipalClassView.tsx student list next to each student name
- Small circular thumbnail in PrincipalDashboard.tsx student list next to each student name

### Modify
- Student interface to include optional `profilePicture?: string`
- StudentEditPage Profile tab: add photo upload at top of the tab
- ParentView: add profile picture avatar at the top of the dashboard header area
- PrincipalClassView: show small avatar thumbnail in student rows
- PrincipalDashboard: show small avatar thumbnail in student rows

### Remove
- Nothing

## Implementation Plan
1. Add `profilePicture?: string` to Student interface in mockData.ts
2. In StudentEditPage.tsx Profile tab, add a circular avatar upload component at the top. On file select, read as base64 and save to student's profilePicture field via the existing student update mechanism
3. In ParentView.tsx, add a prominent circular avatar at the top of the parent dashboard showing the child's profilePicture (or initials fallback)
4. In PrincipalClassView.tsx student list rows, add a small 32px circular avatar thumbnail next to each student name
5. In PrincipalDashboard.tsx student list, add a small 32px circular avatar thumbnail next to each student name
6. Profile pictures are stored as part of the student object in localStorage (same save mechanism already in place)
