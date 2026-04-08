import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOLS } from "@/data/schools";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  NotebookPen,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentRecord {
  id: number;
  name: string;
  class: string;
}

interface Assignment {
  id: string;
  class: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: number;
  content: string;
  submittedAt: string;
  status: "pending" | "submitted" | "reviewed";
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

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Computer",
  "Physical Education",
];

const STATUS_STYLE: Record<
  Submission["status"],
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "oklch(0.62 0.18 55)",
    bg: "oklch(0.62 0.18 55 / 0.1)",
  },
  submitted: {
    label: "Submitted",
    color: "oklch(0.45 0.16 150)",
    bg: "oklch(0.45 0.16 150 / 0.1)",
  },
  reviewed: {
    label: "Reviewed",
    color: "oklch(0.52 0.18 255)",
    bg: "oklch(0.52 0.18 255 / 0.1)",
  },
};

interface Props {
  schoolId: string;
}

export default function AssignmentsPage({ schoolId }: Props) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const students = loadStorage<StudentRecord[]>(
    `lords_students_${schoolId}`,
    [],
  );
  const classOptions = [...new Set(students.map((s) => s.class))].sort();

  const [tab, setTab] = useState<"create" | "list">("list");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form fields
  const [assignClass, setAssignClass] = useState(classOptions[0] ?? "");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    const all = loadStorage<Assignment[]>(`lords_assignments_${schoolId}`, []);
    setAssignments(
      all
        .filter((a) => !filterClass || a.class === filterClass)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
    setSubmissions(
      loadStorage<Submission[]>(`lords_submissions_${schoolId}`, []),
    );
  }, [filterClass, schoolId]);

  const effectiveSubject = subject === "__custom__" ? customSubject : subject;

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Enter assignment title");
      return;
    }
    if (!assignClass) {
      toast.error("Select a class");
      return;
    }
    if (!effectiveSubject.trim()) {
      toast.error("Enter subject");
      return;
    }
    setSaving(true);

    const assignment: Assignment = {
      id: `asgn_${Date.now()}`,
      class: assignClass,
      section,
      subject: effectiveSubject.trim(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      createdAt: new Date().toISOString(),
    };

    const all = loadStorage<Assignment[]>(`lords_assignments_${schoolId}`, []);
    all.push(assignment);
    saveStorage(`lords_assignments_${schoolId}`, all);

    setTimeout(() => {
      setSaving(false);
      toast.success(`Assignment "${title}" created for ${assignClass}`);
      setTitle("");
      setDescription("");
      setTab("list");
      setFilterClass(assignClass);
      window.dispatchEvent(new Event("storage"));
    }, 500);
  };

  const handleMarkReviewed = (submissionId: string) => {
    const all = loadStorage<Submission[]>(`lords_submissions_${schoolId}`, []);
    const updated = all.map((s) =>
      s.id === submissionId ? { ...s, status: "reviewed" as const } : s,
    );
    saveStorage(`lords_submissions_${schoolId}`, updated);
    setSubmissions(updated);
    toast.success("Submission marked as reviewed");
  };

  const handleDeleteAssignment = (id: string) => {
    const all = loadStorage<Assignment[]>(`lords_assignments_${schoolId}`, []);
    saveStorage(
      `lords_assignments_${schoolId}`,
      all.filter((a) => a.id !== id),
    );
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Assignment deleted");
  };

  const getSubmissions = (assignmentId: string) =>
    submissions.filter((s) => s.assignmentId === assignmentId);

  const getStudentName = (studentId: number) =>
    students.find((s) => s.id === studentId)?.name ?? `Student #${studentId}`;

  const getClassStudentCount = (cls: string) =>
    students.filter((s) => s.class === cls).length;

  const isPastDue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Assignments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {school?.shortName} — Homework and submissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("list")}
            className="px-3.5 py-1.5 text-sm rounded-lg border transition-all font-medium"
            style={
              tab === "list"
                ? { background: TEAL_BG, color: TEAL, borderColor: TEAL_BORDER }
                : { borderColor: "oklch(var(--border))" }
            }
          >
            All Assignments
          </button>
          <button
            type="button"
            onClick={() => setTab("create")}
            className="px-3.5 py-1.5 text-sm rounded-lg border transition-all font-medium flex items-center gap-1.5"
            style={
              tab === "create"
                ? { background: TEAL_BG, color: TEAL, borderColor: TEAL_BORDER }
                : { borderColor: "oklch(var(--border))" }
            }
          >
            <Plus size={13} /> New Assignment
          </button>
        </div>
      </div>

      {/* Create form */}
      {tab === "create" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">New Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="asgn-class"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Class
                </label>
                <select
                  id="asgn-class"
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  data-ocid="assignments.class_select"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
                >
                  {classOptions.length === 0 && (
                    <option value="">No classes</option>
                  )}
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="asgn-section"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Section (optional)
                </label>
                <Input
                  id="asgn-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A, B"
                  className="h-9"
                />
              </div>
              <div>
                <label
                  htmlFor="asgn-subject"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Subject
                </label>
                <select
                  id="asgn-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-ocid="assignments.subject_select"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
                >
                  {DEFAULT_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">Other</option>
                </select>
              </div>
              {subject === "__custom__" && (
                <div>
                  <label
                    htmlFor="asgn-custom-subject"
                    className="text-xs font-medium text-muted-foreground mb-1 block"
                  >
                    Custom Subject
                  </label>
                  <Input
                    id="asgn-custom-subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Subject name"
                    className="h-9"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="asgn-due-date"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Due Date
                </label>
                <Input
                  id="asgn-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  data-ocid="assignments.due_date_input"
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="asgn-title"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Assignment Title
              </label>
              <Input
                id="asgn-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Exercise Questions"
                data-ocid="assignments.title_input"
              />
            </div>
            <div>
              <label
                htmlFor="asgn-desc"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Description / Instructions
              </label>
              <textarea
                id="asgn-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write detailed instructions for students..."
                rows={5}
                data-ocid="assignments.description_textarea"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 resize-y"
                style={{ "--tw-ring-color": TEAL } as React.CSSProperties}
              />
            </div>
          </div>
          <Button
            data-ocid="assignments.create_button"
            onClick={handleCreate}
            disabled={saving || !title.trim() || !assignClass}
            className="w-full h-11 font-semibold"
            style={{ background: TEAL, color: "white" }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <NotebookPen size={16} className="mr-2" />
            )}
            {saving ? "Creating..." : "Create Assignment"}
          </Button>
        </div>
      )}

      {/* List view */}
      {tab === "list" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label
              htmlFor="asgn-filter"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Filter:
            </label>
            <select
              id="asgn-filter"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
            >
              <option value="">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <NotebookPen
                size={40}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="text-muted-foreground">No assignments yet.</p>
              <button
                type="button"
                onClick={() => setTab("create")}
                className="mt-3 text-sm font-medium flex items-center gap-1.5 mx-auto"
                style={{ color: TEAL }}
              >
                <Plus size={14} /> Create first assignment
              </button>
            </div>
          ) : (
            assignments.map((assignment) => {
              const assignSubs = getSubmissions(assignment.id);
              const totalStudents = getClassStudentCount(assignment.class);
              const submittedCount = assignSubs.filter(
                (s) => s.status !== "pending",
              ).length;
              const isExpanded = expandedId === assignment.id;
              const overdue = isPastDue(assignment.dueDate);

              return (
                <div
                  key={assignment.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    data-ocid={`assignments.row_${assignment.id}`}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : assignment.id)
                    }
                    className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground text-sm truncate">
                          {assignment.title}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: TEAL_BG, color: TEAL }}
                        >
                          {assignment.class}
                          {assignment.section ? ` ${assignment.section}` : ""}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {assignment.subject}
                        </span>
                        {overdue && (
                          <Badge
                            variant="outline"
                            style={{
                              color: "oklch(0.55 0.22 25)",
                              borderColor: "oklch(0.55 0.22 25)",
                              fontSize: "10px",
                            }}
                          >
                            Past due
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                        <span
                          style={{
                            color:
                              submittedCount > 0
                                ? "oklch(0.45 0.16 150)"
                                : "oklch(var(--muted-foreground))",
                          }}
                        >
                          {submittedCount}/{totalStudents} submitted
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown
                        size={16}
                        className="shrink-0 mt-1 text-muted-foreground"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="shrink-0 mt-1 text-muted-foreground"
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5">
                          {assignment.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          Submissions ({assignSubs.length})
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete Assignment
                        </button>
                      </div>

                      {assignSubs.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No submissions yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assignSubs.map((sub) => {
                            const cfg = STATUS_STYLE[sub.status];
                            return (
                              <div
                                key={sub.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                              >
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ background: TEAL }}
                                >
                                  {getStudentName(sub.studentId).charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-foreground">
                                      {getStudentName(sub.studentId)}
                                    </p>
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                                      style={{
                                        background: cfg.bg,
                                        color: cfg.color,
                                      }}
                                    >
                                      {cfg.label}
                                    </span>
                                  </div>
                                  {sub.content && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {sub.content}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Submitted:{" "}
                                    {new Date(sub.submittedAt).toLocaleString(
                                      "en-IN",
                                    )}
                                  </p>
                                </div>
                                {sub.status === "submitted" && (
                                  <button
                                    type="button"
                                    data-ocid={`assignments.review_${sub.id}`}
                                    onClick={() => handleMarkReviewed(sub.id)}
                                    className="text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors hover:opacity-80"
                                    style={{
                                      background: TEAL_BG,
                                      color: TEAL,
                                    }}
                                  >
                                    Mark Reviewed
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
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
