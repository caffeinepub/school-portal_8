import type { ClassSyllabus } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Student } from "@/data/mockData";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Filter,
  Search,
  Video,
} from "lucide-react";
import { useState } from "react";

interface Props {
  student: Student;
  syllabus: ClassSyllabus;
  principalId: string;
}

interface Resource {
  id: string;
  title: string;
  type: "note" | "pdf" | "video" | "link";
  subject: string;
  date: string;
  url?: string;
  content?: string;
  uploadedBy?: string;
}

interface LessonPlan {
  id: string;
  subject: string;
  week: string;
  topic: string;
  objectives: string;
  date: string;
  class: string;
}

function loadResources(principalId: string, studentClass: string): Resource[] {
  try {
    const raw = localStorage.getItem(`lords_resources_${principalId}`);
    if (raw) {
      const all = JSON.parse(raw) as (Resource & { class?: string })[];
      return all.filter(
        (r) => !r.class || r.class === studentClass || r.class === "All",
      );
    }
  } catch {}
  return [];
}

function loadLessonPlans(
  principalId: string,
  studentClass: string,
): LessonPlan[] {
  try {
    const raw = localStorage.getItem(`lords_lesson_plans_${principalId}`);
    if (raw) {
      const all = JSON.parse(raw) as LessonPlan[];
      return all.filter((p) => p.class === studentClass || p.class === "All");
    }
  } catch {}
  return [];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  note: <FileText size={15} />,
  pdf: <FileText size={15} />,
  video: <Video size={15} />,
  link: <ExternalLink size={15} />,
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  note: { bg: "oklch(0.52 0.18 255 / 0.12)", text: "oklch(0.32 0.14 255)" },
  pdf: { bg: "oklch(0.55 0.22 25 / 0.10)", text: "oklch(0.42 0.18 25)" },
  video: { bg: "oklch(0.55 0.22 80 / 0.12)", text: "oklch(0.45 0.18 80)" },
  link: { bg: "oklch(0.55 0.15 130 / 0.12)", text: "oklch(0.38 0.14 130)" },
};

function SyllabusAccordion({
  subject,
}: {
  subject: { subject: string; chapters: { name: string; status: string }[] };
}) {
  const [open, setOpen] = useState(false);
  const completed = subject.chapters.filter(
    (c) => c.status === "Completed",
  ).length;
  const total = subject.chapters.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "oklch(0.88 0.018 260)" }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3.5 bg-card hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.55 0.15 130 / 0.12)" }}
          >
            <BookOpen size={14} style={{ color: "oklch(0.38 0.14 130)" }} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {subject.subject}
            </p>
            <p className="text-xs text-muted-foreground">
              {completed}/{total} chapters · {pct}% complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-20 h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.88 0.018 260)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background:
                    pct === 100
                      ? "oklch(0.55 0.15 150)"
                      : "oklch(0.55 0.15 130)",
                }}
              />
            </div>
          </div>
          {open ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>
      {open && (
        <div
          className="divide-y"
          style={{ borderColor: "oklch(0.91 0.01 260)" }}
        >
          {subject.chapters.map((c) => {
            const s =
              c.status === "Completed"
                ? { bg: "oklch(0.95 0.06 150)", text: "oklch(0.30 0.16 150)" }
                : c.status === "In Progress"
                  ? { bg: "oklch(0.94 0.05 255)", text: "oklch(0.32 0.14 255)" }
                  : {
                      bg: "oklch(0.93 0.01 260)",
                      text: "oklch(0.48 0.03 260)",
                    };
            return (
              <div
                key={c.name}
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: "oklch(0.985 0.003 260)" }}
              >
                <span className="text-sm text-foreground">{c.name}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.text }}
                >
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DigitalLibraryPage({
  student,
  syllabus,
  principalId,
}: Props) {
  const [tab, setTab] = useState<"resources" | "lessons" | "syllabus">(
    "resources",
  );
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const resources = loadResources(principalId, student.class);
  const lessonPlans = loadLessonPlans(principalId, student.class);
  const classSyllabus = syllabus[student.class] ?? [];

  const subjects = [
    "All",
    ...Array.from(new Set(resources.map((r) => r.subject).filter(Boolean))),
  ];

  const filteredResources = resources.filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "All" || r.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  const tabs = [
    { id: "resources", label: "Resources" },
    { id: "lessons", label: "Lesson Plans" },
    { id: "syllabus", label: "Syllabus" },
  ] as const;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">Digital Library</h2>
          <p className="text-sm text-muted-foreground">
            Notes, PDFs, videos and lesson plans for Class {student.class}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl border border-border bg-muted/30 w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-ocid={`library.tab.${id}`}
            onClick={() => setTab(id)}
            className="px-4 py-1.5 text-sm rounded-lg font-medium transition-all"
            style={
              tab === id
                ? {
                    background: "oklch(0.55 0.15 130)",
                    color: "oklch(0.97 0.02 130)",
                  }
                : { color: "oklch(0.50 0.04 260)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Resources tab */}
      {tab === "resources" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="library.search_input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <select
                className="h-9 px-3 text-sm rounded-lg border border-input bg-background text-foreground"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                data-ocid="library.subject_filter"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div
              className="rounded-xl border py-16 text-center"
              style={{
                borderColor: "oklch(0.88 0.018 260)",
                background: "oklch(0.985 0.003 260)",
              }}
              data-ocid="library.resources_empty_state"
            >
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-muted-foreground">
                No resources uploaded yet for your class.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your teacher will upload notes, PDFs and videos here.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="library.resources_list">
              {filteredResources.map((r) => {
                const typeStyle = TYPE_COLORS[r.type] ?? TYPE_COLORS.link;
                return (
                  <div
                    key={r.id}
                    className="rounded-xl border px-4 py-3 flex items-center gap-4"
                    style={{
                      borderColor: "oklch(0.88 0.018 260)",
                      background: "oklch(1 0 0)",
                    }}
                    data-ocid="library.resource_item"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.text,
                      }}
                    >
                      {TYPE_ICONS[r.type] ?? TYPE_ICONS.link}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.subject} · {r.date}
                        {r.uploadedBy && ` · ${r.uploadedBy}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        className="text-xs"
                        style={{
                          background: typeStyle.bg,
                          color: typeStyle.text,
                          border: "none",
                        }}
                      >
                        {r.type.toUpperCase()}
                      </Badge>
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-muted"
                          style={{ borderColor: "oklch(0.88 0.018 260)" }}
                          data-ocid="library.open_resource"
                        >
                          <ExternalLink size={12} />
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lesson Plans tab */}
      {tab === "lessons" && (
        <div className="space-y-3">
          {lessonPlans.length === 0 ? (
            <div
              className="rounded-xl border py-16 text-center"
              style={{
                borderColor: "oklch(0.88 0.018 260)",
                background: "oklch(0.985 0.003 260)",
              }}
              data-ocid="library.lessons_empty_state"
            >
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-muted-foreground">
                No lesson plans uploaded yet.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              data-ocid="library.lessons_list"
            >
              {lessonPlans.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid="library.lesson_item"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className="text-xs"
                      style={{
                        background: "oklch(0.55 0.15 130 / 0.12)",
                        color: "oklch(0.38 0.14 130)",
                        border: "none",
                      }}
                    >
                      {p.subject}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {p.week}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {p.topic}
                  </p>
                  {p.objectives && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.objectives}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{p.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Syllabus tab */}
      {tab === "syllabus" && (
        <div className="space-y-2">
          {classSyllabus.length === 0 ? (
            <div
              className="rounded-xl border py-16 text-center"
              style={{
                borderColor: "oklch(0.88 0.018 260)",
                background: "oklch(0.985 0.003 260)",
              }}
              data-ocid="library.syllabus_empty_state"
            >
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-muted-foreground">
                No syllabus added yet for Class {student.class}.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="library.syllabus_list">
              {classSyllabus.map((s) => (
                <SyllabusAccordion key={s.subject} subject={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
