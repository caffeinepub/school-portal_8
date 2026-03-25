# Lord's International School Group

## Current State
Three principal pages exist:
- PrincipalExamTimetablePage.tsx — class selector derived from existing students only
- PrincipalTestMarksPage.tsx — class selector derived from existing students only
- PrincipalDiaryPage.tsx — class selector derived from existing students only

All three use getClasses(students) which extracts unique class names from the students array. If no students are added yet, no classes appear.

## Requested Changes (Diff)

### Add
- An "Add Class" button next to the class selector in all three pages
- Inline form to type a class name and save it
- New classes stored in localStorage key lords_custom_classes_{principalId}
- Shared hook useClasses(principalId, students) merging student-derived + custom classes (deduplicated, sorted)

### Modify
- All three pages: use useClasses hook so custom classes appear in dropdowns alongside student-derived ones
- Diary filter dropdown also uses merged classes

### Remove
- Nothing

## Implementation Plan
1. Create src/frontend/src/hooks/useClasses.ts with load/save logic
2. Update PrincipalExamTimetablePage.tsx — use hook, add Add Class button/form
3. Update PrincipalTestMarksPage.tsx — same
4. Update PrincipalDiaryPage.tsx — same, update filter dropdown too
