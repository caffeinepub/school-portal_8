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
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ClipboardList,
  FileSearch,
  Plus,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
];

type InquiryStatus = "new" | "contacted" | "enrolled" | "rejected";

interface Inquiry {
  id: number;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  seekingClass: string;
  status: InquiryStatus;
  notes: string;
  receivedAt: string;
  updatedAt: string;
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

const statusConfig: Record<
  InquiryStatus,
  { label: string; icon: React.ElementType; cls: string }
> = {
  new: {
    label: "New",
    icon: ClipboardList,
    cls: "text-blue-700 bg-blue-50 border-blue-200",
  },
  contacted: {
    label: "Contacted",
    icon: FileSearch,
    cls: "text-amber-700 bg-amber-50 border-amber-200",
  },
  enrolled: {
    label: "Enrolled",
    icon: Check,
    cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    icon: UserX,
    cls: "text-red-700 bg-red-50 border-red-200",
  },
};

const StatusBadge = ({ status }: { status: InquiryStatus }) => {
  const { label, cls } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      {label}
    </span>
  );
};

const emptyForm = (): Omit<Inquiry, "id" | "receivedAt" | "updatedAt"> => ({
  studentName: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  seekingClass: "Class 1",
  status: "new",
  notes: "",
});

interface Props {
  principalId: string;
}

export default function InquiryManagement({ principalId }: Props) {
  const storageKey = `lords_inquiries_${principalId}`;
  const [inquiries, setInquiries] = useState<Inquiry[]>(() =>
    loadLS<Inquiry[]>(storageKey, []),
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const persist = (list: Inquiry[]) => {
    setInquiries(list);
    saveLS(storageKey, list);
  };

  const handleSave = () => {
    if (!form.studentName.trim()) {
      toast.error("Student name is required");
      return;
    }
    if (!form.parentPhone.trim()) {
      toast.error("Parent phone is required");
      return;
    }
    const now = new Date().toISOString();
    if (editingId !== null) {
      persist(
        inquiries.map((i) =>
          i.id === editingId
            ? {
                ...form,
                id: editingId,
                receivedAt: i.receivedAt,
                updatedAt: now,
              }
            : i,
        ),
      );
      toast.success("Inquiry updated");
    } else {
      persist([
        { ...form, id: Date.now(), receivedAt: now, updatedAt: now },
        ...inquiries,
      ]);
      toast.success("Inquiry recorded");
    }
    setForm(emptyForm());
    setShowForm(false);
    setEditingId(null);
  };

  const updateStatus = (id: number, status: InquiryStatus) => {
    persist(
      inquiries.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i,
      ),
    );
    toast.success(`Status updated to ${statusConfig[status].label}`);
  };

  const updateNotes = (id: number, notes: string) => {
    persist(
      inquiries.map((i) =>
        i.id === id ? { ...i, notes, updatedAt: new Date().toISOString() } : i,
      ),
    );
  };

  const deleteInquiry = (id: number) => {
    persist(inquiries.filter((i) => i.id !== id));
    toast.success("Inquiry deleted");
  };

  const filtered = useMemo(() => {
    if (filterStatus === "all") return inquiries;
    return inquiries.filter((i) => i.status === filterStatus);
  }, [inquiries, filterStatus]);

  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, enrolled: 0, rejected: 0 };
    for (const i of inquiries) c[i.status]++;
    return c;
  }, [inquiries]);

  return (
    <div className="space-y-5" data-ocid="principal.inquiry_management">
      {/* Summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          Object.entries(statusConfig) as [
            InquiryStatus,
            (typeof statusConfig)[InquiryStatus],
          ][]
        ).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${filterStatus === key ? "ring-2 ring-primary" : ""}`}
            style={{ borderColor: "oklch(var(--border))" }}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
          >
            <p className="text-2xl font-bold">{counts[key]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid="principal.inquiry_filter"
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered.length} inquiries
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm());
          }}
          data-ocid="principal.add_inquiry_btn"
        >
          <Plus size={14} className="mr-1.5" /> Add Inquiry
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {editingId ? "Edit Inquiry" : "New Inquiry"}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X size={14} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Student Name *</Label>
                <Input
                  value={form.studentName}
                  placeholder="Prospective student name"
                  onChange={(e) =>
                    setForm({ ...form, studentName: e.target.value })
                  }
                  data-ocid="principal.inquiry_student_name"
                />
              </div>
              <div>
                <Label className="text-xs">Parent / Guardian Name</Label>
                <Input
                  value={form.parentName}
                  placeholder="Parent name"
                  onChange={(e) =>
                    setForm({ ...form, parentName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Parent Phone *</Label>
                <Input
                  value={form.parentPhone}
                  placeholder="10-digit mobile"
                  onChange={(e) =>
                    setForm({ ...form, parentPhone: e.target.value })
                  }
                  data-ocid="principal.inquiry_parent_phone"
                />
              </div>
              <div>
                <Label className="text-xs">Parent Email</Label>
                <Input
                  value={form.parentEmail}
                  type="email"
                  placeholder="optional"
                  onChange={(e) =>
                    setForm({ ...form, parentEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Seeking Admission In</Label>
                <Select
                  value={form.seekingClass}
                  onValueChange={(v) => setForm({ ...form, seekingClass: v })}
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
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as InquiryStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-xs">Notes / Follow-up</Label>
                <Textarea
                  value={form.notes}
                  placeholder="Add notes about this inquiry, follow-up actions, etc."
                  rows={2}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <Button
              size="sm"
              className="mt-4"
              onClick={handleSave}
              data-ocid="principal.save_inquiry_btn"
            >
              {editingId ? "Save Changes" : "Save Inquiry"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inquiry list */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
              {filterStatus === "all"
                ? 'No inquiries yet. Click "Add Inquiry" to record a prospective student.'
                : `No ${statusConfig[filterStatus as InquiryStatus]?.label.toLowerCase()} inquiries.`}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((inq) => (
                <div
                  key={inq.id}
                  className="group"
                  data-ocid={`principal.inquiry_row_${inq.id}`}
                >
                  <div className="px-4 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">
                            {inq.studentName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {inq.seekingClass}
                          </Badge>
                          <StatusBadge status={inq.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span>{inq.parentName || "Parent"}</span>
                          <span>·</span>
                          <span>{inq.parentPhone}</span>
                          {inq.parentEmail && (
                            <>
                              <span>·</span>
                              <span>{inq.parentEmail}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>
                            {new Date(inq.receivedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {inq.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                            Notes: {inq.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick status change */}
                        <Select
                          value={inq.status}
                          onValueChange={(v) =>
                            updateStatus(inq.id, v as InquiryStatus)
                          }
                        >
                          <SelectTrigger
                            className="h-7 w-28 text-xs"
                            data-ocid={`principal.inquiry_status_${inq.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() =>
                            setExpandedId(expandedId === inq.id ? null : inq.id)
                          }
                        >
                          <Plus size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
                          onClick={() => deleteInquiry(inq.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded notes editor */}
                    {expandedId === inq.id && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Label className="text-xs">Notes / Follow-up</Label>
                        <Textarea
                          defaultValue={inq.notes}
                          rows={2}
                          className="mt-1 text-sm"
                          placeholder="Add follow-up notes..."
                          onBlur={(e) => updateNotes(inq.id, e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Notes auto-save when you click away.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
