import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/data/mockData";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onAddStudent: (student: Omit<Student, "id">) => void;
  onBulkAddStudents: (students: Omit<Student, "id">[]) => void;
  onBack: () => void;
}

type BulkRow = Omit<Student, "id"> & { _key: number };

let _keyCounter = 0;
function newRow(): BulkRow {
  return {
    _key: ++_keyCounter,
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
}

const BULK_COLS: {
  key: keyof Omit<Student, "id">;
  label: string;
  width: number;
}[] = [
  { key: "name", label: "Name *", width: 140 },
  { key: "class", label: "Class *", width: 90 },
  { key: "rollNo", label: "Roll No", width: 80 },
  { key: "dob", label: "DOB", width: 100 },
  { key: "bloodGroup", label: "Blood Grp", width: 85 },
  { key: "admissionYear", label: "Adm Year", width: 90 },
  { key: "phone", label: "Phone", width: 115 },
  { key: "email", label: "Email", width: 155 },
  { key: "parentName", label: "Parent Name", width: 130 },
  { key: "parentPhone", label: "Parent Phone", width: 115 },
  { key: "address", label: "Address", width: 155 },
];

const EMPTY_FORM: Omit<Student, "id"> = {
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

export default function AddStudentPage({
  onAddStudent,
  onBulkAddStudents,
  onBack,
}: Props) {
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; class?: string }>({});
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    newRow(),
    newRow(),
    newRow(),
  ]);
  const [csvText, setCsvText] = useState("");
  const [csvOpen, setCsvOpen] = useState(false);

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
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

  function updateBulkCell<K extends keyof Omit<Student, "id">>(
    rowKey: number,
    key: K,
    value: Omit<Student, "id">[K],
  ) {
    setBulkRows((prev) =>
      prev.map((r) => (r._key === rowKey ? { ...r, [key]: value } : r)),
    );
  }

  function addRow() {
    setBulkRows((prev) => [...prev, newRow()]);
  }

  function removeRow(rowKey: number) {
    setBulkRows((prev) => prev.filter((r) => r._key !== rowKey));
  }

  function handleBulkSubmit() {
    const invalid = bulkRows.filter((r) => !r.name.trim() || !r.class.trim());
    if (invalid.length > 0) {
      toast.error(`${invalid.length} row(s) are missing Name or Class.`);
      return;
    }
    const validRows = bulkRows.map(({ _key: _k, ...rest }) => rest);
    onBulkAddStudents(validRows);
    toast.success(`${validRows.length} students added successfully!`);
    onBack();
  }

  function handleImportCSV() {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row.");
      return;
    }
    const dataLines = lines.slice(1);
    const parsed: BulkRow[] = dataLines.map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        _key: ++_keyCounter,
        name: cols[0] ?? "",
        class: cols[1] ?? "",
        rollNo: Number(cols[2]) || 0,
        dob: cols[3] ?? "",
        bloodGroup: cols[4] ?? "",
        admissionYear: cols[5] ?? "",
        phone: cols[6] ?? "",
        email: cols[7] ?? "",
        parentName: cols[8] ?? "",
        parentPhone: cols[9] ?? "",
        address: cols[10] ?? "",
        marks: [],
        fees: [],
        attendance: [],
      };
    });
    setBulkRows(parsed);
    setCsvOpen(false);
    setCsvText("");
    toast.success(`${parsed.length} rows imported from CSV!`);
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
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          data-ocid="add_student.cancel_button"
          onClick={onBack}
          className="gap-1.5"
        >
          <ArrowLeft size={14} />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <UserPlus size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
            <p className="text-sm text-gray-500">Single or bulk enrolment</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger
            value="single"
            data-ocid="add_student.tab"
            className="gap-2"
          >
            <UserPlus size={14} />
            Single Student
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            data-ocid="add_student.tab"
            className="gap-2"
          >
            <Users size={14} />
            Bulk Add
          </TabsTrigger>
        </TabsList>

        {/* ── SINGLE TAB ── */}
        <TabsContent value="single">
          <div className="max-w-2xl">
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
                        setField(
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
                    onChange={(e) => setField("address", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pb-4">
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
        </TabsContent>

        {/* ── BULK TAB ── */}
        <TabsContent value="bulk">
          <div className="space-y-3">
            {/* Actions row */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                data-ocid="add_student.primary_button"
                onClick={addRow}
                className="gap-1.5"
              >
                <Plus size={13} />
                Add Row
              </Button>

              <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid="add_student.upload_button"
                    className="gap-1.5"
                  >
                    <FileText size={13} />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent
                  data-ocid="add_student.dialog"
                  className="max-w-xl"
                >
                  <DialogHeader>
                    <DialogTitle>Import Students from CSV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-gray-500">
                    <p>Paste CSV data below. First row must be the header:</p>
                    <code className="block bg-gray-50 border rounded px-3 py-2 text-xs text-gray-700 overflow-x-auto whitespace-nowrap">
                      name,class,rollNo,dob,bloodGroup,admissionYear,phone,email,parentName,parentPhone,address
                    </code>
                    <Textarea
                      data-ocid="add_student.textarea"
                      placeholder="Paste CSV here..."
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="h-48 font-mono text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      data-ocid="add_student.cancel_button"
                      onClick={() => setCsvOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="add_student.confirm_button"
                      onClick={handleImportCSV}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Load Data
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <span className="text-sm text-gray-500 ml-1">
                {bulkRows.length} rows
              </span>
            </div>

            {/* Scrollable table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <ScrollArea className="w-full" style={{ maxHeight: "60vh" }}>
                <div className="overflow-x-auto">
                  <table
                    className="text-sm"
                    style={{
                      minWidth: `${BULK_COLS.reduce((a, c) => a + c.width, 0) + 60}px`,
                    }}
                  >
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="w-10 px-2 py-2 text-center text-xs font-semibold text-gray-500">
                          #
                        </th>
                        {BULK_COLS.map((col) => (
                          <th
                            key={col.key}
                            style={{ minWidth: col.width }}
                            className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                          >
                            {col.label}
                          </th>
                        ))}
                        <th className="w-10 px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bulkRows.map((row, displayIdx) => (
                        <tr
                          key={row._key}
                          data-ocid={`add_student.item.${displayIdx + 1}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-2 py-1 text-center text-xs text-gray-400">
                            {displayIdx + 1}
                          </td>
                          {BULK_COLS.map((col) => (
                            <td key={col.key} className="px-1 py-1">
                              <input
                                type={col.key === "rollNo" ? "number" : "text"}
                                value={String(row[col.key])}
                                onChange={(e) =>
                                  updateBulkCell(
                                    row._key,
                                    col.key,
                                    (col.key === "rollNo"
                                      ? Number(e.target.value)
                                      : e.target.value) as Omit<
                                      Student,
                                      "id"
                                    >[typeof col.key],
                                  )
                                }
                                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                                style={{ minWidth: col.width - 10 }}
                              />
                            </td>
                          ))}
                          <td className="px-1 py-1 text-center">
                            <button
                              type="button"
                              data-ocid={`add_student.delete_button.${displayIdx + 1}`}
                              onClick={() => removeRow(row._key)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center pb-4">
              <p className="text-sm text-gray-500">
                Fill <span className="font-medium text-gray-700">Name</span> and{" "}
                <span className="font-medium text-gray-700">Class</span> for
                each row (required).
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  data-ocid="add_student.cancel_button"
                  onClick={onBack}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="add_student.submit_button"
                  onClick={handleBulkSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  <Users size={15} />
                  Submit All ({bulkRows.length})
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
