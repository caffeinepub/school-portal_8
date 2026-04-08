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
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/data/mockData";
import { SCHOOLS } from "@/data/schools";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileBarChart,
  Send,
  Zap,
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AutomationPage() {
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS[0].id);
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth()),
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [lastReportRun, setLastReportRun] = useState<string | null>(null);
  const [lastAlertScan, setLastAlertScan] = useState<string | null>(null);
  const [lastFeeReminder, setLastFeeReminder] = useState<string | null>(null);
  const [bulkNoticeText, setBulkNoticeText] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [lowAttendanceList, setLowAttendanceList] = useState<Student[]>([]);
  const [unpaidFeeList, setUnpaidFeeList] = useState<Student[]>([]);
  const [showLowAttendance, setShowLowAttendance] = useState(false);
  const [showUnpaidFees, setShowUnpaidFees] = useState(false);

  useEffect(() => {
    setStudents(loadStorage(`lords_students_${selectedSchool}`, []));
  }, [selectedSchool]);

  const schoolName =
    SCHOOLS.find((s) => s.id === selectedSchool)?.shortName ?? "";

  const generateReport = () => {
    setReportGenerating(true);
    setTimeout(() => {
      const classes = Array.from(new Set(students.map((s) => s.class)));
      const rows: string[][] = [
        [
          "Class",
          "Students",
          "Avg Attendance %",
          "Avg Marks %",
          "Fees Collected",
          "Fees Pending",
        ],
      ];
      classes.forEach((cls, i) => {
        const clsStudents = students.filter((s) => s.class === cls);
        const avgAtt = 60 + (i % 30);
        const avgMarks = 55 + (i % 35);
        const feesCollected = clsStudents.length * 4500;
        const feesPending =
          clsStudents.filter((_, si) => si % 3 === 0).length * 4500;
        rows.push([
          cls,
          String(clsStudents.length),
          `${avgAtt}%`,
          `${avgMarks}%`,
          `₹${feesCollected}`,
          `₹${feesPending}`,
        ]);
      });
      if (rows.length <= 1) rows.push(["No data", "—", "—", "—", "—", "—"]);
      downloadCSV(
        rows,
        `Monthly_Report_${schoolName}_${MONTHS[Number(selectedMonth)]}_2026.csv`,
      );
      setLastReportRun(new Date().toLocaleTimeString());
      setReportGenerating(false);
      toast.success(
        `Monthly report for ${MONTHS[Number(selectedMonth)]} downloaded!`,
      );
    }, 1200);
  };

  const scanLowAttendance = () => {
    // Simulate: mark ~25% of students as below 75%
    const lowStudents = students.filter((_, i) => i % 4 === 0);
    setLowAttendanceList(lowStudents);
    setShowLowAttendance(true);
    setLastAlertScan(new Date().toLocaleTimeString());
    if (lowStudents.length > 0) {
      toast.warning(
        `Found ${lowStudents.length} students with attendance below 75%.`,
      );
    } else {
      toast.success("All students have attendance above 75%.");
    }
  };

  const scanUnpaidFees = () => {
    const unpaidStudents = students.filter((_, i) => i % 3 === 0);
    setUnpaidFeeList(unpaidStudents);
    setShowUnpaidFees(true);
    setLastFeeReminder(new Date().toLocaleTimeString());
    if (unpaidStudents.length > 0) {
      toast.warning(
        `Found ${unpaidStudents.length} students with pending fees.`,
      );
    } else {
      toast.success("No pending fee records found.");
    }
  };

  const sendBulkNotice = () => {
    if (!bulkNoticeText.trim()) {
      toast.error("Please enter a notice message.");
      return;
    }
    setBulkSending(true);
    setTimeout(() => {
      for (const school of SCHOOLS) {
        const existing = loadStorage<
          Array<{
            id: number;
            title: string;
            message: string;
            date: string;
            type: string;
          }>
        >(`lords_notifications_${school.id}`, []);
        const notice = {
          id: Date.now(),
          title: "Notice from Main Controller",
          message: bulkNoticeText.trim(),
          date: new Date().toLocaleDateString("en-IN"),
          type: "Announcement",
        };
        const updated = [notice, ...existing];
        saveStorage(`lords_notifications_${school.id}`, updated);
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: `lords_notifications_${school.id}`,
            newValue: JSON.stringify(updated),
          }),
        );
      }
      setBulkSending(false);
      setBulkNoticeText("");
      toast.success("Notice sent to all 5 schools successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6" data-ocid="mc.automation.section">
      {/* Monthly Report */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileBarChart size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Monthly Report Generator
          </CardTitle>
          <CardDescription className="text-xs">
            Generate class-wise summary reports: attendance %, avg marks, fee
            status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="auto-school" className="text-xs mb-1 block">
                School
              </Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger
                  id="auto-school"
                  data-ocid="mc.automation.school_select"
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
              <Label htmlFor="auto-month" className="text-xs mb-1 block">
                Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger
                  id="auto-month"
                  data-ocid="mc.automation.month_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateReport}
                disabled={reportGenerating}
                style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
                data-ocid="mc.automation.generate_report_button"
              >
                {reportGenerating ? (
                  <Zap size={14} className="mr-1.5 animate-pulse" />
                ) : (
                  <FileBarChart size={14} className="mr-1.5" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
          {lastReportRun && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock size={11} />
              Last run: {lastReportRun}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Low Attendance Alerts */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: "oklch(0.62 0.18 55)" }} />
            Low Attendance Alerts
          </CardTitle>
          <CardDescription className="text-xs">
            Scan all students below 75% attendance and view the list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={scanLowAttendance}
              data-ocid="mc.automation.scan_attendance_button"
            >
              <AlertTriangle
                size={13}
                className="mr-1.5"
                style={{ color: "oklch(0.62 0.18 55)" }}
              />
              Scan Now
            </Button>
            {lastAlertScan && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} />
                Last scan: {lastAlertScan}
              </p>
            )}
          </div>
          {showLowAttendance && (
            <div className="rounded-lg border border-border overflow-hidden">
              {lowAttendanceList.length === 0 ? (
                <div
                  className="flex items-center gap-2 p-3 text-sm"
                  style={{ color: "oklch(0.42 0.16 150)" }}
                >
                  <CheckCircle2 size={15} />
                  All students have adequate attendance.
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border/50">
                  {lowAttendanceList.slice(0, 20).map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2"
                      data-ocid={`mc.automation.low_att.${i + 1}`}
                    >
                      <Badge
                        variant="secondary"
                        className="text-xs shrink-0"
                        style={{
                          background: "oklch(0.62 0.18 55 / 0.1)",
                          color: "oklch(0.55 0.18 55)",
                        }}
                      >
                        {60 + (i % 14)}%
                      </Badge>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.class}
                      </span>
                    </div>
                  ))}
                  {lowAttendanceList.length > 20 && (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      ... and {lowAttendanceList.length - 20} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Reminders */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Fee Reminders
          </CardTitle>
          <CardDescription className="text-xs">
            List all students with unpaid fees (simulated from student records).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={scanUnpaidFees}
              data-ocid="mc.automation.scan_fees_button"
            >
              <Calendar size={13} className="mr-1.5" />
              Scan Unpaid Fees
            </Button>
            {lastFeeReminder && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} />
                Last scan: {lastFeeReminder}
              </p>
            )}
          </div>
          {showUnpaidFees && (
            <div className="rounded-lg border border-border overflow-hidden">
              {unpaidFeeList.length === 0 ? (
                <div
                  className="flex items-center gap-2 p-3 text-sm"
                  style={{ color: "oklch(0.42 0.16 150)" }}
                >
                  <CheckCircle2 size={15} />
                  No pending fee records found.
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border/50">
                  {unpaidFeeList.slice(0, 20).map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2"
                      data-ocid={`mc.automation.unpaid_fee.${i + 1}`}
                    >
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Pending
                      </Badge>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.class}
                      </span>
                      <span className="text-xs font-mono ml-auto text-muted-foreground">
                        ₹{(5000 + (i % 5) * 1000).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {unpaidFeeList.length > 20 && (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      ... and {unpaidFeeList.length - 20} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Notice Sender */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Bulk Announcement Broadcaster
          </CardTitle>
          <CardDescription className="text-xs">
            Send a notice to all 5 school portals simultaneously.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bulk-notice" className="text-xs mb-1 block">
              Notice Message
            </Label>
            <Textarea
              id="bulk-notice"
              value={bulkNoticeText}
              onChange={(e) => setBulkNoticeText(e.target.value)}
              placeholder="Type your notice here... (e.g. School closed tomorrow for annual day celebration)"
              className="text-sm min-h-[80px] resize-none"
              data-ocid="mc.automation.bulk_notice_textarea"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={sendBulkNotice}
              disabled={bulkSending || !bulkNoticeText.trim()}
              style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
              data-ocid="mc.automation.send_bulk_button"
            >
              {bulkSending ? (
                <Zap size={14} className="mr-1.5 animate-pulse" />
              ) : (
                <Send size={14} className="mr-1.5" />
              )}
              Send to All Schools
            </Button>
            <p className="text-xs text-muted-foreground">
              Broadcasts to all 5 portals instantly
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
