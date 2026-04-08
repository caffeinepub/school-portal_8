import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Download,
  Fuel,
  IndianRupee,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MaintenanceEntry {
  id: number;
  type: "Fuel" | "Service" | "Repair" | "Inspection";
  date: string;
  cost: number;
  notes: string;
  vehicleNo: string;
  createdAt: string;
}

interface Props {
  schoolId: string;
  driverId?: number;
  vehicleNo?: string;
}

const MAINTENANCE_TYPES: {
  id: MaintenanceEntry["type"];
  label: string;
  emoji: string;
}[] = [
  { id: "Fuel", label: "Fuel", emoji: "⛽" },
  { id: "Service", label: "Service", emoji: "🔧" },
  { id: "Repair", label: "Repair", emoji: "🛠️" },
  { id: "Inspection", label: "Inspection", emoji: "🔍" },
];

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

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const TYPE_COLORS: Record<
  MaintenanceEntry["type"],
  { bg: string; color: string }
> = {
  Fuel: { bg: "oklch(0.65 0.18 55 / 0.12)", color: "oklch(0.5 0.18 55)" },
  Service: { bg: "oklch(0.5 0.16 150 / 0.12)", color: "oklch(0.4 0.14 150)" },
  Repair: { bg: "oklch(0.55 0.22 25 / 0.1)", color: "oklch(0.55 0.22 25)" },
  Inspection: {
    bg: "oklch(0.5 0.14 280 / 0.12)",
    color: "oklch(0.4 0.14 280)",
  },
};

export default function MaintenanceLogPage({
  schoolId,
  driverId,
  vehicleNo: propVehicleNo,
}: Props) {
  const storageKey = `lords_maintenance_${schoolId}_${driverId ?? 0}`;

  const [entries, setEntries] = useState<MaintenanceEntry[]>(() =>
    loadStorage<MaintenanceEntry[]>(storageKey, []),
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "Fuel" as MaintenanceEntry["type"],
    date: new Date().toISOString().slice(0, 10),
    cost: "",
    notes: "",
    vehicleNo: propVehicleNo ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    saveStorage(storageKey, entries);
  }, [entries, storageKey]);

  const handleSave = () => {
    if (!form.vehicleNo.trim()) {
      toast.error("Enter vehicle number");
      return;
    }
    if (!form.date) {
      toast.error("Select a date");
      return;
    }
    const costNum = Number.parseFloat(form.cost);
    if (Number.isNaN(costNum) || costNum < 0) {
      toast.error("Enter a valid cost amount");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const entry: MaintenanceEntry = {
        id: Date.now(),
        type: form.type,
        date: form.date,
        cost: costNum,
        notes: form.notes.trim(),
        vehicleNo: form.vehicleNo.trim().toUpperCase(),
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [entry, ...prev]);
      setForm((prev) => ({ ...prev, cost: "", notes: "" }));
      setShowForm(false);
      setSaving(false);
      toast.success(`${entry.type} log added — ${formatINR(entry.cost)}`);
    }, 300);
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.info("Entry removed.");
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error("No entries to export.");
      return;
    }
    const rows = [
      ["Type", "Date", "Cost (INR)", "Vehicle No", "Notes"],
      ...entries.map((e) => [
        e.type,
        e.date,
        String(e.cost),
        e.vehicleNo,
        e.notes,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported to Downloads.");
  };

  // Monthly summary
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEntries = entries.filter((e) =>
    e.date.startsWith(currentMonth),
  );
  const thisMonthTotal = thisMonthEntries.reduce((sum, e) => sum + e.cost, 0);
  const allTimeTotal = entries.reduce((sum, e) => sum + e.cost, 0);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Maintenance Log</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record fuel, service, repairs & inspections
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            data-ocid="driver.maintenance.export_button"
          >
            <Download size={13} className="mr-1.5" /> CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            data-ocid="driver.maintenance.add_entry_button"
            style={{
              background: "oklch(var(--portal-driver))",
              color: "white",
            }}
          >
            <Plus size={13} className="mr-1.5" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "oklch(var(--portal-driver) / 0.07)",
            borderColor: "oklch(var(--portal-driver) / 0.2)",
          }}
          data-ocid="driver.maintenance.month_total"
        >
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p
            className="text-xl font-bold"
            style={{ color: "oklch(var(--portal-driver))" }}
          >
            {formatINR(thisMonthTotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {thisMonthEntries.length} entr
            {thisMonthEntries.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <div
          className="rounded-xl p-4 border"
          style={{
            background: "oklch(var(--muted) / 0.4)",
            borderColor: "oklch(var(--border))",
          }}
          data-ocid="driver.maintenance.all_time_total"
        >
          <p className="text-xs text-muted-foreground mb-1">All Time</p>
          <p className="text-xl font-bold text-foreground">
            {formatINR(allTimeTotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {entries.length} total entries
          </p>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div
            className="px-4 py-3 border-b border-border"
            style={{ background: "oklch(var(--portal-driver) / 0.06)" }}
          >
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Wrench
                size={14}
                style={{ color: "oklch(var(--portal-driver))" }}
              />
              New Maintenance Entry
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Type */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">
                Type
              </Label>
              <div className="flex gap-2 flex-wrap">
                {MAINTENANCE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                    data-ocid={`driver.maintenance.type_${t.id.toLowerCase()}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all"
                    style={
                      form.type === t.id
                        ? {
                            borderColor: "oklch(var(--portal-driver))",
                            background: "oklch(var(--portal-driver) / 0.1)",
                            color: "oklch(var(--portal-driver))",
                            fontWeight: 600,
                          }
                        : { borderColor: "oklch(var(--border))" }
                    }
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Vehicle + Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="maint-date"
                  className="text-xs font-semibold mb-1 block"
                >
                  Date
                </Label>
                <Input
                  id="maint-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="driver.maintenance.date_input"
                />
              </div>
              <div>
                <Label
                  htmlFor="maint-cost"
                  className="text-xs font-semibold mb-1 block"
                >
                  Cost (INR)
                </Label>
                <Input
                  id="maint-cost"
                  type="number"
                  placeholder="e.g. 2500"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: e.target.value }))
                  }
                  data-ocid="driver.maintenance.cost_input"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="maint-vehicle"
                className="text-xs font-semibold mb-1 block"
              >
                Vehicle Number
              </Label>
              <Input
                id="maint-vehicle"
                placeholder="e.g. RJ-12-AB-1234"
                value={form.vehicleNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vehicleNo: e.target.value }))
                }
                data-ocid="driver.maintenance.vehicle_input"
              />
            </div>

            <div>
              <Label
                htmlFor="maint-notes"
                className="text-xs font-semibold mb-1 block"
              >
                Notes (optional)
              </Label>
              <Textarea
                id="maint-notes"
                placeholder="Add any details about the maintenance..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                data-ocid="driver.maintenance.notes_input"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                data-ocid="driver.maintenance.save_button"
                style={{
                  background: "oklch(var(--portal-driver))",
                  color: "white",
                }}
              >
                {saving ? "Saving..." : "Save Entry"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="driver.maintenance.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Log list */}
      {entries.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center"
          data-ocid="driver.maintenance.empty_state"
        >
          <Wrench size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground mb-1">
            No maintenance records yet
          </p>
          <p className="text-sm text-muted-foreground">
            Add your first entry using the <strong>Add Entry</strong> button
            above.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">
              Records
            </span>
            <span className="text-xs text-muted-foreground">
              {entries.length} entries
            </span>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const colorInfo = TYPE_COLORS[entry.type];
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3"
                  data-ocid={`driver.maintenance.entry_row_${entry.id}`}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 mt-0.5"
                    style={{ background: colorInfo.bg }}
                  >
                    {entry.type === "Fuel" ? (
                      <Fuel size={16} style={{ color: colorInfo.color }} />
                    ) : (
                      <Wrench size={16} style={{ color: colorInfo.color }} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        style={{
                          background: colorInfo.bg,
                          color: colorInfo.color,
                          border: "none",
                        }}
                        className="text-xs"
                      >
                        {entry.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays size={11} />
                        {new Date(entry.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      <IndianRupee
                        size={13}
                        style={{ color: "oklch(var(--portal-driver))" }}
                      />
                      {formatINR(entry.cost)}
                      <span className="text-xs font-normal text-muted-foreground">
                        · {entry.vehicleNo}
                      </span>
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    data-ocid={`driver.maintenance.delete_${entry.id}`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
