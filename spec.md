# Lord's International School Group

## Current State
The app has a Principal panel with multiple sections: Diary, Exam Timetable, Test Marks, Send Message to Parents. Each has a "Send to Parents" or "Save" button that saves data to localStorage. No automatic file download occurs when the principal sends data.

## Requested Changes (Diff)

### Add
- A `downloadCSV(filename, rows)` utility function that triggers a browser CSV file download
- Auto-download CSV when principal clicks "Save & Send to Class" in Diary page
- Auto-download CSV when principal clicks "Save Timetable" in Exam Timetable page
- Auto-download CSV when principal clicks "Save & Send to Parents" in Test Marks page
- Auto-download CSV when principal clicks "Send to All Parents" in Send Message page

### Modify
- `PrincipalDiaryPage.tsx`: After saving diary entry, trigger a CSV download containing date, class, and subject-wise homework rows. Filename: `Diary_Class{class}_{date}.csv`
- `PrincipalExamTimetablePage.tsx`: After saving timetable, trigger a CSV download containing all rows (examName, subject, date, day, time, venue). Filename: `ExamTimetable_{class}_{date}.csv`
- `PrincipalTestMarksPage.tsx`: After saving marks, trigger a CSV download with student names and their marks per subject. Filename: `TestMarks_{class}_{examName}_{date}.csv`
- `PrincipalSendMessagePage.tsx`: After sending message, trigger a CSV download containing category, title, message, and date. Filename: `Notice_{category}_{date}.csv`

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/utils/downloadCSV.ts` with a reusable `downloadCSV(filename: string, headers: string[], rows: string[][])` function
2. Import and call `downloadCSV` in each of the 4 principal pages after the existing save/send logic
3. Each download triggers automatically (no extra button needed) -- browser shows the standard "Save file" prompt / saves to Downloads
4. Filenames include class name and current date for easy identification on Windows and mobile
