import type { Notification } from "@/App";
import { AlertCircle, BookOpen, Calendar } from "lucide-react";
import { useState } from "react";

const typeIcon: Record<string, React.ReactNode> = {
  Alert: <AlertCircle size={16} className="text-orange-500" />,
  Holiday: <Calendar size={16} className="text-green-500" />,
  Exam: <BookOpen size={16} className="text-blue-500" />,
};

const typeBg: Record<string, string> = {
  Alert: "bg-orange-50",
  Holiday: "bg-green-50",
  Exam: "bg-blue-50",
};

interface Props {
  notifications: Notification[];
}

export default function Notifications({ notifications }: Props) {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Alert", "Holiday", "Exam"];

  const filtered =
    tab === "All" ? notifications : notifications.filter((n) => n.type === tab);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            type="button"
            key={t}
            data-ocid="notifications.tab"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t === "Exam" ? "Exam Timetable" : t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border border-gray-100 p-5 shadow-sm ${n.read ? "bg-white" : "bg-blue-50 border-blue-100"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg[n.type]}`}
              >
                {typeIcon[n.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {n.type}
                  </span>
                  <span className="text-xs text-gray-400">{n.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            data-ocid="notifications.empty_state"
            className="text-center py-12 text-gray-400"
          >
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
}
