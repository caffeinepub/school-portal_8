import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  student: Student;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: number) => void;
  onBack: () => void;
}

export default function StudentEditPage({
  student,
  onUpdateStudent,
  onDeleteStudent,
  onBack,
}: Props) {
  const [draft, setDraft] = useState<Student>({
    ...student,
    marks: student.marks.map((m) => ({ ...m })),
    fees: student.fees.map((f) => ({ ...f })),
    attendance: student.attendance.map((a) => ({ ...a })),
  });

  function setField<K extends keyof Student>(key: K, value: Student[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setMark(idx: number, field: "midterm" | "final", value: number) {
    setDraft((prev) => {
      const marks = prev.marks.map((m, i) =>
        i === idx ? { ...m, [field]: value } : m,
      );
      return { ...prev, marks };
    });
  }

  function setFee(
    idx: number,
    field: keyof Student["fees"][0],
    value: string | number,
  ) {
    setDraft((prev) => {
      const fees = prev.fees.map((f, i) =>
        i === idx ? { ...f, [field]: value } : f,
      );
      return { ...prev, fees };
    });
  }

  function addFeeRow() {
    setDraft((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          id: Date.now(),
          type: "New Fee",
          amount: 0,
          paid: 0,
          dueDate: "-",
          paidDate: "-",
          status: "Pending",
        },
      ],
    }));
  }

  function removeFeeRow(idx: number) {
    setDraft((prev) => ({
      ...prev,
      fees: prev.fees.filter((_, i) => i !== idx),
    }));
  }

  function setAttendance(idx: number, status: string) {
    setDraft((prev) => {
      const attendance = prev.attendance.map((a, i) =>
        i === idx ? { ...a, status } : a,
      );
      return { ...prev, attendance };
    });
  }

  function addAttendanceRow() {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const dayStr = today
      .toLocaleDateString("en-IN", { weekday: "short" })
      .slice(0, 3);
    setDraft((prev) => ({
      ...prev,
      attendance: [
        ...prev.attendance,
        { date: dateStr, day: dayStr, status: "Present" },
      ],
    }));
  }

  function addMarkRow() {
    setDraft((prev) => ({
      ...prev,
      marks: [
        ...prev.marks,
        { subject: "New Subject", midterm: 0, final: 0, max: 100 },
      ],
    }));
  }

  function removeMarkRow(idx: number) {
    setDraft((prev) => ({
      ...prev,
      marks: prev.marks.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    onUpdateStudent(draft);
    toast.success(`${draft.name}'s record saved permanently!`);
  }

  const totalPresent = draft.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const totalLate = draft.attendance.filter((a) => a.status === "Late").length;
  const totalAbsent = draft.attendance.filter(
    (a) => a.status === "Absent",
  ).length;
  const attPct = draft.attendance.length
    ? Math.round((totalPresent / draft.attendance.length) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            data-ocid="student_edit.cancel_button"
            onClick={onBack}
            className="gap-1.5"
          >
            <ArrowLeft size={14} />
            Back to Students
          </Button>
          <div className="flex items-center gap-3 ml-1">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {draft.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{draft.name}</h2>
              <p className="text-sm text-gray-500">
                Class {draft.class} · Roll #{draft.rollNo}
              </p>
            </div>
          </div>
        </div>

        {/* Delete Student */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={14} />
              Delete Student
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {student.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {student.name}'s record from the
                school portal. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  toast.success(`${student.name} has been removed.`);
                  onDeleteStudent(student.id);
                }}
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs defaultValue="profile">
          <TabsList className="w-full rounded-none border-b border-gray-200 bg-gray-50 h-auto p-0">
            {["profile", "marks", "fees", "attendance"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                data-ocid={`student_edit.${t}_tab`}
                className="flex-1 rounded-none py-3 text-sm capitalize data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(
                [
                  ["name", "Full Name", "text"],
                  ["class", "Class", "text"],
                  ["rollNo", "Roll Number", "number"],
                  ["dob", "Date of Birth", "text"],
                  ["bloodGroup", "Blood Group", "text"],
                  ["admissionYear", "Admission Year", "text"],
                  ["phone", "Phone Number", "text"],
                  ["email", "Email Address", "email"],
                  ["parentName", "Parent/Guardian Name", "text"],
                  ["parentPhone", "Parent Phone", "text"],
                ] as [keyof Student, string, string][]
              ).map(([key, label, type]) => (
                <div key={key}>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    {label}
                  </Label>
                  <Input
                    data-ocid={`student_edit.${key}_input`}
                    type={type}
                    value={String(draft[key])}
                    onChange={(e) =>
                      setField(
                        key,
                        (type === "number"
                          ? Number(e.target.value)
                          : e.target.value) as Student[typeof key],
                      )
                    }
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Address
                </Label>
                <Input
                  data-ocid="student_edit.address_input"
                  value={draft.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Marks Tab */}
          <TabsContent value="marks" className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Midterm
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Final
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Max
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      %
                    </th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.marks.map((m, idx) => (
                    <tr
                      key={`mark-${m.subject}-${idx}`}
                      data-ocid={`student_edit.marks.row.${idx + 1}`}
                    >
                      <td className="py-3 pr-4">
                        <Input
                          value={m.subject}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              marks: prev.marks.map((mk, i) =>
                                i === idx
                                  ? { ...mk, subject: e.target.value }
                                  : mk,
                              ),
                            }))
                          }
                          className="w-36 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          min={0}
                          max={m.max}
                          value={m.midterm}
                          onChange={(e) =>
                            setMark(idx, "midterm", Number(e.target.value))
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          min={0}
                          max={m.max}
                          value={m.final}
                          onChange={(e) =>
                            setMark(idx, "final", Number(e.target.value))
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          min={1}
                          value={m.max}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              marks: prev.marks.map((mk, i) =>
                                i === idx
                                  ? { ...mk, max: Number(e.target.value) }
                                  : mk,
                              ),
                            }))
                          }
                          className="w-16 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={`${
                            Math.round(
                              ((m.midterm + m.final) / (m.max * 2)) * 100,
                            ) >= 75
                              ? "bg-green-100 text-green-700"
                              : Math.round(
                                    ((m.midterm + m.final) / (m.max * 2)) * 100,
                                  ) >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          } hover:bg-inherit`}
                        >
                          {Math.round(
                            ((m.midterm + m.final) / (m.max * 2)) * 100,
                          )}
                          %
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMarkRow(idx)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMarkRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Subject
            </Button>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Amount (₹)
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Paid (₹)
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Due Date
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.fees.map((f, idx) => (
                    <tr
                      key={f.id}
                      data-ocid={`student_edit.fees.row.${idx + 1}`}
                    >
                      <td className="py-3 pr-4">
                        <Input
                          value={f.type}
                          onChange={(e) => setFee(idx, "type", e.target.value)}
                          className="w-36 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          value={f.amount}
                          onChange={(e) =>
                            setFee(idx, "amount", Number(e.target.value))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          value={f.paid}
                          onChange={(e) =>
                            setFee(idx, "paid", Number(e.target.value))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          value={f.dueDate}
                          onChange={(e) =>
                            setFee(idx, "dueDate", e.target.value)
                          }
                          className="w-28 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={f.status}
                          onValueChange={(v) => setFee(idx, "status", v)}
                        >
                          <SelectTrigger
                            data-ocid={`student_edit.fees.select.${idx + 1}`}
                            className="w-32 h-8 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeRow(idx)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFeeRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Fee Row
            </Button>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Present",
                  value: totalPresent,
                  color: "text-green-600 bg-green-50",
                },
                {
                  label: "Absent",
                  value: totalAbsent,
                  color: "text-red-600 bg-red-50",
                },
                {
                  label: "Late",
                  value: totalLate,
                  color: "text-yellow-600 bg-yellow-50",
                },
                {
                  label: "Attendance",
                  value: `${attPct}%`,
                  color: "text-indigo-600 bg-indigo-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-lg p-3 ${stat.color}`}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Day
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.attendance.map((a, idx) => (
                    <tr
                      key={`${a.date}-${idx}`}
                      data-ocid={`student_edit.attendance.row.${idx + 1}`}
                    >
                      <td className="py-2.5 pr-4">
                        <Input
                          value={a.date}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              attendance: prev.attendance.map((att, i) =>
                                i === idx
                                  ? { ...att, date: e.target.value }
                                  : att,
                              ),
                            }))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2.5 pr-4">
                        <Input
                          value={a.day}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              attendance: prev.attendance.map((att, i) =>
                                i === idx
                                  ? { ...att, day: e.target.value }
                                  : att,
                              ),
                            }))
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2.5">
                        <Select
                          value={a.status}
                          onValueChange={(v) => setAttendance(idx, v)}
                        >
                          <SelectTrigger
                            data-ocid={`student_edit.attendance.select.${idx + 1}`}
                            className="w-32 h-8 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addAttendanceRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Attendance Row
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <Button
          variant="outline"
          data-ocid="student_edit.cancel_button"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          data-ocid="student_edit.save_button"
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Save size={15} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
