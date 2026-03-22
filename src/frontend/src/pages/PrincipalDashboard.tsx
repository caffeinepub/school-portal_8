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
import { Plus, Search, UserPen, Users } from "lucide-react";
import { useState } from "react";

interface Props {
  students: Student[];
  onEditStudent: (id: number) => void;
  onNavigateToAdd?: () => void;
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

const CLASSES = ["All", "9-A", "10-A", "10-B", "11-A", "11-B", "12-A"];

export default function PrincipalDashboard({
  students,
  onEditStudent,
  onNavigateToAdd,
}: Props) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 text-sm px-3 py-1">
            {students.length} Students
          </Badge>
          {onNavigateToAdd && (
            <Button
              size="sm"
              data-ocid="students.primary_button"
              onClick={onNavigateToAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <Plus size={14} />
              Add Student
            </Button>
          )}
        </div>
      </div>

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
                  return (
                    <tr
                      key={student.id}
                      data-ocid={`students.row.${ocidIdx}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                            {initials}
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
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                          {student.rank ?? "-"}
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
