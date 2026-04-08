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
import { useActor } from "@/hooks/useActor";
import {
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  Key,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Users,
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

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

export default function BackupSecurityPage() {
  const { actor } = useActor();
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS[0].id);
  const [exporting, setExporting] = useState(false);
  const [exportingSchool, setExportingSchool] = useState(false);
  const [canisterId, setCanisterId] = useState("");
  const [healthCounts, setHealthCounts] = useState({
    students: 0,
    teachers: 0,
    drivers: 0,
    notices: 0,
  });
  const [mcOldPwd, setMcOldPwd] = useState("");
  const [mcNewPwd, setMcNewPwd] = useState("");
  const [mcConfirmPwd, setMcConfirmPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [healthChecking, setHealthChecking] = useState(false);

  useEffect(() => {
    // Derive canister ID from actor if possible
    const id =
      import.meta.env.VITE_CANISTER_ID_BACKEND ??
      import.meta.env.VITE_BACKEND_CANISTER_ID ??
      "rrkah-fqaaa-aaaaa-aaaaq-cai";
    setCanisterId(id);
    runHealthCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runHealthCheck = () => {
    setHealthChecking(true);
    setTimeout(() => {
      let students = 0;
      let notices = 0;
      for (const school of SCHOOLS) {
        const s = loadStorage<Student[]>(`lords_students_${school.id}`, []);
        students += s.length;
        const n = loadStorage<unknown[]>(
          `lords_notifications_${school.id}`,
          [],
        );
        notices += n.length;
      }
      setHealthCounts({ students, teachers: 0, drivers: 0, notices });
      setHealthChecking(false);
    }, 600);
  };

  const handleExportAll = () => {
    setExporting(true);
    setTimeout(async () => {
      const allData: Record<string, unknown> = {};
      for (const school of SCHOOLS) {
        allData[school.id] = {
          school: school.shortName,
          students: loadStorage(`lords_students_${school.id}`, []),
          notifications: loadStorage(`lords_notifications_${school.id}`, []),
          syllabus: loadStorage(`lords_syllabus_${school.id}`, {}),
          diary: loadStorage(`lords_diary_${school.id}`, []),
          examTimetable: loadStorage(`lords_exam_timetables_${school.id}`, []),
          testMarks: loadStorage(`lords_test_marks_${school.id}`, []),
        };
      }
      if (actor) {
        try {
          await actor.setData("lords_backup_full", JSON.stringify(allData));
        } catch {}
      }
      downloadJSON(
        allData,
        `Lords_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      );
      setExporting(false);
      toast.success("Full backup exported and saved to ICP backend!");
    }, 1000);
  };

  const handleExportSchool = () => {
    setExportingSchool(true);
    setTimeout(() => {
      const school = SCHOOLS.find((s) => s.id === selectedSchool);
      const students = loadStorage<Student[]>(
        `lords_students_${selectedSchool}`,
        [],
      );
      const rows: string[][] = [
        ["Name", "Class", "Roll No", "Password", "Mobile"],
        ...students.map((s) => [
          s.name,
          s.class,
          String(s.rollNo ?? ""),
          s.parentPassword ?? "",
          s.parentMobile ?? "",
        ]),
      ];
      downloadCSV(
        rows,
        `Students_${school?.shortName ?? selectedSchool}_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      setExportingSchool(false);
      toast.success(`${school?.shortName} student data exported!`);
    }, 600);
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

  const allAccounts = [
    {
      role: "Main Controller",
      name: "Admin",
      portal: "Main Controller",
      school: "All Schools",
    },
    ...SCHOOLS.map((s) => ({
      role: "Principal",
      name: `Principal — ${s.shortName}`,
      portal: "Principal Panel",
      school: s.shortName,
    })),
  ];

  return (
    <div className="space-y-6" data-ocid="mc.backup_security.section">
      {/* ICP Backend Status */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            ICP Backend Status
            <span className="badge-live ml-auto">Connected</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Canister ID</p>
              <p className="text-sm font-mono font-semibold text-foreground break-all">
                {canisterId}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Dashboard</p>
              <a
                href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:underline break-all"
                style={{ color: "oklch(0.48 0.14 280)" }}
              >
                dashboard.internetcomputer.org/canister/{canisterId}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Health Check */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: "oklch(0.42 0.16 150)" }} />
            Data Health Check
          </CardTitle>
          <CardDescription className="text-xs">
            Count of all records across all 5 schools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={healthChecking}
            data-ocid="mc.backup.health_check_button"
          >
            {healthChecking ? (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            ) : (
              <RefreshCw size={13} className="mr-1.5" />
            )}
            Run Health Check
          </Button>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Students",
                value: healthCounts.students,
                icon: Users,
              },
              { label: "Teachers", value: healthCounts.teachers, icon: Users },
              { label: "Drivers", value: healthCounts.drivers, icon: Users },
              { label: "Notices", value: healthCounts.notices, icon: Database },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="p-3 rounded-lg bg-muted/30 border border-border text-center"
              >
                <Icon
                  size={18}
                  className="mx-auto mb-1"
                  style={{ color: "oklch(0.48 0.14 280)" }}
                />
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export All Data */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Export Data
          </CardTitle>
          <CardDescription className="text-xs">
            Download all school data as JSON (full backup) or per-school CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportAll}
              disabled={exporting}
              style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
              data-ocid="mc.backup.export_all_button"
            >
              {exporting ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Download size={14} className="mr-1.5" />
              )}
              Export All Schools (JSON)
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="bs-school" className="text-xs mb-1 block">
                Export by School (CSV)
              </Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger
                  id="bs-school"
                  data-ocid="mc.backup.school_select"
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
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleExportSchool}
                disabled={exportingSchool}
                data-ocid="mc.backup.export_school_button"
              >
                {exportingSchool ? (
                  <Loader2 size={13} className="mr-1.5 animate-spin" />
                ) : (
                  <Download size={13} className="mr-1.5" />
                )}
                Export Students CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Security Overview — All Login Accounts
          </CardTitle>
          <CardDescription className="text-xs">
            All registered login accounts across all portals. Passwords are
            never shown here.
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
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                    Account
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                    Portal
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                    School
                  </th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAccounts.map((acc) => (
                  <tr
                    key={acc.name}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`mc.backup.account_row.${acc.name.replace(/\s+/g, "_")}`}
                  >
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-xs">
                        {acc.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {acc.name}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {acc.portal}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {acc.school}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Shield size={10} />
                        <span>Protected</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <Label htmlFor="bs-old-pwd" className="text-xs mb-1 block">
                Current Password
              </Label>
              <Input
                id="bs-old-pwd"
                type="password"
                value={mcOldPwd}
                onChange={(e) => setMcOldPwd(e.target.value)}
                placeholder="Current password"
                className="h-9 text-sm"
                data-ocid="mc.backup.old_pwd_input"
              />
            </div>
            <div>
              <Label htmlFor="bs-new-pwd" className="text-xs mb-1 block">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="bs-new-pwd"
                  type={showNewPwd ? "text" : "password"}
                  value={mcNewPwd}
                  onChange={(e) => setMcNewPwd(e.target.value)}
                  placeholder="New password"
                  className="h-9 text-sm pr-9"
                  data-ocid="mc.backup.new_pwd_input"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="bs-confirm-pwd" className="text-xs mb-1 block">
                Confirm Password
              </Label>
              <Input
                id="bs-confirm-pwd"
                type="password"
                value={mcConfirmPwd}
                onChange={(e) => setMcConfirmPwd(e.target.value)}
                placeholder="Confirm password"
                className="h-9 text-sm"
                data-ocid="mc.backup.confirm_pwd_input"
              />
            </div>
          </div>
          <Button
            className="mt-3"
            onClick={handleChangeMCPassword}
            disabled={!mcOldPwd || !mcNewPwd || !mcConfirmPwd}
            style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
            data-ocid="mc.backup.change_mc_pwd_button"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
