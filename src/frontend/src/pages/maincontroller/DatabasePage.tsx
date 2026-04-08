import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import { SCHOOLS } from "@/data/schools";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MapPin,
  RefreshCw,
  Wifi,
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

interface FeeRecord {
  id: number;
  studentName: string;
  class: string;
  amount: number;
  paid: boolean;
  dueDate: string;
}

interface AttendanceRecord {
  id: number;
  studentName: string;
  class: string;
  present: number;
  total: number;
}

interface MarksRecord {
  id: number;
  studentName: string;
  class: string;
  subject: string;
  marks: number;
  maxMarks: number;
}

interface BusLocation {
  driverName: string;
  vehicleNo: string;
  lat: number;
  lng: number;
  lastUpdate: string;
}

interface EmergencyAlert {
  id: string;
  school: string;
  driverName: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Generate mock fee/attendance/marks data from student list
function buildFeeData(students: Student[]): FeeRecord[] {
  return students.map((s, i) => {
    const totalFees = s.fees.reduce((sum, f) => sum + f.amount, 0);
    const paidFees = s.fees.reduce((sum, f) => sum + f.paid, 0);
    return {
      id: s.id,
      studentName: s.name,
      class: s.class,
      amount: totalFees || 5000 + (i % 5) * 1000,
      paid: totalFees > 0 ? paidFees >= totalFees : i % 3 !== 0,
      dueDate: `2026-0${(i % 3) + 1}-15`,
    };
  });
}

function buildAttendanceData(students: Student[]): AttendanceRecord[] {
  return students.map((s, i) => ({
    id: s.id,
    studentName: s.name,
    class: s.class,
    present: 60 + (i % 25),
    total: 90,
  }));
}

function buildMarksData(students: Student[]): MarksRecord[] {
  const subjects = ["Math", "Science", "English", "Hindi", "Social"];
  const result: MarksRecord[] = [];
  students.slice(0, 30).forEach((s, si) => {
    subjects.slice(0, 2).forEach((sub, subIdx) => {
      result.push({
        id: s.id * 100 + subIdx,
        studentName: s.name,
        class: s.class,
        subject: sub,
        marks: 50 + ((si + subIdx) % 45),
        maxMarks: 100,
      });
    });
  });
  return result;
}

export default function DatabasePage() {
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS[0].id);
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab] = useState("students");
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [busLocations] = useState<BusLocation[]>([
    {
      driverName: "Ramesh Kumar",
      vehicleNo: "RJ-15-A-1234",
      lat: 28.0229,
      lng: 73.3119,
      lastUpdate: "2 min ago",
    },
    {
      driverName: "Suresh Yadav",
      vehicleNo: "RJ-15-B-5678",
      lat: 28.0315,
      lng: 73.3205,
      lastUpdate: "5 min ago",
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setStudents(loadStorage(`lords_students_${selectedSchool}`, []));
  }, [selectedSchool]);

  useEffect(() => {
    // Load mock emergency alerts
    setAlerts(
      loadStorage("lords_emergency_alerts", [
        {
          id: "a1",
          school: "Lords Churu",
          driverName: "Ramesh Kumar",
          message: "Bus breakdown on NH58 near Churu bypass.",
          timestamp: "Today 08:45 AM",
          resolved: false,
        },
      ] as EmergencyAlert[]),
    );
    const interval = setInterval(() => {
      setStudents(loadStorage(`lords_students_${selectedSchool}`, []));
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedSchool]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStudents(loadStorage(`lords_students_${selectedSchool}`, []));
      setRefreshing(false);
      toast.success("Data refreshed");
    }, 800);
  };

  const resolveAlert = (id: string) => {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, resolved: true } : a,
    );
    setAlerts(updated);
    localStorage.setItem("lords_emergency_alerts", JSON.stringify(updated));
    toast.success("Alert resolved");
  };

  const feeData = buildFeeData(students);
  const attendanceData = buildAttendanceData(students);
  const marksData = buildMarksData(students);

  const schoolName =
    SCHOOLS.find((s) => s.id === selectedSchool)?.shortName ?? "";

  return (
    <div className="space-y-4" data-ocid="mc.database.section">
      {/* School selector + refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 max-w-xs">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger data-ocid="mc.database.school_select">
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
        <div className="flex gap-2 items-center">
          <Badge variant="secondary">{students.length} students</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-ocid="mc.database.refresh_button"
          >
            <RefreshCw
              size={13}
              className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Emergency Alerts */}
      {alerts.some((a) => !a.resolved) && (
        <Card
          className="border-2"
          style={{ borderColor: "oklch(0.55 0.22 25 / 0.4)" }}
        >
          <CardHeader className="py-3 px-4">
            <CardTitle
              className="text-sm flex items-center gap-2"
              style={{ color: "oklch(0.55 0.22 25)" }}
            >
              <AlertTriangle size={15} />
              Active Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {alerts
              .filter((a) => !a.resolved)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: "oklch(0.55 0.22 25 / 0.06)" }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.school} · {alert.driverName} · {alert.timestamp}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                    className="shrink-0 h-7 text-xs"
                    data-ocid={`mc.database.resolve_alert.${alert.id}`}
                  >
                    <CheckCircle2 size={12} className="mr-1" />
                    Resolve
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Live Bus Locations */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wifi size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Live Bus Locations
            <span className="badge-live ml-auto">Live</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {busLocations.map((bus) => (
              <div
                key={bus.vehicleNo}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.62 0.18 55 / 0.15)" }}
                >
                  <MapPin size={14} style={{ color: "oklch(0.55 0.18 55)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {bus.driverName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bus.vehicleNo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bus.lat.toFixed(4)}, {bus.lng.toFixed(4)} ·{" "}
                    {bus.lastUpdate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {["students", "fees", "attendance", "marks"].map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="capitalize text-xs"
              data-ocid={`mc.database.tab.${t}`}
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Students — {schoolName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  downloadCSV(
                    [
                      [
                        "Name",
                        "Class",
                        "Roll No",
                        "Section",
                        "Parent Password",
                      ],
                      ...students.map((s) => [
                        s.name,
                        s.class,
                        String(s.rollNo ?? ""),
                        "",
                        s.parentPassword ?? "",
                      ]),
                    ],
                    `Students_${schoolName}_${new Date().toISOString().slice(0, 10)}.csv`,
                  )
                }
                data-ocid="mc.database.download_students"
              >
                <Download size={12} className="mr-1" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {students.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No students in this school yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          #
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Class
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Roll No
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Password
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr
                          key={s.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          data-ocid={`mc.database.student_row.${i + 1}`}
                        >
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {s.name}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {s.class}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {s.rollNo ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">
                            {s.parentPassword || "(not set)"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                Fee Records — {schoolName}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  downloadCSV(
                    [
                      ["Name", "Class", "Amount", "Status", "Due Date"],
                      ...feeData.map((r) => [
                        r.studentName,
                        r.class,
                        String(r.amount),
                        r.paid ? "Paid" : "Pending",
                        r.dueDate,
                      ]),
                    ],
                    `Fees_${schoolName}_${new Date().toISOString().slice(0, 10)}.csv`,
                  )
                }
                data-ocid="mc.database.download_fees"
              >
                <Download size={12} className="mr-1" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {feeData.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No fee data available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Class
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeData.slice(0, 50).map((r, i) => (
                        <tr
                          key={r.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium">
                            {r.studentName}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {r.class}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            ₹{r.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant={r.paid ? "secondary" : "destructive"}
                              className="text-xs"
                              style={
                                r.paid
                                  ? {
                                      background: "oklch(0.42 0.16 150 / 0.12)",
                                      color: "oklch(0.42 0.16 150)",
                                    }
                                  : {}
                              }
                              data-ocid={`mc.database.fee_status.${i + 1}`}
                            >
                              {r.paid ? "Paid" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                Attendance — {schoolName}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  downloadCSV(
                    [
                      ["Name", "Class", "Present", "Total", "%"],
                      ...attendanceData.map((r) => [
                        r.studentName,
                        r.class,
                        String(r.present),
                        String(r.total),
                        `${Math.round((r.present / r.total) * 100)}%`,
                      ]),
                    ],
                    `Attendance_${schoolName}_${new Date().toISOString().slice(0, 10)}.csv`,
                  )
                }
                data-ocid="mc.database.download_attendance"
              >
                <Download size={12} className="mr-1" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {attendanceData.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No attendance data available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Class
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">
                          Present
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">
                          %
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((r, i) => {
                        const pct = Math.round((r.present / r.total) * 100);
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                            data-ocid={`mc.database.attendance_row.${i + 1}`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {r.studentName}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {r.class}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              {r.present}/{r.total}
                            </td>
                            <td
                              className="px-4 py-2.5 text-right font-mono font-semibold"
                              style={{
                                color:
                                  pct < 75
                                    ? "oklch(0.55 0.22 25)"
                                    : "oklch(0.42 0.16 150)",
                              }}
                            >
                              {pct}%
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={
                                  pct < 75
                                    ? {
                                        background: "oklch(0.55 0.22 25 / 0.1)",
                                        color: "oklch(0.55 0.22 25)",
                                      }
                                    : {
                                        background:
                                          "oklch(0.42 0.16 150 / 0.1)",
                                        color: "oklch(0.42 0.16 150)",
                                      }
                                }
                              >
                                {pct < 75 ? "Low" : "Good"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks">
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Marks — {schoolName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  downloadCSV(
                    [
                      ["Name", "Class", "Subject", "Marks", "Max", "%"],
                      ...marksData.map((r) => [
                        r.studentName,
                        r.class,
                        r.subject,
                        String(r.marks),
                        String(r.maxMarks),
                        `${Math.round((r.marks / r.maxMarks) * 100)}%`,
                      ]),
                    ],
                    `Marks_${schoolName}_${new Date().toISOString().slice(0, 10)}.csv`,
                  )
                }
                data-ocid="mc.database.download_marks"
              >
                <Download size={12} className="mr-1" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {marksData.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No marks data available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Class
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                          Subject
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">
                          Marks
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksData.map((r, i) => {
                        const pct = Math.round((r.marks / r.maxMarks) * 100);
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                            data-ocid={`mc.database.marks_row.${i + 1}`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {r.studentName}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {r.class}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {r.subject}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              {r.marks}/{r.maxMarks}
                            </td>
                            <td
                              className="px-4 py-2.5 text-right font-semibold font-mono"
                              style={{
                                color:
                                  pct < 40
                                    ? "oklch(0.55 0.22 25)"
                                    : pct >= 75
                                      ? "oklch(0.42 0.16 150)"
                                      : "oklch(0.55 0.18 80)",
                              }}
                            >
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
