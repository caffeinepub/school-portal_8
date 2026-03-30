import type { Notification } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { downloadCSV } from "@/utils/downloadCSV";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Megaphone,
  MessageSquarePlus,
  Send,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  principalId: string;
  notifications: Notification[];
  onSendNotification: (n: Notification) => void;
}

const CATEGORIES = [
  {
    value: "Fees",
    label: "Fees",
    icon: IndianRupee,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "Marks",
    label: "Marks",
    icon: Star,
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "Syllabus",
    label: "Syllabus",
    icon: BookOpen,
    color: "bg-violet-100 text-violet-700",
  },
  {
    value: "Announcement",
    label: "Announcement",
    icon: Megaphone,
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "Holiday",
    label: "Holiday",
    icon: CalendarDays,
    color: "bg-rose-100 text-rose-700",
  },
  {
    value: "General",
    label: "General",
    icon: Bell,
    color: "bg-gray-100 text-gray-700",
  },
];

function countStudents(principalId: string): number {
  try {
    const raw = localStorage.getItem(`lords_students_${principalId}`);
    if (raw) {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    }
  } catch {}
  return 0;
}

function getAllPrincipalStudentCount(): number {
  let total = 0;
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("lords_students_"),
    );
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) total += arr.length;
      }
    }
  } catch {}
  return total;
}

export default function PrincipalSendMessagePage({
  principalId,
  notifications,
  onSendNotification,
}: Props) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<Notification | null>(null);

  const studentCount = countStudents(principalId);
  const totalStudents = getAllPrincipalStudentCount();

  const handleSend = () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    // Simulate a brief delay for UX (message is actually instant via localStorage)
    setTimeout(() => {
      const newNotification: Notification = {
        id: Date.now(),
        type: category,
        title: title.trim(),
        message: message.trim(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        priority: "high",
        read: false,
      };

      onSendNotification(newNotification);
      setLastSent(newNotification);

      // Auto-download CSV
      downloadCSV(
        `Message_${category}_${newNotification.date}.csv`,
        ["Category", "Title", "Message", "Date", "Time"],
        [
          [
            category,
            title,
            message,
            newNotification.date,
            newNotification.time,
          ],
        ],
      );

      // Trigger storage event for other tabs (instant cross-tab delivery)
      try {
        const existing = JSON.parse(
          localStorage.getItem(`lords_notifications_${principalId}`) || "[]",
        );
        localStorage.setItem(
          `lords_notifications_${principalId}`,
          JSON.stringify([newNotification, ...existing]),
        );
        // Force storage event on same tab for any polling
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: `lords_notifications_${principalId}`,
            newValue: JSON.stringify([newNotification, ...existing]),
          }),
        );
      } catch {}

      toast.success("Message sent to all parents!");
      setTitle("");
      setMessage("");
      setSending(false);
    }, 300);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Fast delivery info */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: "oklch(0.58 0.16 150 / 0.08)",
          border: "1px solid oklch(0.58 0.16 150 / 0.2)",
        }}
      >
        <Zap
          size={18}
          style={{ color: "oklch(0.42 0.16 150)", flexShrink: 0, marginTop: 2 }}
        />
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: "oklch(0.30 0.12 150)" }}
          >
            Fast Broadcast Messaging
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.42 0.12 150)" }}
          >
            Messages are stored instantly. All{" "}
            <strong>
              {studentCount.toLocaleString()} parent
              {studentCount !== 1 ? "s" : ""}
            </strong>{" "}
            in your school will see this within 5 seconds when they open the
            portal.
            {totalStudents > studentCount && (
              <span className="ml-1 text-muted-foreground">
                ({totalStudents.toLocaleString()} total across all schools)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Last sent success */}
      {lastSent && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "oklch(0.52 0.18 255 / 0.07)",
            border: "1px solid oklch(0.52 0.18 255 / 0.2)",
          }}
          data-ocid="send_message.success_state"
        >
          <CheckCircle2
            size={18}
            style={{
              color: "oklch(0.52 0.18 255)",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.35 0.12 255)" }}
            >
              ✓ Last message sent: {lastSent.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {lastSent.type} · {lastSent.date} at {lastSent.time} · CSV
              downloaded automatically
            </p>
          </div>
        </div>
      )}

      {/* Compose form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquarePlus
            size={18}
            style={{ color: "oklch(0.52 0.18 255)" }}
          />
          <h2 className="font-semibold text-base">Compose Message</h2>
        </div>

        <div>
          <Label className="text-sm font-medium">Category</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                data-ocid={`send_message.${value.toLowerCase()}.radio`}
                onClick={() => setCategory(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  category === value
                    ? "border-primary bg-primary/5 font-semibold"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${color}`}
                >
                  <Icon size={12} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Title</Label>
          <Input
            data-ocid="send_message.title.input"
            className="mt-1.5"
            placeholder="e.g., Fee payment reminder for March"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Message</Label>
          <Textarea
            data-ocid="send_message.message.textarea"
            className="mt-1.5 min-h-[100px]"
            placeholder="Write your message to parents here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {message.length} characters
          </p>
        </div>

        <Button
          data-ocid="send_message.send.primary_button"
          className="w-full gap-2"
          style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {sending
            ? "Sending..."
            : `Send to ${studentCount} Parent${studentCount !== 1 ? "s" : ""}`}
        </Button>
      </div>

      {/* Recent messages */}
      {notifications.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Bell size={15} />
            Recent Messages
            <span className="text-xs text-muted-foreground font-normal">
              ({notifications.length} total)
            </span>
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 8).map((n, i) => {
              const cat = CATEGORIES.find((c) => c.value === n.type);
              const Icon = cat?.icon || Bell;
              return (
                <div
                  key={n.id}
                  data-ocid={`send_message.item.${i + 1}`}
                  className="flex items-start gap-3 bg-card border border-border rounded-lg px-4 py-3"
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs shrink-0 ${cat?.color || "bg-gray-100 text-gray-700"}`}
                  >
                    <Icon size={13} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {n.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{n.date}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {n.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Parent count by school */}
      <div className="bg-muted/40 rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Users size={14} />
          Recipient Breakdown
        </h3>
        <div className="space-y-1.5">
          {["p1", "p2", "p3", "p4", "p5"].map((pid, idx) => {
            const count = countStudents(pid);
            const names = [
              "Churu",
              "Sadulpur",
              "Taranagar",
              "Principal 4",
              "Principal 5",
            ];
            if (count === 0) return null;
            return (
              <div
                key={pid}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  Lords {names[idx]}
                </span>
                <span className="font-medium">
                  {count} student{count !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
          {totalStudents === 0 && (
            <p className="text-xs text-muted-foreground">
              No students added yet. Add students in Student Management first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
