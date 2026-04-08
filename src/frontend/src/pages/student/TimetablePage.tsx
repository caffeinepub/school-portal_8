import { Badge } from "@/components/ui/badge";
import type { Student } from "@/data/mockData";
import { Calendar, Clock } from "lucide-react";

interface Props {
  student: Student;
  principalId: string;
}

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

interface ExamEntry {
  id: string;
  class: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  examType: string;
  venue?: string;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function loadTimetable(
  principalId: string,
  studentClass: string,
): TimetableEntry[] {
  try {
    const raw = localStorage.getItem(`lords_timetable_${principalId}`);
    if (raw) {
      const all = JSON.parse(raw) as TimetableEntry[];
      return all.filter((e) => e.class === studentClass);
    }
  } catch {}
  return [];
}

function loadExams(principalId: string, studentClass: string): ExamEntry[] {
  try {
    const keys = [
      `lords_exam_timetables_${principalId}`,
      "lords_exam_timetables_default",
    ];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const all = JSON.parse(raw) as ExamEntry[];
        const filtered = all.filter((e) => e.class === studentClass);
        if (filtered.length > 0) return filtered;
      }
    }
  } catch {}
  return [];
}

function getTodayDay(): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
}

export default function TimetablePage({ student, principalId }: Props) {
  const timetable = loadTimetable(principalId, student.class);
  const exams = loadExams(principalId, student.class);
  const todayDay = getTodayDay();

  const upcomingExams = exams
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastExams = exams
    .filter((e) => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Group timetable by day
  const byDay: Record<string, TimetableEntry[]> = {};
  for (const day of DAYS) {
    byDay[day] = timetable
      .filter((e) => e.day === day)
      .sort((a, b) => a.period - b.period);
  }

  // Today's entries
  const todayEntries = byDay[todayDay] ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">Timetable</h2>
        <p className="text-sm text-muted-foreground">
          Class {student.class} — weekly schedule and exam dates
        </p>
      </div>

      {/* Today's schedule */}
      {DAYS.includes(todayDay) && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock size={15} style={{ color: "oklch(0.55 0.15 130)" }} />
            Today&apos;s Schedule
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.55 0.15 130)",
                color: "oklch(0.97 0.02 130)",
                border: "none",
              }}
            >
              {todayDay}
            </Badge>
          </h3>
          {todayEntries.length === 0 ? (
            <div
              className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground"
              style={{ borderColor: "oklch(0.88 0.018 260)" }}
              data-ocid="timetable.today_empty"
            >
              No periods scheduled for today.
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              data-ocid="timetable.today_schedule"
            >
              {todayEntries.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border px-4 py-3 flex items-center gap-3"
                  style={{
                    borderColor: "oklch(0.55 0.15 130 / 0.3)",
                    background: "oklch(0.97 0.02 130)",
                  }}
                  data-ocid="timetable.today_period"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-white"
                    style={{ background: "oklch(0.55 0.15 130)" }}
                  >
                    P{e.period}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {e.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.startTime}
                      {e.endTime && ` – ${e.endTime}`}
                      {e.teacher && ` · ${e.teacher}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly timetable */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar size={15} style={{ color: "oklch(0.55 0.15 130)" }} />
          Weekly Schedule
        </h3>

        {timetable.length === 0 ? (
          <div
            className="rounded-xl border py-16 text-center"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(0.985 0.003 260)",
            }}
            data-ocid="timetable.weekly_empty_state"
          >
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">
              No timetable set up yet for Class {student.class}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your principal will add the schedule here.
            </p>
          </div>
        ) : (
          /* Responsive grid: stacked on mobile, grid on desktop */
          <div className="space-y-3" data-ocid="timetable.weekly_schedule">
            {DAYS.filter((d) => (byDay[d]?.length ?? 0) > 0).map((day) => (
              <div
                key={day}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor:
                    day === todayDay
                      ? "oklch(0.55 0.15 130 / 0.4)"
                      : "oklch(0.88 0.018 260)",
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2"
                  style={{
                    background:
                      day === todayDay
                        ? "oklch(0.55 0.15 130)"
                        : "oklch(0.96 0.01 260)",
                    color: day === todayDay ? "white" : "oklch(0.25 0.08 260)",
                  }}
                >
                  <span className="text-sm font-semibold">{day}</span>
                  {day === todayDay && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20 font-medium">
                      Today
                    </span>
                  )}
                  <span
                    className="ml-auto text-xs opacity-70"
                    style={{ color: day === todayDay ? "white" : undefined }}
                  >
                    {byDay[day].length} period
                    {byDay[day].length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(0.93 0.01 260)" }}
                >
                  {byDay[day].map((e) => (
                    <div
                      key={e.id}
                      className="px-4 py-2.5 flex items-center gap-3"
                      style={{ background: "oklch(1 0 0)" }}
                      data-ocid="timetable.period_row"
                    >
                      <span
                        className="text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: "oklch(0.55 0.15 130 / 0.1)",
                          color: "oklch(0.38 0.14 130)",
                        }}
                      >
                        P{e.period}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {e.subject}
                        </p>
                        {e.teacher && (
                          <p className="text-xs text-muted-foreground truncate">
                            {e.teacher}
                          </p>
                        )}
                      </div>
                      {(e.startTime || e.endTime) && (
                        <p className="text-xs text-muted-foreground shrink-0">
                          {e.startTime}
                          {e.endTime && `–${e.endTime}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam timetable */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar size={15} style={{ color: "oklch(0.52 0.18 255)" }} />
          Exam Timetable
        </h3>

        {/* Upcoming exams */}
        {upcomingExams.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Upcoming
            </p>
            <div className="space-y-2" data-ocid="timetable.upcoming_exams">
              {upcomingExams.map((e) => {
                const d = new Date(e.date);
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={e.id}
                    className="rounded-xl border px-4 py-3 flex items-center gap-4"
                    style={{
                      borderColor: isToday
                        ? "oklch(0.52 0.18 255 / 0.4)"
                        : "oklch(0.88 0.018 260)",
                      background: isToday
                        ? "oklch(0.96 0.02 255)"
                        : "oklch(1 0 0)",
                    }}
                    data-ocid="timetable.exam_item"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                      style={{
                        background: isToday
                          ? "oklch(0.52 0.18 255)"
                          : "oklch(0.35 0.14 255)",
                      }}
                    >
                      <span className="text-base font-bold leading-none">
                        {d.getDate()}
                      </span>
                      <span className="text-xs opacity-80">
                        {d.toLocaleString("en", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {e.subject}
                        </p>
                        {isToday && (
                          <Badge
                            className="text-xs"
                            style={{
                              background: "oklch(0.52 0.18 255 / 0.15)",
                              color: "oklch(0.32 0.14 255)",
                              border: "none",
                            }}
                          >
                            Today
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {e.examType} · {e.time}
                        {e.duration && ` · ${e.duration}`}
                        {e.venue && ` · ${e.venue}`}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-lg shrink-0"
                      style={{
                        background: "oklch(0.52 0.18 255 / 0.1)",
                        color: "oklch(0.32 0.14 255)",
                      }}
                    >
                      {d.toLocaleDateString("en-IN", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past exams */}
        {pastExams.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Completed
            </p>
            <div className="space-y-2" data-ocid="timetable.past_exams">
              {pastExams.map((e) => {
                const d = new Date(e.date);
                return (
                  <div
                    key={e.id}
                    className="rounded-xl border px-4 py-3 flex items-center gap-4 opacity-60"
                    style={{
                      borderColor: "oklch(0.88 0.018 260)",
                      background: "oklch(0.985 0.003 260)",
                    }}
                    data-ocid="timetable.past_exam_item"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: "oklch(0.55 0.03 260)",
                        color: "oklch(0.92 0.02 260)",
                      }}
                    >
                      <span className="text-base font-bold leading-none">
                        {d.getDate()}
                      </span>
                      <span className="text-xs opacity-80">
                        {d.toLocaleString("en", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {e.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.examType} · {e.time}
                      </p>
                    </div>
                    <Badge
                      className="text-xs shrink-0"
                      style={{
                        background: "oklch(0.93 0.01 260)",
                        color: "oklch(0.48 0.03 260)",
                        border: "none",
                      }}
                    >
                      Done
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {exams.length === 0 && (
          <div
            className="rounded-xl border py-12 text-center"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(0.985 0.003 260)",
            }}
            data-ocid="timetable.exams_empty_state"
          >
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">
              No exam schedule set up yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
