import { getCurrentStudent } from "@/data/mockData";
const fees = getCurrentStudent().fees;

const statusColor: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function SchoolFees() {
  const total = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paid, 0);
  const due = total - paid;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Total Fees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₹{paid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Amount Due</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ₹{due.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Fee Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-6 py-3">Fee Type</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Due Date</th>
                <th className="text-center px-4 py-3">Paid Date</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fees.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {f.type}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 text-right">
                    ₹{f.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center">
                    {f.dueDate}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center">
                    {f.paidDate}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
