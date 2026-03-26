import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRINCIPALS } from "@/data/principals";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DiagnosticResult {
  id: string;
  label: string;
  status: "ok" | "warning" | "error";
  message: string;
  fixable: boolean;
}

interface Props {
  principalId: string;
}

function runDiagnostics(principalId: string): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // 1. Student data integrity
  try {
    const raw = localStorage.getItem(`lords_students_${principalId}`);
    if (!raw) {
      results.push({
        id: "students",
        label: "Student Records",
        status: "warning",
        message: "No student data found. Add students from the dashboard.",
        fixable: false,
      });
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      const corrupt = parsed.filter(
        (s: unknown) =>
          typeof s !== "object" ||
          s === null ||
          !("id" in (s as object)) ||
          !("name" in (s as object)),
      ).length;
      if (corrupt > 0) {
        results.push({
          id: "students",
          label: "Student Records",
          status: "error",
          message: `${corrupt} corrupted student record(s) found. Click Fix to remove them.`,
          fixable: true,
        });
      } else {
        results.push({
          id: "students",
          label: "Student Records",
          status: "ok",
          message: `${parsed.length} student(s) loaded correctly.`,
          fixable: false,
        });
      }
    }
  } catch {
    results.push({
      id: "students",
      label: "Student Records",
      status: "error",
      message: "Student data is corrupted and cannot be read.",
      fixable: true,
    });
  }

  // 2. Syllabus data
  try {
    const raw = localStorage.getItem(`lords_syllabus_${principalId}`);
    if (!raw) {
      results.push({
        id: "syllabus",
        label: "Syllabus Data",
        status: "warning",
        message:
          "No syllabus data found. It will be created when you open the Syllabus page.",
        fixable: false,
      });
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        results.push({
          id: "syllabus",
          label: "Syllabus Data",
          status: "warning",
          message:
            "Syllabus is in old format. Click Fix to upgrade it to class-wise format.",
          fixable: true,
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        const classCount = Object.keys(parsed).length;
        results.push({
          id: "syllabus",
          label: "Syllabus Data",
          status: "ok",
          message: `Syllabus loaded correctly with ${classCount} class(es).`,
          fixable: false,
        });
      } else {
        results.push({
          id: "syllabus",
          label: "Syllabus Data",
          status: "error",
          message: "Syllabus data is corrupted.",
          fixable: true,
        });
      }
    }
  } catch {
    results.push({
      id: "syllabus",
      label: "Syllabus Data",
      status: "error",
      message: "Syllabus data cannot be read.",
      fixable: true,
    });
  }

  // 3. Notifications / messages
  try {
    const raw = localStorage.getItem(`lords_notifications_${principalId}`);
    if (!raw) {
      results.push({
        id: "notifications",
        label: "Notices & Messages",
        status: "warning",
        message: "No notice data found.",
        fixable: false,
      });
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error();
      results.push({
        id: "notifications",
        label: "Notices & Messages",
        status: "ok",
        message: `${parsed.length} notice(s) found and loading correctly.`,
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "notifications",
      label: "Notices & Messages",
      status: "error",
      message: "Notice data is corrupted.",
      fixable: true,
    });
  }

  // 4. Parent messages (doubt chat)
  try {
    const raw = localStorage.getItem(`lords_doubt_msgs_${principalId}`);
    if (!raw || raw === "[]") {
      results.push({
        id: "doubt",
        label: "Doubt Chat Messages",
        status: "ok",
        message: "No messages yet.",
        fixable: false,
      });
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error();
      results.push({
        id: "doubt",
        label: "Doubt Chat Messages",
        status: "ok",
        message: `${parsed.length} message(s) in Doubt Chat.`,
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "doubt",
      label: "Doubt Chat Messages",
      status: "error",
      message: "Doubt Chat data is corrupted.",
      fixable: true,
    });
  }

  // 5. Diary entries
  try {
    const raw = localStorage.getItem(`lords_diary_${principalId}`);
    if (!raw) {
      results.push({
        id: "diary",
        label: "Diary Entries",
        status: "ok",
        message: "No diary entries yet.",
        fixable: false,
      });
    } else {
      JSON.parse(raw);
      results.push({
        id: "diary",
        label: "Diary Entries",
        status: "ok",
        message: "Diary data is loading correctly.",
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "diary",
      label: "Diary Entries",
      status: "error",
      message: "Diary data is corrupted.",
      fixable: true,
    });
  }

  // 6. Exam timetable
  try {
    const raw = localStorage.getItem(`lords_exam_timetable_${principalId}`);
    if (!raw) {
      results.push({
        id: "exam",
        label: "Exam Timetable",
        status: "ok",
        message: "No exam timetable yet.",
        fixable: false,
      });
    } else {
      JSON.parse(raw);
      results.push({
        id: "exam",
        label: "Exam Timetable",
        status: "ok",
        message: "Exam timetable loading correctly.",
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "exam",
      label: "Exam Timetable",
      status: "error",
      message: "Exam timetable data is corrupted.",
      fixable: true,
    });
  }

  // 7. Test marks
  try {
    const raw = localStorage.getItem(`lords_test_marks_${principalId}`);
    if (!raw) {
      results.push({
        id: "testmarks",
        label: "Test Marks",
        status: "ok",
        message: "No test marks yet.",
        fixable: false,
      });
    } else {
      JSON.parse(raw);
      results.push({
        id: "testmarks",
        label: "Test Marks",
        status: "ok",
        message: "Test marks loading correctly.",
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "testmarks",
      label: "Test Marks",
      status: "error",
      message: "Test marks data is corrupted.",
      fixable: true,
    });
  }

  // 8. LocalStorage space
  try {
    let totalSize = 0;
    for (const key of Object.keys(localStorage)) {
      totalSize += (localStorage.getItem(key) ?? "").length * 2;
    }
    const mb = (totalSize / 1024 / 1024).toFixed(2);
    const pct = Math.round((totalSize / (5 * 1024 * 1024)) * 100);
    if (pct > 85) {
      results.push({
        id: "storage",
        label: "Storage Space",
        status: "error",
        message: `Storage is ${pct}% full (${mb} MB / 5 MB). Delete unused data to free space.`,
        fixable: false,
      });
    } else if (pct > 60) {
      results.push({
        id: "storage",
        label: "Storage Space",
        status: "warning",
        message: `Storage is ${pct}% full (${mb} MB / 5 MB).`,
        fixable: false,
      });
    } else {
      results.push({
        id: "storage",
        label: "Storage Space",
        status: "ok",
        message: `Storage is ${pct}% full (${mb} MB / 5 MB). Plenty of space available.`,
        fixable: false,
      });
    }
  } catch {
    results.push({
      id: "storage",
      label: "Storage Space",
      status: "warning",
      message: "Could not calculate storage usage.",
      fixable: false,
    });
  }

  return results;
}

function fixIssue(id: string, principalId: string) {
  switch (id) {
    case "students": {
      try {
        const raw = localStorage.getItem(`lords_students_${principalId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter(
              (s: unknown) =>
                typeof s === "object" &&
                s !== null &&
                "id" in (s as object) &&
                "name" in (s as object),
            );
            localStorage.setItem(
              `lords_students_${principalId}`,
              JSON.stringify(clean),
            );
          }
        }
      } catch {
        localStorage.removeItem(`lords_students_${principalId}`);
      }
      break;
    }
    case "syllabus": {
      try {
        const raw = localStorage.getItem(`lords_syllabus_${principalId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const migrated = parsed.length > 0 ? { General: parsed } : {};
            localStorage.setItem(
              `lords_syllabus_${principalId}`,
              JSON.stringify(migrated),
            );
          }
        }
      } catch {
        localStorage.removeItem(`lords_syllabus_${principalId}`);
      }
      break;
    }
    case "notifications":
      localStorage.removeItem(`lords_notifications_${principalId}`);
      break;
    case "doubt":
      localStorage.removeItem(`lords_doubt_msgs_${principalId}`);
      break;
    case "diary":
      localStorage.removeItem(`lords_diary_${principalId}`);
      break;
    case "exam":
      localStorage.removeItem(`lords_exam_timetable_${principalId}`);
      break;
    case "testmarks":
      localStorage.removeItem(`lords_test_marks_${principalId}`);
      break;
  }
}

export default function PrincipalErrorFixPage({ principalId }: Props) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [fixing, setFixing] = useState(false);
  const [fixedIds, setFixedIds] = useState<string[]>([]);
  const [lastRun, setLastRun] = useState<string>("");

  const runCheck = useCallback(() => {
    setResults(runDiagnostics(principalId));
    setFixedIds([]);
    setLastRun(new Date().toLocaleTimeString());
  }, [principalId]);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const handleFixOne = (id: string) => {
    fixIssue(id, principalId);
    setFixedIds((prev) => [...prev, id]);
    setTimeout(() => runCheck(), 300);
  };

  const handleFixAll = () => {
    setFixing(true);
    const fixable = results.filter((r) => r.fixable && r.status !== "ok");
    for (const r of fixable) fixIssue(r.id, principalId);
    setTimeout(() => {
      runCheck();
      setFixing(false);
    }, 400);
  };

  const errors = results.filter((r) => r.status === "error");
  const warnings = results.filter((r) => r.status === "warning");
  const ok = results.filter((r) => r.status === "ok");
  const fixableCount = results.filter(
    (r) => r.fixable && r.status !== "ok",
  ).length;

  const principalName =
    PRINCIPALS.find((p) => p.id === principalId)?.name ?? "Principal";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Wrench className="text-indigo-600" size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                Error Fix & Diagnostics
              </h2>
              <p className="text-sm text-gray-500">
                {principalName} &mdash; checks all app data for problems
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            className="gap-2"
          >
            <RefreshCw size={14} /> Re-check
          </Button>
        </div>
        {lastRun && (
          <p className="text-xs text-gray-400 mt-3">Last checked: {lastRun}</p>
        )}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{errors.length}</p>
            <p className="text-xs text-red-500 mt-1">Errors</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {warnings.length}
            </p>
            <p className="text-xs text-yellow-500 mt-1">Warnings</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{ok.length}</p>
            <p className="text-xs text-green-500 mt-1">OK</p>
          </div>
        </div>
      )}

      {/* Fix All */}
      {fixableCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            <span className="text-sm text-red-700">
              {fixableCount} problem(s) can be automatically repaired.
            </span>
          </div>
          <Button
            onClick={handleFixAll}
            disabled={fixing}
            className="bg-red-600 hover:bg-red-700 text-white text-sm gap-2 flex-shrink-0"
            size="sm"
          >
            {fixing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            Fix All Problems
          </Button>
        </div>
      )}

      {/* All clear */}
      {results.length > 0 && errors.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-sm text-green-700 font-medium">
            All systems are working correctly. No problems found.
          </span>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-3 ${
              r.status === "error"
                ? "border-red-200"
                : r.status === "warning"
                  ? "border-yellow-200"
                  : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {r.status === "ok" ? (
                <CheckCircle
                  className="text-green-500 flex-shrink-0 mt-0.5"
                  size={18}
                />
              ) : r.status === "warning" ? (
                <AlertCircle
                  className="text-yellow-500 flex-shrink-0 mt-0.5"
                  size={18}
                />
              ) : (
                <AlertCircle
                  className="text-red-500 flex-shrink-0 mt-0.5"
                  size={18}
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900">
                    {r.label}
                  </span>
                  <Badge
                    className={`text-xs ${
                      r.status === "ok"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : r.status === "warning"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                    } hover:bg-inherit`}
                  >
                    {r.status === "ok"
                      ? "OK"
                      : r.status === "warning"
                        ? "Warning"
                        : "Error"}
                  </Badge>
                  {fixedIds.includes(r.id) && (
                    <Badge className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                      Fixed!
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{r.message}</p>
              </div>
            </div>
            {r.fixable && r.status !== "ok" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFixOne(r.id)}
                className="text-xs flex-shrink-0 border-red-300 text-red-600 hover:bg-red-50"
              >
                Fix
              </Button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        This tool checks data stored in the browser. If a parent reports not
        receiving information, ask them to reload the app and wait 5 seconds for
        live sync.
      </p>
    </div>
  );
}
