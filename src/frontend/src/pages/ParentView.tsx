import type { Notification, SyllabusSubject } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import { getMediaBlobUrl } from "@/utils/mediaStorage";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Image,
  Info,
  Phone,
  Star,
  Trophy,
  User,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  student: Student;
  notifications: Notification[];
  syllabus: SyllabusSubject[];
}

interface MediaItem {
  id: string;
  fileType: "photo" | "video";
  url: string;
  caption: string;
  uploadedAt: string;
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

function getGrade(pct: number) {
  if (pct >= 90) return { grade: "A+", color: "bg-green-100 text-green-700" };
  if (pct >= 80) return { grade: "A", color: "bg-blue-100 text-blue-700" };
  if (pct >= 70) return { grade: "B", color: "bg-indigo-100 text-indigo-700" };
  if (pct >= 60) return { grade: "C", color: "bg-yellow-100 text-yellow-700" };
  return { grade: "D", color: "bg-red-100 text-red-700" };
}

function loadMedia(studentId: number): MediaItem[] {
  try {
    const raw = localStorage.getItem(`lords_media_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function downloadMedia(
  blobUrl: string,
  fileType: "photo" | "video",
  caption: string,
) {
  const ext = fileType === "photo" ? "jpg" : "mp4";
  const filename = caption ? `${caption}.${ext}` : `${fileType}.${ext}`;
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ParentView({
  student,
  notifications,
  syllabus,
}: Props) {
  const presentCount = student.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const attendancePct =
    student.attendance.length > 0
      ? Math.round((presentCount / student.attendance.length) * 100)
      : 0;
  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.paid, 0);
  const overdueFees = student.fees.filter((f) => f.status === "Overdue");

  const grandTotal = student.marks.reduce(
    (sum, m) => sum + m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2,
    0,
  );

  const [media] = useState<MediaItem[]>(() => loadMedia(student.id));
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      for (const item of media) {
        const url = await getMediaBlobUrl(item.id);
        if (url && !cancelled) {
          setBlobUrls((prev) => ({ ...prev, [item.id]: url }));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [media]);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
          {student.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">{student.name}</h2>
            <Badge className="bg-indigo-100 text-indigo-700 border-0 gap-1">
              <Star size={11} /> My Child
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Class {student.class} · Roll No. {student.rollNo}
          </p>
        </div>
      </div>

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
          <TabsTrigger
            value="media"
            data-ocid="parent.tab"
            className="flex items-center gap-1.5"
          >
            <Image size={13} /> Media
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
        <TabsContent value="marks" className="mt-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-indigo-50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-indigo-500 mb-0.5">Class Rank</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    #{student.rank ?? "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-green-50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-0.5">Total Marks</p>
                  <p className="text-2xl font-bold text-green-700">
                    {grandTotal}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Read-only note */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs"
            data-ocid="marks.panel"
          >
            <Info size={13} className="flex-shrink-0" />
            <span>Read Only — Only the principal can edit marks</span>
          </div>

          {/* Marks table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" />
                Examination Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Subject
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        PT 1
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        PT 2
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        PT 3
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Term 1
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Term 2
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Total
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.marks.map((m, idx) => {
                      const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                      const maxTotal = m.max * 5;
                      const pct = Math.round((total / maxTotal) * 100);
                      const { grade, color } = getGrade(pct);
                      return (
                        <tr
                          key={m.subject}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }
                          data-ocid={`marks.row.${idx + 1}`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {m.subject}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {m.pt1}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {m.pt2}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {m.pt3}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {m.term1}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {m.term2}
                          </td>
                          <td className="px-3 py-3 text-center font-semibold text-gray-800">
                            {total}
                            <span className="text-xs text-gray-400 font-normal">
                              /{maxTotal}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <Badge className={`border-0 text-xs ${color}`}>
                              {grade}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {student.marks.map((m) => {
                  const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                  const maxTotal = m.max * 5;
                  const pct = Math.round((total / maxTotal) * 100);
                  const { grade, color } = getGrade(pct);
                  return (
                    <div key={m.subject} className="px-4 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-800">
                          {m.subject}
                        </span>
                        <Badge className={`border-0 text-xs ${color}`}>
                          {grade}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "PT 1", val: m.pt1 },
                          { label: "PT 2", val: m.pt2 },
                          { label: "PT 3", val: m.pt3 },
                          { label: "Term 1", val: m.term1 },
                          { label: "Term 2", val: m.term2 },
                          { label: "Total", val: `${total}/${maxTotal}` },
                        ].map(({ label, val }) => (
                          <div
                            key={label}
                            className="bg-gray-50 rounded-lg px-2 py-1.5 text-center"
                          >
                            <p className="text-xs text-gray-400 mb-0.5">
                              {label}
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                className={`rounded-2xl border border-gray-100 p-4 shadow-sm ${
                  n.read ? "bg-white" : "bg-blue-50 border-blue-100"
                }`}
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

        {/* Media */}
        <TabsContent value="media" className="mt-4">
          {media.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="media.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <Image size={28} className="text-indigo-300" />
              </div>
              <p className="text-gray-500 font-medium">
                No media shared by the principal yet.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Photos and videos uploaded by the principal will appear here.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="media.list"
            >
              {media.map((item, idx) => (
                <Card
                  key={item.id}
                  className="border-0 shadow-sm overflow-hidden"
                  data-ocid={`media.item.${idx + 1}`}
                >
                  <div className="relative bg-gray-100">
                    {blobUrls[item.id] ? (
                      item.fileType === "photo" ? (
                        <img
                          src={blobUrls[item.id]}
                          alt={item.caption || "Shared photo"}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <video
                          src={blobUrls[item.id]}
                          controls
                          className="w-full h-48 object-contain bg-black"
                        >
                          <track kind="captions" />
                        </video>
                      )
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="border-0 text-xs gap-1 bg-black/60 text-white">
                        {item.fileType === "photo" ? (
                          <>
                            <Image size={10} /> Photo
                          </>
                        ) : (
                          <>
                            <Video size={10} /> Video
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    {item.caption && (
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(item.uploadedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {blobUrls[item.id] && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          onClick={() =>
                            downloadMedia(
                              blobUrls[item.id],
                              item.fileType,
                              item.caption,
                            )
                          }
                        >
                          <Download size={12} />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
