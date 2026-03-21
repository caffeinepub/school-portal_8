import type { SyllabusSubject } from "@/App";
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
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  syllabus: SyllabusSubject[];
  setSyllabus: React.Dispatch<React.SetStateAction<SyllabusSubject[]>>;
}

type ChapterStatus = "Completed" | "In Progress" | "Pending";

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-gray-100 text-gray-500",
};

export default function PrincipalSyllabusPage({
  syllabus,
  setSyllabus,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Add subject dialog
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  // Add chapter dialog
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [chapterTarget, setChapterTarget] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [newChapterStatus, setNewChapterStatus] =
    useState<ChapterStatus>("Pending");

  // Edit chapter
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState({
    subject: "",
    chapter: "",
    status: "Pending" as ChapterStatus,
  });

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSyllabus((prev) => [
      ...prev,
      { subject: newSubject.trim(), chapters: [] },
    ]);
    toast.success("Subject added");
    setNewSubject("");
    setAddSubjectOpen(false);
  };

  const deleteSubject = (subjectName: string) => {
    setSyllabus((prev) => prev.filter((s) => s.subject !== subjectName));
    toast.success("Subject removed");
  };

  const openAddChapter = (subjectName: string) => {
    setChapterTarget(subjectName);
    setNewChapter("");
    setNewChapterStatus("Pending");
    setAddChapterOpen(true);
  };

  const addChapter = () => {
    if (!newChapter.trim()) return;
    setSyllabus((prev) =>
      prev.map((s) =>
        s.subject === chapterTarget
          ? {
              ...s,
              chapters: [
                ...s.chapters,
                { name: newChapter.trim(), status: newChapterStatus },
              ],
            }
          : s,
      ),
    );
    toast.success("Chapter added");
    setAddChapterOpen(false);
  };

  const openEditChapter = (
    subject: string,
    chapter: string,
    status: ChapterStatus,
  ) => {
    setEditTarget({ subject, chapter, status });
    setEditOpen(true);
  };

  const saveEditChapter = () => {
    setSyllabus((prev) =>
      prev.map((s) =>
        s.subject === editTarget.subject
          ? {
              ...s,
              chapters: s.chapters.map((c) =>
                c.name === editTarget.chapter
                  ? { ...c, status: editTarget.status }
                  : c,
              ),
            }
          : s,
      ),
    );
    toast.success("Chapter status updated");
    setEditOpen(false);
  };

  const deleteChapter = (subjectName: string, chapterName: string) => {
    setSyllabus((prev) =>
      prev.map((s) =>
        s.subject === subjectName
          ? { ...s, chapters: s.chapters.filter((c) => c.name !== chapterName) }
          : s,
      ),
    );
    toast.success("Chapter removed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Manage Syllabus</h2>
          <p className="text-sm text-gray-500">{syllabus.length} subjects</p>
        </div>
        <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="syllabus.open_modal_button"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="syllabus.dialog">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Label>Subject Name</Label>
              <Input
                data-ocid="syllabus.input"
                className="mt-1"
                placeholder="e.g. Geography"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                data-ocid="syllabus.cancel_button"
                variant="outline"
                onClick={() => setAddSubjectOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="syllabus.save_button"
                onClick={addSubject}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add chapter dialog */}
      <Dialog open={addChapterOpen} onOpenChange={setAddChapterOpen}>
        <DialogContent data-ocid="syllabus.dialog">
          <DialogHeader>
            <DialogTitle>Add Chapter to {chapterTarget}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Chapter Name</Label>
              <Input
                data-ocid="syllabus.input"
                className="mt-1"
                placeholder="e.g. Photosynthesis"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newChapterStatus}
                onValueChange={(v) => setNewChapterStatus(v as ChapterStatus)}
              >
                <SelectTrigger data-ocid="syllabus.select" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="syllabus.cancel_button"
              variant="outline"
              onClick={() => setAddChapterOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="syllabus.save_button"
              onClick={addChapter}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Add Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit chapter status dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="syllabus.dialog">
          <DialogHeader>
            <DialogTitle>Edit Chapter Status</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-600 mb-3">
              Chapter: <strong>{editTarget.chapter}</strong>
            </p>
            <Label>Status</Label>
            <Select
              value={editTarget.status}
              onValueChange={(v) =>
                setEditTarget((t) => ({ ...t, status: v as ChapterStatus }))
              }
            >
              <SelectTrigger data-ocid="syllabus.select" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              data-ocid="syllabus.cancel_button"
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="syllabus.save_button"
              onClick={saveEditChapter}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {syllabus.length === 0 && (
        <div
          data-ocid="syllabus.empty_state"
          className="text-center py-16 text-gray-400"
        >
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No subjects added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {syllabus.map((s, sIdx) => (
          <div
            key={s.subject}
            data-ocid={`syllabus.item.${sIdx + 1}`}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setExpanded((e) => ({ ...e, [s.subject]: !e[s.subject] }))
                }
                className="flex items-center gap-2 flex-1 text-left"
              >
                {expanded[s.subject] ? (
                  <ChevronDown size={18} className="text-gray-400" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
                <span className="font-semibold text-gray-800">{s.subject}</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({s.chapters.length} chapters)
                </span>
              </button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAddChapter(s.subject)}
                  className="text-xs text-indigo-600 hover:bg-indigo-50 gap-1"
                >
                  <Plus size={13} /> Chapter
                </Button>
                <Button
                  data-ocid={`syllabus.delete_button.${sIdx + 1}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSubject(s.subject)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>

            {expanded[s.subject] && (
              <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-2">
                {s.chapters.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">
                    No chapters yet. Click "+ Chapter" to add one.
                  </p>
                )}
                {s.chapters.map((c, cIdx) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-700">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}
                      >
                        {c.status}
                      </span>
                      <Button
                        data-ocid={`syllabus.edit_button.${cIdx + 1}`}
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          openEditChapter(
                            s.subject,
                            c.name,
                            c.status as ChapterStatus,
                          )
                        }
                        className="h-7 w-7 text-gray-400 hover:text-indigo-600"
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        data-ocid={`syllabus.delete_button.${cIdx + 1}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChapter(s.subject, c.name)}
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
