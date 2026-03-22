import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Student } from "@/data/mockData";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useState } from "react";

interface DoubtMessage {
  id: string;
  text: string;
  sentAt: string;
  edited: boolean;
}

function loadMessages(studentId: number): DoubtMessage[] {
  try {
    const raw = localStorage.getItem(`lords_doubts_${studentId}`);
    if (raw) return JSON.parse(raw) as DoubtMessage[];
  } catch {}
  return [];
}

interface Props {
  students: Student[];
}

export default function PrincipalDoubtChat({ students }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const studentsWithDoubts = students
    .map((s) => ({ student: s, messages: loadMessages(s.id) }))
    .filter((x) => x.messages.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Doubt Chat</h2>
          <p className="text-xs text-gray-500">
            Messages sent by parents to the principal
          </p>
        </div>
      </div>

      {studentsWithDoubts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="principal_doubt.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-indigo-300" />
          </div>
          <p className="text-gray-500 font-medium">
            No doubt messages received yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Messages from parents will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="principal_doubt.list">
          {studentsWithDoubts.map(({ student, messages }, idx) => (
            <Card
              key={student.id}
              className="border border-indigo-100 shadow-sm"
              data-ocid={`principal_doubt.item.${idx + 1}`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-indigo-50 transition-colors rounded-lg"
                onClick={() =>
                  setExpanded(expanded === student.id ? null : student.id)
                }
                data-ocid={`principal_doubt.toggle.${idx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Class {student.class} · Roll {student.rollNo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white border-0 text-xs">
                    {messages.length}{" "}
                    {messages.length === 1 ? "message" : "messages"}
                  </Badge>
                  {expanded === student.id ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {expanded === student.id && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="border-t border-indigo-50 pt-3 space-y-3">
                    {messages.map((msg, mIdx) => (
                      <div
                        key={msg.id}
                        className="bg-gray-50 rounded-xl px-4 py-3"
                        data-ocid={`principal_doubt.message.${mIdx + 1}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-800 leading-relaxed flex-1">
                            {msg.text}
                          </p>
                          {msg.edited && (
                            <span className="text-xs text-gray-400 shrink-0">
                              (edited)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-indigo-600">
                            {student.name}'s parent
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.sentAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
