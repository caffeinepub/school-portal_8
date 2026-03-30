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
import { useBackendSync } from "@/hooks/useBackendSync";
import { useClasses } from "@/hooks/useClasses";
import { downloadCSV } from "@/utils/downloadCSV";
import { Check, FileText, Plus, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Storage: lords_test_marks_{principalId}
// Shape: { [className]: { [examName]: { [studentId]: { [subject]: string } } } }
type TestMarksData = Record<
  string,
  Record<string, Record<string, Record<string, string>>>
>;

interface Props {
  principalId: string;
  students: Student[];
}

function loadTestMarks(principalId: string): TestMarksData {
  try {
    const raw = localStorage.getItem(`lords_test_marks_${principalId}`);
    if (raw) return JSON.parse(raw) as TestMarksData;
  } catch {}
  return {};
}

function saveTestMarks(principalId: string, data: TestMarksData) {
  localStorage.setItem(`lords_test_marks_${principalId}`, JSON.stringify(data));
}

const EXAM_NAMES = [
  "Unit Test 1",
  "Unit Test 2",
  "Unit Test 3",
  "Half Yearly Exam",
  "Annual Exam",
  "Pre-Board Exam",
];

export default function PrincipalTestMarksPage({
  principalId,
  students,
}: Props) {
  const { classes, addClass } = useClasses(principalId, students);
  const { syncToBackend, loadFromBackend } = useBackendSync();
  const [allData, setAllData] = useState<TestMarksData>(() =>
    loadTestMarks(principalId),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadFromBackend is stable
  useEffect(() => {
    loadFromBackend(`lords_test_marks_${principalId}`)
      .then((data) => {
        if (data && typeof data === "object" && !Array.isArray(data)) {
          localStorage.setItem(
            `lords_test_marks_${principalId}`,
            JSON.stringify(data),
          );
          setAllData(data as TestMarksData);
        }
      })
      .catch(() => {});
  }, [principalId]);
  const [selectedClass, setSelectedClass] = useState(classes[0] ?? "");
  const [examName, setExamName] = useState("");
  const [customExamName, setCustomExamName] = useState("");
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const effectiveExamName =
    examName === "__custom__" ? customExamName : examName;

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

  const classStudents = useMemo(
    () => students.filter((s) => s.class === selectedClass),
    [students, selectedClass],
  );

  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const s of classStudents) {
      if (s.marks) {
        for (const key of Object.keys(s.marks)) {
          if (
            key !== "pt1" &&
            key !== "pt2" &&
            key !== "pt3" &&
            key !== "term1" &&
            key !== "term2" &&
            key !== "total" &&
            key !== "grade" &&
            key !== "rank"
          ) {
            set.add(key);
          }
        }
      }
    }
    // If no marks subjects, use defaults
    if (set.size === 0) {
      for (const sub of [
        "Hindi",
        "English",
        "Mathematics",
        "Science",
        "Social Science",
      ]) {
        set.add(sub);
      }
    }
    return Array.from(set);
  }, [classStudents]);

  const getMarkValue = (studentId: number, subject: string): string => {
    return (
      allData[selectedClass]?.[effectiveExamName]?.[String(studentId)]?.[
        subject
      ] ?? ""
    );
  };

  const setMarkValue = (studentId: number, subject: string, value: string) => {
    if (!selectedClass || !effectiveExamName) return;
    setAllData((prev) => ({
      ...prev,
      [selectedClass]: {
        ...(prev[selectedClass] ?? {}),
        [effectiveExamName]: {
          ...(prev[selectedClass]?.[effectiveExamName] ?? {}),
          [String(studentId)]: {
            ...(prev[selectedClass]?.[effectiveExamName]?.[String(studentId)] ??
              {}),
            [subject]: value,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    if (!selectedClass) {
      toast.error("Select a class.");
      return;
    }
    if (!effectiveExamName.trim()) {
      toast.error("Enter exam name.");
      return;
    }
    saveTestMarks(principalId, allData);
    syncToBackend(`lords_test_marks_${principalId}`, allData).catch(() => {});
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `lords_test_marks_${principalId}`,
        newValue: JSON.stringify(allData),
      }),
    );
    toast.success(
      `Test marks for "${effectiveExamName}" (${selectedClass}) saved!`,
    );
    const csvDate = new Date().toISOString().split("T")[0];
    const headers = ["Student Name", ...subjects];
    const rows = classStudents.map((student) => [
      student.name,
      ...subjects.map((sub) => getMarkValue(student.id, sub)),
    ]);
    downloadCSV(
      `TestMarks_${selectedClass}_${effectiveExamName}_${csvDate}.csv`,
      headers,
      rows,
    );
  };

  const showTable = selectedClass && effectiveExamName.trim();

  return (
    <div className="space-y-6" data-ocid="test_marks.section">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Test Marks</h2>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <div className="flex items-center gap-1.5">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger
                    data-ocid="test_marks.select"
                    className="flex-1"
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
                {showAddClass ? (
                  <div className="flex items-center gap-1">
                    <Input
                      className="h-8 w-24 text-sm"
                      placeholder="Class"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                      autoFocus
                      data-ocid="test_marks.input"
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleAddClass}
                      data-ocid="test_marks.confirm_button"
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
                      data-ocid="test_marks.cancel_button"
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
                    data-ocid="test_marks.open_modal_button"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Class
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Exam Name</Label>
              <Select value={examName} onValueChange={setExamName}>
                <SelectTrigger data-ocid="test_marks.select">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_NAMES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Custom...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {examName === "__custom__" && (
              <div className="space-y-1.5">
                <Label>Custom Exam Name</Label>
                <Input
                  placeholder="Enter exam name"
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  data-ocid="test_marks.input"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!showTable ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="test_marks.empty_state"
        >
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Select a class and exam name to enter marks.
          </p>
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              Marks for <Badge variant="secondary">{selectedClass}</Badge>
              <Badge variant="outline">{effectiveExamName}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44 sticky left-0 bg-background">
                    Student Name
                  </TableHead>
                  {subjects.map((sub) => (
                    <TableHead key={sub} className="w-28">
                      {sub}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={subjects.length + 1}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No students in this class.
                    </TableCell>
                  </TableRow>
                ) : (
                  classStudents.map((student, i) => (
                    <TableRow
                      key={student.id}
                      data-ocid={`test_marks.row.${i + 1}`}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background">
                        {student.name}
                      </TableCell>
                      {subjects.map((sub) => (
                        <TableCell key={sub}>
                          <Input
                            className="w-20"
                            placeholder="—"
                            value={getMarkValue(student.id, sub)}
                            onChange={(e) =>
                              setMarkValue(student.id, sub, e.target.value)
                            }
                            data-ocid="test_marks.input"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {showTable && (
        <div className="flex justify-end">
          <Button onClick={handleSave} data-ocid="test_marks.submit_button">
            <Save className="h-4 w-4 mr-2" /> Save & Send to Parents
          </Button>
        </div>
      )}
    </div>
  );
}
