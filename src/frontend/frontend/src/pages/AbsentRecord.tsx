import { getCurrentStudent } from "@/data/mockData";
const attendance = getCurrentStudent().attendance;

const statusColor: Record<string, string> = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700",
};

export default function AbsentRecord() {
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "Present").length;
  const absent = attendance.filter((a) => a.status === "Absent").length;
  const late = attendance.filter((a) => a.status === "Late").length;
  const pct = Math.round((present / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Attendance %", value: `${pct}%`, color: "text-gray-900" },
          { label: "Present", value: present, color: "text-green-600" },
          { label: "Absent", value: absent, color: "text-red-600" },
          { label: "Late", value: late, color: "text-yellow-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">March 2026 Attendance</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {attendance.map((a) => (
            <div
              key={a.date}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-16">
                  {a.date}
                </span>
                <span className="text-xs text-gray-400">{a.day}</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}
              >
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
