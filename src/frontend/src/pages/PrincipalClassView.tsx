import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Student } from "@/data/mockData";
import {
  Edit,
  Eye,
  EyeOff,
  KeyRound,
  LayoutGrid,
  Loader2,
  Lock,
  Plus,
  Save,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PREDEFINED_CLASSES = [
  "1-A",
  "1-B",
  "2-A",
  "2-B",
  "3-A",
  "3-B",
  "4-A",
  "4-B",
  "5-A",
  "5-B",
  "6-A",
  "6-B",
  "7-A",
  "7-B",
  "8-A",
  "8-B",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
  "11-A",
  "11-B",
  "12-A",
  "12-B",
];

interface Props {
  students: Student[];
  onEditStudent: (id: number) => void;
  onAddStudentToClass: (className: string) => void;
  principalId: string;
}

export default function PrincipalClassView({
  students,
  onEditStudent,
  onAddStudentToClass,
  principalId,
}: Props) {
  const [search, setSearch] = useState("");

  // Parent password state
  const storageKey = `lords_parent_password_${principalId}`;
  const currentSaved = localStorage.getItem(storageKey) ?? "parent123";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSaveParentPassword() {
    if (!newPassword.trim()) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(storageKey, newPassword);
      setSaving(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Parent login password updated!");
    }, 600);
  }

  // Build class list
  const studentClasses = [
    ...new Set(students.map((s) => s.class).filter(Boolean)),
  ];
  const allClasses = [
    ...new Set([...PREDEFINED_CLASSES, ...studentClasses]),
  ].sort((a, b) => {
    const numA = Number.parseInt(a);
    const numB = Number.parseInt(b);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  const filteredStudents = search.trim()
    ? students.filter((s) =>
        s.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : students;

  const studentsByClass = (cls: string) =>
    filteredStudents.filter((s) => s.class === cls);
  const visibleClasses = search.trim()
    ? allClasses.filter((cls) => studentsByClass(cls).length > 0)
    : allClasses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <LayoutGrid className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Students Management
            </h2>
            <p className="text-sm text-gray-500">
              {students.length} total students across {allClasses.length}{" "}
              classes
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            data-ocid="class_view.search_input"
            placeholder="Search student by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Parent Login Password Section */}
      <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border-b border-indigo-100">
          <Lock className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">
            Parent Login Password
          </h3>
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 border-0 text-xs"
          >
            Edit by Principal
          </Badge>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-4">
            Parents use this password to log in and view their child's records.
            Update it here and share with parents.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            {/* Current */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Current Password</Label>
              <div className="relative">
                <Input
                  data-ocid="class_view.parent_current_password"
                  type={showCurrent ? "text" : "password"}
                  readOnly
                  value={currentSaved}
                  className="pr-10 bg-gray-50 cursor-default text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {/* New */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">New Password</Label>
              <div className="relative">
                <Input
                  data-ocid="class_view.parent_new_password"
                  type={showNew ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Confirm Password</Label>
              <div className="relative">
                <Input
                  data-ocid="class_view.parent_confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 text-sm"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSaveParentPassword()
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              data-ocid="class_view.parent_password_save"
              onClick={handleSaveParentPassword}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Update Parent Password"}
            </Button>
          </div>
        </div>
      </div>

      {/* Classes */}
      {visibleClasses.length === 0 && search.trim() && (
        <div
          data-ocid="class_view.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}

      <div className="grid gap-4">
        {visibleClasses.map((cls, clsIdx) => {
          const classStudents = studentsByClass(cls);
          return (
            <div
              key={cls}
              data-ocid={`class_view.panel.${clsIdx + 1}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Class Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-800 text-base">
                    Class {cls}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 border-0"
                  >
                    {classStudents.length}{" "}
                    {classStudents.length === 1 ? "student" : "students"}
                  </Badge>
                </div>
                <Button
                  data-ocid={`class_view.primary_button.${clsIdx + 1}`}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  onClick={() => onAddStudentToClass(cls)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Student
                </Button>
              </div>

              {/* Student Rows */}
              {classStudents.length === 0 ? (
                <div
                  data-ocid="class_view.empty_state"
                  className="px-5 py-4 text-sm text-gray-400 italic"
                >
                  No students in this class yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {classStudents.map((student, idx) => (
                    <div
                      key={student.id}
                      data-ocid={`class_view.row.${idx + 1}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {student.profilePicture ? (
                            <img
                              src={student.profilePicture}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            student.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Roll No: {student.rollNo || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Total Marks</p>
                            <p className="font-semibold text-gray-700">
                              {student.marks.reduce(
                                (sum, m) =>
                                  sum +
                                  m.pt1 +
                                  m.pt2 +
                                  m.pt3 +
                                  m.term1 +
                                  m.term2,
                                0,
                              ) || "—"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Rank</p>
                            <p className="font-semibold text-gray-700">
                              {student.rank || "—"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">Password</p>
                            <div className="flex items-center gap-1">
                              <KeyRound className="h-3 w-3 text-indigo-400" />
                              <p className="font-semibold text-gray-500 text-xs">
                                {student.password ? "Set" : "Default"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          data-ocid={`class_view.edit_button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => onEditStudent(student.id)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
