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
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../../data/mockData";

const FEE_TYPES = [
  "Tuition Fee",
  "Admission Fee",
  "Sports Fee",
  "Library Fee",
  "Transport Fee",
  "Exam Fee",
  "Lab Fee",
  "Annual Charges",
];
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

interface FeeRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentClass: string;
  feeType: string;
  amount: number;
  paid: number;
  month: string;
  year: string;
  status: "paid" | "unpaid" | "partial";
  dueDate: string;
  paidDate: string;
  notes: string;
}

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

function computeStatus(paid: number, amount: number): FeeRecord["status"] {
  if (paid <= 0) return "unpaid";
  if (paid >= amount) return "paid";
  return "partial";
}

const StatusBadge = ({ status }: { status: FeeRecord["status"] }) => {
  const map = {
    paid: {
      label: "Paid",
      icon: CheckCircle2,
      cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    unpaid: {
      label: "Unpaid",
      icon: AlertCircle,
      cls: "text-red-700 bg-red-50 border-red-200",
    },
    partial: {
      label: "Partial",
      icon: Clock,
      cls: "text-amber-700 bg-amber-50 border-amber-200",
    },
  };
  const { label, icon: Icon, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      <Icon size={10} /> {label}
    </span>
  );
};

interface Props {
  principalId: string;
  students: Student[];
}

export default function FinancialDashboard({ principalId, students }: Props) {
  const [records, setRecords] = useState<FeeRecord[]>(() =>
    loadLS<FeeRecord[]>(`lords_fees_${principalId}`, []),
  );
  const [showForm, setShowForm] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = String(new Date().getFullYear());

  const [form, setForm] = useState<Omit<FeeRecord, "id" | "status">>({
    studentId: 0,
    studentName: "",
    studentClass: "",
    feeType: "Tuition Fee",
    amount: 0,
    paid: 0,
    month: currentMonth,
    year: currentYear,
    dueDate: today,
    paidDate: "",
    notes: "",
  });

  const persistRecords = (list: FeeRecord[]) => {
    setRecords(list);
    saveLS(`lords_fees_${principalId}`, list);
  };

  const classes = useMemo(() => {
    const s = new Set(students.map((st) => st.class));
    return Array.from(s).sort();
  }, [students]);

  const stats = useMemo(() => {
    const total = records.reduce((acc, r) => acc + r.paid, 0);
    const pending = records.reduce((acc, r) => acc + (r.amount - r.paid), 0);
    const outstanding = records.filter((r) => r.status !== "paid").length;
    return { total, pending, outstanding };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchClass =
        filterClass === "all" || r.studentClass === filterClass;
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchClass && matchStatus;
    });
  }, [records, filterClass, filterStatus]);

  const handleAddRecord = () => {
    if (!form.studentName.trim()) {
      toast.error("Select or enter student name");
      return;
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    const status = computeStatus(form.paid, form.amount);
    const rec: FeeRecord = { ...form, id: Date.now(), status };
    persistRecords([rec, ...records]);
    setShowForm(false);
    toast.success("Fee record added");
  };

  const markAsPaid = (id: number) => {
    persistRecords(
      records.map((r) => {
        if (r.id !== id) return r;
        return { ...r, paid: r.amount, status: "paid", paidDate: today };
      }),
    );
    toast.success("Marked as paid");
  };

  const deleteRecord = (id: number) => {
    persistRecords(records.filter((r) => r.id !== id));
    toast.success("Record deleted");
  };

  const exportCSV = () => {
    const rows = [
      [
        "Student",
        "Class",
        "Fee Type",
        "Amount",
        "Paid",
        "Balance",
        "Month",
        "Status",
        "Due Date",
        "Paid Date",
      ],
      ...filtered.map((r) => [
        r.studentName,
        r.studentClass,
        r.feeType,
        String(r.amount),
        String(r.paid),
        String(r.amount - r.paid),
        r.month,
        r.status,
        r.dueDate,
        r.paidDate || "—",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee_report_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-5" data-ocid="principal.financial_dashboard">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {fmt(stats.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All collected fees
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Pending Fees
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {fmt(stats.pending)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Outstanding amount
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50">
                <Clock size={18} className="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Outstanding Records
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.outstanding}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unpaid / partial
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50">
                <AlertCircle size={18} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee size={16} /> Fee Records
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={exportCSV}
              data-ocid="principal.export_fees_btn"
            >
              <Download size={13} className="mr-1.5" /> Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => setShowForm((v) => !v)}
              data-ocid="principal.add_fee_btn"
            >
              <Plus size={14} className="mr-1.5" /> Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Add form */}
          {showForm && (
            <div className="mx-4 mb-4 p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">New Fee Record</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  <X size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Student Name *</Label>
                  {students.length > 0 ? (
                    <Select
                      onValueChange={(v) => {
                        const s = students.find((st) => String(st.id) === v);
                        if (s)
                          setForm({
                            ...form,
                            studentId: s.id,
                            studentName: s.name,
                            studentClass: s.class,
                          });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} — {s.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.studentName}
                      placeholder="Student name"
                      onChange={(e) =>
                        setForm({ ...form, studentName: e.target.value })
                      }
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs">Fee Type</Label>
                  <Select
                    value={form.feeType}
                    onValueChange={(v) => setForm({ ...form, feeType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Month</Label>
                  <Select
                    value={form.month}
                    onValueChange={(v) => setForm({ ...form, month: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Total Amount (₹)</Label>
                  <Input
                    type="number"
                    value={form.amount || ""}
                    onChange={(e) =>
                      setForm({ ...form, amount: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    value={form.paid || ""}
                    onChange={(e) =>
                      setForm({ ...form, paid: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="mt-4"
                onClick={handleAddRecord}
                data-ocid="principal.save_fee_btn"
              >
                Save Fee Record
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 px-4 py-3 border-b border-border bg-muted/20">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-36 h-8 text-xs">
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <IndianRupee size={32} className="mx-auto mb-2 opacity-30" />
                No fee records found. Click &quot;Add Record&quot; to get
                started.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Student
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Class
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Fee Type
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Amount
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Paid
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Balance
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {r.studentName}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="text-xs">
                          {r.studentClass}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {r.feeType}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {fmt(r.amount)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-700">
                        {fmt(r.paid)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-red-600">
                        {fmt(r.amount - r.paid)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => markAsPaid(r.id)}
                              data-ocid={`principal.mark_paid_${r.id}`}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => deleteRecord(r.id)}
                          >
                            <X size={12} />
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
    </div>
  );
}
