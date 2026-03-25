import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NotebookPen } from "lucide-react";
import { useState } from "react";
import type { DiaryEntry } from "./PrincipalDiaryPage";

interface Props {
  studentClass: string;
  principalId: string;
}

function loadDiary(principalId: string): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(`diary_${principalId}`);
    if (raw) return JSON.parse(raw) as DiaryEntry[];
  } catch {}
  return [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ParentDiaryView({ studentClass, principalId }: Props) {
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const allEntries = loadDiary(principalId);
  const entries = allEntries
    .filter((e) => e.class === studentClass)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (entries.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="diary.empty_state"
      >
        <NotebookPen className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No diary entries yet for your class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="diary.section">
      {entries.map((entry, i) => (
        <Card
          key={entry.id}
          className="border shadow-sm"
          data-ocid={`diary.item.${i + 1}`}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {formatDate(entry.date)}
              </span>
              <Badge variant="secondary">Class {entry.class}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {entry.subjects.map((s) => (
                <div
                  key={s.subject}
                  className="bg-muted/50 rounded-md px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {s.subject}:
                  </span>{" "}
                  <span className="text-muted-foreground">{s.homework}</span>
                </div>
              ))}
            </div>

            {entry.photoBase64 && (
              <button
                type="button"
                onClick={() => setZoomedPhoto(entry.photoBase64 ?? null)}
                className="border-0 bg-transparent p-0 w-full"
              >
                <img
                  src={entry.photoBase64}
                  alt="Diary entry"
                  className="w-full max-h-64 rounded-lg border object-cover cursor-pointer"
                />
              </button>
            )}
          </CardContent>
        </Card>
      ))}

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
