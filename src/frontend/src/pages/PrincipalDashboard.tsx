import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/data/mockData";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  KeyRound,
  MessageCircle,
  Plus,
  Search,
  Trophy,
  UserPen,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  students: Student[];
  onEditStudent: (id: number) => void;
  onNavigateToAdd?: () => void;
  onRankStudents?: (ranked: Student[]) => void;
  onAutoGeneratePasswords?: () => void;
}

function getWorstFeeStatus(fees: Student["fees"]): string {
  if (fees.some((f) => f.status === "Overdue")) return "Overdue";
  if (fees.some((f) => f.status === "Pending")) return "Pending";
  return "Paid";
}

function getAttendancePct(attendance: Student["attendance"]): number {
  if (!attendance.length) return 0;
  const present = attendance.filter((a) => a.status === "Present").length;
  return Math.round((present / attendance.length) * 100);
}

function feeStatusBadge(status: string) {
  if (status === "Paid")
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        {status}
      </Badge>
    );
  if (status === "Overdue")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        {status}
      </Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
      {status}
    </Badge>
  );
}

function getStudentTotal(student: Student): number {
  return student.marks.reduce(
    (sum, m) => sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
    0,
  );
}

function getRankBadgeClass(rank: number): string {
  if (rank === 1)
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  if (rank === 2) return "bg-gray-100 text-gray-600 border border-gray-300";
  if (rank === 3)
    return "bg-orange-100 text-orange-700 border border-orange-300";
  return "bg-white text-gray-600 border border-gray-200";
}

function downloadPasswordCSV(studentsToExport: Student[]) {
  const rows = [
    ["Student Name", "Class", "Roll No", "Parent Password"],
    ...studentsToExport.map((s) => [
      s.name,
      s.class,
      String(s.rollNo),
      s.parentPassword ?? "",
    ]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student_passwords_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CLASSES = ["All", "9-A", "10-A", "10-B", "11-A", "11-B", "12-A"];

export default function PrincipalDashboard({
  students,
  onEditStudent,
  onNavigateToAdd,
  onRankStudents,
  onAutoGeneratePasswords,
}: Props) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [rankSuccess, setRankSuccess] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPasswordResults, setShowPasswordResults] = useState(false);
  const [pwdClassFilter, setPwdClassFilter] = useState("All");

  useEffect(() => {
    if (rankSuccess) {
      const t = setTimeout(() => setRankSuccess(false), 2000);
      return () => clearTimeout(t);
    }
  }, [rankSuccess]);

  // Close results panel when students change externally (e.g. on logout)
  useEffect(() => {
    if (students.length === 0) setShowPasswordResults(false);
  }, [students.length]);

  const handleRankStudents = () => {
    const withTotals = students.map((s) => ({ s, total: getStudentTotal(s) }));
    const sorted = [...withTotals].sort((a, b) => b.total - a.total);
    // Dense ranking
    let rank = 1;
    const ranked: Student[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].total < sorted[i - 1].total) {
        rank = i + 1;
      }
      ranked.push({ ...sorted[i].s, rank });
    }
    onRankStudents?.(ranked);
    setRankSuccess(true);
    setLeaderboardOpen(true);
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  // Leaderboard: filtered by class if class filter active, sorted by rank/total
  const leaderboardStudents = (
    classFilter === "All"
      ? students
      : students.filter((s) => s.class === classFilter)
  )
    .slice()
    .sort((a, b) => {
      const ra = a.rank ?? 9999;
      const rb = b.rank ?? 9999;
      if (ra !== rb) return ra - rb;
      return getStudentTotal(b) - getStudentTotal(a);
    });

  // All unique classes for the password results filter
  const allClasses = [
    "All",
    ...Array.from(new Set(students.map((s) => s.class))).sort(),
  ];

  // Students shown in password results panel
  const pwdFilteredStudents = students.filter(
    (s) => pwdClassFilter === "All" || s.class === pwdClassFilter,
  );

  const handleCopyPassword = (student: Student) => {
    const pwd = student.parentPassword ?? "";
    navigator.clipboard
      .writeText(pwd)
      .then(() => {
        toast.success(`Password copied for ${student.name}`);
      })
      .catch(() => {
        toast.error("Could not copy to clipboard");
      });
  };

  const handleWhatsAppShare = (student: Student) => {
    const msg = encodeURIComponent(
      `Student: ${student.name}, Class: ${student.class}, Parent Login Password: ${student.parentPassword ?? ""} - Lords International School`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Auto Password Manager Confirmation Dialog */}
      <AlertDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      >
        <AlertDialogContent data-ocid="students.password_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound size={18} className="text-indigo-600" />
              Auto Password Manager
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will assign a unique random 10-digit password to{" "}
              <strong>ALL {students.length} students</strong>. Existing
              passwords will be replaced. Each student gets their own unique
              password — no two students share the same password. A CSV file
              will be downloaded automatically. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="students.password_dialog.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="students.password_dialog.confirm_button"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setShowPasswordDialog(false);
                onAutoGeneratePasswords?.();
                setShowPasswordResults(true);
                setPwdClassFilter("All");
              }}
            >
              Generate Passwords
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Student Management
            </h2>
            <p className="text-sm text-gray-500">
              Manage and edit all student records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 text-sm px-3 py-1">
            {students.length} Students
          </Badge>
          <Button
            size="sm"
            data-ocid="students.auto_password_button"
            onClick={() => setShowPasswordDialog(true)}
            disabled={students.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            <KeyRound size={14} />
            Auto Password Manager
          </Button>
          <Button
            size="sm"
            data-ocid="students.rank_button"
            onClick={handleRankStudents}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
          >
            <Trophy size={14} />
            Rank by Marks
          </Button>
          {onNavigateToAdd && (
            <Button
              size="sm"
              data-ocid="students.primary_button"
              onClick={onNavigateToAdd}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              <Plus size={14} />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Rank success toast */}
      {rankSuccess && (
        <div
          data-ocid="students.success_state"
          className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Trophy size={15} className="text-amber-500" />
          Ranks updated! Students have been ranked by total marks.
        </div>
      )}

      {/* Auto Password Manager Results Panel */}
      {showPasswordResults && (
        <div
          data-ocid="students.password_panel"
          className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm overflow-hidden"
        >
          {/* Panel Header */}
          <div className="bg-indigo-600 px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <KeyRound size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">
                  Auto Password Manager
                </h3>
                <p className="text-indigo-200 text-sm">
                  Passwords generated for{" "}
                  <strong className="text-white">{students.length}</strong>{" "}
                  students
                </p>
              </div>
            </div>
            <button
              type="button"
              data-ocid="students.password_panel.close_button"
              onClick={() => setShowPasswordResults(false)}
              className="text-white/70 hover:text-white transition-colors mt-0.5"
              aria-label="Close password panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success Banner */}
          <div className="flex items-center gap-2.5 bg-green-50 border-b border-green-200 px-5 py-3">
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">
              ✅ Passwords generated for {students.length} students! Share with
              parents to log in.
            </p>
          </div>

          {/* Filter + Download Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                Filter by class:
              </span>
              <Select value={pwdClassFilter} onValueChange={setPwdClassFilter}>
                <SelectTrigger
                  data-ocid="students.password_panel.select"
                  className="w-full sm:w-44 h-8 text-sm"
                >
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  {allClasses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "All" ? "All Classes" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100 text-xs">
                {pwdFilteredStudents.length} students
              </Badge>
              <Button
                size="sm"
                data-ocid="students.password_panel.download_button"
                variant="outline"
                className="h-8 gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                onClick={() => downloadPasswordCSV(pwdFilteredStudents)}
              >
                <Download size={13} />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Password List */}
          <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
            {pwdFilteredStudents.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No students in this class
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-indigo-50 border-b border-indigo-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      #
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Student Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Class
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Roll No
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Parent Password
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pwdFilteredStudents.map((student, idx) => (
                    <tr
                      key={student.id}
                      data-ocid={`students.password_panel.item.${idx + 1}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-sm text-gray-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs flex-shrink-0">
                            {student.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {student.class}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600 font-mono">
                        {student.rollNo}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <code className="bg-indigo-50 text-indigo-800 border border-indigo-200 rounded px-2.5 py-1 text-sm font-mono tracking-wider">
                            {student.parentPassword ?? "—"}
                          </code>
                          <button
                            type="button"
                            data-ocid={`students.password_panel.copy_button.${idx + 1}`}
                            onClick={() => handleCopyPassword(student)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Copy password"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          data-ocid={`students.password_panel.whatsapp_button.${idx + 1}`}
                          onClick={() => handleWhatsAppShare(student)}
                          className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md px-2.5 py-1.5 transition-colors"
                          title="Share via WhatsApp"
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Note */}
          <div className="flex items-start gap-2 px-5 py-3 bg-amber-50 border-t border-amber-200">
            <span className="text-amber-500 text-base mt-0.5">ℹ️</span>
            <p className="text-amber-800 text-xs leading-relaxed">
              These are <strong>parent login passwords</strong>. Each parent
              uses their child's unique password to log in and view their
              student's data. No two students share the same password.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            data-ocid="students.search_input"
            placeholder="Search by name or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger data-ocid="students.select" className="w-full sm:w-44">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            {CLASSES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All Classes" : `Class ${c}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rank Leaderboard */}
      <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
        <button
          type="button"
          data-ocid="students.toggle"
          onClick={() => setLeaderboardOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy size={17} className="text-amber-500" />
            <span className="font-semibold text-gray-800 text-sm">
              Class Rank Leaderboard
              {classFilter !== "All" && (
                <span className="ml-2 text-amber-600">
                  — Class {classFilter}
                </span>
              )}
            </span>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
              {leaderboardStudents.length} students
            </Badge>
          </div>
          {leaderboardOpen ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {leaderboardOpen && (
          <div className="divide-y divide-gray-100">
            {leaderboardStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No students found
              </div>
            ) : (
              leaderboardStudents.map((student, idx) => {
                const rank = student.rank ?? idx + 1;
                const total = getStudentTotal(student);
                return (
                  <div
                    key={student.id}
                    data-ocid={`students.leaderboard.item.${idx + 1}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${getRankBadgeClass(rank)}`}
                    >
                      {rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Class {student.class}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-indigo-700">
                        {total}
                      </p>
                      <p className="text-xs text-gray-400">total marks</p>
                    </div>
                    {rank <= 3 && (
                      <Trophy
                        size={14}
                        className={
                          rank === 1
                            ? "text-yellow-500"
                            : rank === 2
                              ? "text-gray-400"
                              : "text-orange-400"
                        }
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Student List */}
      {filtered.length === 0 ? (
        <div
          data-ocid="students.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No students found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Roll No
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Rank
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total Marks
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fees
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student, idx) => {
                  const initials = student.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const feeStatus = getWorstFeeStatus(student.fees);
                  const attPct = getAttendancePct(student.attendance);
                  const ocidIdx = idx + 1;
                  const rank = student.rank;
                  return (
                    <tr
                      key={student.id}
                      data-ocid={`students.row.${ocidIdx}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
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
                          <span className="font-medium text-gray-900 text-sm">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.class}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.rollNo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            rank === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : rank === 2
                                ? "bg-gray-100 text-gray-600"
                                : rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {rank ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {student.marks.reduce(
                          (sum, m) =>
                            sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
                          0,
                        )}
                      </td>
                      <td className="px-4 py-3">{feeStatusBadge(feeStatus)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                attPct >= 85
                                  ? "bg-green-500"
                                  : attPct >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${attPct}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {attPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          data-ocid={`students.edit_button.${ocidIdx}`}
                          onClick={() => onEditStudent(student.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8"
                        >
                          <UserPen size={13} />
                          View & Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
