import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bus,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Student } from "../../data/mockData";

const CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
  "11-Science",
  "11-Commerce",
  "12-Science",
  "12-Commerce",
];

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Computer",
  "Physics",
  "Chemistry",
  "Biology",
  "Accountancy",
  "Economics",
  "History",
  "Geography",
];
const ROUTES = [
  "Churu City",
  "Bhaleri Road",
  "Rajgarh Road",
  "Sardarshar Road",
  "Sujangarh Road",
  "Ratangarh Road",
];

// ── Types ──────────────────────────────────────────────────────────────────

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  assignedClass: string;
  subjects: string;
  password: string;
  joinDate: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicleNo: string;
  route: string;
  licenseNo: string;
  password: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveLS<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "Lords@";
  for (let i = 0; i < 7; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function generateUniquePasswords(count: number): string[] {
  const used = new Set<string>();
  const out: string[] = [];
  while (out.length < count) {
    const p = generatePassword();
    if (!used.has(p)) {
      used.add(p);
      out.push(p);
    }
  }
  return out;
}

// ── Empty form builders ─────────────────────────────────────────────────────

const emptyStudent = (): Omit<Student, "id"> => ({
  name: "",
  class: "Class 1",
  rollNo: 1,
  dob: "",
  address: "",
  phone: "",
  email: "",
  parentName: "",
  parentPhone: "",
  bloodGroup: "O+",
  admissionYear: "2026",
  marks: [],
  fees: [],
  attendance: [],
  rank: 0,
  password: generatePassword(),
  parentPassword: generatePassword(),
});

const emptyTeacher = (): Omit<Teacher, "id"> => ({
  name: "",
  email: "",
  phone: "",
  assignedClass: "Class 1",
  subjects: "",
  password: generatePassword(),
  joinDate: new Date().toISOString().slice(0, 10),
});

const emptyDriver = (): Omit<Driver, "id"> => ({
  name: "",
  phone: "",
  vehicleNo: "",
  route: ROUTES[0],
  licenseNo: "",
  password: generatePassword(),
});

// ── Password cell component ──────────────────────────────────────────────────

function PasswordCell({ pwd, onCopy }: { pwd: string; onCopy: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs">{show ? pwd : "••••••••"}</span>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
      >
        <Copy size={12} />
      </button>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  principalId: string;
  students: Student[];
  onAddStudent: (s: Omit<Student, "id">) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: number) => void;
  onAutoGeneratePasswords: () => void;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function UserManagement({
  principalId,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAutoGeneratePasswords,
}: Props) {
  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    loadLS<Teacher[]>(`lords_teachers_${principalId}`, []),
  );
  const [teacherForm, setTeacherForm] = useState<Omit<Teacher, "id"> | null>(
    null,
  );
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>(() =>
    loadLS<Driver[]>(`lords_drivers_${principalId}`, []),
  );
  const [driverForm, setDriverForm] = useState<Omit<Driver, "id"> | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);

  // Students form state
  const [studentForm, setStudentForm] = useState<Omit<Student, "id"> | null>(
    null,
  );
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  const persistTeachers = (list: Teacher[]) => {
    setTeachers(list);
    saveLS(`lords_teachers_${principalId}`, list);
  };
  const persistDrivers = (list: Driver[]) => {
    setDrivers(list);
    saveLS(`lords_drivers_${principalId}`, list);
  };

  // ── Students tab ─────────────────────────────────────────────────────────

  const openAddStudent = () => {
    setEditingStudentId(null);
    setStudentForm(emptyStudent());
  };
  const openEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setStudentForm({ ...s });
  };
  const saveStudent = () => {
    if (!studentForm) return;
    if (!studentForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingStudentId !== null) {
      onUpdateStudent({ ...studentForm, id: editingStudentId } as Student);
      toast.success("Student updated");
    } else {
      onAddStudent(studentForm);
      toast.success("Student added");
    }
    setStudentForm(null);
    setEditingStudentId(null);
  };

  // ── Teachers tab ─────────────────────────────────────────────────────────

  const openAddTeacher = () => {
    setEditingTeacherId(null);
    setTeacherForm(emptyTeacher());
  };
  const openEditTeacher = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setTeacherForm({ ...t });
  };
  const saveTeacher = () => {
    if (!teacherForm) return;
    if (!teacherForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingTeacherId !== null) {
      persistTeachers(
        teachers.map((t) =>
          t.id === editingTeacherId
            ? { ...teacherForm, id: editingTeacherId }
            : t,
        ),
      );
      toast.success("Teacher updated");
    } else {
      persistTeachers([...teachers, { ...teacherForm, id: Date.now() }]);
      toast.success("Teacher added");
    }
    setTeacherForm(null);
    setEditingTeacherId(null);
  };
  const deleteTeacher = (id: number) => {
    persistTeachers(teachers.filter((t) => t.id !== id));
    toast.success("Teacher removed");
  };
  const resetTeacherPassword = (id: number) => {
    const pwd = generatePassword();
    persistTeachers(
      teachers.map((t) => (t.id === id ? { ...t, password: pwd } : t)),
    );
    toast.success("Password reset — copy before closing");
  };

  // ── Drivers tab ──────────────────────────────────────────────────────────

  const openAddDriver = () => {
    setEditingDriverId(null);
    setDriverForm(emptyDriver());
  };
  const openEditDriver = (d: Driver) => {
    setEditingDriverId(d.id);
    setDriverForm({ ...d });
  };
  const saveDriver = () => {
    if (!driverForm) return;
    if (!driverForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingDriverId !== null) {
      persistDrivers(
        drivers.map((d) =>
          d.id === editingDriverId ? { ...driverForm, id: editingDriverId } : d,
        ),
      );
      toast.success("Driver updated");
    } else {
      persistDrivers([...drivers, { ...driverForm, id: Date.now() }]);
      toast.success("Driver added");
    }
    setDriverForm(null);
    setEditingDriverId(null);
  };
  const deleteDriver = (id: number) => {
    persistDrivers(drivers.filter((d) => d.id !== id));
    toast.success("Driver removed");
  };
  const resetDriverPassword = (id: number) => {
    const pwd = generatePassword();
    persistDrivers(
      drivers.map((d) => (d.id === id ? { ...d, password: pwd } : d)),
    );
    toast.success("Password reset — copy before closing");
  };

  // ── Auto-generate all student passwords ──────────────────────────────────

  const handleBulkPasswords = () => {
    onAutoGeneratePasswords();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5" data-ocid="principal.user_management">
      <Tabs defaultValue="students">
        <TabsList className="mb-4">
          <TabsTrigger value="students" data-ocid="principal.um_tab_students">
            <Users size={14} className="mr-1.5" /> Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="teachers" data-ocid="principal.um_tab_teachers">
            <UserCheck size={14} className="mr-1.5" /> Teachers (
            {teachers.length})
          </TabsTrigger>
          <TabsTrigger value="drivers" data-ocid="principal.um_tab_drivers">
            <Bus size={14} className="mr-1.5" /> Drivers ({drivers.length})
          </TabsTrigger>
        </TabsList>

        {/* ── STUDENTS ──────────────────────────────────────────────────── */}
        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Student Management</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkPasswords}
                  data-ocid="principal.auto_password_btn"
                >
                  <RefreshCw size={13} className="mr-1.5" /> Auto Passwords
                </Button>
                <Button
                  size="sm"
                  onClick={openAddStudent}
                  data-ocid="principal.add_student_btn"
                >
                  <Plus size={14} className="mr-1.5" /> Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Student form */}
              {studentForm && (
                <div className="mx-4 mb-4 p-4 border border-border rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">
                      {editingStudentId ? "Edit Student" : "Add New Student"}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStudentForm(null)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Full Name *</Label>
                      <Input
                        value={studentForm.name}
                        placeholder="Student name"
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Class</Label>
                      <Select
                        value={studentForm.class}
                        onValueChange={(v) =>
                          setStudentForm({ ...studentForm, class: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Roll No</Label>
                      <Input
                        type="number"
                        value={studentForm.rollNo}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            rollNo: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Parent Name</Label>
                      <Input
                        value={studentForm.parentName}
                        placeholder="Parent / Guardian name"
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            parentName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Parent Phone</Label>
                      <Input
                        value={studentForm.parentPhone}
                        placeholder="10-digit mobile"
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            parentPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Student Login Password</Label>
                      <Input
                        value={studentForm.password ?? ""}
                        placeholder="Students portal password"
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={saveStudent}
                    data-ocid="principal.save_student_btn"
                  >
                    <Save size={13} className="mr-1.5" />
                    {editingStudentId
                      ? "Save & Send to Students Portal"
                      : "Add Student"}
                  </Button>
                </div>
              )}

              {/* Students table */}
              <div className="overflow-x-auto">
                {students.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    No students yet. Click &quot;Add Student&quot; to get
                    started.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Class
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Roll
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Parent
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Password
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          data-ocid={`principal.student_row_${s.id}`}
                        >
                          <td className="px-4 py-2.5 font-medium">{s.name}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="secondary" className="text-xs">
                              {s.class}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {s.rollNo}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {s.parentName || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <PasswordCell
                              pwd={s.password ?? s.parentPassword ?? "—"}
                              onCopy={() => {
                                navigator.clipboard
                                  .writeText(
                                    s.password ?? s.parentPassword ?? "",
                                  )
                                  .catch(() => {});
                                toast.success("Password copied");
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => openEditStudent(s)}
                                data-ocid={`principal.edit_student_${s.id}`}
                              >
                                <Pencil size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => {
                                  onDeleteStudent(s.id);
                                  toast.success("Student deleted");
                                }}
                                data-ocid={`principal.delete_student_${s.id}`}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TEACHERS ──────────────────────────────────────────────────── */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Teacher Accounts</CardTitle>
              <Button
                size="sm"
                onClick={openAddTeacher}
                data-ocid="principal.add_teacher_btn"
              >
                <Plus size={14} className="mr-1.5" /> Add Teacher
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Teacher form */}
              {teacherForm && (
                <div className="mx-4 mb-4 p-4 border border-border rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">
                      {editingTeacherId ? "Edit Teacher" : "Add New Teacher"}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTeacherForm(null)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Full Name *</Label>
                      <Input
                        value={teacherForm.name}
                        placeholder="Teacher name"
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={teacherForm.email}
                        type="email"
                        placeholder="teacher@school.in"
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={teacherForm.phone}
                        placeholder="10-digit mobile"
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Assigned Class</Label>
                      <Select
                        value={teacherForm.assignedClass}
                        onValueChange={(v) =>
                          setTeacherForm({ ...teacherForm, assignedClass: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Subjects</Label>
                      <Select
                        value={teacherForm.subjects}
                        onValueChange={(v) =>
                          setTeacherForm({ ...teacherForm, subjects: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Login Password</Label>
                      <Input
                        value={teacherForm.password}
                        onChange={(e) =>
                          setTeacherForm({
                            ...teacherForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={saveTeacher}>
                    <Save size={13} className="mr-1.5" />
                    {editingTeacherId ? "Save Changes" : "Add Teacher"}
                  </Button>
                </div>
              )}

              {/* Teachers table */}
              <div className="overflow-x-auto">
                {teachers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <UserCheck size={32} className="mx-auto mb-2 opacity-30" />
                    No teachers yet. Click &quot;Add Teacher&quot; to get
                    started.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Class
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Subjects
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Phone
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Password
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium">{t.name}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="secondary" className="text-xs">
                              {t.assignedClass}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {t.subjects || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {t.phone || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <PasswordCell
                              pwd={t.password}
                              onCopy={() => {
                                navigator.clipboard
                                  .writeText(t.password)
                                  .catch(() => {});
                                toast.success("Copied");
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => resetTeacherPassword(t.id)}
                                title="Reset password"
                              >
                                <KeyRound size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => openEditTeacher(t)}
                              >
                                <Pencil size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => deleteTeacher(t.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DRIVERS ───────────────────────────────────────────────────── */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Driver Accounts</CardTitle>
              <Button
                size="sm"
                onClick={openAddDriver}
                data-ocid="principal.add_driver_btn"
              >
                <Plus size={14} className="mr-1.5" /> Add Driver
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Driver form */}
              {driverForm && (
                <div className="mx-4 mb-4 p-4 border border-border rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">
                      {editingDriverId ? "Edit Driver" : "Add New Driver"}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDriverForm(null)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Full Name *</Label>
                      <Input
                        value={driverForm.name}
                        placeholder="Driver name"
                        onChange={(e) =>
                          setDriverForm({ ...driverForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={driverForm.phone}
                        placeholder="10-digit mobile"
                        onChange={(e) =>
                          setDriverForm({
                            ...driverForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vehicle No.</Label>
                      <Input
                        value={driverForm.vehicleNo}
                        placeholder="RJ-XX-XX-XXXX"
                        onChange={(e) =>
                          setDriverForm({
                            ...driverForm,
                            vehicleNo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Route</Label>
                      <Select
                        value={driverForm.route}
                        onValueChange={(v) =>
                          setDriverForm({ ...driverForm, route: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">License No.</Label>
                      <Input
                        value={driverForm.licenseNo}
                        placeholder="License number"
                        onChange={(e) =>
                          setDriverForm({
                            ...driverForm,
                            licenseNo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Login Password</Label>
                      <Input
                        value={driverForm.password}
                        onChange={(e) =>
                          setDriverForm({
                            ...driverForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button size="sm" className="mt-4" onClick={saveDriver}>
                    <Save size={13} className="mr-1.5" />
                    {editingDriverId ? "Save Changes" : "Add Driver"}
                  </Button>
                </div>
              )}

              {/* Drivers table */}
              <div className="overflow-x-auto">
                {drivers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <Bus size={32} className="mx-auto mb-2 opacity-30" />
                    No drivers yet. Click &quot;Add Driver&quot; to get started.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Vehicle
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Route
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Phone
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Password
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium">{d.name}</td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {d.vehicleNo || "—"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {d.route}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {d.phone || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <PasswordCell
                              pwd={d.password}
                              onCopy={() => {
                                navigator.clipboard
                                  .writeText(d.password)
                                  .catch(() => {});
                                toast.success("Copied");
                              }}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => resetDriverPassword(d.id)}
                                title="Reset password"
                              >
                                <KeyRound size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => openEditDriver(d)}
                              >
                                <Pencil size={12} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => deleteDriver(d.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-export types for consumers
export type { Driver, Teacher };
export { generatePassword, generateUniquePasswords };
