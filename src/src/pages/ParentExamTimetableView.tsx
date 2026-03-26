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
import { ClipboardList } from "lucide-react";
import type { TimetableEntry } from "./PrincipalExamTimetablePage";

interface Props {
  studentClass: string;
  principalId: string;
}

type TimetableData = Record<string, TimetableEntry[]>;

function loadTimetable(principalId: string): TimetableData {
  try {
    const raw = localStorage.getItem(`lords_exam_timetable_${principalId}`);
    if (raw) return JSON.parse(raw) as TimetableData;
  } catch {}
  return {};
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ParentExamTimetableView({
  studentClass,
  principalId,
}: Props) {
  const data = loadTimetable(principalId);
  const entries: TimetableEntry[] = data[studentClass] ?? [];

  if (entries.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="parent_exam_timetable.empty_state"
      >
        <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No exam timetable has been published yet.</p>
      </div>
    );
  }

  // Group by exam name
  const examGroups = entries.reduce<Record<string, TimetableEntry[]>>(
    (acc, entry) => {
      const key = entry.examName || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6" data-ocid="parent_exam_timetable.section">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Exam Timetable</h3>
        <Badge variant="secondary">{studentClass}</Badge>
      </div>

      {Object.entries(examGroups).map(([examName, rows]) => (
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
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Venue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow
                      key={row.id}
                      data-ocid={`parent_exam_timetable.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {row.subject || "—"}
                      </TableCell>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.day || "—"}</TableCell>
                      <TableCell>{formatTime(row.time)}</TableCell>
                      <TableCell>{row.venue || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
