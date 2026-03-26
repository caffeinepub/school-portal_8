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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const emptyForm = { title: "", message: "", date: "" };

export default function PrincipalHolidaysPage({
  notifications,
  setNotifications,
}: Props) {
  const holidays = notifications.filter((n) => n.type === "Holiday");

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
    setForm({ title: n.title, message: n.message, date: n.date });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    if (editId !== null) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === editId ? { ...n, ...form } : n)),
      );
      toast.success("Holiday updated");
    } else {
      const newItem: Notification = {
        id: Date.now(),
        type: "Holiday",
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
      toast.success("Holiday added");
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Holiday removed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Manage Holidays</h2>
          <p className="text-sm text-gray-500">
            {holidays.length} holiday{holidays.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="holidays.open_modal_button"
              onClick={openAdd}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} /> Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="holidays.dialog">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Holiday" : "Add Holiday"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title</Label>
                <Input
                  data-ocid="holidays.input"
                  className="mt-1"
                  placeholder="e.g. Diwali Holiday"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Message / Details</Label>
                <Textarea
                  data-ocid="holidays.textarea"
                  className="mt-1"
                  placeholder="Describe the holiday..."
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
                  placeholder="e.g. Apr 5, 2026"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                data-ocid="holidays.cancel_button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="holidays.save_button"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {editId ? "Save Changes" : "Add Holiday"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {holidays.length === 0 && (
        <div
          data-ocid="holidays.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <Calendar size={40} className="mx-auto mb-3 opacity-40" />
          <p>No holidays added yet. Click "Add Holiday" to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {holidays.map((n, idx) => (
          <div
            key={n.id}
            data-ocid={`holidays.item.${idx + 1}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                  Holiday
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-1">{n.message}</p>
              <p className="text-xs text-gray-400">{n.date}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                data-ocid={`holidays.edit_button.${idx + 1}`}
                variant="ghost"
                size="icon"
                onClick={() => openEdit(n)}
                className="h-8 w-8 text-gray-400 hover:text-indigo-600"
              >
                <Pencil size={15} />
              </Button>
              <Button
                data-ocid={`holidays.delete_button.${idx + 1}`}
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
