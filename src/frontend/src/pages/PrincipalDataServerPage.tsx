import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/data/mockData";
import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ServerRecord {
  timestamp: string;
  principalId: string;
  classSummary: Record<string, Student[]>;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

function getStudentTotal(student: Student): number {
  return student.marks.reduce(
    (sum, m) => sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
    0,
  );
}

function groupByClass(students: Student[]): Record<string, Student[]> {
  const groups: Record<string, Student[]> = {};
  for (const s of students) {
    if (!groups[s.class]) groups[s.class] = [];
    groups[s.class].push(s);
  }
  // Sort each class by rank/total
  for (const cls of Object.keys(groups)) {
    groups[cls].sort((a, b) => {
      const ra = a.rank ?? 9999;
      const rb = b.rank ?? 9999;
      if (ra !== rb) return ra - rb;
      return getStudentTotal(b) - getStudentTotal(a);
    });
  }
  return groups;
}

function downloadJSON(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function studentsToCSV(students: Student[]): string {
  const headers = [
    "Name",
    "Class",
    "Roll No",
    "Rank",
    "PT1",
    "PT2",
    "PT3",
    "Term1",
    "Term2",
    "Total Marks",
    "Grade",
    "Attendance %",
    "Fees Status",
    "Parent Name",
    "Phone",
    "Address",
  ];
  const rows = students.map((s) => {
    const totalMarks = getStudentTotal(s);
    const pt1 = s.marks.reduce((sum, m) => sum + m.pt1, 0);
    const pt2 = s.marks.reduce((sum, m) => sum + m.pt2, 0);
    const pt3 = s.marks.reduce((sum, m) => sum + m.pt3, 0);
    const term1 = s.marks.reduce((sum, m) => sum + m.term1, 0);
    const term2 = s.marks.reduce((sum, m) => sum + m.term2, 0);
    const present = s.attendance.filter((a) => a.status === "Present").length;
    const attPct =
      s.attendance.length > 0
        ? Math.round((present / s.attendance.length) * 100)
        : 0;
    const worstFee = s.fees.some((f) => f.status === "Overdue")
      ? "Overdue"
      : s.fees.some((f) => f.status === "Pending")
        ? "Pending"
        : "Paid";
    const row = [
      s.name,
      s.class,
      s.rollNo,
      s.rank ?? "",
      pt1,
      pt2,
      pt3,
      term1,
      term2,
      totalMarks,
      "",
      `${attPct}%`,
      worstFee,
      s.parentName ?? "",
      s.phone ?? "",
      s.address ?? "",
    ];
    return row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
  });
  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([`FEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function loadStudents(principalId: string): Student[] {
  try {
    const raw = localStorage.getItem(`lords_students_${principalId}`);
    if (raw) return JSON.parse(raw) as Student[];
  } catch {}
  return [];
}

function saveServerRecord(principalId: string, students: Student[]) {
  const record: ServerRecord = {
    timestamp: new Date().toISOString(),
    principalId,
    classSummary: groupByClass(students),
  };
  localStorage.setItem(
    `lords_data_server_${principalId}`,
    JSON.stringify(record),
  );
  return record;
}

interface Props {
  principalId: string;
  students: Student[];
}

export default function PrincipalDataServerPage({
  principalId,
  students,
}: Props) {
  const [record, setRecord] = useState<ServerRecord | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Auto-save on mount and auto-download CSV
  useEffect(() => {
    const fresh = loadStudents(principalId);
    const allStudents = fresh.length > 0 ? fresh : students;
    const savedRecord = saveServerRecord(principalId, allStudents);
    setRecord(savedRecord);

    const totalStudents = Object.values(savedRecord.classSummary).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    if (totalStudents > 0) {
      const allFlat = Object.values(savedRecord.classSummary).flat();
      const csv = studentsToCSV(allFlat);
      const date = savedRecord.timestamp.slice(0, 10);
      downloadCSV(csv, `lords-all-students-${principalId}-${date}.csv`);
      toast.success("Data auto-saved and downloaded to your device.");
    }
  }, [principalId, students]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      const fresh = loadStudents(principalId);
      const savedRecord = saveServerRecord(
        principalId,
        fresh.length > 0 ? fresh : students,
      );
      setRecord(savedRecord);
      setSyncing(false);
      toast.success("Data Server synced with latest student records!");
    }, 600);
  };

  const handleDownloadAllCSV = () => {
    if (!record) return;
    const allStudents = Object.values(record.classSummary).flat();
    if (allStudents.length === 0) {
      toast.error("No student data to download.");
      return;
    }
    const csv = studentsToCSV(allStudents);
    const date = record.timestamp.slice(0, 10);
    downloadCSV(csv, `lords-all-students-${principalId}-${date}.csv`);
    toast.success("Downloaded all students CSV (opens in Excel/Sheets)");
  };

  const handleDownloadClassCSV = (
    className: string,
    classStudents: Student[],
  ) => {
    const csv = studentsToCSV(classStudents);
    const safe = className.replace(/[^a-zA-Z0-9-]/g, "-");
    downloadCSV(csv, `lords-class-${safe}-${principalId}.csv`);
    toast.success(`Downloaded ${className} CSV`);
  };

  const handleDownloadAllJSON = () => {
    if (!record) return;
    downloadJSON(
      record,
      `lords-data-server-${principalId}-${record.timestamp.slice(0, 10)}.json`,
    );
    toast.success("Downloaded full JSON backup");
  };

  const classSummary = record?.classSummary ?? {};
  const classNames = Object.keys(classSummary).filter(
    (c) => classSummary[c].length > 0,
  );
  const totalStudents = Object.values(classSummary).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <div className="space-y-6 max-w-4xl" data-ocid="data_server.page">
      {/* Header */}
      <Card className="border-teal-100 bg-teal-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-800">
            <Server size={22} className="text-teal-600" />
            Data Server
          </CardTitle>
          <p className="text-sm text-teal-700 mt-1">
            All student records are automatically saved here class-wise.
            Download to your Windows PC or mobile anytime.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              data-ocid="data_server.primary_button"
              onClick={handleSync}
              disabled={syncing}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              data-ocid="data_server.secondary_button"
              onClick={handleDownloadAllCSV}
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50 gap-2"
            >
              <FileSpreadsheet size={15} />
              Download All (Excel/CSV)
            </Button>
            <Button
              data-ocid="data_server.tertiary_button"
              onClick={handleDownloadAllJSON}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 gap-2"
            >
              <FileText size={15} />
              Download All (JSON)
            </Button>
          </div>
          {record && (
            <div className="flex items-center gap-2 mt-3 text-xs text-teal-600">
              <CheckCircle size={13} />
              Last synced: {formatDate(record.timestamp)} &nbsp;|&nbsp;{" "}
              {totalStudents} students across {classNames.length} classes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class-wise Records */}
      {classNames.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <Server size={36} className="mx-auto mb-3 opacity-30" />
            <p>
              No student data found. Add students in the Students section first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classNames.map((className) => {
            const classStudents = classSummary[className];
            return (
              <Card key={className} className="border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                      <span>Class {className}</span>
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
                        {classStudents.length} students
                      </Badge>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="data_server.class_download_button"
                      onClick={() =>
                        handleDownloadClassCSV(className, classStudents)
                      }
                      className="border-teal-200 text-teal-700 hover:bg-teal-50 gap-1.5 h-8"
                    >
                      <Download size={13} />
                      Download Class CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Name
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Roll No
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Rank
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Total Marks
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Grade
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Attendance
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Fees
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {classStudents.map((student, idx) => {
                          const total = getStudentTotal(student);
                          const present = student.attendance.filter(
                            (a) => a.status === "Present",
                          ).length;
                          const attPct =
                            student.attendance.length > 0
                              ? Math.round(
                                  (present / student.attendance.length) * 100,
                                )
                              : 0;
                          const worstFee = student.fees.some(
                            (f) => f.status === "Overdue",
                          )
                            ? "Overdue"
                            : student.fees.some((f) => f.status === "Pending")
                              ? "Pending"
                              : "Paid";
                          return (
                            <tr
                              key={student.id}
                              data-ocid={`data_server.student_row.${idx + 1}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="py-2 px-3 font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {student.rollNo}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                    student.rank === 1
                                      ? "bg-yellow-100 text-yellow-700"
                                      : student.rank === 2
                                        ? "bg-gray-100 text-gray-600"
                                        : student.rank === 3
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-teal-50 text-teal-700"
                                  }`}
                                >
                                  {student.rank ?? "-"}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-semibold text-teal-700">
                                {total}
                              </td>
                              <td className="py-2 px-3 text-gray-600">{"-"}</td>
                              <td className="py-2 px-3">
                                <span
                                  className={`text-xs font-medium ${
                                    attPct >= 85
                                      ? "text-green-600"
                                      : attPct >= 70
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {attPct}%
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    worstFee === "Paid"
                                      ? "bg-green-100 text-green-700"
                                      : worstFee === "Overdue"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {worstFee}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
