import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, BookOpen, Download, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../../data/mockData";

const CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
  "11-Science",
  "11-Commerce",
  "12-Science",
  "12-Commerce",
];

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

interface Teacher {
  id: number;
  name: string;
  assignedClass: string;
  subjects: string;
  feedback?: string;
}

// Compute average marks for a student across all subjects
function avgMarks(student: Student): number {
  if (!student.marks || student.marks.length === 0) return 0;
  const total = student.marks.reduce((acc, m) => {
    const scored = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
    const max = m.max * 5;
    return acc + (max > 0 ? (scored / max) * 100 : 0);
  }, 0);
  return Math.round(total / student.marks.length);
}

// Compute subject-wise averages for a class
function subjectAverages(classStudents: Student[]) {
  if (classStudents.length === 0) return [];
  const subjectMap = new Map<string, { total: number; count: number }>();
  for (const s of classStudents) {
    for (const m of s.marks ?? []) {
      const existing = subjectMap.get(m.subject) ?? { total: 0, count: 0 };
      const scored = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
      const maxPossible = m.max * 5;
      const pct = maxPossible > 0 ? (scored / maxPossible) * 100 : 0;
      subjectMap.set(m.subject, {
        total: existing.total + pct,
        count: existing.count + 1,
      });
    }
  }
  return Array.from(subjectMap.entries())
    .map(([subject, { total, count }]) => ({
      subject,
      avg: Math.round(total / count),
    }))
    .sort((a, b) => b.avg - a.avg);
}

// Attendance percentage from attendance array
function attendancePct(student: Student): number {
  if (!student.attendance || student.attendance.length === 0) return 100;
  const present = student.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  return Math.round((present / student.attendance.length) * 100);
}

const AvgBar = ({ value }: { value: number }) => {
  const color =
    value >= 75
      ? "bg-emerald-500"
      : value >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right">{value}%</span>
    </div>
  );
};

interface Props {
  principalId: string;
  students: Student[];
}

export default function AcademicOversight({ principalId, students }: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const teachers = loadLS<Teacher[]>(`lords_teachers_${principalId}`, []);

  const classStudents = useMemo(() => {
    if (selectedClass === "all") return students;
    return students.filter((s) => s.class === selectedClass);
  }, [students, selectedClass]);

  const top5 = useMemo(() => {
    return [...classStudents]
      .map((s) => ({ ...s, avg: avgMarks(s) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [classStudents]);

  const subjectAvgs = useMemo(
    () => subjectAverages(classStudents),
    [classStudents],
  );

  const attendanceSummary = useMemo(() => {
    if (classStudents.length === 0) return { avg: 0, below75: 0 };
    const avgs = classStudents.map(attendancePct);
    const sum = avgs.reduce((a, b) => a + b, 0);
    const below75 = avgs.filter((p) => p < 75).length;
    return { avg: Math.round(sum / avgs.length), below75 };
  }, [classStudents]);

  const exportMarks = () => {
    const rows = [
      ["Student", "Class", "Roll No", "Avg Marks %", "Attendance %", "Rank"],
      ...classStudents.map((s) => [
        s.name,
        s.class,
        String(s.rollNo),
        String(avgMarks(s)),
        String(attendancePct(s)),
        String(s.rank || "—"),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic_report_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Academic report downloaded");
  };

  const classTeachers = useMemo(() => {
    if (selectedClass === "all") return teachers;
    return teachers.filter((t) => t.assignedClass === selectedClass);
  }, [teachers, selectedClass]);

  return (
    <div className="space-y-5" data-ocid="principal.academic_oversight">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Class:</span>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger
              className="w-44 h-9"
              data-ocid="principal.class_selector"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">
            {classStudents.length} students
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={exportMarks}
          data-ocid="principal.export_marks_btn"
        >
          <Download size={13} className="mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject averages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} /> Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectAvgs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No marks data available for this selection.
              </p>
            ) : (
              <div className="space-y-3">
                {subjectAvgs.map((s) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{s.subject}</span>
                      <span
                        className={
                          s.avg >= 75
                            ? "text-emerald-700"
                            : s.avg >= 50
                              ? "text-amber-700"
                              : "text-red-700"
                        }
                      >
                        {s.avg}%
                      </span>
                    </div>
                    <AvgBar value={s.avg} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 students */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award size={16} /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {top5.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No students or marks available.
              </p>
            ) : (
              <div className="space-y-2.5">
                {top5.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-slate-100 text-slate-700"
                            : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.class} · Roll {s.rollNo}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{s.avg}%</p>
                      <p className="text-xs text-muted-foreground">avg marks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} /> Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {attendanceSummary.avg}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Class average
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 text-center">
                <p className="text-2xl font-bold text-red-700">
                  {attendanceSummary.below75}
                </p>
                <p className="text-xs text-red-600 mt-0.5">Below 75%</p>
              </div>
            </div>
            {classStudents.length > 0 && (
              <div className="space-y-1.5">
                {classStudents.slice(0, 6).map((s) => {
                  const pct = attendancePct(s);
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="w-28 truncate font-medium">
                        {s.name}
                      </span>
                      <AvgBar value={pct} />
                    </div>
                  );
                })}
                {classStudents.length > 6 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {classStudents.length - 6} more students
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} /> Teachers —{" "}
              {selectedClass === "all" ? "All Classes" : selectedClass}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No teachers assigned for this selection.
              </p>
            ) : (
              <div className="space-y-2">
                {classTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-border/50 bg-muted/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.subjects || "All subjects"} · {t.assignedClass}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {t.assignedClass}
                      </Badge>
                    </div>
                    {t.feedback && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        &quot;{t.feedback}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
