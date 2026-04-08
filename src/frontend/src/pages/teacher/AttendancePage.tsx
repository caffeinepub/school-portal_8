import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOLS } from "@/data/schools";
import { CheckCircle, Clock, Loader2, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentRecord {
  id: number;
  name: string;
  class: string;
  section?: string;
  rollNo?: number;
}

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceEntry {
  studentId: number;
  status: AttendanceStatus;
  note: string;
}

interface SavedAttendance {
  date: string;
  class: string;
  entries: AttendanceEntry[];
  submittedAt: string;
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

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string }
> = {
  present: {
    label: "Present",
    color: "oklch(0.45 0.16 150)",
    bg: "oklch(0.45 0.16 150 / 0.1)",
  },
  late: {
    label: "Late",
    color: "oklch(0.62 0.18 55)",
    bg: "oklch(0.62 0.18 55 / 0.1)",
  },
  absent: {
    label: "Absent",
    color: "oklch(0.55 0.22 25)",
    bg: "oklch(0.55 0.22 25 / 0.1)",
  },
};

interface Props {
  schoolId: string;
}

export default function AttendancePage({ schoolId }: Props) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const students = loadStorage<StudentRecord[]>(
    `lords_students_${schoolId}`,
    [],
  );

  // Derive class list
  const classOptions = [...new Set(students.map((s) => s.class))].sort();

  const today = new Date().toISOString().slice(0, 10);
  const [selectedClass, setSelectedClass] = useState(classOptions[0] ?? "");
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<
    Record<number, AttendanceStatus>
  >({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"mark" | "history">("mark");
  const [history, setHistory] = useState<SavedAttendance[]>([]);

  const classStudents = students.filter((s) => s.class === selectedClass);

  // Load existing attendance for selected class+date
  // classStudents is computed inline to avoid stale closure; disable exhaustive-deps for it
  useEffect(() => {
    if (!selectedClass || !date) return;
    const key = `lords_attendance_${schoolId}`;
    const all = loadStorage<SavedAttendance[]>(key, []);
    const existing = all.find(
      (a) => a.date === date && a.class === selectedClass,
    );
    if (existing) {
      const statusMap: Record<number, AttendanceStatus> = {};
      const noteMap: Record<number, string> = {};
      for (const e of existing.entries) {
        statusMap[e.studentId] = e.status;
        noteMap[e.studentId] = e.note;
      }
      setAttendance(statusMap);
      setNotes(noteMap);
    } else {
      // Default all to present
      const classStudentsNow = students.filter(
        (s) => s.class === selectedClass,
      );
      const defaultMap: Record<number, AttendanceStatus> = {};
      for (const s of classStudentsNow) defaultMap[s.id] = "present";
      setAttendance(defaultMap);
      setNotes({});
    }
    // classStudents is a derived value — intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date, schoolId, students]);

  // Load history
  useEffect(() => {
    if (viewMode !== "history") return;
    const all = loadStorage<SavedAttendance[]>(
      `lords_attendance_${schoolId}`,
      [],
    );
    setHistory(
      all
        .filter((a) => a.class === selectedClass)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30),
    );
  }, [viewMode, selectedClass, schoolId]);

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    if (!selectedClass) {
      toast.error("Select a class first");
      return;
    }
    if (classStudents.length === 0) {
      toast.error("No students in this class");
      return;
    }
    setSubmitting(true);

    const entries: AttendanceEntry[] = classStudents.map((s) => ({
      studentId: s.id,
      status: attendance[s.id] ?? "present",
      note: notes[s.id] ?? "",
    }));

    const key = `lords_attendance_${schoolId}`;
    const all = loadStorage<SavedAttendance[]>(key, []);
    const idx = all.findIndex(
      (a) => a.date === date && a.class === selectedClass,
    );
    const record: SavedAttendance = {
      date,
      class: selectedClass,
      entries,
      submittedAt: new Date().toISOString(),
    };
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    saveStorage(key, all);

    // Auto-notify absent students via parent messages
    const absentStudents = entries.filter((e) => e.status === "absent");
    if (absentStudents.length > 0) {
      const msgKey = `lords_parent_messages_${schoolId}`;
      const msgs = loadStorage<
        {
          id: number;
          studentId: number;
          message: string;
          timestamp: string;
          category: string;
          read: boolean;
        }[]
      >(msgKey, []);
      for (const e of absentStudents) {
        const student = students.find((s) => s.id === e.studentId);
        if (student) {
          msgs.push({
            id: Date.now() + e.studentId,
            studentId: e.studentId,
            message: `Your child ${student.name} was marked ABSENT on ${date} for ${selectedClass}.`,
            timestamp: new Date().toISOString(),
            category: "Attendance",
            read: false,
          });
        }
      }
      saveStorage(msgKey, msgs);
    }

    setTimeout(() => {
      setSubmitting(false);
      const absentCount = entries.filter((e) => e.status === "absent").length;
      const lateCount = entries.filter((e) => e.status === "late").length;
      toast.success(
        `Attendance submitted for ${selectedClass} on ${date}. ${absentCount} absent, ${lateCount} late.`,
      );
      window.dispatchEvent(new Event("storage"));
    }, 600);
  };

  const presentCount = classStudents.filter(
    (s) => (attendance[s.id] ?? "present") === "present",
  ).length;
  const absentCount = classStudents.filter(
    (s) => (attendance[s.id] ?? "present") === "absent",
  ).length;
  const lateCount = classStudents.filter(
    (s) => (attendance[s.id] ?? "present") === "late",
  ).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Attendance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {school?.shortName} — Mark daily roll-call
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("mark")}
            className="px-3.5 py-1.5 text-sm rounded-lg border transition-all font-medium"
            style={
              viewMode === "mark"
                ? { background: TEAL_BG, color: TEAL, borderColor: TEAL }
                : { borderColor: "oklch(var(--border))" }
            }
          >
            Mark Attendance
          </button>
          <button
            type="button"
            onClick={() => setViewMode("history")}
            className="px-3.5 py-1.5 text-sm rounded-lg border transition-all font-medium"
            style={
              viewMode === "history"
                ? { background: TEAL_BG, color: TEAL, borderColor: TEAL }
                : { borderColor: "oklch(var(--border))" }
            }
          >
            History
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-36">
          <label
            htmlFor="att-class"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Class / Section
          </label>
          <select
            id="att-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            data-ocid="attendance.class_select"
            className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": TEAL } as React.CSSProperties}
          >
            {classOptions.length === 0 && (
              <option value="">No classes found</option>
            )}
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label
            htmlFor="att-date"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Date
          </label>
          <Input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-ocid="attendance.date_input"
            className="h-9"
          />
        </div>
        {viewMode === "mark" && classStudents.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-muted"
              onClick={() => {
                const all: Record<number, AttendanceStatus> = {};
                for (const s of classStudents) {
                  all[s.id] = "present";
                }
                setAttendance(all);
              }}
            >
              All Present
            </button>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-muted"
              onClick={() => {
                const all: Record<number, AttendanceStatus> = {};
                for (const s of classStudents) {
                  all[s.id] = "absent";
                }
                setAttendance(all);
              }}
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Summary chips */}
      {viewMode === "mark" && classStudents.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {(
            [
              { count: presentCount, ...STATUS_CONFIG.present },
              { count: lateCount, ...STATUS_CONFIG.late },
              { count: absentCount, ...STATUS_CONFIG.absent },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium"
              style={{ background: item.bg, color: item.color }}
            >
              <span className="text-lg font-bold">{item.count}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
            <span className="text-lg font-bold">{classStudents.length}</span>
            <span>Total</span>
          </div>
        </div>
      )}

      {/* Mark attendance */}
      {viewMode === "mark" && (
        <>
          {classStudents.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <UserX size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No students in {selectedClass || "this class"}.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {classStudents.map((student, idx) => {
                const status = attendance[student.id] ?? "present";
                return (
                  <div
                    key={student.id}
                    data-ocid={`attendance.student_row_${idx}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                      style={{ background: TEAL }}
                    >
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Roll {student.rollNo ?? idx + 1}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {(
                        ["present", "late", "absent"] as AttendanceStatus[]
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          data-ocid={`attendance.${s}_${idx}`}
                          onClick={() => setStatus(student.id, s)}
                          className="px-2.5 py-1 text-xs rounded-lg font-medium transition-all border"
                          style={
                            status === s
                              ? {
                                  background: STATUS_CONFIG[s].bg,
                                  color: STATUS_CONFIG[s].color,
                                  borderColor: STATUS_CONFIG[s].color,
                                }
                              : {
                                  color: "oklch(var(--muted-foreground))",
                                  borderColor: "oklch(var(--border))",
                                }
                          }
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {classStudents.length > 0 && (
            <Button
              data-ocid="attendance.submit_button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-11 text-base font-semibold"
              style={{ background: TEAL, color: "white" }}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <CheckCircle size={16} className="mr-2" />
              )}
              {submitting
                ? "Saving..."
                : `Submit Attendance for ${selectedClass}`}
            </Button>
          )}
        </>
      )}

      {/* History view */}
      {viewMode === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Clock size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No attendance records for {selectedClass}.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const absentList = record.entries
                .filter((e) => e.status === "absent")
                .map((e) => students.find((s) => s.id === e.studentId)?.name)
                .filter(Boolean);
              return (
                <div
                  key={record.date}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {new Date(record.date).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.class} — submitted{" "}
                        {new Date(record.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          color: STATUS_CONFIG.present.color,
                          borderColor: STATUS_CONFIG.present.color,
                        }}
                      >
                        {
                          record.entries.filter((e) => e.status === "present")
                            .length
                        }{" "}
                        Present
                      </Badge>
                      {record.entries.filter((e) => e.status === "absent")
                        .length > 0 && (
                        <Badge
                          variant="outline"
                          style={{
                            color: STATUS_CONFIG.absent.color,
                            borderColor: STATUS_CONFIG.absent.color,
                          }}
                        >
                          {
                            record.entries.filter((e) => e.status === "absent")
                              .length
                          }{" "}
                          Absent
                        </Badge>
                      )}
                    </div>
                  </div>
                  {absentList.length > 0 && (
                    <div
                      className="text-xs rounded-lg px-3 py-2"
                      style={{
                        background: "oklch(0.55 0.22 25 / 0.08)",
                        color: "oklch(0.55 0.22 25)",
                      }}
                    >
                      Absent: {absentList.join(", ")}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
