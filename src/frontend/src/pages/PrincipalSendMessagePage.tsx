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
  IndianRupee,
  Megaphone,
  MessageSquarePlus,
  Send,
  Star,
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
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "Announcement",
    label: "Announcement",
    icon: Megaphone,
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "Holiday",
    label: "Holiday",
    icon: CalendarDays,
    color: "bg-pink-100 text-pink-700",
  },
  {
    value: "General",
    label: "General",
    icon: Bell,
    color: "bg-gray-100 text-gray-700",
  },
];

export default function PrincipalSendMessagePage({
  principalId,
  notifications,
  onSendNotification,
}: Props) {
  const [category, setCategory] = useState("General");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Recent sent messages (last 5)
  const recent = [...notifications]
    .filter((n) => CATEGORIES.map((c) => c.value).includes(n.type))
    .slice(0, 5);

  const getCatMeta = (type: string) =>
    CATEGORIES.find((c) => c.value === type) ??
    CATEGORIES[CATEGORIES.length - 1];

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }
    setSending(true);

    const newNotif: Notification = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      type: category,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      read: false,
    };

    // Persist directly so the parent panel picks it up on next refresh
    try {
      const existing = JSON.parse(
        localStorage.getItem(`lords_notifications_${principalId}`) ?? "[]",
      ) as Notification[];
      localStorage.setItem(
        `lords_notifications_${principalId}`,
        JSON.stringify([newNotif, ...existing]),
      );
    } catch {}

    onSendNotification(newNotif);
    toast.success("Message sent to all parents!");
    downloadCSV(
      `Notice_${category}_${new Date().toISOString().split("T")[0]}.csv`,
      ["Category", "Title", "Message", "Date"],
      [[category, title.trim(), message.trim(), newNotif.date]],
    );
    setTitle("");
    setMessage("");
    setCategory("General");
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <MessageSquarePlus size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Send Message to Parents
          </h2>
          <p className="text-sm text-gray-500">
            Messages are instantly visible in all parent dashboards.
          </p>
        </div>
      </div>

      {/* Compose card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="msg-category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="msg-category"
              data-ocid="send-message.select"
              className="mt-1"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <c.icon size={14} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="msg-title">Title</Label>
          <Input
            id="msg-title"
            data-ocid="send-message.input"
            placeholder="e.g. Fee Payment Due — April 15"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="msg-body">Message</Label>
          <Textarea
            id="msg-body"
            data-ocid="send-message.textarea"
            placeholder="Type your message here..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button
          data-ocid="send-message.primary_button"
          onClick={handleSend}
          disabled={sending}
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Send size={16} />
          Send to All Parents
        </Button>
      </div>

      {/* Recent messages */}
      {recent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Recently Sent
          </h3>
          <div className="space-y-2">
            {recent.map((n, idx) => {
              const meta = getCatMeta(n.type);
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  data-ocid={`send-message.item.${idx + 1}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {n.title}
                      </p>
                      <Badge
                        className={`border-0 text-xs flex-shrink-0 ${meta.color}`}
                      >
                        {n.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
