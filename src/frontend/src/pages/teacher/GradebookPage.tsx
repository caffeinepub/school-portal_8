import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOLS } from "@/data/schools";
import { Award, Download, Loader2, Plus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentRecord {
  id: number;
  name: string;
  class: string;
  rollNo?: number;
}

interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtained: number;
}

interface StudentMarkEntry {
  studentId: number;
  subjects: SubjectMark[];
}

interface SavedExam {
  id: string;
  examName: string;
  class: string;
  date: string;
  subjects: string[];
  entries: StudentMarkEntry[];
  savedAt: string;
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const TEAL = "oklch(var(--portal-teachers))";
const TEAL_BG = "oklch(var(--portal-teachers) / 0.1)";
const TEAL_BORDER = "oklch(var(--portal-teachers))";

function calcGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  if (pct >= 33) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "oklch(0.45 0.16 150)";
  if (grade === "B") return "oklch(0.55 0.16 150)";
  if (grade === "C" || grade === "D") return "oklch(0.62 0.18 55)";
  return "oklch(0.55 0.22 25)";
}

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
];

interface Props {
  schoolId: string;
}

export default function GradebookPage({ schoolId }: Props) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const students = loadStorage<StudentRecord[]>(
    `lords_students_${schoolId}`,
    [],
  );
  const classOptions = [...new Set(students.map((s) => s.class))].sort();

  const [tab, setTab] = useState<"entry" | "view">("entry");
  const [selectedClass, setSelectedClass] = useState(classOptions[0] ?? "");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [subjects, setSubjects] = useState<string[]>([...DEFAULT_SUBJECTS]);
  const [maxMarks, setMaxMarks] = useState<Record<string, number>>({});
  const [marksData, setMarksData] = useState<
    Record<number, Record<string, number>>
  >({});
  const [saving, setSaving] = useState(false);
  const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");

  const classStudents = students.filter((s) => s.class === selectedClass);

  useEffect(() => {
    const all = loadStorage<SavedExam[]>(`lords_exams_${schoolId}`, []);
    setSavedExams(
      all
        .filter((e) => e.class === selectedClass)
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    );
    if (tab === "view" && all.length > 0) {
      const classExams = all.filter((e) => e.class === selectedClass);
      if (classExams.length > 0) setSelectedExam(classExams[0].id);
    }
  }, [selectedClass, schoolId, tab]);

  const handleSetMark = (studentId: number, subject: string, value: string) => {
    const num = Math.max(0, Math.min(maxMarks[subject] ?? 100, Number(value)));
    setMarksData((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [subject]: num },
    }));
  };

  const handleSave = () => {
    if (!examName.trim()) {
      toast.error("Enter exam name");
      return;
    }
    if (!selectedClass) {
      toast.error("Select a class");
      return;
    }
    setSaving(true);

    const entries: StudentMarkEntry[] = classStudents.map((s) => ({
      studentId: s.id,
      subjects: subjects.map((sub) => ({
        subject: sub,
        maxMarks: maxMarks[sub] ?? 100,
        obtained: marksData[s.id]?.[sub] ?? 0,
      })),
    }));

    const exam: SavedExam = {
      id: `${schoolId}_${Date.now()}`,
      examName: examName.trim(),
      class: selectedClass,
      date: examDate,
      subjects,
      entries,
      savedAt: new Date().toISOString(),
    };

    const all = loadStorage<SavedExam[]>(`lords_exams_${schoolId}`, []);
    all.push(exam);
    saveStorage(`lords_exams_${schoolId}`, all);
    setSavedExams(
      all
        .filter((e) => e.class === selectedClass)
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    );

    setTimeout(() => {
      setSaving(false);
      toast.success(`Marks saved for ${examName} — ${selectedClass}`);
      setTab("view");
      setSelectedExam(exam.id);
    }, 600);
  };

  const exportCSV = (exam: SavedExam) => {
    const headers = [
      "Rank",
      "Student",
      ...exam.subjects,
      "Total",
      "Pct",
      "Grade",
    ];
    const rankedRows = getRankedRows(exam);
    const rows = rankedRows.map((r) => [
      String(r.rank),
      r.name,
      ...exam.subjects.map((sub) => {
        const s = r.subjects.find((x) => x.subject === sub);
        return `${s?.obtained ?? 0}/${s?.maxMarks ?? 100}`;
      }),
      String(r.total),
      `${r.pct.toFixed(1)}%`,
      r.grade,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.examName}_${exam.class}_${exam.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  function getRankedRows(exam: SavedExam) {
    return exam.entries
      .map((entry) => {
        const student = students.find((s) => s.id === entry.studentId);
        const total = entry.subjects.reduce((s, x) => s + x.obtained, 0);
        const maxTotal = entry.subjects.reduce((s, x) => s + x.maxMarks, 0);
        const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        return {
          studentId: entry.studentId,
          name: student?.name ?? `Student ${entry.studentId}`,
          subjects: entry.subjects,
          total,
          maxTotal,
          pct,
          grade: calcGrade(pct),
          rank: 0,
        };
      })
      .sort((a, b) => b.total - a.total)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  const viewExam = savedExams.find((e) => e.id === selectedExam);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Gradebook</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {school?.shortName} — Marks, grades and rankings
          </p>
        </div>
        <div className="flex gap-2">
          {(["entry", "view"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-3.5 py-1.5 text-sm rounded-lg border transition-all font-medium capitalize"
              style={
                tab === t
                  ? {
                      background: TEAL_BG,
                      color: TEAL,
                      borderColor: TEAL_BORDER,
                    }
                  : { borderColor: "oklch(var(--border))" }
              }
            >
              {t === "entry" ? "Enter Marks" : "View Reports"}
            </button>
          ))}
        </div>
      </div>

      {/* Class selector */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-36">
          <label
            htmlFor="gb-class"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Class
          </label>
          <select
            id="gb-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            data-ocid="gradebook.class_select"
            className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
          >
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {tab === "entry" && (
          <>
            <div className="flex-1 min-w-40">
              <label
                htmlFor="gb-exam-name"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Exam Name
              </label>
              <Input
                id="gb-exam-name"
                placeholder="e.g. Unit Test 1, Mid-Term"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                data-ocid="gradebook.exam_name_input"
                className="h-9"
              />
            </div>
            <div className="flex-1 min-w-36">
              <label
                htmlFor="gb-exam-date"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Date
              </label>
              <Input
                id="gb-exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="h-9"
              />
            </div>
          </>
        )}
        {tab === "view" && savedExams.length > 0 && (
          <div className="flex-1 min-w-48">
            <label
              htmlFor="gb-exam-select"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Select Exam
            </label>
            <select
              id="gb-exam-select"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              data-ocid="gradebook.exam_select"
              className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
            >
              {savedExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.examName} — {e.date}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mark entry */}
      {tab === "entry" && (
        <>
          {/* Subject config */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Subjects &amp; Max Marks
              </p>
              <button
                type="button"
                onClick={() => setSubjects((prev) => [...prev, ""])}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-muted"
              >
                <Plus size={12} /> Add Subject
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {subjects.map((sub, i) => (
                <div
                  key={`sub-${i}-${sub}`}
                  className="flex items-center gap-2 min-w-0"
                >
                  <Input
                    value={sub}
                    onChange={(e) => {
                      const next = [...subjects];
                      next[i] = e.target.value;
                      setSubjects(next);
                    }}
                    placeholder="Subject"
                    className="h-8 w-32 text-xs"
                  />
                  <Input
                    type="number"
                    value={maxMarks[sub] ?? 100}
                    onChange={(e) =>
                      setMaxMarks((prev) => ({
                        ...prev,
                        [sub]: Number(e.target.value),
                      }))
                    }
                    placeholder="Max"
                    className="h-8 w-16 text-xs"
                    min={1}
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSubjects((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="text-destructive text-xs hover:underline"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Marks table */}
          {classStudents.length > 0 ? (
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      Student
                    </th>
                    {subjects.filter(Boolean).map((sub) => (
                      <th
                        key={sub}
                        className="text-right px-3 py-3 font-semibold text-foreground whitespace-nowrap"
                      >
                        {sub}
                        <span className="text-xs text-muted-foreground ml-1">
                          /{maxMarks[sub] ?? 100}
                        </span>
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 font-semibold text-foreground">
                      Total
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student, idx) => {
                    const total = subjects
                      .filter(Boolean)
                      .reduce(
                        (acc, sub) => acc + (marksData[student.id]?.[sub] ?? 0),
                        0,
                      );
                    const maxTotal = subjects
                      .filter(Boolean)
                      .reduce((acc, sub) => acc + (maxMarks[sub] ?? 100), 0);
                    const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                    const grade = calcGrade(pct);
                    return (
                      <tr
                        key={student.id}
                        className="border-b border-border/60 hover:bg-muted/20"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: TEAL }}
                            >
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium truncate max-w-32">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        {subjects.filter(Boolean).map((sub) => (
                          <td key={sub} className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              value={marksData[student.id]?.[sub] ?? ""}
                              onChange={(e) =>
                                handleSetMark(student.id, sub, e.target.value)
                              }
                              data-ocid={`gradebook.mark_${idx}_${sub.toLowerCase().replace(/\s+/g, "_")}`}
                              min={0}
                              max={maxMarks[sub] ?? 100}
                              className="h-7 w-16 text-xs text-right ml-auto"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right font-semibold">
                          {total}/{maxTotal}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({pct.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className="font-bold text-sm"
                            style={{ color: gradeColor(grade) }}
                          >
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
              No students in {selectedClass || "selected class"}.
            </div>
          )}

          {classStudents.length > 0 && (
            <Button
              data-ocid="gradebook.save_button"
              onClick={handleSave}
              disabled={saving || !examName.trim()}
              className="w-full h-11 font-semibold"
              style={{ background: TEAL, color: "white" }}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Award size={16} className="mr-2" />
              )}
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          )}
        </>
      )}

      {/* View reports */}
      {tab === "view" && savedExams.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <Trophy size={40} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No exams saved for {selectedClass} yet.
          </p>
        </div>
      )}
      {tab === "view" && savedExams.length > 0 && viewExam && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {viewExam.examName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {viewExam.class} — {viewExam.date}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(viewExam)}
              data-ocid="gradebook.export_csv"
            >
              <Download size={14} className="mr-1.5" /> Export CSV
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-12">
                    Rank
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Student
                  </th>
                  {viewExam.subjects.map((sub) => (
                    <th
                      key={sub}
                      className="text-right px-3 py-3 font-semibold text-foreground whitespace-nowrap"
                    >
                      {sub}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-semibold text-foreground">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">
                    %
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {getRankedRows(viewExam).map((row) => (
                  <tr
                    key={row.studentId}
                    className="border-b border-border/60 hover:bg-muted/20"
                  >
                    <td className="px-4 py-2.5 text-center">
                      {row.rank <= 3 ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                          style={{
                            background:
                              row.rank === 1
                                ? "oklch(0.72 0.18 80)"
                                : row.rank === 2
                                  ? "oklch(0.65 0.05 260)"
                                  : "oklch(0.60 0.12 40)",
                          }}
                        >
                          {row.rank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {row.rank}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{row.name}</td>
                    {viewExam.subjects.map((sub) => {
                      const s = row.subjects.find((x) => x.subject === sub);
                      return (
                        <td
                          key={sub}
                          className="px-3 py-2.5 text-right text-muted-foreground"
                        >
                          {s?.obtained ?? 0}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-right font-semibold">
                      {row.total}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {row.pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge
                        variant="outline"
                        style={{
                          color: gradeColor(row.grade),
                          borderColor: gradeColor(row.grade),
                        }}
                      >
                        {row.grade}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
