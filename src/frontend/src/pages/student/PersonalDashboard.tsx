import type { ClassSyllabus, Notification } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Student } from "@/data/mockData";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  MessageCircle,
  Trophy,
} from "lucide-react";
// ClassSyllabus is used in props typing only

interface Props {
  student: Student;
  notifications: Notification[];
  syllabus: ClassSyllabus;
  principalId: string;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accentColor,
  bgColor,
}: StatCardProps) {
  return (
    <Card
      className="border shadow-xs"
      style={{ borderColor: "oklch(0.88 0.018 260)" }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bgColor }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold" style={{ color: accentColor }}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PersonalDashboard({
  student,
  notifications,
  syllabus: _syllabus,
}: Props) {
  const presentCount = student.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const totalDays = student.attendance.length;
  const attendancePct =
    totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const totalMarks = student.marks.reduce(
    (sum, m) => sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
    0,
  );
  const maxMarks = student.marks.reduce((sum, m) => sum + m.max * 5, 0);
  const avgPct = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.paid, 0);
  const outstanding = totalFees - paidFees;

  // Exam timetable from localStorage
  const rawExams = (() => {
    try {
      const raw = localStorage.getItem("lords_exam_timetables_default");
      if (raw) {
        const all = JSON.parse(raw) as Array<{
          class: string;
          subject: string;
          date: string;
          time: string;
          duration: string;
          examType: string;
        }>;
        return all
          .filter(
            (e) => e.class === student.class && new Date(e.date) >= new Date(),
          )
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .slice(0, 3);
      }
    } catch {}
    return [];
  })();

  const recentNotices = notifications.slice(0, 4);

  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Header */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "oklch(0.88 0.018 260)" }}
      >
        <div
          className="h-1.5"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.55 0.15 130), oklch(0.65 0.14 155), oklch(0.45 0.12 200))",
          }}
        />
        <div
          className="px-5 py-5 flex items-center gap-4"
          style={{ background: "oklch(1 0 0)" }}
        >
          <div
            className="w-16 h-16 rounded-full overflow-hidden border-4 flex items-center justify-center font-bold text-lg shrink-0"
            style={{
              borderColor: "oklch(0.55 0.15 130 / 0.25)",
              background: "oklch(0.55 0.15 130 / 0.08)",
              color: "oklch(0.38 0.14 130)",
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
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">
              Welcome back,
            </p>
            <h2 className="text-xl font-bold text-foreground truncate">
              {student.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Class {student.class} · Roll No. {student.rollNo}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} style={{ color: "oklch(0.62 0.18 80)" }} />
              <span className="text-sm font-bold text-foreground">
                Rank #{student.rank ?? "—"}
              </span>
            </div>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                background: "oklch(0.55 0.15 130 / 0.1)",
                color: "oklch(0.38 0.14 130)",
              }}
            >
              Lord&apos;s International School
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
        data-ocid="student.stats_grid"
      >
        <StatCard
          label="Attendance"
          value={`${attendancePct}%`}
          sub={`${presentCount} / ${totalDays} days present`}
          icon={<CheckCircle2 size={20} />}
          accentColor="oklch(0.40 0.15 150)"
          bgColor="oklch(0.55 0.15 150 / 0.12)"
        />
        <StatCard
          label="Overall Average"
          value={`${avgPct}%`}
          sub={`${totalMarks} / ${maxMarks} marks`}
          icon={<GraduationCap size={20} />}
          accentColor="oklch(0.35 0.14 255)"
          bgColor="oklch(0.52 0.18 255 / 0.10)"
        />
        <StatCard
          label="Fee Outstanding"
          value={`₹${outstanding.toLocaleString()}`}
          sub={`₹${paidFees.toLocaleString()} paid of ₹${totalFees.toLocaleString()}`}
          icon={<CreditCard size={20} />}
          accentColor={
            outstanding > 0 ? "oklch(0.45 0.18 25)" : "oklch(0.38 0.14 150)"
          }
          bgColor={
            outstanding > 0
              ? "oklch(0.55 0.22 25 / 0.10)"
              : "oklch(0.55 0.15 150 / 0.10)"
          }
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Exams */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar size={15} style={{ color: "oklch(0.55 0.15 130)" }} />
            Upcoming Exams
          </h3>
          {rawExams.length === 0 ? (
            <div
              className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground"
              style={{ borderColor: "oklch(0.88 0.018 260)" }}
              data-ocid="student.exams_empty_state"
            >
              <Calendar size={28} className="mx-auto mb-2 opacity-30" />
              No upcoming exams scheduled
            </div>
          ) : (
            <div className="space-y-2" data-ocid="student.upcoming_exams">
              {rawExams.map((e, examIdx) => (
                <div
                  key={`${e.subject}-${e.date}`}
                  className="rounded-xl border px-4 py-3 flex items-center gap-3"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid={`student.exam_item.${examIdx + 1}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
                    style={{ background: "oklch(0.55 0.15 130)" }}
                  >
                    <span className="text-xs font-bold leading-none">
                      {new Date(e.date).getDate()}
                    </span>
                    <span className="text-xs opacity-80">
                      {new Date(e.date).toLocaleString("en", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {e.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.examType} · {e.time}
                    </p>
                  </div>
                  <Badge
                    className="text-xs shrink-0"
                    style={{
                      background: "oklch(0.55 0.15 130 / 0.1)",
                      color: "oklch(0.38 0.14 130)",
                      border: "none",
                    }}
                  >
                    {e.duration}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageCircle
              size={15}
              style={{ color: "oklch(0.55 0.15 130)" }}
            />
            Recent Notices
          </h3>
          {recentNotices.length === 0 ? (
            <div
              className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground"
              style={{ borderColor: "oklch(0.88 0.018 260)" }}
              data-ocid="student.notices_empty_state"
            >
              <AlertCircle size={28} className="mx-auto mb-2 opacity-30" />
              No notices yet
            </div>
          ) : (
            <div className="space-y-2" data-ocid="student.recent_notices">
              {recentNotices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border px-4 py-3"
                  style={{
                    borderColor: n.read
                      ? "oklch(0.88 0.018 260)"
                      : "oklch(0.55 0.15 130 / 0.35)",
                    background: n.read
                      ? "oklch(1 0 0)"
                      : "oklch(0.97 0.02 130)",
                  }}
                  data-ocid="student.notice_item"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.55 0.15 130 / 0.12)",
                        color: "oklch(0.38 0.14 130)",
                      }}
                    >
                      {n.type}
                    </span>
                    {!n.read && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.52 0.18 255 / 0.12)",
                          color: "oklch(0.32 0.14 255)",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marks Summary */}
      {student.marks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen size={15} style={{ color: "oklch(0.55 0.15 130)" }} />
            Subject Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {student.marks.map((m) => {
              const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
              const max = m.max * 5;
              const pct = max > 0 ? Math.round((total / max) * 100) : 0;
              const color =
                pct >= 80
                  ? "oklch(0.40 0.15 150)"
                  : pct >= 60
                    ? "oklch(0.35 0.14 255)"
                    : "oklch(0.45 0.18 25)";
              const bg =
                pct >= 80
                  ? "oklch(0.55 0.15 150 / 0.08)"
                  : pct >= 60
                    ? "oklch(0.52 0.18 255 / 0.08)"
                    : "oklch(0.55 0.22 25 / 0.08)";
              return (
                <div
                  key={m.subject}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: bg,
                  }}
                >
                  <p className="text-xs font-medium text-foreground truncate mb-2">
                    {m.subject}
                  </p>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ background: "oklch(0.88 0.018 260)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <p className="text-sm font-bold" style={{ color }}>
                    {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
