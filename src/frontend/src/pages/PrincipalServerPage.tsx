import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/data/mockData";
import {
  Archive,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  Server,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import PrincipalDataBackupPage from "./PrincipalDataBackupPage";
import PrincipalDataServerPage from "./PrincipalDataServerPage";
import PrincipalErrorFixPage from "./PrincipalErrorFixPage";
import PrincipalStoragePage from "./PrincipalStoragePage";

interface Props {
  principalId: string;
  students: Student[];
}

type Tab =
  | "data-server"
  | "data-backup"
  | "storage"
  | "error-fix"
  | "class-records";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "data-server", label: "Data Server", icon: Database },
  { id: "data-backup", label: "Data Backup", icon: Archive },
  { id: "storage", label: "Storage & Backup", icon: HardDrive },
  { id: "error-fix", label: "Error Fix", icon: Wrench },
  { id: "class-records", label: "Class Records", icon: FolderOpen },
];

type RecordType = "Diary" | "Timetable" | "Test Marks" | "Notice";

interface ClassRecord {
  type: RecordType;
  className: string;
  date: string;
  summary: string;
  raw: unknown;
}

function getIcon(type: RecordType) {
  switch (type) {
    case "Diary":
      return BookOpen;
    case "Timetable":
      return ClipboardList;
    case "Test Marks":
      return FileText;
    case "Notice":
      return Bell;
  }
}

function getColor(type: RecordType) {
  switch (type) {
    case "Diary":
      return "bg-emerald-100 text-emerald-700";
    case "Timetable":
      return "bg-blue-100 text-blue-700";
    case "Test Marks":
      return "bg-purple-100 text-purple-700";
    case "Notice":
      return "bg-amber-100 text-amber-700";
  }
}

function loadClassRecords(principalId: string): Record<string, ClassRecord[]> {
  const grouped: Record<string, ClassRecord[]> = {};

  const addRecord = (record: ClassRecord) => {
    if (!grouped[record.className]) grouped[record.className] = [];
    grouped[record.className].push(record);
  };

  // Diary
  try {
    const raw = localStorage.getItem(`lords_diary_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const entry of data) {
          addRecord({
            type: "Diary",
            className: entry.className || "Unknown",
            date: entry.date || entry.createdAt || "",
            summary:
              entry.subjects
                ?.map(
                  (s: { subject: string; homework: string }) =>
                    `${s.subject}: ${s.homework}`,
                )
                .join("; ") ||
              entry.homework ||
              "Diary entry",
            raw: entry,
          });
        }
      } else if (typeof data === "object") {
        for (const [cls, entries] of Object.entries(data)) {
          if (Array.isArray(entries)) {
            for (const entry of entries as ClassRecord[]) {
              addRecord({
                type: "Diary",
                className: cls,
                date: (entry as { date?: string }).date || "",
                summary:
                  (
                    entry as {
                      subjects?: { subject: string; homework: string }[];
                    }
                  ).subjects
                    ?.map((s) => `${s.subject}: ${s.homework}`)
                    .join("; ") || "Diary entry",
                raw: entry,
              });
            }
          }
        }
      }
    }
  } catch {}

  // Exam Timetable
  try {
    const raw = localStorage.getItem(`lords_exam_timetable_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data === "object" && !Array.isArray(data)) {
        for (const [cls, timetable] of Object.entries(data)) {
          if (timetable && typeof timetable === "object") {
            const rows =
              (timetable as { rows?: { subject: string; date: string }[] })
                .rows || [];
            addRecord({
              type: "Timetable",
              className: cls,
              date: rows[0]?.date || "",
              summary: `${rows.length} exam(s) scheduled`,
              raw: timetable,
            });
          }
        }
      }
    }
  } catch {}

  // Test Marks
  try {
    const raw = localStorage.getItem(`lords_test_marks_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data === "object" && !Array.isArray(data)) {
        for (const [cls, exams] of Object.entries(data)) {
          if (typeof exams === "object" && exams !== null) {
            const examNames = Object.keys(exams as object);
            addRecord({
              type: "Test Marks",
              className: cls,
              date: "",
              summary: `Exams: ${examNames.join(", ") || "None"}`,
              raw: exams,
            });
          }
        }
      }
    }
  } catch {}

  // Notifications
  try {
    const raw = localStorage.getItem(`lords_notifications_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const n of data) {
          addRecord({
            type: "Notice",
            className: n.targetClass || "All Classes",
            date: n.date || n.createdAt || "",
            summary: `[${n.category || "General"}] ${n.message || ""}`,
            raw: n,
          });
        }
      }
    }
  } catch {}

  // Sort each class by date desc
  for (const cls of Object.keys(grouped)) {
    grouped[cls].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  return grouped;
}

function ClassRecordsTab({ principalId }: { principalId: string }) {
  const [records, setRecords] = useState<Record<string, ClassRecord[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const data = loadClassRecords(principalId);
    setRecords(data);
    // Expand first class by default
    const first = Object.keys(data)[0];
    if (first) setExpanded({ [first]: true });
  }, [principalId]);

  const classNames = Object.keys(records).sort();

  const toggle = (cls: string) =>
    setExpanded((prev) => ({ ...prev, [cls]: !prev[cls] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Class Records Archive
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            All data sent to parents, organized by class. Read-only.
          </p>
        </div>
        <button
          type="button"
          data-ocid="class_records.primary_button"
          onClick={() => setRecords(loadClassRecords(principalId))}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {classNames.length === 0 ? (
        <div
          data-ocid="class_records.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No class records found</p>
          <p className="text-sm mt-1">
            Records will appear here once you send diary entries, timetables,
            marks, or notices to parents.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {classNames.map((cls, i) => (
            <Card
              key={cls}
              data-ocid={`class_records.item.${i + 1}`}
              className="border border-gray-200"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-t-lg"
                onClick={() => toggle(cls)}
                data-ocid={"class_records.toggle"}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-indigo-500" />
                  <span className="font-semibold text-gray-800">{cls}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                    {records[cls].length} record
                    {records[cls].length !== 1 ? "s" : ""}
                  </span>
                </div>
                {expanded[cls] ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              {expanded[cls] && (
                <CardContent className="pt-0 pb-3 px-4">
                  <div className="space-y-2">
                    {records[cls].map((rec) => {
                      const Icon = getIcon(rec.type);
                      return (
                        <div
                          key={`${rec.type}-${rec.date}-${rec.summary.slice(0, 20)}`}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getColor(rec.type)}`}
                          >
                            <Icon size={11} />
                            {rec.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {rec.summary}
                            </p>
                            {rec.date && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {rec.date}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrincipalServerPage({ principalId, students }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("data-server");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Server size={22} className="text-indigo-600" />
            Server
          </CardTitle>
          <p className="text-sm text-gray-500">
            All server functions in one place — data, backup, storage,
            diagnostics, and class records.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className="flex flex-wrap gap-2 border-b border-gray-200 pb-1"
            role="tablist"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                data-ocid={`server.${id.replace("-", "_")}.tab`}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? "border-indigo-600 text-indigo-700 font-medium bg-indigo-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        {activeTab === "data-server" && (
          <PrincipalDataServerPage
            principalId={principalId}
            students={students}
          />
        )}
        {activeTab === "data-backup" && (
          <PrincipalDataBackupPage principalId={principalId} />
        )}
        {activeTab === "storage" && (
          <PrincipalStoragePage principalId={principalId} />
        )}
        {activeTab === "error-fix" && (
          <PrincipalErrorFixPage principalId={principalId} />
        )}
        {activeTab === "class-records" && (
          <ClassRecordsTab principalId={principalId} />
        )}
      </div>
    </div>
  );
}
