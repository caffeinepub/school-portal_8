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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useClasses } from "@/hooks/useClasses";
import {
  BookOpen,
  Check,
  Edit2,
  Image,
  NotebookPen,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../data/mockData";

export interface DiaryEntry {
  id: string;
  date: string;
  class: string;
  subjects: { subject: string; homework: string }[];
  photoBase64?: string;
  createdAt: number;
}

const DEFAULT_SUBJECTS = [
  "Hindi",
  "English",
  "Mathematics",
  "Science",
  "Social Science",
  "Computer",
];

interface Props {
  principalId: string;
  students: Student[];
}

function loadDiary(principalId: string): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(`diary_${principalId}`);
    if (raw) return JSON.parse(raw) as DiaryEntry[];
  } catch {}
  return [];
}

function saveDiary(principalId: string, entries: DiaryEntry[]) {
  localStorage.setItem(`diary_${principalId}`, JSON.stringify(entries));
}

export default function PrincipalDiaryPage({ principalId, students }: Props) {
  const { classes, addClass } = useClasses(principalId, students);
  const [entries, setEntries] = useState<DiaryEntry[]>(() =>
    loadDiary(principalId),
  );
  const [filterClass, setFilterClass] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formClass, setFormClass] = useState(classes[0] ?? "");
  const [formSubjects, setFormSubjects] = useState<
    { _id: string; subject: string; homework: string }[]
  >(
    DEFAULT_SUBJECTS.map((s, i) => ({
      _id: String(i),
      subject: s,
      homework: "",
    })),
  );
  const [formPhoto, setFormPhoto] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveDiary(principalId, entries);
  }, [entries, principalId]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormClass(classes[0] ?? "");
    setFormSubjects(
      DEFAULT_SUBJECTS.map((s, i) => ({
        _id: String(i),
        subject: s,
        homework: "",
      })),
    );
    setFormPhoto(undefined);
    setEditingEntry(null);
    setShowAddClass(false);
    setNewClassName("");
  };

  const handleAddClass = () => {
    const trimmed = newClassName.trim();
    if (!trimmed) {
      toast.error("Class name cannot be empty.");
      return;
    }
    if (classes.includes(trimmed)) {
      toast.error("Class already exists.");
      return;
    }
    addClass(trimmed);
    setFormClass(trimmed);
    setNewClassName("");
    setShowAddClass(false);
    toast.success(`Class "${trimmed}" added.`);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormClass(entry.class);
    setFormSubjects(
      entry.subjects.map((s, i) => ({ _id: String(Date.now() + i), ...s })),
    );
    setFormPhoto(entry.photoBase64);
    setShowForm(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubjectChange = (
    idx: number,
    field: "subject" | "homework",
    value: string,
  ) => {
    setFormSubjects((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const addSubjectRow = () => {
    setFormSubjects((prev) => [
      ...prev,
      { _id: String(Date.now()), subject: "", homework: "" },
    ]);
  };

  const removeSubjectRow = (idx: number) => {
    setFormSubjects((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!formDate || !formClass) {
      toast.error("Please select a date and class.");
      return;
    }
    const validSubjects = formSubjects.filter(
      (s) => s.subject.trim() && s.homework.trim(),
    );
    if (validSubjects.length === 0) {
      toast.error("Add at least one subject with homework.");
      return;
    }

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                date: formDate,
                class: formClass,
                subjects: validSubjects,
                photoBase64: formPhoto,
              }
            : e,
        ),
      );
      toast.success("Diary entry updated.");
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: formDate,
        class: formClass,
        subjects: validSubjects,
        photoBase64: formPhoto,
        createdAt: Date.now(),
      };
      setEntries((prev) => [newEntry, ...prev]);
      toast.success(`Diary sent to Class ${formClass}!`);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Diary entry deleted.");
  };

  const filteredEntries =
    filterClass === "all"
      ? entries
      : entries.filter((e) => e.class === filterClass);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-6" data-ocid="diary.section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Class Diary</h2>
        </div>
        <Button
          onClick={openNewForm}
          data-ocid="diary.primary_button"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Diary Entry
        </Button>
      </div>

      {showForm && (
        <Card className="border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {editingEntry ? "Edit Diary Entry" : "Create New Diary Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="diary-date">Date</Label>
                <Input
                  id="diary-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  data-ocid="diary.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <div className="flex items-center gap-1.5">
                  <Select value={formClass} onValueChange={setFormClass}>
                    <SelectTrigger data-ocid="diary.select" className="flex-1">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c} value={c}>
                          Class {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showAddClass ? (
                    <div className="flex items-center gap-1">
                      <Input
                        className="h-8 w-24 text-sm"
                        placeholder="Class"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                        autoFocus
                        data-ocid="diary.input"
                      />
                      <Button
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleAddClass}
                        data-ocid="diary.confirm_button"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setShowAddClass(false);
                          setNewClassName("");
                        }}
                        data-ocid="diary.cancel_button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={() => setShowAddClass(true)}
                      data-ocid="diary.open_modal_button"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Class
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subject-wise Homework</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSubjectRow}
                  data-ocid="diary.secondary_button"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Subject
                </Button>
              </div>
              <div className="space-y-2">
                {formSubjects.map((row, idx) => (
                  <div key={row._id} className="flex gap-2 items-start">
                    <Input
                      placeholder="Subject"
                      value={row.subject}
                      onChange={(e) =>
                        handleSubjectChange(idx, "subject", e.target.value)
                      }
                      className="w-32 shrink-0"
                    />
                    <Textarea
                      placeholder="Homework / notes"
                      value={row.homework}
                      onChange={(e) =>
                        handleSubjectChange(idx, "homework", e.target.value)
                      }
                      className="flex-1 min-h-[60px] resize-none"
                      data-ocid="diary.textarea"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubjectRow(idx)}
                      className="text-destructive hover:text-destructive shrink-0"
                      data-ocid="diary.delete_button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Diary Photo (optional)</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  data-ocid="diary.upload_button"
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" /> Upload
                </Button>
                {formPhoto && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormPhoto(undefined)}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              {formPhoto && (
                <button
                  type="button"
                  onClick={() => setZoomedPhoto(formPhoto)}
                  className="border-0 bg-transparent p-0"
                >
                  <img
                    src={formPhoto}
                    alt="Diary preview"
                    className="max-h-48 rounded-lg border object-cover cursor-pointer"
                  />
                </button>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                data-ocid="diary.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="diary.submit_button">
                <Send className="h-4 w-4 mr-2" />
                {editingEntry ? "Update Entry" : "Save & Send to Class"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">
          Filter by class:
        </Label>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-44" data-ocid="diary.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredEntries.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="diary.empty_state"
        >
          <NotebookPen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No diary entries yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry, i) => (
            <Card
              key={entry.id}
              className="border shadow-sm"
              data-ocid={`diary.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {formatDate(entry.date)}
                    </span>
                    <Badge variant="secondary">Class {entry.class}</Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(entry)}
                      data-ocid="diary.edit_button"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                      data-ocid="diary.delete_button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {entry.subjects.map((s) => (
                    <div
                      key={s.subject}
                      className="bg-muted/50 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {s.subject}:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {s.homework}
                      </span>
                    </div>
                  ))}
                </div>

                {entry.photoBase64 && (
                  <button
                    type="button"
                    onClick={() => setZoomedPhoto(entry.photoBase64 ?? null)}
                    className="border-0 bg-transparent p-0"
                  >
                    <img
                      src={entry.photoBase64}
                      alt="Diary entry"
                      className="max-h-40 rounded-lg border object-cover cursor-pointer"
                    />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {zoomedPhoto && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 w-full border-0"
          onClick={() => setZoomedPhoto(null)}
        >
          <img
            src={zoomedPhoto}
            alt="Diary entry enlarged"
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
          />
        </button>
      )}
    </div>
  );
}
