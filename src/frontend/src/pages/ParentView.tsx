import type { ClassSyllabus, Notification, SyllabusSubject } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import { getMediaBlobUrl } from "@/utils/mediaStorage";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Image,
  Info,
  Lock,
  MessageCircle,
  NotebookPen,
  Phone,
  Star,
  Trophy,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import ParentDiaryView from "./ParentDiaryView";
import ParentDoubtChat from "./ParentDoubtChat";
import ParentExamTimetableView from "./ParentExamTimetableView";
import ParentTestMarksView from "./ParentTestMarksView";

interface Props {
  student: Student;
  notifications: Notification[];
  syllabus: ClassSyllabus;
  principalId?: string;
}

interface MediaItem {
  id: string;
  fileType: "photo" | "video";
  url: string;
  caption: string;
  uploadedAt: string;
}

const feeStatusStyles: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Paid: {
    bg: "oklch(0.95 0.06 150)",
    text: "oklch(0.32 0.14 150)",
    dot: "oklch(0.55 0.18 150)",
  },
  Pending: {
    bg: "oklch(0.97 0.06 80)",
    text: "oklch(0.45 0.14 80)",
    dot: "oklch(0.70 0.18 80)",
  },
  Overdue: {
    bg: "oklch(0.96 0.06 25)",
    text: "oklch(0.42 0.18 25)",
    dot: "oklch(0.60 0.22 25)",
  },
};

const attendanceStatusStyles: Record<string, { bg: string; text: string }> = {
  Present: { bg: "oklch(0.95 0.06 150)", text: "oklch(0.32 0.14 150)" },
  Absent: { bg: "oklch(0.96 0.06 25)", text: "oklch(0.42 0.18 25)" },
  Late: { bg: "oklch(0.97 0.06 80)", text: "oklch(0.45 0.14 80)" },
};

const notifCategoryStyles: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  Alert: {
    bg: "oklch(0.97 0.06 60)",
    text: "oklch(0.45 0.15 60)",
    icon: <AlertCircle size={13} />,
  },
  Holiday: {
    bg: "oklch(0.95 0.06 150)",
    text: "oklch(0.35 0.14 150)",
    icon: <Calendar size={13} />,
  },
  Exam: {
    bg: "oklch(0.95 0.05 255)",
    text: "oklch(0.35 0.12 255)",
    icon: <BookOpen size={13} />,
  },
  Fees: {
    bg: "oklch(0.96 0.06 25)",
    text: "oklch(0.42 0.18 25)",
    icon: <FileText size={13} />,
  },
  Marks: {
    bg: "oklch(0.95 0.05 255)",
    text: "oklch(0.35 0.12 255)",
    icon: <GraduationCap size={13} />,
  },
  Syllabus: {
    bg: "oklch(0.96 0.05 300)",
    text: "oklch(0.40 0.12 300)",
    icon: <BookOpen size={13} />,
  },
  Announcement: {
    bg: "oklch(0.97 0.06 60)",
    text: "oklch(0.45 0.15 60)",
    icon: <AlertCircle size={13} />,
  },
  General: {
    bg: "oklch(0.95 0.01 260)",
    text: "oklch(0.40 0.04 260)",
    icon: <Info size={13} />,
  },
};

function getGradeStyle(pct: number): {
  grade: string;
  bg: string;
  text: string;
} {
  if (pct >= 90)
    return {
      grade: "A+",
      bg: "oklch(0.93 0.07 150)",
      text: "oklch(0.30 0.16 150)",
    };
  if (pct >= 80)
    return {
      grade: "A",
      bg: "oklch(0.94 0.05 255)",
      text: "oklch(0.32 0.14 255)",
    };
  if (pct >= 70)
    return {
      grade: "B",
      bg: "oklch(0.94 0.05 230)",
      text: "oklch(0.35 0.14 230)",
    };
  if (pct >= 60)
    return {
      grade: "C",
      bg: "oklch(0.96 0.06 80)",
      text: "oklch(0.44 0.14 80)",
    };
  return { grade: "D", bg: "oklch(0.96 0.06 25)", text: "oklch(0.42 0.18 25)" };
}

function loadMedia(studentId: number): MediaItem[] {
  try {
    const raw = localStorage.getItem(`lords_media_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function downloadMedia(
  blobUrl: string,
  fileType: "photo" | "video",
  caption: string,
) {
  const ext = fileType === "photo" ? "jpg" : "mp4";
  const filename = caption ? `${caption}.${ext}` : `${fileType}.${ext}`;
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Accordion subject card for the Syllabus tab */
function SubjectAccordion({ subject }: { subject: SyllabusSubject }) {
  const [open, setOpen] = useState(false);
  const completedCount = subject.chapters.filter(
    (c) => c.status === "Completed",
  ).length;
  const total = subject.chapters.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

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
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.25 0.10 265 / 0.08)" }}
          >
            <BookOpen size={14} style={{ color: "oklch(0.35 0.12 265)" }} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {subject.subject}
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{total} chapters · {pct}% complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-20 h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.88 0.018 260)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background:
                    pct === 100
                      ? "oklch(0.55 0.18 150)"
                      : "oklch(0.52 0.18 255)",
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
          style={{
            borderTop: "1px solid oklch(0.91 0.01 260)",
            borderColor: "oklch(0.91 0.01 260)",
          }}
        >
          {subject.chapters.map((c) => {
            const statusStyle =
              c.status === "Completed"
                ? { bg: "oklch(0.93 0.07 150)", text: "oklch(0.30 0.16 150)" }
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
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.text,
                  }}
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

export default function ParentView({
  student,
  notifications,
  syllabus,
  principalId = "default",
}: Props) {
  const presentCount = student.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const absentCount = student.attendance.filter(
    (a) => a.status === "Absent",
  ).length;
  const lateCount = student.attendance.filter(
    (a) => a.status === "Late",
  ).length;
  const attendancePct =
    student.attendance.length > 0
      ? Math.round((presentCount / student.attendance.length) * 100)
      : 0;
  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.paid, 0);
  const overdueFees = student.fees.filter((f) => f.status === "Overdue");

  const grandTotal = student.marks.reduce(
    (sum, m) => sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
    0,
  );

  const [media] = useState<MediaItem[]>(() => loadMedia(student.id));
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      for (const item of media) {
        const url = await getMediaBlobUrl(item.id);
        if (url && !cancelled) {
          setBlobUrls((prev) => ({ ...prev, [item.id]: url }));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [media]);

  // Initials fallback
  const initials = student.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5">
      {/* ── Student Profile Header ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "oklch(0.88 0.018 260)",
          background: "oklch(1 0 0)",
        }}
      >
        {/* Colored top band */}
        <div
          className="h-2"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.25 0.10 265), oklch(0.52 0.18 255), oklch(0.72 0.18 80))",
          }}
        />
        <div className="px-5 py-5 flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-4 flex items-center justify-center font-bold text-xl"
              style={{
                borderColor: "oklch(0.25 0.10 265 / 0.18)",
                background: "oklch(0.25 0.10 265 / 0.10)",
                color: "oklch(0.25 0.10 265)",
              }}
            >
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {/* Secure badge */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white"
              style={{ background: "oklch(0.50 0.18 150)" }}
              title="Secure Session"
            >
              <Lock size={10} className="text-white" />
            </div>
          </div>

          {/* Student info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">
                {student.name}
              </h2>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.72 0.18 80 / 0.15)",
                  color: "oklch(0.45 0.18 80)",
                }}
              >
                <Lock size={9} /> Secure Session
              </span>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.35 0.10 265)" }}
            >
              Class {student.class}
            </p>
            <p className="text-xs text-muted-foreground">
              Roll No. {student.rollNo} · Lord&apos;s International School Group
            </p>
          </div>

          {/* Quick stats on right */}
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} style={{ color: "oklch(0.72 0.18 80)" }} />
              <span
                className="text-sm font-bold"
                style={{ color: "oklch(0.25 0.10 265)" }}
              >
                Rank #{student.rank ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                size={13}
                style={{ color: "oklch(0.55 0.18 150)" }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {attendancePct}% Attendance
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap
                size={13}
                style={{ color: "oklch(0.52 0.18 255)" }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {grandTotal} Total Marks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick stats row (mobile) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:hidden">
        {[
          {
            label: "Attendance",
            value: `${attendancePct}%`,
            icon: <Calendar size={14} />,
            color: "oklch(0.55 0.18 150)",
          },
          {
            label: "Class Rank",
            value: `#${student.rank ?? "—"}`,
            icon: <Trophy size={14} />,
            color: "oklch(0.72 0.18 80)",
          },
          {
            label: "Fees Paid",
            value: `₹${paidFees.toLocaleString()}`,
            icon: <FileText size={14} />,
            color: "oklch(0.52 0.18 255)",
          },
          {
            label: "Overdue",
            value: String(overdueFees.length),
            icon: <AlertCircle size={14} />,
            color: "oklch(0.60 0.22 25)",
          },
        ].map(({ label, value, icon, color }) => (
          <Card
            key={label}
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
                {icon}
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-lg font-bold" style={{ color }}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Tabs ── */}
      <Tabs defaultValue="profile">
        {/* Scrollable tab nav */}
        <div
          className="overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          <TabsList
            className="h-auto p-0 bg-transparent gap-0 flex flex-nowrap min-w-max w-full border-b"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
            data-ocid="parent.tab"
          >
            {[
              { value: "profile", label: "Profile", icon: <User size={12} /> },
              {
                value: "marks",
                label: "Marks",
                icon: <GraduationCap size={12} />,
              },
              { value: "fees", label: "Fees", icon: <FileText size={12} /> },
              {
                value: "attendance",
                label: "Attendance",
                icon: <Calendar size={12} />,
              },
              {
                value: "syllabus",
                label: "Syllabus",
                icon: <BookOpen size={12} />,
              },
              {
                value: "notifications",
                label: "Notices",
                icon: <AlertCircle size={12} />,
              },
              { value: "media", label: "Media", icon: <Image size={12} /> },
              {
                value: "doubt-chat",
                label: "Doubt Chat",
                icon: <MessageCircle size={12} />,
              },
              {
                value: "diary",
                label: "Diary",
                icon: <NotebookPen size={12} />,
              },
              {
                value: "exam-timetable",
                label: "Exam Timetable",
                icon: <ClipboardList size={12} />,
              },
              {
                value: "test-marks",
                label: "Test Marks",
                icon: <Star size={12} />,
              },
            ].map(({ value, label, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                data-ocid="parent.tab"
                className="relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-none bg-transparent whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary"
                style={{
                  color: "oklch(0.50 0.04 260)",
                }}
              >
                {icon}
                {label}
                {/* Active underline — implemented via CSS in the component */}
                <span className="sr-only">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student info card */}
            <Card
              className="border shadow-xs"
              style={{ borderColor: "oklch(0.88 0.018 260)" }}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-sm flex items-center gap-2"
                  style={{ color: "oklch(0.25 0.10 265)" }}
                >
                  <User size={15} style={{ color: "oklch(0.52 0.18 255)" }} />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    { label: "Full Name", value: student.name },
                    { label: "Class", value: student.class },
                    { label: "Roll Number", value: String(student.rollNo) },
                    { label: "Date of Birth", value: student.dob },
                    { label: "Blood Group", value: student.bloodGroup },
                    { label: "Address", value: student.address },
                  ] as { label: string; value: string }[]
                ).map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Parent / Contact info card */}
            <Card
              className="border shadow-xs"
              style={{ borderColor: "oklch(0.88 0.018 260)" }}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-sm flex items-center gap-2"
                  style={{ color: "oklch(0.25 0.10 265)" }}
                >
                  <Phone size={15} style={{ color: "oklch(0.52 0.18 255)" }} />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    { label: "Phone", value: student.phone },
                    { label: "Email", value: student.email },
                    { label: "Parent/Guardian", value: student.parentName },
                    { label: "Parent Phone", value: student.parentPhone },
                    { label: "Admission Year", value: student.admissionYear },
                  ] as { label: string; value: string }[]
                ).map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Marks Tab ── */}
        <TabsContent value="marks" className="mt-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl border p-4 flex items-center gap-3"
              style={{
                background: "oklch(0.25 0.10 265 / 0.05)",
                borderColor: "oklch(0.25 0.10 265 / 0.18)",
              }}
              data-ocid="marks.panel"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.25 0.10 265 / 0.12)" }}
              >
                <Trophy size={20} style={{ color: "oklch(0.72 0.18 80)" }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.40 0.08 265)" }}
                >
                  Class Rank
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.25 0.10 265)" }}
                >
                  #{student.rank ?? "—"}
                </p>
              </div>
            </div>
            <div
              className="rounded-xl border p-4 flex items-center gap-3"
              style={{
                background: "oklch(0.50 0.18 150 / 0.06)",
                borderColor: "oklch(0.50 0.18 150 / 0.20)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.50 0.18 150 / 0.12)" }}
              >
                <GraduationCap
                  size={20}
                  style={{ color: "oklch(0.42 0.16 150)" }}
                />
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.36 0.10 150)" }}
                >
                  Total Marks
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.32 0.14 150)" }}
                >
                  {grandTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Read-only note */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "oklch(0.97 0.06 80 / 0.5)",
              border: "1px solid oklch(0.88 0.10 80 / 0.4)",
              color: "oklch(0.45 0.14 80)",
            }}
          >
            <Info size={13} className="flex-shrink-0" />
            <span>
              Read Only — Only the principal can edit marks and grades
            </span>
          </div>

          {/* Marks table */}
          <Card
            className="border shadow-xs overflow-hidden"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "oklch(0.96 0.01 260)" }}>
                    {[
                      "Subject",
                      "PT 1",
                      "PT 2",
                      "PT 3",
                      "Term 1",
                      "Term 2",
                      "Total",
                      "Grade",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`py-3 text-xs font-semibold uppercase tracking-wide ${
                          h === "Subject"
                            ? "text-left px-4"
                            : "text-center px-3"
                        }`}
                        style={{ color: "oklch(0.45 0.05 260)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {student.marks.map((m, idx) => {
                    const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                    const maxTotal = m.max * 5;
                    const pct = Math.round((total / maxTotal) * 100);
                    const gs = getGradeStyle(pct);
                    return (
                      <tr
                        key={m.subject}
                        className="border-b last:border-0"
                        style={{
                          borderColor: "oklch(0.93 0.01 260)",
                          background:
                            idx % 2 === 0
                              ? "oklch(1 0 0)"
                              : "oklch(0.985 0.003 260)",
                        }}
                        data-ocid={`marks.row.${idx + 1}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {m.subject}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {m.pt1}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {m.pt2}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {m.pt3}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {m.term1}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {m.term2}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold text-foreground">
                            {total}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{maxTotal}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: gs.bg, color: gs.text }}
                          >
                            {gs.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div
              className="sm:hidden divide-y"
              style={{ borderColor: "oklch(0.93 0.01 260)" }}
            >
              {student.marks.map((m) => {
                const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                const maxTotal = m.max * 5;
                const pct = Math.round((total / maxTotal) * 100);
                const gs = getGradeStyle(pct);
                return (
                  <div key={m.subject} className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">
                        {m.subject}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: gs.bg, color: gs.text }}
                      >
                        {gs.grade}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "PT 1", val: m.pt1 },
                        { label: "PT 2", val: m.pt2 },
                        { label: "PT 3", val: m.pt3 },
                        { label: "Term 1", val: m.term1 },
                        { label: "Term 2", val: m.term2 },
                        { label: "Total", val: `${total}/${maxTotal}` },
                      ].map(({ label, val }) => (
                        <div
                          key={label}
                          className="rounded-lg px-2 py-1.5 text-center"
                          style={{ background: "oklch(0.96 0.01 260)" }}
                        >
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ── Fees Tab ── */}
        <TabsContent value="fees" className="mt-4 space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Fees",
                value: `₹${totalFees.toLocaleString()}`,
                color: "oklch(0.25 0.10 265)",
              },
              {
                label: "Paid",
                value: `₹${paidFees.toLocaleString()}`,
                color: "oklch(0.42 0.16 150)",
              },
              {
                label: "Overdue",
                value: `${overdueFees.length} item${overdueFees.length !== 1 ? "s" : ""}`,
                color: "oklch(0.55 0.22 25)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border p-3 text-center"
                style={{
                  borderColor: "oklch(0.88 0.018 260)",
                  background: "oklch(1 0 0)",
                }}
              >
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-base font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Fee cards */}
          <div className="space-y-2">
            {student.fees.map((f) => {
              const s = feeStatusStyles[f.status] ?? feeStatusStyles.Pending;
              return (
                <div
                  key={f.id}
                  className="rounded-xl border p-4 flex items-center justify-between"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid="fees.card"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {f.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {f.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      ₹{f.amount.toLocaleString()}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1"
                      style={{ background: s.bg, color: s.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: s.dot }}
                      />
                      {f.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Attendance Tab ── */}
        <TabsContent value="attendance" className="mt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: "Present",
                value: presentCount,
                color: "oklch(0.42 0.16 150)",
                bg: "oklch(0.95 0.06 150)",
              },
              {
                label: "Absent",
                value: absentCount,
                color: "oklch(0.42 0.18 25)",
                bg: "oklch(0.96 0.06 25)",
              },
              {
                label: "Late",
                value: lateCount,
                color: "oklch(0.45 0.14 80)",
                bg: "oklch(0.96 0.06 80)",
              },
              {
                label: "Attendance",
                value: `${attendancePct}%`,
                color: "oklch(0.32 0.12 255)",
                bg: "oklch(0.94 0.05 255)",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-xl border p-3 text-center"
                style={{ borderColor: "oklch(0.88 0.018 260)", background: bg }}
              >
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-lg font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {student.attendance.map((a) => {
              const s =
                attendanceStatusStyles[a.status] ??
                attendanceStatusStyles.Present;
              return (
                <div
                  key={a.date}
                  className="rounded-xl border p-2.5 text-center"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                >
                  <p className="text-xs text-muted-foreground">{a.day}</p>
                  <p className="text-sm font-semibold text-foreground my-0.5">
                    {a.date}
                  </p>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.text }}
                  >
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Syllabus Tab ── */}
        <TabsContent value="syllabus" className="mt-4">
          <div className="space-y-2">
            {(syllabus[student.class] ?? []).length === 0 ? (
              <div
                className="text-center py-12 rounded-xl border"
                style={{
                  borderColor: "oklch(0.88 0.018 260)",
                  background: "oklch(0.985 0.003 260)",
                }}
                data-ocid="syllabus.empty_state"
              >
                <BookOpen
                  size={32}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.70 0.04 260)" }}
                />
                <p className="text-sm font-medium text-muted-foreground">
                  No syllabus added yet for your class.
                </p>
              </div>
            ) : (
              (syllabus[student.class] ?? []).map((s) => (
                <SubjectAccordion key={s.subject} subject={s} />
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Notices Tab ── */}
        <TabsContent value="notifications" className="mt-4">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div
                className="text-center py-12 rounded-xl border"
                style={{
                  borderColor: "oklch(0.88 0.018 260)",
                  background: "oklch(0.985 0.003 260)",
                }}
                data-ocid="notices.empty_state"
              >
                <AlertCircle
                  size={32}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.70 0.04 260)" }}
                />
                <p className="text-sm font-medium text-muted-foreground">
                  No notices from the school yet.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const ns =
                  notifCategoryStyles[n.type] ?? notifCategoryStyles.General;
                return (
                  <div
                    key={n.id}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: n.read
                        ? "oklch(0.88 0.018 260)"
                        : "oklch(0.75 0.10 255 / 0.4)",
                      background: n.read
                        ? "oklch(1 0 0)"
                        : "oklch(0.97 0.02 255)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Timeline dot */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: ns.bg, color: ns.text }}
                      >
                        {ns.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: ns.bg, color: ns.text }}
                          >
                            {n.type}
                          </span>
                          {!n.read && (
                            <span
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "oklch(0.52 0.18 255 / 0.15)",
                                color: "oklch(0.32 0.14 255)",
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-foreground mb-0.5">
                          {n.title}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {n.date}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ── Media Tab ── */}
        <TabsContent value="media" className="mt-4">
          {media.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center rounded-xl border"
              style={{
                borderColor: "oklch(0.88 0.018 260)",
                background: "oklch(0.985 0.003 260)",
              }}
              data-ocid="media.empty_state"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "oklch(0.25 0.10 265 / 0.08)" }}
              >
                <Image size={28} style={{ color: "oklch(0.55 0.10 265)" }} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No media shared by the principal yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Photos and videos uploaded by the principal will appear here.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              data-ocid="media.list"
            >
              {media.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid={`media.item.${idx + 1}`}
                >
                  <div className="relative">
                    {blobUrls[item.id] ? (
                      item.fileType === "photo" ? (
                        <img
                          src={blobUrls[item.id]}
                          alt={item.caption || "Shared photo"}
                          className="w-full h-52 object-cover"
                        />
                      ) : (
                        <video
                          src={blobUrls[item.id]}
                          controls
                          className="w-full h-52 object-contain bg-black"
                        >
                          <track kind="captions" />
                        </video>
                      )
                    ) : (
                      <div
                        className="w-full h-52 flex items-center justify-center"
                        style={{ background: "oklch(0.93 0.01 260)" }}
                      >
                        <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.15 0.04 265 / 0.7)",
                          color: "oklch(0.95 0.02 260)",
                        }}
                      >
                        {item.fileType === "photo" ? (
                          <Image size={10} />
                        ) : (
                          <Video size={10} />
                        )}
                        {item.fileType === "photo" ? "Photo" : "Video"}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    {item.caption && (
                      <p className="text-sm font-medium text-foreground mb-1">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.uploadedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {blobUrls[item.id] && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          style={{
                            borderColor: "oklch(0.52 0.18 255 / 0.4)",
                            color: "oklch(0.35 0.14 255)",
                          }}
                          onClick={() =>
                            downloadMedia(
                              blobUrls[item.id],
                              item.fileType,
                              item.caption,
                            )
                          }
                        >
                          <Download size={12} />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Doubt Chat Tab ── */}
        <TabsContent value="doubt-chat" className="mt-4">
          <Card
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-4">
              <ParentDoubtChat
                studentId={student.id}
                studentName={student.name}
                principalId={principalId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Diary Tab ── */}
        <TabsContent value="diary" className="mt-4">
          <Card
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-4">
              <ParentDiaryView
                studentClass={student.class}
                principalId={principalId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Exam Timetable Tab ── */}
        <TabsContent value="exam-timetable" className="mt-4">
          <Card
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-4">
              <ParentExamTimetableView
                studentClass={student.class}
                principalId={principalId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Test Marks Tab ── */}
        <TabsContent value="test-marks" className="mt-4">
          <Card
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-4">
              <ParentTestMarksView
                student={student}
                principalId={principalId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
