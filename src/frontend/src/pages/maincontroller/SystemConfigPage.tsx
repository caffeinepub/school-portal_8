import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHOOLS } from "@/data/schools";
import {
  BookOpen,
  Check,
  GraduationCap,
  Grid3X3,
  Layers,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const DEFAULT_CLASSES = [
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
const DEFAULT_SECTIONS = ["A", "B", "C", "D"];
const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Computer Science",
  "Physical Education",
  "Art",
];

interface ExamTimetable {
  id: string;
  schoolId: string;
  examName: string;
  className: string;
  entries: { id?: string; subject: string; date: string; time: string }[];
  createdAt: string;
}

export default function SystemConfigPage() {
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS[0].id);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [examName, setExamName] = useState("");
  const [examClass, setExamClass] = useState("");
  const [examEntries, setExamEntries] = useState<
    { id: string; subject: string; date: string; time: string }[]
  >([{ id: "e0", subject: "", date: "", time: "" }]);
  const [editingTimetableId, setEditingTimetableId] = useState<string | null>(
    null,
  );

  const configKey = `lords_sys_config_${selectedSchool}`;
  const timetableKey = `lords_exam_timetables_${selectedSchool}`;

  useEffect(() => {
    const cfg = loadStorage<{
      classes: string[];
      sections: string[];
      subjects: string[];
    }>(configKey, {
      classes: DEFAULT_CLASSES,
      sections: DEFAULT_SECTIONS,
      subjects: DEFAULT_SUBJECTS,
    });
    setClasses(cfg.classes);
    setSections(cfg.sections);
    setSubjects(cfg.subjects);
    setTimetables(loadStorage<ExamTimetable[]>(timetableKey, []));
    setExamClass("");
    setExamName("");
    setExamEntries([{ id: "e0", subject: "", date: "", time: "" }]);
  }, [configKey, timetableKey]);

  const saveConfig = (c: string[], sec: string[], sub: string[]) => {
    saveStorage(configKey, { classes: c, sections: sec, subjects: sub });
  };

  const addClass = () => {
    if (!newClass.trim()) return;
    if (classes.includes(newClass.trim())) {
      toast.error("Class already exists");
      return;
    }
    const updated = [...classes, newClass.trim()];
    setClasses(updated);
    saveConfig(updated, sections, subjects);
    setNewClass("");
    toast.success(`Class "${newClass.trim()}" added`);
  };

  const removeClass = (cls: string) => {
    const updated = classes.filter((c) => c !== cls);
    setClasses(updated);
    saveConfig(updated, sections, subjects);
  };

  const addSection = () => {
    if (!newSection.trim()) return;
    if (sections.includes(newSection.trim())) {
      toast.error("Section already exists");
      return;
    }
    const updated = [...sections, newSection.trim()];
    setSections(updated);
    saveConfig(classes, updated, subjects);
    setNewSection("");
    toast.success(`Section "${newSection.trim()}" added`);
  };

  const removeSection = (sec: string) => {
    const updated = sections.filter((s) => s !== sec);
    setSections(updated);
    saveConfig(classes, updated, subjects);
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) {
      toast.error("Subject already exists");
      return;
    }
    const updated = [...subjects, newSubject.trim()];
    setSubjects(updated);
    saveConfig(classes, sections, updated);
    setNewSubject("");
    toast.success(`Subject "${newSubject.trim()}" added`);
  };

  const removeSubject = (sub: string) => {
    const updated = subjects.filter((s) => s !== sub);
    setSubjects(updated);
    saveConfig(classes, sections, updated);
  };

  const addExamEntry = () =>
    setExamEntries((prev) => [
      ...prev,
      { id: `e${Date.now()}`, subject: "", date: "", time: "" },
    ]);
  const updateExamEntry = (
    i: number,
    field: "subject" | "date" | "time",
    value: string,
  ) => {
    setExamEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)),
    );
  };
  const removeExamEntry = (i: number) =>
    setExamEntries((prev) => prev.filter((_, idx) => idx !== i));

  const saveTimetable = () => {
    if (!examName.trim() || !examClass.trim()) {
      toast.error("Please enter exam name and class");
      return;
    }
    const validEntries = examEntries.filter(
      (e) => e.subject.trim() && e.date.trim(),
    );
    if (validEntries.length === 0) {
      toast.error("Please add at least one exam entry with subject and date");
      return;
    }
    const timetable: ExamTimetable = {
      id: editingTimetableId ?? `tt_${Date.now()}`,
      schoolId: selectedSchool,
      examName: examName.trim(),
      className: examClass,
      entries: validEntries,
      createdAt: new Date().toLocaleDateString("en-IN"),
    };
    const updated = editingTimetableId
      ? timetables.map((t) => (t.id === editingTimetableId ? timetable : t))
      : [...timetables, timetable];
    setTimetables(updated);
    saveStorage(timetableKey, updated);
    setExamName("");
    setExamClass("");
    setExamEntries([{ id: "e0", subject: "", date: "", time: "" }]);
    toast.success(
      editingTimetableId ? "Timetable updated!" : "Timetable created!",
    );
  };

  const deleteTimetable = (id: string) => {
    const updated = timetables.filter((t) => t.id !== id);
    setTimetables(updated);
    saveStorage(timetableKey, updated);
    toast.success("Timetable deleted");
  };

  return (
    <div className="space-y-6" data-ocid="mc.system_config.section">
      {/* School selector */}
      <div className="flex items-center gap-3 max-w-xs">
        <Label htmlFor="sc-school" className="text-xs shrink-0">
          School
        </Label>
        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
          <SelectTrigger
            id="sc-school"
            data-ocid="mc.system_config.school_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCHOOLS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Classes */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap
                size={13}
                style={{ color: "oklch(0.48 0.14 280)" }}
              />
              Classes ({classes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="new-class"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="e.g. Class 12-A"
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && addClass()}
                data-ocid="mc.system_config.class_input"
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={addClass}
                style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
                data-ocid="mc.system_config.add_class_button"
              >
                <Plus size={13} />
              </Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <Check size={11} style={{ color: "oklch(0.48 0.14 280)" }} />
                  <span className="flex-1 text-xs font-medium">{cls}</span>
                  {!DEFAULT_CLASSES.includes(cls) && (
                    <button
                      type="button"
                      onClick={() => removeClass(cls)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid3X3 size={13} style={{ color: "oklch(0.48 0.14 280)" }} />
              Sections ({sections.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="new-section"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g. E"
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && addSection()}
                data-ocid="mc.system_config.section_input"
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={addSection}
                style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
                data-ocid="mc.system_config.add_section_button"
              >
                <Plus size={13} />
              </Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {sections.map((sec) => (
                <div
                  key={sec}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <Layers size={11} style={{ color: "oklch(0.48 0.14 280)" }} />
                  <span className="flex-1 text-xs font-medium">
                    Section {sec}
                  </span>
                  {!DEFAULT_SECTIONS.includes(sec) && (
                    <button
                      type="button"
                      onClick={() => removeSection(sec)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen size={13} style={{ color: "oklch(0.48 0.14 280)" }} />
              Subjects ({subjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="new-subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Chemistry"
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && addSubject()}
                data-ocid="mc.system_config.subject_input"
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={addSubject}
                style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
                data-ocid="mc.system_config.add_subject_button"
              >
                <Plus size={13} />
              </Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {subjects.map((sub) => (
                <div
                  key={sub}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <Check size={11} style={{ color: "oklch(0.48 0.14 280)" }} />
                  <span className="flex-1 text-xs font-medium">{sub}</span>
                  {!DEFAULT_SUBJECTS.includes(sub) && (
                    <button
                      type="button"
                      onClick={() => removeSubject(sub)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Timetable */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings size={14} style={{ color: "oklch(0.48 0.14 280)" }} />
            Exam Timetable Management
          </CardTitle>
          <CardDescription className="text-xs">
            Create and manage exam schedules with class, subjects, dates and
            times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exam-name" className="text-xs mb-1 block">
                Exam Name
              </Label>
              <Input
                id="exam-name"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Half Yearly Exam 2026"
                className="h-9 text-sm"
                data-ocid="mc.system_config.exam_name_input"
              />
            </div>
            <div>
              <Label htmlFor="exam-class" className="text-xs mb-1 block">
                Class
              </Label>
              <Select value={examClass} onValueChange={setExamClass}>
                <SelectTrigger
                  id="exam-class"
                  data-ocid="mc.system_config.exam_class_select"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Exam Schedule Entries</Label>
              <button
                type="button"
                onClick={addExamEntry}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: "oklch(0.48 0.14 280)" }}
              >
                <Plus size={11} />
                Add Entry
              </button>
            </div>
            {examEntries.map((entry, i) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-4">
                  <Input
                    id={`entry-subject-${i}`}
                    value={entry.subject}
                    onChange={(e) =>
                      updateExamEntry(i, "subject", e.target.value)
                    }
                    placeholder="Subject"
                    className="h-8 text-xs"
                    data-ocid={`mc.system_config.exam_subject.${i + 1}`}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    id={`entry-date-${i}`}
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateExamEntry(i, "date", e.target.value)}
                    className="h-8 text-xs"
                    data-ocid={`mc.system_config.exam_date.${i + 1}`}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    id={`entry-time-${i}`}
                    type="time"
                    value={entry.time}
                    onChange={(e) => updateExamEntry(i, "time", e.target.value)}
                    className="h-8 text-xs"
                    data-ocid={`mc.system_config.exam_time.${i + 1}`}
                  />
                </div>
                {examEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExamEntry(i)}
                    className="col-span-1 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={saveTimetable}
            style={{ background: "oklch(0.48 0.14 280)", color: "white" }}
            data-ocid="mc.system_config.save_timetable_button"
          >
            {editingTimetableId ? "Update Timetable" : "Save Timetable"}
          </Button>

          {/* Existing timetables */}
          {timetables.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saved Timetables
              </p>
              {timetables.map((tt) => (
                <div
                  key={tt.id}
                  className="rounded-lg border border-border p-3 space-y-2"
                  data-ocid={`mc.system_config.timetable.${tt.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {tt.examName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {tt.className}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {tt.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTimetableId(tt.id);
                        setExamName(tt.examName);
                        setExamClass(tt.className);
                        setExamEntries(
                          tt.entries.map((e, i) => ({
                            id: e.id ?? `e${i}`,
                            subject: e.subject,
                            date: e.date,
                            time: e.time,
                          })),
                        );
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTimetable(tt.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {tt.entries.map((e, ei) => (
                      <div
                        key={`${tt.id}-e-${ei}`}
                        className="flex items-center gap-3 text-xs text-muted-foreground"
                      >
                        <span className="font-medium text-foreground w-28 truncate">
                          {e.subject}
                        </span>
                        <span>{e.date}</span>
                        {e.time && <span>{e.time}</span>}
                      </div>
                    ))}
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
