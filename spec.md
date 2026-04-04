# Lord's International School Group

## Current State
- Principal login works correctly via PRINCIPALS array password match
- Parent login reads `lords_parent_password_student_${id}_${principalId}` per-student keys first, then falls back to `s.parentPassword` from the student array, then ICP
- StudentEditPage has a "Save Changes" button that calls `onUpdateStudent(draft)` AND writes per-student localStorage keys separately
- The `onUpdateStudent` in App.tsx only updates React state; a useEffect auto-saves the full students array to localStorage and ICP
- Bug: When principal saves a student via StudentEditPage, the per-student key `lords_parent_password_student_${id}_${principalId}` is written directly as a string, but the student array in `lords_students_${pid}` is only updated after React re-render. If a parent logs in before the useEffect fires, or if state is stale, the passwords can be out of sync. Additionally, login checks the per-student key first — if this key exists from an old password it may shadow the new one saved into the student object.
- StudentEditPage bottom bar has "Cancel" + "Save Changes" buttons

## Requested Changes (Diff)

### Add
- "Send" button in StudentEditPage bottom bar (replaces "Save Changes"): saves student data AND explicitly broadcasts to parents via localStorage storageEvent

### Modify
- Fix parent login: unify password storage so the password saved in the student object is the single source of truth. Remove per-student localStorage key shadowing — store the password only in the student object (in `lords_students_${pid}`), and write it there explicitly on save. The login code must read from the student object consistently.
- Rename "Save Changes" → "Send" (with a Send icon) in StudentEditPage footer
- On Send: call `onUpdateStudent(draft)`, write full student array with updated password to localStorage immediately (not waiting for useEffect), dispatch storageEvent for instant parent panel refresh, show success toast "Data saved and sent to parents!"

### Remove
- Per-student password localStorage keys (`lords_parent_password_student_${id}_${principalId}` and `lords_parent_mobile_student_${id}_${principalId}`) as primary storage -- these cause stale-shadowing bugs. They can stay as write-through but login must prioritize the student object from the main array.
- Separate per-student key reads in Login.tsx's `tryMatchFromStudents` -- simplify to read only from the student's parentPassword/parentMobile fields (which are saved in the main array).

## Implementation Plan
1. **Login.tsx** `tryMatchFromStudents`: remove per-student key lookups. Compare only `s.parentPassword` and `s.parentMobile` directly (trimmed string comparison). This ensures the password in the student object is authoritative.
2. **StudentEditPage.tsx** `handleSave` → rename to `handleSend`: after calling `onUpdateStudent(draft)`, immediately update the full `lords_students_${principalId}` localStorage key with the new password embedded in the updated student, dispatch a storageEvent, and toast "Data saved and sent to parents!".
3. **StudentEditPage.tsx** bottom buttons: rename "Save Changes" to "Send" and swap icon to `Send`.
4. Validate, build, and deploy.
