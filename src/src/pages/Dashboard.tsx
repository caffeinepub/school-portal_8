import {
  attendance,
  fees,
  getCurrentStudent,
  marks,
  notifications,
} from "@/data/mockData";
const student = getCurrentStudent();
import { AlertCircle, Bell, BookOpen, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const presentDays = attendance.filter((a) => a.status === "Present").length;
  const attendancePct = Math.round((presentDays / attendance.length) * 100);
  const pendingFees = fees.filter((f) => f.status !== "Paid").length;
  const unread = notifications.filter((n) => !n.read).length;
  const avgFinal = Math.round(
    marks.reduce(
      (s, m) =>
        s +
        Math.round(
          ((m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2) / (m.max * 5)) * 100,
        ),
      0,
    ) / marks.length,
  );

  const stats = [
    {
      label: "Attendance",
      value: `${attendancePct}%`,
      sub: `${presentDays}/${attendance.length} days`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg Score",
      value: `${avgFinal}%`,
      sub: "Final exams",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Fees",
      value: pendingFees.toString(),
      sub: "Items due",
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Notifications",
      value: unread.toString(),
      sub: "Unread",
      icon: Bell,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            AS
          </div>
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-blue-200 text-sm">
              Class {student.class} &bull; Roll No. {student.rollNo}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-3`}
            >
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Marks + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Exam Marks
          </h3>
          <div className="space-y-3">
            {marks.slice(0, 4).map((m) => (
              <div key={m.subject} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-36 truncate">
                  {m.subject}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.round(((m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2) / (m.max * 5)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-10 text-right">
                  {Math.round(
                    ((m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2) /
                      (m.max * 5)) *
                      100,
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.read ? "bg-gray-300" : "bg-blue-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-400">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
