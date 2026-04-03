# Lord's International School Group — Version 69

## Current State

The app is a full-stack school management portal for Lord's International School Group with:
- 5 principal accounts (Churu, Sadulpur, Taranagar, Principal 4, Principal 5) with hardcoded passwords
- A parent portal accessible via 10-digit password or mobile number set per student by principal
- State-driven SPA (no URL router) — role/page state controls rendering
- All data stored in localStorage, synced to ICP backend via `actor.setData/getData`
- ParentView has 11 tabs: profile, marks, fees, attendance, syllabus, notices, media, doubt-chat, diary, exam-timetable, test-marks
- StudentEditPage has password and mobile fields with Copy/WhatsApp Share buttons
- Auto Password Manager generates unique 10-digit passwords for all students at once
- Parent login checks both `lords_parent_password_student_{id}_{pid}` override key and student object field
- Parent panel auto-refreshes via 3s interval + storage events for sub-second updates
- Session persisted in `lords_session` localStorage key
- Backend: `setData/getData` generic KV store, plus media/blob storage

## Requested Changes (Diff)

### Add
- Completely rebuilt Parent Portal (ParentView) with a fresh, professional, mobile-responsive design
- Clean, dedicated parent login screen: single input field for password/mobile number, prominent school logo/name, clear error feedback, fast matching
- "Send to Parent Portal" button in StudentEditPage next to the password field — opens a share sheet / copies credentials with a friendly message
- Security visual indicators in parent portal (locked icon, secure session badge)
- Better credential display in Student Management — show password and mobile clearly with dedicated "Send Credentials" button that composes a WhatsApp message with both login methods

### Modify
- Parent login UI: redesign to be cleaner, faster, more mobile-friendly — large input field, clear CTA button, logo at top
- ParentView UI: full redesign — modern card-based layout, improved tab navigation, student profile header, better data presentation for marks/fees/attendance
- StudentEditPage Profile tab: improve password/mobile credential section — group them together under "Parent Login Credentials" heading, add "Send to Parent Portal" action button
- All parent panel tabs: make fully mobile-responsive, improve typography and spacing
- Logout button stays at top of sidebar in both panels
- Refresh button stays in top header with "Last updated" timestamp

### Remove
- No features removed — all existing functionality (marks, fees, attendance, syllabus, diary, exam timetable, test marks, notices, doubt chat, media, server section, auto CSV download, class records, data backup, data server, error fix) must be preserved exactly

## Implementation Plan

1. **ParentView.tsx** — Complete UI redesign:
   - New student profile header card: profile picture, name, class, roll number, school name
   - Tab navigation redesign: horizontal scrollable tabs on mobile, icon+label tabs
   - Marks tab: styled grade card with color-coded grades, total/rank prominently displayed
   - Fees tab: clean card list with status badges (Paid/Due/Overdue)
   - Attendance tab: improved grid with month/date grouping, percentage summary card
   - Syllabus tab: accordion-style subject/chapter list
   - Notices tab: timeline-style notice cards with category badges
   - Media tab: improved grid layout, full-screen preview capability
   - Diary tab: date-grouped card list
   - Exam Timetable tab: table with date/subject/time
   - Test Marks tab: card with marks table

2. **Login.tsx** — Parent login screen redesign:
   - School logo/name centered at top
   - Single large input field: "Enter your 10-digit password or mobile number"
   - Auto-format: digits only, max 10
   - Login button with loading state
   - Clear error: "Password not found. Please check your credentials or contact the school."
   - Back button to return to portal selection
   - School information shown below login form

3. **StudentEditPage.tsx** — Credential section enhancement:
   - Group parentPassword and parentMobile under "Parent Login Credentials" section header
   - Add "Send to Parent Portal" button that triggers WhatsApp share with a complete message:
     "Your ward [Name] ([Class])'s parent login credentials:\nPassword: [pwd]\nMobile: [mobile]\nLogin at: [app URL]"
   - Keep existing Copy buttons for each field

4. **ParentLayout.tsx** — Keep logout button at top of sidebar, refresh in header

5. All existing principal panel pages preserved as-is (StudentEditPage, PrincipalDashboard, etc.)

6. Backend: no changes needed — `setData/getData` already handles all data sync
