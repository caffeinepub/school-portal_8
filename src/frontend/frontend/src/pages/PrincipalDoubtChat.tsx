import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/data/mockData";
import { ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

export interface DoubtMessage {
  id: string;
  text: string;
  sentAt: string;
  edited: boolean;
}

export interface PrincipalReply {
  id: string;
  parentMessageId: string;
  text: string;
  sentAt: string;
}

function loadMessages(principalId: string, studentId: number): DoubtMessage[] {
  try {
    const raw = localStorage.getItem(
      `lords_doubts_${principalId}_${studentId}`,
    );
    if (raw) return JSON.parse(raw) as DoubtMessage[];
    // Fallback: legacy key (pre-multi-principal)
    const legacyRaw = localStorage.getItem(`lords_doubts_${studentId}`);
    if (legacyRaw) return JSON.parse(legacyRaw) as DoubtMessage[];
  } catch {}
  return [];
}

export function loadReplies(
  principalId: string,
  studentId: number,
): PrincipalReply[] {
  try {
    const raw = localStorage.getItem(
      `lords_replies_${principalId}_${studentId}`,
    );
    if (raw) return JSON.parse(raw) as PrincipalReply[];
    // Fallback: legacy key
    const legacyRaw = localStorage.getItem(`lords_replies_${studentId}`);
    if (legacyRaw) return JSON.parse(legacyRaw) as PrincipalReply[];
  } catch {}
  return [];
}

function saveReplies(
  principalId: string,
  studentId: number,
  replies: PrincipalReply[],
) {
  localStorage.setItem(
    `lords_replies_${principalId}_${studentId}`,
    JSON.stringify(replies),
  );
}

interface Props {
  students: Student[];
  principalId: string;
}

export default function PrincipalDoubtChat({ students, principalId }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, PrincipalReply[]>>(
    () => {
      const map: Record<number, PrincipalReply[]> = {};
      for (const s of students) map[s.id] = loadReplies(principalId, s.id);
      return map;
    },
  );
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const studentsWithDoubts = students
    .map((s) => ({ student: s, messages: loadMessages(principalId, s.id) }))
    .filter((x) => x.messages.length > 0);

  const handleSendReply = (studentId: number, messageId: string) => {
    const text = (replyText[messageId] ?? "").trim();
    if (!text) return;
    const newReply: PrincipalReply = {
      id: `${Date.now()}-${Math.random()}`,
      parentMessageId: messageId,
      text,
      sentAt: new Date().toISOString(),
    };
    const updated = [...(replies[studentId] ?? []), newReply];
    const next = { ...replies, [studentId]: updated };
    setReplies(next);
    saveReplies(principalId, studentId, updated);
    setReplyText((prev) => ({ ...prev, [messageId]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Doubt Chat</h2>
          <p className="text-xs text-gray-500">
            Messages from parents — reply to each one
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
          {studentsWithDoubts.map(({ student, messages }, idx) => {
            const studentReplies = replies[student.id] ?? [];
            return (
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
                    <div className="border-t border-indigo-50 pt-3 space-y-4">
                      {messages.map((msg, mIdx) => {
                        const msgReplies = studentReplies.filter(
                          (r) => r.parentMessageId === msg.id,
                        );
                        return (
                          <div
                            key={msg.id}
                            className="space-y-2"
                            data-ocid={`principal_doubt.message.${mIdx + 1}`}
                          >
                            {/* Parent message */}
                            <div className="flex justify-start">
                              <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
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
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs font-medium text-indigo-600">
                                    {student.name}'s parent
                                  </span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(msg.sentAt).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Principal replies */}
                            {msgReplies.map((reply) => (
                              <div key={reply.id} className="flex justify-end">
                                <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                  <p className="text-sm leading-relaxed">
                                    {reply.text}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-indigo-200 text-xs font-medium">
                                      Principal
                                    </span>
                                    <span className="text-indigo-300">·</span>
                                    <span className="text-indigo-200 text-xs">
                                      {new Date(reply.sentAt).toLocaleString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Reply input */}
                            <div className="flex gap-2 items-end pl-2">
                              <Textarea
                                value={replyText[msg.id] ?? ""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [msg.id]: e.target.value,
                                  }))
                                }
                                placeholder="Reply to this message..."
                                className="flex-1 resize-none text-sm min-h-[40px] max-h-[100px]"
                                rows={1}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply(student.id, msg.id);
                                  }
                                }}
                                data-ocid={`principal_doubt.reply_input.${mIdx + 1}`}
                              />
                              <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 h-10 px-3"
                                onClick={() =>
                                  handleSendReply(student.id, msg.id)
                                }
                                disabled={!(replyText[msg.id] ?? "").trim()}
                                data-ocid={`principal_doubt.reply_send.${mIdx + 1}`}
                              >
                                <Send size={14} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
