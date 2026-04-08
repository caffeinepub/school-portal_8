import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Student, StudentFee } from "@/data/mockData";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Receipt,
} from "lucide-react";

interface Props {
  student: Student;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    Paid: {
      bg: "oklch(0.95 0.06 150)",
      text: "oklch(0.32 0.14 150)",
      dot: "oklch(0.55 0.18 150)",
    },
    Pending: {
      bg: "oklch(0.97 0.06 80)",
      text: "oklch(0.45 0.14 80)",
      dot: "oklch(0.68 0.18 80)",
    },
    Partial: {
      bg: "oklch(0.97 0.06 70)",
      text: "oklch(0.44 0.15 70)",
      dot: "oklch(0.66 0.18 70)",
    },
    Overdue: {
      bg: "oklch(0.96 0.06 25)",
      text: "oklch(0.42 0.18 25)",
      dot: "oklch(0.60 0.22 25)",
    },
  };

function downloadReceipt(fee: StudentFee, studentName: string) {
  const lines = [
    "RECEIPT — Lord's International School Group",
    "=".repeat(44),
    `Student: ${studentName}`,
    `Fee Type: ${fee.type}`,
    `Amount: ₹${fee.amount.toLocaleString()}`,
    `Paid: ₹${fee.paid.toLocaleString()}`,
    `Due Date: ${fee.dueDate}`,
    `Paid Date: ${fee.paidDate || "—"}`,
    `Status: ${fee.status}`,
    "=".repeat(44),
    `Generated: ${new Date().toLocaleString("en-IN")}`,
  ];
  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt_${fee.type.replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FeeStatusPage({ student }: Props) {
  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = student.fees.reduce((s, f) => s + f.paid, 0);
  const outstanding = totalFees - paidFees;
  const overdueCount = student.fees.filter(
    (f) => f.status === "Overdue",
  ).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">Fee Status</h2>
        <p className="text-sm text-muted-foreground">
          Fee records for {student.name} · Class {student.class}
        </p>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="fees.summary_grid"
      >
        {[
          {
            label: "Total Fees",
            value: `₹${totalFees.toLocaleString()}`,
            icon: <CreditCard size={18} />,
            color: "oklch(0.35 0.12 265)",
            bg: "oklch(0.25 0.10 265 / 0.08)",
          },
          {
            label: "Paid",
            value: `₹${paidFees.toLocaleString()}`,
            icon: <CheckCircle2 size={18} />,
            color: "oklch(0.38 0.14 150)",
            bg: "oklch(0.55 0.15 150 / 0.10)",
          },
          {
            label: "Outstanding",
            value: `₹${outstanding.toLocaleString()}`,
            icon: <Receipt size={18} />,
            color:
              outstanding > 0 ? "oklch(0.45 0.14 80)" : "oklch(0.38 0.14 150)",
            bg:
              outstanding > 0
                ? "oklch(0.68 0.18 80 / 0.12)"
                : "oklch(0.55 0.15 150 / 0.10)",
          },
          {
            label: "Overdue",
            value: String(overdueCount),
            icon: <AlertCircle size={18} />,
            color:
              overdueCount > 0 ? "oklch(0.42 0.18 25)" : "oklch(0.38 0.14 150)",
            bg:
              overdueCount > 0
                ? "oklch(0.60 0.22 25 / 0.10)"
                : "oklch(0.55 0.15 150 / 0.10)",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <Card
            key={label}
            className="border shadow-xs"
            style={{ borderColor: "oklch(0.88 0.018 260)" }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment progress */}
      {totalFees > 0 && (
        <div
          className="rounded-xl border px-4 py-4"
          style={{
            borderColor: "oklch(0.88 0.018 260)",
            background: "oklch(1 0 0)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Payment Progress
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.38 0.14 150)" }}
            >
              {Math.round((paidFees / totalFees) * 100)}%
            </span>
          </div>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ background: "oklch(0.88 0.018 260)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round((paidFees / totalFees) * 100)}%`,
                background:
                  paidFees === totalFees
                    ? "oklch(0.55 0.15 150)"
                    : "oklch(0.55 0.15 130)",
              }}
            />
          </div>
        </div>
      )}

      {/* Fee records */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Fee Records
        </h3>
        {student.fees.length === 0 ? (
          <div
            className="rounded-xl border py-16 text-center"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(0.985 0.003 260)",
            }}
            data-ocid="fees.empty_state"
          >
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">
              No fee records available.
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="fees.records_list">
            {student.fees.map((f) => {
              const s = STATUS_STYLES[f.status] ?? STATUS_STYLES.Pending;
              return (
                <div
                  key={f.id}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "oklch(0.88 0.018 260)",
                    background: "oklch(1 0 0)",
                  }}
                  data-ocid="fees.record_item"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {f.type}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Due: {f.dueDate}
                        </p>
                        {f.paidDate && (
                          <p className="text-xs text-muted-foreground">
                            Paid: {f.paidDate}
                          </p>
                        )}
                      </div>
                      {f.paid < f.amount && f.paid > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{f.paid.toLocaleString()} paid of ₹
                          {f.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          ₹{f.amount.toLocaleString()}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: s.bg, color: s.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: s.dot }}
                          />
                          {f.status}
                        </span>
                      </div>
                      {f.status === "Paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 shrink-0"
                          style={{
                            borderColor: "oklch(0.55 0.15 130 / 0.4)",
                            color: "oklch(0.38 0.14 130)",
                          }}
                          onClick={() => downloadReceipt(f, student.name)}
                          data-ocid="fees.download_receipt"
                        >
                          <Download size={12} />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
