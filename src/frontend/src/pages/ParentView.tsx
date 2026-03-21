import type { Notification, SyllabusSubject } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Phone,
  User,
  XCircle,
} from "lucide-react";

interface Props {
  student: Student;
  notifications: Notification[];
  syllabus: SyllabusSubject[];
}

const statusBadge: Record<string, string> = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700",
};

const feeStatusBadge: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
};

const syllabusStatusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-gray-100 text-gray-500",
};

const notifTypeBg: Record<string, string> = {
  Alert: "bg-orange-50",
  Holiday: "bg-green-50",
  Exam: "bg-blue-50",
};

const notifTypeIcon: Record<string, React.ReactNode> = {
  Alert: <AlertCircle size={16} className="text-orange-500" />,
  Holiday: <Calendar size={16} className="text-green-500" />,
  Exam: <BookOpen size={16} className="text-blue-500" />,
};

export default function ParentView({
  student,
  notifications,
  syllabus,
}: Props) {
  const presentCount = student.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const attendancePct = Math.round(
    (presentCount / student.attendance.length) * 100,
  );

  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.paid, 0);
  const overdueFees = student.fees.filter((f) => f.status === "Overdue");

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Attendance</p>
            <p className="text-2xl font-bold text-indigo-600">
              {attendancePct}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Subjects</p>
            <p className="text-2xl font-bold text-indigo-600">
              {student.marks.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Fees Paid</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{paidFees.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-500">
              {overdueFees.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile">
        <TabsList
          className="w-full flex-wrap h-auto gap-1 bg-gray-100 p-1"
          data-ocid="parent.tab"
        >
          <TabsTrigger value="profile" data-ocid="parent.tab">
            Profile
          </TabsTrigger>
          <TabsTrigger value="marks" data-ocid="parent.tab">
            Marks
          </TabsTrigger>
          <TabsTrigger value="fees" data-ocid="parent.tab">
            Fees
          </TabsTrigger>
          <TabsTrigger value="attendance" data-ocid="parent.tab">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="syllabus" data-ocid="parent.tab">
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="notifications" data-ocid="parent.tab">
            Notices
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User size={16} className="text-indigo-600" /> Student
                Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: student.name },
                  { label: "Class", value: student.class },
                  { label: "Roll Number", value: String(student.rollNo) },
                  { label: "Date of Birth", value: student.dob },
                  { label: "Blood Group", value: student.bloodGroup },
                  { label: "Address", value: student.address },
                  { label: "Phone", value: student.phone },
                  { label: "Email", value: student.email },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone size={14} className="text-indigo-600" /> Parent /
                  Guardian
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">
                      {student.parentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">
                      {student.parentPhone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marks */}
        <TabsContent value="marks" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" />{" "}
                Examination Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.marks.map((m) => {
                const avg = Math.round((m.midterm + m.final) / 2);
                const pct = Math.round((avg / m.max) * 100);
                const grade =
                  pct >= 90
                    ? "A+"
                    : pct >= 80
                      ? "A"
                      : pct >= 70
                        ? "B"
                        : pct >= 60
                          ? "C"
                          : "D";
                return (
                  <div key={m.subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {m.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Mid: {m.midterm} | Final: {m.final}
                        </span>
                        <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                          {grade}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Fee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Fees</span>
                <span className="font-bold text-gray-800">
                  ₹{totalFees.toLocaleString()}
                </span>
              </div>
              {student.fees.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {f.type}
                    </p>
                    <p className="text-xs text-gray-400">Due: {f.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      ₹{f.amount.toLocaleString()}
                    </p>
                    <Badge
                      className={`border-0 text-xs mt-1 ${feeStatusBadge[f.status]}`}
                    >
                      {f.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Attendance
                Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {presentCount} Present
                </span>
                <span className="flex items-center gap-1.5">
                  <XCircle size={14} className="text-red-400" />
                  {
                    student.attendance.filter((a) => a.status === "Absent")
                      .length
                  }{" "}
                  Absent
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-yellow-500" />
                  {student.attendance.filter((a) => a.status === "Late").length}{" "}
                  Late
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {student.attendance.map((a) => (
                  <div
                    key={a.date}
                    className="rounded-xl border border-gray-100 p-2 text-center"
                  >
                    <p className="text-xs text-gray-400">{a.day}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {a.date}
                    </p>
                    <Badge
                      className={`border-0 text-xs mt-1 ${statusBadge[a.status]}`}
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syllabus */}
        <TabsContent value="syllabus" className="mt-4">
          <div className="space-y-3">
            {syllabus.map((s) => (
              <Card key={s.subject} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800">
                    {s.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {s.chapters.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-700">{c.name}</span>
                      <Badge
                        className={`border-0 text-xs ${syllabusStatusColor[c.status]}`}
                      >
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl border border-gray-100 p-4 shadow-sm ${n.read ? "bg-white" : "bg-blue-50 border-blue-100"}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${notifTypeBg[n.type]}`}
                  >
                    {notifTypeIcon[n.type]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {n.type}
                      </span>
                      <span className="text-xs text-gray-400">{n.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
