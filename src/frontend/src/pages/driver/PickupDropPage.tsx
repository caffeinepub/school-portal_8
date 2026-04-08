import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentEntry {
  id: number;
  name: string;
  stop: string;
  class: string;
  pickedUp: boolean;
  droppedOff: boolean;
  pickupTime?: string;
  dropTime?: string;
}

interface Props {
  schoolId: string;
  driverId?: number;
}

const DEMO_STUDENTS: StudentEntry[] = [
  {
    id: 1,
    name: "Arjun Sharma",
    stop: "Station Road",
    class: "Class 8",
    pickedUp: false,
    droppedOff: false,
  },
  {
    id: 2,
    name: "Priya Patel",
    stop: "Station Road",
    class: "Class 5",
    pickedUp: false,
    droppedOff: false,
  },
  {
    id: 3,
    name: "Rahul Kumar",
    stop: "Nehru Nagar",
    class: "Class 10",
    pickedUp: false,
    droppedOff: false,
  },
  {
    id: 4,
    name: "Anjali Singh",
    stop: "Gandhi Chowk",
    class: "Class 7",
    pickedUp: false,
    droppedOff: false,
  },
  {
    id: 5,
    name: "Vikram Yadav",
    stop: "Gandhi Chowk",
    class: "Class 9",
    pickedUp: false,
    droppedOff: false,
  },
  {
    id: 6,
    name: "Sunita Devi",
    stop: "Market Area",
    class: "Class 6",
    pickedUp: false,
    droppedOff: false,
  },
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

export default function PickupDropPage({ schoolId, driverId }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `lords_pickup_log_${schoolId}_${driverId ?? 0}_${today}`;

  const [students, setStudents] = useState<StudentEntry[]>(() => {
    const saved = loadStorage<StudentEntry[]>(storageKey, []);
    return saved.length > 0 ? saved : DEMO_STUDENTS;
  });
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => {
    saveStorage(storageKey, students);
  }, [students, storageKey]);

  const handlePickup = (id: number) => {
    setLoading(id);
    setTimeout(() => {
      const time = new Date().toLocaleTimeString();
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, pickedUp: true, pickupTime: time } : s,
        ),
      );
      setLoading(null);
      const student = students.find((s) => s.id === id);
      toast.success(`${student?.name ?? "Student"} picked up at ${time}`);
    }, 300);
  };

  const handleDrop = (id: number) => {
    setLoading(id);
    setTimeout(() => {
      const time = new Date().toLocaleTimeString();
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, droppedOff: true, dropTime: time } : s,
        ),
      );
      setLoading(null);
      const student = students.find((s) => s.id === id);
      toast.success(`${student?.name ?? "Student"} dropped off at ${time}`);
    }, 300);
  };

  const handleReset = () => {
    const reset = students.map((s) => ({
      ...s,
      pickedUp: false,
      droppedOff: false,
      pickupTime: undefined,
      dropTime: undefined,
    }));
    setStudents(reset);
    toast.info("Pickup/drop log reset for today.");
  };

  const pickedCount = students.filter((s) => s.pickedUp).length;
  const droppedCount = students.filter((s) => s.droppedOff).length;
  const pendingCount = students.filter(
    (s) => !s.pickedUp && !s.droppedOff,
  ).length;

  // Group by stop
  const stops = [...new Set(students.map((s) => s.stop))];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Pickup / Drop</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Today —{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          data-ocid="driver.pickup.reset_button"
        >
          <RefreshCw size={13} className="mr-1.5" /> Reset
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Picked Up",
            count: pickedCount,
            icon: CheckCircle2,
            color: "oklch(0.5 0.16 150)",
            bg: "oklch(0.5 0.16 150 / 0.08)",
            ocid: "driver.pickup.picked_summary",
          },
          {
            label: "Dropped Off",
            count: droppedCount,
            icon: XCircle,
            color: "oklch(0.55 0.22 25)",
            bg: "oklch(0.55 0.22 25 / 0.08)",
            ocid: "driver.pickup.dropped_summary",
          },
          {
            label: "Pending",
            count: pendingCount,
            icon: Clock,
            color: "oklch(var(--portal-driver))",
            bg: "oklch(var(--portal-driver) / 0.08)",
            ocid: "driver.pickup.pending_summary",
          },
        ].map(({ label, count, icon: Icon, color, bg, ocid }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center border"
            style={{
              background: bg,
              borderColor: `${color.replace(")", " / 0.2)")}`,
            }}
            data-ocid={ocid}
          >
            <Icon size={20} className="mx-auto mb-1" style={{ color }} />
            <p className="text-xl font-bold" style={{ color }}>
              {count}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Student list grouped by stop */}
      {stops.map((stop) => {
        const stopStudents = students.filter((s) => s.stop === stop);
        return (
          <div
            key={stop}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div
              className="px-4 py-2.5 border-b border-border flex items-center gap-2"
              style={{ background: "oklch(var(--muted) / 0.4)" }}
            >
              <Users size={13} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {stop}
              </span>
            </div>
            <div className="divide-y divide-border">
              {stopStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-4 py-3"
                  data-ocid={`driver.pickup.student_row_${student.id}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: student.pickedUp
                        ? "oklch(0.5 0.16 150 / 0.15)"
                        : student.droppedOff
                          ? "oklch(0.55 0.22 25 / 0.12)"
                          : "oklch(var(--portal-driver) / 0.12)",
                      color: student.pickedUp
                        ? "oklch(0.4 0.14 150)"
                        : student.droppedOff
                          ? "oklch(0.55 0.22 25)"
                          : "oklch(var(--portal-driver))",
                    }}
                  >
                    {student.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {student.class}
                      </span>
                      {student.pickedUp && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.5 0.16 150 / 0.12)",
                            color: "oklch(0.4 0.14 150)",
                            border: "none",
                          }}
                        >
                          ✓ Picked {student.pickupTime}
                        </Badge>
                      )}
                      {student.droppedOff && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.55 0.22 25 / 0.1)",
                            color: "oklch(0.55 0.22 25)",
                            border: "none",
                          }}
                        >
                          ✓ Dropped {student.dropTime}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {!student.pickedUp ? (
                      <Button
                        size="sm"
                        onClick={() => handlePickup(student.id)}
                        disabled={loading === student.id}
                        data-ocid={`driver.pickup.pickup_button_${student.id}`}
                        className="h-7 px-2.5 text-xs"
                        style={{
                          background: "oklch(0.5 0.16 150)",
                          color: "white",
                        }}
                      >
                        <UserCheck size={13} className="mr-1" />
                        {loading === student.id ? "..." : "Pickup"}
                      </Button>
                    ) : !student.droppedOff ? (
                      <Button
                        size="sm"
                        onClick={() => handleDrop(student.id)}
                        disabled={loading === student.id}
                        data-ocid={`driver.pickup.drop_button_${student.id}`}
                        className="h-7 px-2.5 text-xs"
                        style={{
                          background: "oklch(0.55 0.22 25)",
                          color: "white",
                        }}
                      >
                        {loading === student.id ? "..." : "Drop"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2">
                        Complete
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
