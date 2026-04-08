import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/data/mockData";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  student: Student;
  principalId: string;
}

interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  class: string;
  teacher?: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: number;
  content: string;
  submittedAt: string;
  status: "Under Review" | "Reviewed" | "Returned";
  feedback?: string;
}

function loadAssignments(
  principalId: string,
  studentClass: string,
): Assignment[] {
  try {
    const raw = localStorage.getItem(`lords_assignments_${principalId}`);
    if (raw) {
      const all = JSON.parse(raw) as Assignment[];
      return all.filter((a) => a.class === studentClass || a.class === "All");
    }
  } catch {}
  return [];
}

function loadSubmissions(principalId: string, studentId: number): Submission[] {
  try {
    const raw = localStorage.getItem(
      `lords_submissions_${principalId}_${studentId}`,
    );
    if (raw) return JSON.parse(raw) as Submission[];
  } catch {}
  return [];
}

function saveSubmissions(
  principalId: string,
  studentId: number,
  subs: Submission[],
) {
  try {
    localStorage.setItem(
      `lords_submissions_${principalId}_${studentId}`,
      JSON.stringify(subs),
    );
  } catch {}
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  "Under Review": {
    bg: "oklch(0.97 0.06 80)",
    text: "oklch(0.45 0.14 80)",
    icon: <Clock size={12} />,
  },
  Reviewed: {
    bg: "oklch(0.95 0.06 150)",
    text: "oklch(0.32 0.14 150)",
    icon: <CheckCircle2 size={12} />,
  },
  Returned: {
    bg: "oklch(0.94 0.05 255)",
    text: "oklch(0.32 0.14 255)",
    icon: <ChevronRight size={12} />,
  },
};

function isPastDue(dueDate: string): boolean {
  try {
    return new Date(dueDate) < new Date();
  } catch {
    return false;
  }
}

export default function SubmissionsPage({ student, principalId }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null,
  );
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAssignments(loadAssignments(principalId, student.class));
    setSubmissions(loadSubmissions(principalId, student.id));
  }, [principalId, student.class, student.id]);

  const getSubmission = (assignmentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId);

  const handleSubmit = () => {
    if (!activeAssignment || !submissionText.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const newSub: Submission = {
        id: String(Date.now()),
        assignmentId: activeAssignment.id,
        studentId: student.id,
        content: submissionText.trim(),
        submittedAt: new Date().toISOString(),
        status: "Under Review",
      };
      const updated = [
        ...submissions.filter((s) => s.assignmentId !== activeAssignment.id),
        newSub,
      ];
      setSubmissions(updated);
      saveSubmissions(principalId, student.id, updated);
      setSubmitting(false);
      setActiveAssignment(null);
      setSubmissionText("");
      toast.success("Assignment submitted successfully!", {
        description: `${activeAssignment.title} — Under Review`,
      });
    }, 600);
  };

  const pendingAssignments = assignments.filter((a) => !getSubmission(a.id));
  const submittedAssignments = assignments.filter((a) => getSubmission(a.id));

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">Submissions</h2>
        <p className="text-sm text-muted-foreground">
          Assignments and homework submissions for Class {student.class}
        </p>
      </div>

      {/* Submission modal/panel */}
      {activeAssignment && (
        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: "oklch(0.55 0.15 130 / 0.4)",
            background: "oklch(0.97 0.02 130)",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                {activeAssignment.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeAssignment.subject} · Due: {activeAssignment.dueDate}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveAssignment(null);
                setSubmissionText("");
              }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          {activeAssignment.description && (
            <p className="text-sm text-foreground mb-3 p-3 rounded-lg bg-card border border-border">
              {activeAssignment.description}
            </p>
          )}
          <Textarea
            placeholder="Write your answer or submission here..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="min-h-[120px] text-sm mb-3 resize-none"
            data-ocid="submissions.text_input"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveAssignment(null);
                setSubmissionText("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!submissionText.trim() || submitting}
              onClick={handleSubmit}
              style={{
                background: submissionText.trim()
                  ? "oklch(0.55 0.15 130)"
                  : undefined,
                color: submissionText.trim()
                  ? "oklch(0.97 0.02 130)"
                  : undefined,
              }}
              data-ocid="submissions.submit_button"
            >
              <Upload size={14} className="mr-1.5" />
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        </div>
      )}

      {/* Pending assignments */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle size={15} style={{ color: "oklch(0.55 0.15 130)" }} />
          Pending Assignments
          {pendingAssignments.length > 0 && (
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.55 0.15 130)",
                color: "oklch(0.97 0.02 130)",
                border: "none",
              }}
            >
              {pendingAssignments.length}
            </Badge>
          )}
        </h3>

        {pendingAssignments.length === 0 ? (
          <div
            className="rounded-xl border py-12 text-center"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(0.985 0.003 260)",
            }}
            data-ocid="submissions.pending_empty_state"
          >
            <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">
              {assignments.length === 0
                ? "No assignments posted yet."
                : "All assignments submitted! 🎉"}
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="submissions.pending_list">
            {pendingAssignments.map((a) => {
              const pastDue = isPastDue(a.dueDate);
              return (
                <div
                  key={a.id}
                  className="rounded-xl border px-4 py-3.5 flex items-center gap-4"
                  style={{
                    borderColor: pastDue
                      ? "oklch(0.60 0.22 25 / 0.3)"
                      : "oklch(0.88 0.018 260)",
                    background: pastDue
                      ? "oklch(0.98 0.02 25)"
                      : "oklch(1 0 0)",
                  }}
                  data-ocid="submissions.assignment_item"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {a.title}
                      </p>
                      {pastDue && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.60 0.22 25 / 0.12)",
                            color: "oklch(0.42 0.18 25)",
                            border: "none",
                          }}
                        >
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.subject}
                      {a.teacher && ` · ${a.teacher}`} · Due: {a.dueDate}
                    </p>
                    {a.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveAssignment(a);
                      setSubmissionText("");
                    }}
                    style={{
                      background: "oklch(0.55 0.15 130)",
                      color: "oklch(0.97 0.02 130)",
                    }}
                    className="shrink-0"
                    data-ocid="submissions.submit_btn"
                  >
                    <Upload size={13} className="mr-1.5" />
                    Submit
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past submissions */}
      {submittedAssignments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} style={{ color: "oklch(0.40 0.15 150)" }} />
            Past Submissions
          </h3>
          <div className="space-y-2" data-ocid="submissions.past_list">
            {submittedAssignments.map((a) => {
              const sub = getSubmission(a.id)!;
              const statusStyle =
                STATUS_STYLES[sub.status] ?? STATUS_STYLES["Under Review"];
              return (
                <div
                  key={a.id}
                  className="rounded-xl border px-4 py-3.5"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid="submissions.past_item"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.subject} · Submitted:{" "}
                        {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                        &ldquo;{sub.content}&rdquo;
                      </p>
                      {sub.feedback && (
                        <p
                          className="text-xs mt-2 px-2.5 py-1.5 rounded-lg"
                          style={{
                            background: "oklch(0.55 0.15 130 / 0.08)",
                            color: "oklch(0.38 0.14 130)",
                          }}
                        >
                          Feedback: {sub.feedback}
                        </p>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      {statusStyle.icon}
                      {sub.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
