import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/data/mockData";
import { SCHOOLS } from "@/data/schools";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Pencil,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function generateStrongPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 7; i++)
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  return `Lords@${suffix}`;
}

function generateUniquePasswords(count: number): string[] {
  const used = new Set<string>();
  const result: string[] = [];
  while (result.length < count) {
    const pwd = generateStrongPassword();
    if (!used.has(pwd)) {
      used.add(pwd);
      result.push(pwd);
    }
  }
  return result;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ROLE_PERMISSIONS = [
  {
    role: "Principal",
    canManageStudents: true,
    canViewMarks: true,
    canViewSalaries: true,
    canSendNotices: true,
    canEditSystem: false,
    canViewTransport: true,
  },
  {
    role: "Teacher",
    canManageStudents: false,
    canViewMarks: true,
    canViewSalaries: false,
    canSendNotices: true,
    canEditSystem: false,
    canViewTransport: false,
  },
  {
    role: "Student",
    canManageStudents: false,
    canViewMarks: true,
    canViewSalaries: false,
    canSendNotices: false,
    canEditSystem: false,
    canViewTransport: true,
  },
  {
    role: "Driver",
    canManageStudents: false,
    canViewMarks: false,
    canViewSalaries: false,
    canSendNotices: false,
    canEditSystem: false,
    canViewTransport: true,
  },
  {
    role: "Main Controller",
    canManageStudents: true,
    canViewMarks: true,
    canViewSalaries: true,
    canSendNotices: true,
    canEditSystem: true,
    canViewTransport: true,
  },
];

const PERM_COLUMNS = [
  { key: "canManageStudents", label: "Manage Students" },
  { key: "canViewMarks", label: "View Marks" },
  { key: "canViewSalaries", label: "View Salaries" },
  { key: "canSendNotices", label: "Send Notices" },
  { key: "canEditSystem", label: "Edit System" },
  { key: "canViewTransport", label: "View Transport" },
] as const;

export default function AccessControlPage() {
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS[0].id);
  const [_filterRole] = useState("student");
  const [students, setStudents] = useState<Student[]>([]);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPwd, setEditPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [mcOldPwd, setMcOldPwd] = useState("");
  const [mcNewPwd, setMcNewPwd] = useState("");
  const [mcConfirmPwd, setMcConfirmPwd] = useState("");

  useEffect(() => {
    setStudents(loadStorage(`lords_students_${selectedSchool}`, []));
    setEditingId(null);
    setFilterClass("all");
  }, [selectedSchool]);

  const classes = Array.from(new Set(students.map((s) => s.class))).sort();
  const filtered =
    filterClass === "all"
      ? students
      : students.filter((s) => s.class === filterClass);

  const saveAndBroadcast = (updated: Student[]) => {
    saveStorage(`lords_students_${selectedSchool}`, updated);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `lords_students_${selectedSchool}`,
        newValue: JSON.stringify(updated),
      }),
    );
    setStudents(updated);
  };

  const handleGenerateAll = () => {
    if (students.length === 0) {
      toast.error("No students found.");
      return;
    }
    setGenerating(true);
    const passwords = generateUniquePasswords(students.length);
    const updated = students.map((s, i) => ({
      ...s,
      parentPassword: passwords[i],
    }));
    saveAndBroadcast(updated);
    const schoolName =
      SCHOOLS.find((s) => s.id === selectedSchool)?.shortName ?? selectedSchool;
    downloadCSV(
      [
        ["Student Name", "Class", "Roll No", "Password"],
        ...updated.map((s) => [
          s.name,
          s.class,
          String(s.rollNo ?? ""),
          s.parentPassword ?? "",
        ]),
      ],
      `Passwords_${schoolName}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    setGenerating(false);
    toast.success(
      `Passwords generated for ${updated.length} students! CSV downloaded.`,
    );
  };

  const handleSaveSinglePassword = (studentId: number) => {
    if (editPwd.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, parentPassword: editPwd.trim() } : s,
    );
    saveAndBroadcast(updated);
    setEditingId(null);
    setEditPwd("");
    toast.success(
      "Password updated and broadcast to student portal instantly.",
    );
  };

  const handleChangeMCPassword = () => {
    const storedPwd = loadStorage("lords_mc_password", "Admin@Lords2026");
    if (mcOldPwd !== storedPwd) {
      toast.error("Current password is incorrect");
      return;
    }
    if (mcNewPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (mcNewPwd !== mcConfirmPwd) {
      toast.error("Passwords do not match");
      return;
    }
    saveStorage("lords_mc_password", mcNewPwd);
    setMcOldPwd("");
    setMcNewPwd("");
    setMcConfirmPwd("");
    toast.success("Main Controller password updated successfully.");
  };

  return (
    <div className="space-y-6" data-ocid="mc.access_control.section">
      {/* RBAC Overview */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Role-Based Access Control (RBAC)
          </CardTitle>
          <CardDescription className="text-xs">
            What each role can see and do across all portals.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                    Role
                  </th>
                  {PERM_COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className="text-center px-3 py-2.5 font-semibold text-muted-foreground whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLE_PERMISSIONS.map((row) => (
                  <tr
                    key={row.role}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-semibold text-foreground">
                      {row.role}
                    </td>
                    {PERM_COLUMNS.map((c) => (
                      <td key={c.key} className="px-3 py-2.5 text-center">
                        {row[c.key] ? (
                          <Check
                            size={13}
                            className="mx-auto"
                            style={{ color: "oklch(0.42 0.16 150)" }}
                          />
                        ) : (
                          <X
                            size={13}
                            className="mx-auto text-muted-foreground/40"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Password Management */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Student Portal Password Management
          </CardTitle>
          <CardDescription className="text-xs">
            Set and reset student login passwords. Changes broadcast instantly
            to all devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block" htmlFor="ac-school-select">
                School
              </Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger
                  id="ac-school-select"
                  data-ocid="mc.access.school_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block" htmlFor="ac-class-select">
                Filter by Class
              </Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger
                  id="ac-class-select"
                  data-ocid="mc.access.class_select"
                >
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateAll}
                disabled={generating || students.length === 0}
                style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
                data-ocid="mc.access.generate_all_button"
              >
                {generating ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                ) : (
                  <Key size={14} className="mr-1.5" />
                )}
                Generate All
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {students.length} students ·{" "}
            {students.filter((s) => s.parentPassword).length} have passwords
          </p>

          {filtered.length === 0 ? (
            <div
              className="py-10 text-center text-muted-foreground text-sm"
              data-ocid="mc.access.empty_state"
            >
              <Key size={32} className="mx-auto mb-2 opacity-30" />
              <p>No students found for this school.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((s, idx) => (
                <div
                  key={s.id}
                  data-ocid={`mc.access.password_row.${idx + 1}`}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.class} · Roll: {String(s.rollNo ?? "—")}
                    </p>
                  </div>
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          data-ocid={`mc.access.edit_input.${idx + 1}`}
                          type={showPwd ? "text" : "password"}
                          value={editPwd}
                          onChange={(e) => setEditPwd(e.target.value)}
                          placeholder="New password (min 6)"
                          className="h-7 text-xs w-44 pr-8"
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleSaveSinglePassword(s.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditPwd("");
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPwd ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        style={{
                          background: "oklch(0.48 0.14 280)",
                          color: "white",
                        }}
                        onClick={() => handleSaveSinglePassword(s.id)}
                        data-ocid={`mc.access.save_pwd.${idx + 1}`}
                      >
                        Save
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditPwd("");
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs px-2 py-1 rounded border max-w-[130px] truncate"
                        style={{
                          background: "oklch(0.97 0.01 260)",
                          borderColor: "oklch(0.88 0.018 260)",
                        }}
                        title={s.parentPassword || "(not set)"}
                      >
                        {s.parentPassword || "(not set)"}
                      </span>
                      <button
                        type="button"
                        data-ocid={`mc.access.edit_pwd_button.${idx + 1}`}
                        onClick={() => {
                          setEditingId(s.id);
                          setEditPwd(s.parentPassword ?? "");
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      {s.parentPassword && (
                        <button
                          type="button"
                          data-ocid={`mc.access.copy_pwd.${idx + 1}`}
                          onClick={() =>
                            navigator.clipboard
                              .writeText(s.parentPassword ?? "")
                              .then(() => toast.success("Copied!"))
                              .catch(() => {})
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change MC Password */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Change Main Controller Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
            <div>
              <Label htmlFor="mc-old-pwd" className="text-xs mb-1 block">
                Current Password
              </Label>
              <Input
                id="mc-old-pwd"
                type="password"
                value={mcOldPwd}
                onChange={(e) => setMcOldPwd(e.target.value)}
                placeholder="Current password"
                className="h-9 text-sm"
                data-ocid="mc.access.old_pwd_input"
              />
            </div>
            <div>
              <Label htmlFor="mc-new-pwd" className="text-xs mb-1 block">
                New Password
              </Label>
              <Input
                id="mc-new-pwd"
                type="password"
                value={mcNewPwd}
                onChange={(e) => setMcNewPwd(e.target.value)}
                placeholder="New password"
                className="h-9 text-sm"
                data-ocid="mc.access.new_pwd_input"
              />
            </div>
            <div>
              <Label htmlFor="mc-confirm-pwd" className="text-xs mb-1 block">
                Confirm Password
              </Label>
              <Input
                id="mc-confirm-pwd"
                type="password"
                value={mcConfirmPwd}
                onChange={(e) => setMcConfirmPwd(e.target.value)}
                placeholder="Confirm password"
                className="h-9 text-sm"
                data-ocid="mc.access.confirm_pwd_input"
              />
            </div>
          </div>
          <Button
            className="mt-3"
            onClick={handleChangeMCPassword}
            disabled={!mcOldPwd || !mcNewPwd || !mcConfirmPwd}
            style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
            data-ocid="mc.access.change_mc_pwd_button"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
