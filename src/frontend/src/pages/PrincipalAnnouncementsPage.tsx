import type { Notification } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertCircle,
  BookOpen,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const emptyForm = { title: "", message: "", date: "", type: "Alert" };

const typeBadge: Record<string, string> = {
  Alert: "bg-orange-100 text-orange-700",
  Exam: "bg-blue-100 text-blue-700",
};

export default function PrincipalAnnouncementsPage({
  notifications,
  setNotifications,
}: Props) {
  const items = notifications.filter(
    (n) => n.type === "Alert" || n.type === "Exam",
  );

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (n: Notification) => {
    setEditId(n.id);
    setForm({ title: n.title, message: n.message, date: n.date, type: n.type });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    if (editId !== null) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === editId ? { ...n, ...form } : n)),
      );
      toast.success("Announcement updated");
    } else {
      const newItem: Notification = {
        id: Date.now(),
        type: form.type as "Alert" | "Exam",
        read: false,
        title: form.title,
        message: form.message,
        date:
          form.date ||
          new Date().toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
      };
      setNotifications((prev) => [newItem, ...prev]);
      toast.success("Announcement added");
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Announcement removed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Announcements & Exams
          </h2>
          <p className="text-sm text-gray-500">
            {items.length} announcement{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="announcements.open_modal_button"
              onClick={openAdd}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} /> Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="announcements.dialog">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Announcement" : "Add Announcement"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger
                    data-ocid="announcements.select"
                    className="mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alert">Alert</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  data-ocid="announcements.input"
                  className="mt-1"
                  placeholder="e.g. Parent-Teacher Meeting"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  data-ocid="announcements.textarea"
                  className="mt-1"
                  placeholder="Details..."
                  rows={3}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Apr 10, 2026"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                data-ocid="announcements.cancel_button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="announcements.save_button"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {editId ? "Save Changes" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 && (
        <div
          data-ocid="announcements.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <Megaphone size={40} className="mx-auto mb-3 opacity-40" />
          <p>No announcements yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((n, idx) => (
          <div
            key={n.id}
            data-ocid={`announcements.item.${idx + 1}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "Exam" ? "bg-blue-50" : "bg-orange-50"}`}
            >
              {n.type === "Exam" ? (
                <BookOpen size={18} className="text-blue-600" />
              ) : (
                <AlertCircle size={18} className="text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                <Badge className={`border-0 text-xs ${typeBadge[n.type]}`}>
                  {n.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-1">{n.message}</p>
              <p className="text-xs text-gray-400">{n.date}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                data-ocid={`announcements.edit_button.${idx + 1}`}
                variant="ghost"
                size="icon"
                onClick={() => openEdit(n)}
                className="h-8 w-8 text-gray-400 hover:text-indigo-600"
              >
                <Pencil size={15} />
              </Button>
              <Button
                data-ocid={`announcements.delete_button.${idx + 1}`}
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(n.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
