import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle,
  Bell,
  Info,
  Megaphone,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: "urgent" | "normal" | "info";
  targetPortals: string[];
  sentAt: string;
  sentBy: string;
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

const PORTAL_OPTIONS = [
  { id: "teachers", label: "Teachers Portal" },
  { id: "students", label: "Students Portal" },
  { id: "drivers", label: "Driver Portal" },
  { id: "controller", label: "Main Controller" },
];

const PriorityIcon = ({ priority }: { priority: Announcement["priority"] }) => {
  if (priority === "urgent")
    return <AlertTriangle size={14} className="text-red-600" />;
  if (priority === "normal")
    return <Bell size={14} className="text-amber-600" />;
  return <Info size={14} className="text-blue-600" />;
};

const priorityConfig = {
  urgent: { label: "Urgent", cls: "text-red-700 bg-red-50 border-red-200" },
  normal: {
    label: "Normal",
    cls: "text-amber-700 bg-amber-50 border-amber-200",
  },
  info: { label: "Info", cls: "text-blue-700 bg-blue-50 border-blue-200" },
};

interface Props {
  principalId: string;
  principalName?: string;
}

export default function Announcements({
  principalId,
  principalName = "Principal",
}: Props) {
  const storageKey = `lords_announcements_${principalId}`;
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadLS<Announcement[]>(storageKey, []),
  );
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal" as Announcement["priority"],
    targetPortals: [
      "teachers",
      "students",
      "drivers",
      "controller",
    ] as string[],
  });

  const persist = (list: Announcement[]) => {
    setAnnouncements(list);
    saveLS(storageKey, list);
    // Broadcast to students portal via storage event
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `lords_school_announcements_${principalId}`,
        }),
      );
    } catch {}
  };

  const togglePortal = (portalId: string) => {
    setForm((f) => ({
      ...f,
      targetPortals: f.targetPortals.includes(portalId)
        ? f.targetPortals.filter((p) => p !== portalId)
        : [...f.targetPortals, portalId],
    }));
  };

  const broadcastAll = () => {
    setForm((f) => ({
      ...f,
      targetPortals: ["teachers", "students", "drivers", "controller"],
    }));
    setShowForm(true);
  };

  const handleSend = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (form.targetPortals.length === 0) {
      toast.error("Select at least one portal");
      return;
    }

    const announcement: Announcement = {
      id: Date.now(),
      title: form.title.trim(),
      message: form.message.trim(),
      priority: form.priority,
      targetPortals: form.targetPortals,
      sentAt: new Date().toISOString(),
      sentBy: principalName,
    };

    // Also store in lords_notifications for backward compat with student/parent view
    try {
      const notifKey = `lords_notifications_${principalId}`;
      const existing = loadLS<object[]>(notifKey, []);
      const notif = {
        id: announcement.id,
        type: "Announcement",
        title: announcement.title,
        message: announcement.message,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        priority:
          announcement.priority === "urgent"
            ? "high"
            : announcement.priority === "info"
              ? "low"
              : "medium",
        read: false,
      };
      saveLS(notifKey, [notif, ...existing]);
      window.dispatchEvent(new StorageEvent("storage", { key: notifKey }));
    } catch {}

    persist([announcement, ...announcements]);
    setForm({
      title: "",
      message: "",
      priority: "normal",
      targetPortals: ["teachers", "students", "drivers", "controller"],
    });
    setShowForm(false);
    toast.success(
      `Announcement sent to ${form.targetPortals.length} portal${form.targetPortals.length > 1 ? "s" : ""}!`,
      {
        description: `"${announcement.title}"`,
        duration: 5000,
      },
    );
  };

  const deleteAnnouncement = (id: number) => {
    persist(announcements.filter((a) => a.id !== id));
    toast.success("Announcement deleted");
  };

  return (
    <div className="space-y-5" data-ocid="principal.announcements">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Broadcast notices to all portals instantly
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={broadcastAll}
            data-ocid="principal.broadcast_all_btn"
          >
            <Megaphone size={14} className="mr-1.5" /> Broadcast to All
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            data-ocid="principal.new_announcement_btn"
          >
            <Send size={14} className="mr-1.5" /> New Announcement
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Create Announcement</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              <X size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title}
                placeholder="e.g. School closed tomorrow due to rain"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="principal.announcement_title_input"
              />
            </div>
            <div>
              <Label className="text-xs">Message *</Label>
              <Textarea
                value={form.message}
                placeholder="Write the full announcement message here..."
                rows={4}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                data-ocid="principal.announcement_message_input"
              />
            </div>
            <div className="flex gap-6 flex-wrap">
              <div>
                <Label className="text-xs mb-2 block">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      priority: v as Announcement["priority"],
                    })
                  }
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="normal">🟡 Normal</SelectItem>
                    <SelectItem value="info">🔵 Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Target Portals</Label>
                <div className="flex flex-wrap gap-3">
                  {PORTAL_OPTIONS.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`portal-${p.id}`}
                        checked={form.targetPortals.includes(p.id)}
                        onCheckedChange={() => togglePortal(p.id)}
                        data-ocid={`principal.portal_checkbox_${p.id}`}
                      />
                      <label
                        htmlFor={`portal-${p.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {p.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSend}
              className="w-full sm:w-auto"
              data-ocid="principal.send_announcement_btn"
            >
              <Send size={14} className="mr-2" /> Send to{" "}
              {form.targetPortals.length} Portal
              {form.targetPortals.length !== 1 ? "s" : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Announcements list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Sent Announcements
            {announcements.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {announcements.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {announcements.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Megaphone size={32} className="mx-auto mb-2 opacity-30" />
              No announcements yet. Click &quot;New Announcement&quot; to get
              started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {announcements.map((a) => {
                const cfg = priorityConfig[a.priority];
                const portals = a.targetPortals.join(", ");
                return (
                  <div
                    key={a.id}
                    className="px-4 py-4 hover:bg-muted/20 transition-colors group"
                    data-ocid={`principal.announcement_item_${a.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          <PriorityIcon priority={a.priority} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{a.title}</h3>
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {a.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(a.sentAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(a.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>·</span>
                            <span className="truncate">Sent to: {portals}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => deleteAnnouncement(a.id)}
                        aria-label="Delete announcement"
                        data-ocid={`principal.delete_announcement_${a.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
