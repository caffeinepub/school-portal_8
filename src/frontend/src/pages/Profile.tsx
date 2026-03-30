// @ts-nocheck
import { getCurrentStudent } from "@/data/mockData";
const student = getCurrentStudent();

export default function Profile() {
  const fields = [
    { label: "Full Name", value: student.name },
    { label: "Class", value: student.class },
    { label: "Roll Number", value: student.rollNo.toString() },
    { label: "Date of Birth", value: student.dob },
    { label: "Blood Group", value: student.bloodGroup },
    { label: "Admission Year", value: student.admissionYear },
    { label: "Email", value: student.email },
    { label: "Phone", value: student.phone },
    { label: "Address", value: student.address },
    { label: "Parent's Name", value: student.parentName },
    { label: "Parent's Phone", value: student.parentPhone },
  ];

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-blue-700 text-2xl font-bold">
              AS
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
          <p className="text-gray-500 text-sm mb-6">
            Class {student.class} &bull; Roll No. {student.rollNo}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
