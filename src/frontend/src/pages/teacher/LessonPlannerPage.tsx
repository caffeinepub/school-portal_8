import { Button } from "@/components/ui/button";
import { SCHOOLS } from "@/data/schools";
import { BookOpen, Calendar, Loader2, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentRecord {
  id: number;
  name: string;
  class: string;
}

interface LessonPlan {
  id: string;
  class: string;
  section: string;
  subject: string;
  weekOf: string;
  content: string;
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

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Computer",
  "Physical Education",
];

function getWeekOf(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().slice(0, 10);
}

interface Props {
  schoolId: string;
}

export default function LessonPlannerPage({ schoolId }: Props) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const students = loadStorage<StudentRecord[]>(
    `lords_students_${schoolId}`,
    [],
  );
  const classOptions = [...new Set(students.map((s) => s.class))].sort();

  const [tab, setTab] = useState<"create" | "view">("create");
  const [selectedClass, setSelectedClass] = useState(classOptions[0] ?? "");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [weekOf, setWeekOf] = useState(getWeekOf(new Date()));
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [filterClass, setFilterClass] = useState(classOptions[0] ?? "");

  useEffect(() => {
    const all = loadStorage<LessonPlan[]>(`lords_lesson_plans_${schoolId}`, []);
    setPlans(
      all
        .filter((p) => !filterClass || p.class === filterClass)
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    );
  }, [filterClass, schoolId]);

  const effectiveSubject = subject === "__custom__" ? customSubject : subject;

  const handleSave = () => {
    if (!selectedClass) {
      toast.error("Select a class");
      return;
    }
    if (!effectiveSubject.trim()) {
      toast.error("Enter a subject");
      return;
    }
    if (!content.trim()) {
      toast.error("Enter lesson plan content");
      return;
    }
    setSaving(true);

    const plan: LessonPlan = {
      id: `lp_${Date.now()}`,
      class: selectedClass,
      section,
      subject: effectiveSubject.trim(),
      weekOf,
      content: content.trim(),
      savedAt: new Date().toISOString(),
    };

    const all = loadStorage<LessonPlan[]>(`lords_lesson_plans_${schoolId}`, []);
    all.push(plan);
    saveStorage(`lords_lesson_plans_${schoolId}`, all);

    setTimeout(() => {
      setSaving(false);
      toast.success(
        `Lesson plan saved for ${selectedClass} — ${effectiveSubject}`,
      );
      setContent("");
      setTab("view");
      setFilterClass(selectedClass);
      window.dispatchEvent(new Event("storage"));
    }, 500);
  };

  const handleDelete = (id: string) => {
    const all = loadStorage<LessonPlan[]>(`lords_lesson_plans_${schoolId}`, []);
    saveStorage(
      `lords_lesson_plans_${schoolId}`,
      all.filter((p) => p.id !== id),
    );
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.success("Plan deleted");
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lesson Planner</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {school?.shortName} — Syllabus and weekly plans
          </p>
        </div>
        <div className="flex gap-2">
          {(["create", "view"] as const).map((t) => (
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
              {t === "create" ? (
                <span className="flex items-center gap-1.5">
                  <Plus size={13} /> New Plan
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} /> View Plans
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Create */}
      {tab === "create" && (
        <div className="space-y-5">
          {/* Selectors */}
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lp-class"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Class
              </label>
              <select
                id="lp-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                data-ocid="lesson_planner.class_select"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
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
            <div>
              <label
                htmlFor="lp-section"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Section (optional)
              </label>
              <input
                id="lp-section"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B"
                data-ocid="lesson_planner.section_input"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="lp-subject"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Subject
              </label>
              <select
                id="lp-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-ocid="lesson_planner.subject_select"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
              >
                {DEFAULT_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom__">Other (type below)</option>
              </select>
            </div>
            {subject === "__custom__" && (
              <div>
                <label
                  htmlFor="lp-custom-subject"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Custom Subject
                </label>
                <input
                  id="lp-custom-subject"
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Subject name"
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="lp-week"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Week of
              </label>
              <input
                id="lp-week"
                type="date"
                value={weekOf}
                onChange={(e) => setWeekOf(e.target.value)}
                data-ocid="lesson_planner.week_input"
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none"
              />
            </div>
          </div>

          {/* Content area */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="lp-content"
                className="text-sm font-semibold text-foreground"
              >
                Lesson Plan / Syllabus Content
              </label>
              <span className="text-xs text-muted-foreground">
                {content.length} chars
              </span>
            </div>
            <textarea
              id="lp-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              data-ocid="lesson_planner.content_textarea"
              placeholder={`Write the lesson plan for ${effectiveSubject || "this subject"} for week of ${weekOf}...\n\nExample:\n• Monday: Introduction to Chapter 5 — Fractions\n• Tuesday: Practice problems on addition of fractions\n• Wednesday: Subtraction of fractions with unlike denominators\n• Thursday: Word problems and group activity\n• Friday: Revision and worksheet`}
              rows={12}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 resize-y"
              style={{ "--tw-ring-color": TEAL } as React.CSSProperties}
            />
          </div>

          <Button
            data-ocid="lesson_planner.save_button"
            onClick={handleSave}
            disabled={saving || !content.trim() || !selectedClass}
            className="w-full h-11 font-semibold"
            style={{ background: TEAL, color: "white" }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? "Saving..." : "Save Lesson Plan"}
          </Button>
        </div>
      )}

      {/* View */}
      {tab === "view" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label
              htmlFor="lp-filter-class"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Filter by class:
            </label>
            <select
              id="lp-filter-class"
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

          {plans.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Calendar
                size={40}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <p className="text-muted-foreground">
                No lesson plans saved yet.
              </p>
              <button
                type="button"
                onClick={() => setTab("create")}
                className="mt-3 text-sm font-medium"
                style={{ color: TEAL }}
              >
                Create your first plan →
              </button>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: TEAL_BG, color: TEAL }}
                      >
                        {plan.class}
                        {plan.section ? ` — ${plan.section}` : ""}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {plan.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar size={11} />
                      Week of{" "}
                      {new Date(plan.weekOf).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id)}
                    className="text-xs text-destructive hover:underline shrink-0"
                  >
                    Delete
                  </button>
                </div>
                <div
                  className="text-sm text-foreground rounded-lg px-3 py-2.5 whitespace-pre-line leading-relaxed"
                  style={{ background: "oklch(var(--muted) / 0.5)" }}
                >
                  {plan.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
