import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/data/mockData";
import { useClasses } from "@/hooks/useClasses";
import type { DiaryEntry } from "@/pages/PrincipalDiaryPage";
import type { TimetableEntry } from "@/pages/PrincipalExamTimetablePage";
import {
  Archive,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  MessageSquare,
  NotebookPen,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  principalId: string;
  students: Student[];
}

type RecordType = "all" | "diary" | "timetable" | "testmarks" | "messages" | "syllabus";

type TestMarksData = Record<
  string,
  Record<string, Record<string, Record<string, string>>>
>;

type ClassSyllabus = Record<
  string,
  { subject: string; chapters: { name: string; status: string }[] }[]
>;

interface StoredMessage {
  id: number;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
}

interface ClassRecord {
  id: string;
  type: RecordType;
  className: string;
  title: string;
  summary: string;
  date: string;
  rawData?: unknown;
  hasPhoto?: boolean;
}

function loadAllRecords(principalId: string): ClassRecord[] {
  const records: ClassRecord[] = [];

  // 1. Diary entries
  try {
    const raw = localStorage.getItem(`diary_${principalId}`);
    if (raw) {
      const entries = JSON.parse(raw) as DiaryEntry[];
      for (const e of entries) {
        records.push({
          id: `diary_${e.id}`,
          type: "diary",
          className: e.class,
          title: `Diary \u2014 ${new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
          summary: e.subjects.map((s) => `${s.subject}: ${s.homework}`).join(" | "),
          date: e.date,
          hasPhoto: !!e.photoBase64,
        });
      }
    }
  } catch {}

  // 2. Exam timetable
  try {
    const raw = localStorage.getItem(`lords_exam_timetable_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw) as Record<string, TimetableEntry[]>;
      for (const [cls, entries] of Object.entries(data)) {
        if (!entries || entries.length === 0) continue;
        const examNames = [...new Set(entries.map((e) => e.examName).filter(Boolean))];
        records.push({
          id: `timetable_${cls}`,
          type: "timetable",
          className: cls,
          title: `Exam Timetable \u2014 ${cls}`,
          summary: examNames.length > 0 ? `Exams: ${examNames.join(", ")}` : `${entries.length} entries`,
          date: entries[0]?.date || new Date().toISOString().split("T")[0],
        });
      }
    }
  } catch {}

  // 3. Test marks
  try {
    const raw = localStorage.getItem(`lords_test_marks_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw) as TestMarksData;
      for (const [cls, exams] of Object.entries(data)) {
        for (const examName of Object.keys(exams)) {
          records.push({
            id: `testmarks_${cls}_${examName}`,
            type: "testmarks",
            className: cls,
            title: `Test Marks \u2014 ${examName}`,
            summary: `Class: ${cls} | Exam: ${examName}`,
            date: new Date().toISOString().split("T")[0],
          });
        }
      }
    }
  } catch {}

  // 4. Messages / notices sent to parents
  try {
    const raw = localStorage.getItem(`lords_notifications_${principalId}`);
    if (raw) {
      const messages = JSON.parse(raw) as StoredMessage[];
      for (const m of messages) {
        records.push({
          id: `msg_${m.id}`,
          type: "messages",
          className: "All Classes",
          title: `${m.type}: ${m.title}`,
          summary: m.message,
          date: m.date,
        });
      }
    }
  } catch {}

  // 5. Syllabus (class-wise)
  try {
    const raw = localStorage.getItem(`lords_syllabus_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw) as ClassSyllabus;
      for (const [cls, subjects] of Object.entries(data)) {
        if (!subjects || subjects.length === 0) continue;
        records.push({
          id: `syllabus_${cls}`,
          type: "syllabus",
          className: cls,
          title: `Syllabus \u2014 ${cls}`,
          summary: subjects.map((s) => s.subject).join(", "),
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
  } catch {}

  // Sort by date desc
  records.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return db - da;
  });

  return records;
}

const TYPE_META: Record<
  RecordType,
  { label: string; color: string; icon: React.ElementType }
> = {
  all: { label: "All", color: "bg-gray-100 text-gray-700", icon: Archive },
  diary: { label: "Diary", color: "bg-purple-100 text-purple-700", icon: NotebookPen },
  timetable: { label: "Exam Timetable", color: "bg-blue-100 text-blue-700", icon: ClipboardList },
  testmarks: { label: "Test Marks", color: "bg-emerald-100 text-emerald-700", icon: FileText },
  messages: { label: "Messages", color: "bg-orange-100 text-orange-700", icon: MessageSquare },
  syllabus: { label: "Syllabus", color: "bg-indigo-100 text-indigo-700", icon: BookOpen },
};

export default function PrincipalClassRecordsPage({
  principalId,
  students,
}: Props) {
  const { classes } = useClasses(principalId, students);
  const [filterClass, setFilterClass] = useState("all");
  const [filterType, setFilterType] = useState<RecordType>("all");
  const [records, setRecords] = useState<ClassRecord[]>(() =>
    loadAllRecords(principalId),
  );

  const handleRefresh = () => {
    setRecords(loadAllRecords(principalId));
    toast.success("Records refreshed.");
  };

  const filtered = records.filter((r) => {
    const matchClass =
      filterClass === "all" ||
      r.className === filterClass ||
      r.className === "All Classes";
    const matchType = filterType === "all" || r.type === filterType;
    return matchClass && matchType;
  });

  // Group by class
  const grouped: Record<string, ClassRecord[]> = {};
  for (const r of filtered) {
    if (!grouped[r.className]) grouped[r.className] = [];
    grouped[r.className].push(r);
  }
  const sortedClasses = Object.keys(grouped).sort();

  return (
    <div className="space-y-6" data-ocid="class_records.section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Archive size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Class Records</h2>
            <p className="text-sm text-gray-500">
              All files and information sent to parents \u2014 auto-saved class-wise
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 text-sm px-3 py-1">
            {records.length} Records
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5"
            data-ocid="class_records.refresh_button"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <strong>Auto-Save:</strong> Every diary entry, exam timetable, test marks,
        message, and syllabus you send to parents is automatically saved here. If
        any file or information fails to show parents, check here to verify it was
        saved correctly.
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="class_records.select"
          >
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as RecordType)}
        >
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="class_records.select"
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_META) as RecordType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_META[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            "diary",
            "timetable",
            "testmarks",
            "messages",
            "syllabus",
          ] as RecordType[]
        ).map((t) => {
          const count = records.filter((r) => r.type === t).length;
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(filterType === t ? "all" : t)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterType === t
                  ? `${meta.color} border-current shadow-sm`
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              data-ocid={`class_records.filter.${t}`}
            >
              <Icon size={12} />
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Records grouped by class */}
      {sortedClasses.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="class_records.empty_state"
        >
          <Archive size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">
            Records appear here automatically when you send diary entries, exam
            timetables, test marks, messages, or syllabus to parents.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedClasses.map((cls) => (
            <div key={cls} data-ocid={`class_records.class_group`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{cls}</h3>
                <Badge variant="secondary" className="text-xs">
                  {grouped[cls].length} item
                  {grouped[cls].length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-2">
                {grouped[cls].map((record, idx) => {
                  const meta = TYPE_META[record.type];
                  const Icon = meta.icon;
                  return (
                    <Card
                      key={record.id}
                      className="border border-gray-100 shadow-sm"
                      data-ocid={`class_records.item.${idx + 1}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {record.title}
                              </p>
                              <Badge
                                className={`border-0 text-xs flex-shrink-0 ${meta.color}`}
                              >
                                {meta.label}
                              </Badge>
                              {record.hasPhoto && (
                                <Badge
                                  variant="outline"
                                  className="text-xs flex-shrink-0"
                                >
                                  Photo attached
                                </Badge>
                              )}
                            </div>
                            {record.summary && (
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {record.summary}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {record.date}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
