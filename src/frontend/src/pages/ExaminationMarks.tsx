// @ts-nocheck
import { getCurrentStudent } from "@/data/mockData";
const marks = getCurrentStudent().marks;

function grade(pct: number) {
  if (pct >= 90) return { g: "A+", color: "bg-green-100 text-green-700" };
  if (pct >= 80) return { g: "A", color: "bg-green-100 text-green-700" };
  if (pct >= 70) return { g: "B", color: "bg-blue-100 text-blue-700" };
  if (pct >= 60) return { g: "C", color: "bg-yellow-100 text-yellow-700" };
  return { g: "D", color: "bg-red-100 text-red-700" };
}

export default function ExaminationMarks() {
  const avgPT = Math.round(
    marks.reduce((s, m) => s + Math.round((m.pt1 + m.pt2 + m.pt3) / 3), 0) /
      marks.length,
  );
  const avgTerm = Math.round(
    marks.reduce((s, m) => s + Math.round((m.term1 + m.term2) / 2), 0) /
      marks.length,
  );
  const overallAvg = Math.round(
    marks.reduce((s, m) => {
      const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
      return s + Math.round((total / (m.max * 5)) * 100);
    }, 0) / marks.length,
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">PT Average</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgPT}%</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${grade(avgPT).color}`}
          >
            {grade(avgPT).g}
          </span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Term Average</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgTerm}%</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${grade(avgTerm).color}`}
          >
            {grade(avgTerm).g}
          </span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Overall Grade</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {grade(overallAvg).g}
          </p>
          <span className="text-xs text-gray-400">All Exams</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Subject-wise Marks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-6 py-3">Subject</th>
                <th className="text-center px-3 py-3">PT 1</th>
                <th className="text-center px-3 py-3">PT 2</th>
                <th className="text-center px-3 py-3">PT 3</th>
                <th className="text-center px-3 py-3">Term 1</th>
                <th className="text-center px-3 py-3">Term 2</th>
                <th className="text-center px-3 py-3">Total</th>
                <th className="text-center px-3 py-3">Grade</th>
                <th className="px-4 py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {marks.map((m) => {
                const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                const pct = Math.round((total / (m.max * 5)) * 100);
                const g = grade(pct);
                return (
                  <tr key={m.subject} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {m.subject}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600">
                      {m.pt1}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600">
                      {m.pt2}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600">
                      {m.pt3}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600">
                      {m.term1}
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-600">
                      {m.term2}
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-semibold text-indigo-700">
                      {total}/{m.max * 5}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${g.color}`}
                      >
                        {g.g}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
