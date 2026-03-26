import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/data/mockData";
import { FileText } from "lucide-react";

interface Props {
  student: Student;
  principalId: string;
}

type TestMarksData = Record<
  string,
  Record<string, Record<string, Record<string, string>>>
>;

function loadTestMarks(principalId: string): TestMarksData {
  try {
    const raw = localStorage.getItem(`lords_test_marks_${principalId}`);
    if (raw) return JSON.parse(raw) as TestMarksData;
  } catch {}
  return {};
}

export default function ParentTestMarksView({ student, principalId }: Props) {
  const data = loadTestMarks(principalId);
  const classData = data[student.class] ?? {};
  const examNames = Object.keys(classData);

  if (examNames.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="parent_test_marks.empty_state"
      >
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No test marks have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="parent_test_marks.section">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Test Marks</h3>
        <Badge variant="secondary">{student.name}</Badge>
      </div>

      {examNames.map((examName) => {
        const studentMarks = classData[examName]?.[String(student.id)] ?? {};
        const subjects = Object.keys(studentMarks);

        if (subjects.length === 0) return null;

        return (
          <Card key={examName} className="border shadow-sm">
            <CardContent className="p-0">
              <div className="px-4 py-2 border-b bg-muted/30">
                <span className="font-semibold text-sm">{examName}</span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, i) => (
                      <TableRow
                        key={subject}
                        data-ocid={`parent_test_marks.row.${i + 1}`}
                      >
                        <TableCell className="font-medium">{subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {studentMarks[subject] || "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
