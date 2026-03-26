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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/data/mockData";
import { useClasses } from "@/hooks/useClasses";
import { downloadCSV } from "@/utils/downloadCSV";
import { Check, ClipboardList, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface TimetableEntry {
  id: string;
  examName: string;
  subject: string;
  date: string;
  day: string;
  time: string;
  venue: string;
}

type TimetableData = Record<string, TimetableEntry[]>;

interface Props {
  principalId: string;
  students: Student[];
}

function loadTimetable(principalId: string): TimetableData {
  try {
    const raw = localStorage.getItem(`lords_exam_timetable_${principalId}`);
    if (raw) return JSON.parse(raw) as TimetableData;
  } catch {}
  return {};
}

function saveTimetable(principalId: string, data: TimetableData) {
  localStorage.setItem(
    `lords_exam_timetable_${principalId}`,
    JSON.stringify(data),
  );
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function PrincipalExamTimetablePage({
  principalId,
  students,
}: Props) {
  const { classes, addClass } = useClasses(principalId, students);
  const [allData, setAllData] = useState<TimetableData>(() =>
    loadTimetable(principalId),
  );
  const [selectedClass, setSelectedClass] = useState(classes[0] ?? "");
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const entries: TimetableEntry[] = allData[selectedClass] ?? [];

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
    setSelectedClass(trimmed);
    setNewClassName("");
    setShowAddClass(false);
    toast.success(`Class "${trimmed}" added.`);
  };

  const updateEntry = (
    id: string,
    field: keyof TimetableEntry,
    value: string,
  ) => {
    setAllData((prev) => ({
      ...prev,
      [selectedClass]: (prev[selectedClass] ?? []).map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    }));
  };

  const addRow = () => {
    const newEntry: TimetableEntry = {
      id: Date.now().toString(),
      examName: "",
      subject: "",
      date: "",
      day: "",
      time: "",
      venue: "",
    };
    setAllData((prev) => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] ?? []), newEntry],
    }));
  };

  const deleteRow = (id: string) => {
    setAllData((prev) => ({
      ...prev,
      [selectedClass]: (prev[selectedClass] ?? []).filter((e) => e.id !== id),
    }));
  };

  const handleSave = () => {
    if (!selectedClass) {
      toast.error("Please select a class first.");
      return;
    }
    saveTimetable(principalId, allData);
    toast.success(
      `Exam timetable for ${selectedClass} saved and sent to parents!`,
    );
    const csvDate = new Date().toISOString().split("T")[0];
    downloadCSV(
      `ExamTimetable_${selectedClass}_${csvDate}.csv`,
      ["Exam Name", "Subject", "Date", "Day", "Time", "Venue"],
      entries.map((e) => [
        e.examName,
        e.subject,
        e.date,
        e.day,
        e.time,
        e.venue,
      ]),
    );
  };

  return (
    <div className="space-y-6" data-ocid="exam_timetable.section">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Exam Timetable</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Class:</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-44" data-ocid="exam_timetable.select">
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
            {showAddClass ? (
              <div className="flex items-center gap-1">
                <Input
                  className="h-8 w-28 text-sm"
                  placeholder="Class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                  autoFocus
                  data-ocid="exam_timetable.input"
                />
                <Button
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleAddClass}
                  data-ocid="exam_timetable.confirm_button"
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
                  data-ocid="exam_timetable.cancel_button"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowAddClass(true)}
                data-ocid="exam_timetable.open_modal_button"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Class
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={addRow}
            data-ocid="exam_timetable.secondary_button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
          <Button onClick={handleSave} data-ocid="exam_timetable.submit_button">
            <Save className="h-4 w-4 mr-1" /> Save Timetable
          </Button>
        </div>
      </div>

      {!selectedClass ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="exam_timetable.empty_state"
        >
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Select a class to manage its exam timetable.
          </p>
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Timetable for <Badge variant="secondary">{selectedClass}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Exam Name</TableHead>
                  <TableHead className="w-32">Subject</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead className="w-32">Day</TableHead>
                  <TableHead className="w-28">Time</TableHead>
                  <TableHead className="w-32">Venue</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No entries yet. Click "Add Row" to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry, i) => (
                    <TableRow
                      key={entry.id}
                      data-ocid={`exam_timetable.row.${i + 1}`}
                    >
                      <TableCell>
                        <Input
                          value={entry.examName}
                          placeholder="e.g. Half Yearly"
                          onChange={(e) =>
                            updateEntry(entry.id, "examName", e.target.value)
                          }
                          data-ocid="exam_timetable.input"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.subject}
                          placeholder="Subject"
                          onChange={(e) =>
                            updateEntry(entry.id, "subject", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) =>
                            updateEntry(entry.id, "date", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.day}
                          onValueChange={(v) => updateEntry(entry.id, "day", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={entry.time}
                          onChange={(e) =>
                            updateEntry(entry.id, "time", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry.venue}
                          placeholder="Room / Hall"
                          onChange={(e) =>
                            updateEntry(entry.id, "venue", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRow(entry.id)}
                          className="text-destructive hover:text-destructive"
                          data-ocid="exam_timetable.delete_button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
