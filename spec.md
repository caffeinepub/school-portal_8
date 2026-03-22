# Lord's International School Group

## Current State
The Principal panel has a read-only "School Info" page (SchoolInfo.tsx) showing the three branch details. It shares the same component with the student view and has no editing capability.

## Requested Changes (Diff)

### Add
- `PrincipalSchoolInfoEditor.tsx`: A new full-featured editor page for the Principal panel that allows:
  - Edit school group name, tagline, and "About" description
  - Add/edit/delete branch cards with name, description, and contact details
  - Upload a thumbnail/photo per branch (stored as base64 in localStorage)
  - Add custom free-text or announcement sections
  - Save all changes to localStorage; reflected in read-only SchoolInfo view

### Modify
- `App.tsx`: When principal navigates to "info", render `PrincipalSchoolInfoEditor` instead of `SchoolInfo`
- `SchoolInfo.tsx`: Read from localStorage for editable content (group name, about text, branches, custom sections, branch photos) so student/parent view reflects principal edits

### Remove
- Nothing removed

## Implementation Plan
1. Create `PrincipalSchoolInfoEditor.tsx` with tabs: Overview, Branches, Custom Sections
2. Use localStorage key `lords_school_info` for persisting all editable school info
3. Update `SchoolInfo.tsx` to merge localStorage data over defaults
4. Wire `PrincipalSchoolInfoEditor` into `App.tsx` for principal role
