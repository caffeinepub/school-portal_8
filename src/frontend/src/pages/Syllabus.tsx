import type { SyllabusSubject } from "@/App";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-gray-100 text-gray-500",
};

interface Props {
  syllabus: SyllabusSubject[];
}

export default function Syllabus({ syllabus }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    Mathematics: true,
  });

  return (
    <div className="space-y-3">
      {syllabus.map((s) => (
        <div
          key={s.subject}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <button
            type="button"
            onClick={() =>
              setOpen((o) => ({ ...o, [s.subject]: !o[s.subject] }))
            }
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <span className="font-semibold text-gray-800">{s.subject}</span>
            {open[s.subject] ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          {open[s.subject] && (
            <div className="px-6 pb-4 border-t border-gray-50 pt-3 space-y-2">
              {s.chapters.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
