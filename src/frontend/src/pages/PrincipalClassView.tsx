import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Student } from "@/data/mockData";
import { Edit, LayoutGrid, Plus, Search, Users } from "lucide-react";
import { useState } from "react";

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
}

export default function PrincipalClassView({
  students,
  onEditStudent,
  onAddStudentToClass,
}: Props) {
  const [search, setSearch] = useState("");

  // Build class list: predefined + any custom classes from students
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

  // When searching, only show classes that have matching students
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
              Class-wise Students
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
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {student.name.charAt(0).toUpperCase()}
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
