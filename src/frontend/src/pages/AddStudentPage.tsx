import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Student } from "@/data/mockData";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onAddStudent: (student: Omit<Student, "id">) => void;
  onBack: () => void;
}

const EMPTY: Omit<Student, "id"> = {
  name: "",
  class: "",
  rollNo: 0,
  dob: "",
  address: "",
  phone: "",
  email: "",
  parentName: "",
  parentPhone: "",
  bloodGroup: "",
  admissionYear: "",
  marks: [],
  fees: [],
  attendance: [],
};

export default function AddStudentPage({ onAddStudent, onBack }: Props) {
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY);
  const [errors, setErrors] = useState<{ name?: string; class?: string }>({});

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" || key === "class") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleSubmit() {
    const errs: { name?: string; class?: string } = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.class.trim()) errs.class = "Class is required";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onAddStudent(form);
    toast.success(`${form.name} added successfully!`);
    onBack();
  }

  const fields: [keyof typeof form, string, string][] = [
    ["name", "Full Name *", "text"],
    ["class", "Class *", "text"],
    ["rollNo", "Roll Number", "number"],
    ["dob", "Date of Birth", "text"],
    ["bloodGroup", "Blood Group", "text"],
    ["admissionYear", "Admission Year", "text"],
    ["phone", "Phone Number", "text"],
    ["email", "Email Address", "email"],
    ["parentName", "Parent/Guardian Name", "text"],
    ["parentPhone", "Parent Phone", "text"],
  ];

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          data-ocid="add_student.cancel_button"
          onClick={onBack}
          className="gap-1.5"
        >
          <ArrowLeft size={14} />
          Back to Students
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <UserPlus size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
            <p className="text-sm text-gray-500">
              Fill in the details to enrol a new student
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map(([key, label, type]) => (
            <div key={key}>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                {label}
              </Label>
              <Input
                data-ocid={`add_student.${key}_input`}
                type={type}
                value={String(form[key])}
                onChange={(e) =>
                  set(
                    key,
                    (type === "number"
                      ? Number(e.target.value)
                      : e.target.value) as (typeof form)[typeof key],
                  )
                }
                className={
                  (key === "name" && errors.name) ||
                  (key === "class" && errors.class)
                    ? "border-red-400"
                    : ""
                }
              />
              {key === "name" && errors.name && (
                <p
                  data-ocid="add_student.name_error"
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.name}
                </p>
              )}
              {key === "class" && errors.class && (
                <p
                  data-ocid="add_student.class_error"
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.class}
                </p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Label className="text-sm font-medium text-gray-700 mb-1 block">
              Address
            </Label>
            <Input
              data-ocid="add_student.address_input"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <Button
          variant="outline"
          data-ocid="add_student.cancel_button"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          data-ocid="add_student.submit_button"
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <UserPlus size={15} />
          Add Student
        </Button>
      </div>
    </div>
  );
}
