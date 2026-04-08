import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SCHOOLS } from "@/data/schools";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StudentRecord {
  id: number;
  name: string;
  class: string;
  rollNo?: number;
}

interface ParentMessage {
  id: number;
  studentId: number;
  message: string;
  timestamp: string;
  category: string;
  read: boolean;
  sentBy: string;
}

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

const TEAL = "oklch(var(--portal-teachers))";
const TEAL_BG = "oklch(var(--portal-teachers) / 0.1)";

const MESSAGE_CATEGORIES = [
  "Behavior",
  "Academic Progress",
  "Attendance",
  "General",
  "Fees",
  "Achievement",
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Behavior: {
    bg: "oklch(0.55 0.22 25 / 0.1)",
    color: "oklch(0.55 0.22 25)",
  },
  "Academic Progress": {
    bg: "oklch(0.52 0.18 255 / 0.1)",
    color: "oklch(0.52 0.18 255)",
  },
  Attendance: {
    bg: "oklch(0.62 0.18 55 / 0.1)",
    color: "oklch(0.62 0.18 55)",
  },
  General: {
    bg: "oklch(var(--muted))",
    color: "oklch(var(--muted-foreground))",
  },
  Fees: {
    bg: "oklch(0.72 0.18 80 / 0.1)",
    color: "oklch(0.62 0.14 80)",
  },
  Achievement: {
    bg: "oklch(0.45 0.16 150 / 0.1)",
    color: "oklch(0.45 0.16 150)",
  },
};

interface Props {
  schoolId: string;
}

export default function ParentMessagesPage({ schoolId }: Props) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const students = loadStorage<StudentRecord[]>(
    `lords_students_${schoolId}`,
    [],
  );
  const classOptions = [...new Set(students.map((s) => s.class))].sort();

  const [filterClass, setFilterClass] = useState(classOptions[0] ?? "");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [category, setCategory] = useState(MESSAGE_CATEGORIES[3]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ParentMessage[]>([]);

  const filteredStudents = filterClass
    ? students.filter((s) => s.class === filterClass)
    : students;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudentId === null) return;
    const all = loadStorage<ParentMessage[]>(
      `lords_parent_messages_${schoolId}`,
      [],
    );
    setMessages(
      all
        .filter((m) => m.studentId === selectedStudentId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    );
  }, [selectedStudentId, schoolId]);

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Write a message first");
      return;
    }
    if (!selectedStudentId) {
      toast.error("Select a student");
      return;
    }
    setSending(true);

    const newMsg: ParentMessage = {
      id: Date.now(),
      studentId: selectedStudentId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      category,
      read: false,
      sentBy: "Teacher",
    };

    const key = `lords_parent_messages_${schoolId}`;
    const all = loadStorage<ParentMessage[]>(key, []);
    all.push(newMsg);
    saveStorage(key, all);

    setTimeout(() => {
      setSending(false);
      const updated = [newMsg, ...messages];
      setMessages(updated);
      toast.success(
        `Message sent to ${selectedStudent?.name ?? "parent"} — "${category}"`,
      );
      setMessage("");
      window.dispatchEvent(new Event("storage"));
    }, 500);
  };

  const unreadCount = (studentId: number) => {
    const all = loadStorage<ParentMessage[]>(
      `lords_parent_messages_${schoolId}`,
      [],
    );
    return all.filter((m) => m.studentId === studentId && !m.read).length;
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Parent Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {school?.shortName} — Direct communication to parents
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)] min-h-96">
        {/* Student list panel */}
        <div className="w-52 shrink-0 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none"
            >
              <option value="">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 px-3">
                No students found
              </p>
            ) : (
              filteredStudents.map((student) => {
                const unread = unreadCount(student.id);
                const isSelected = selectedStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    data-ocid={`parent_messages.student_${student.id}`}
                    onClick={() => setSelectedStudentId(student.id)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors hover:bg-muted/40 border-b border-border/40 last:border-0"
                    style={isSelected ? { background: TEAL_BG } : {}}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{
                        background: isSelected
                          ? TEAL
                          : "oklch(var(--muted-foreground))",
                      }}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={
                          isSelected
                            ? { color: TEAL }
                            : { color: "oklch(var(--foreground))" }
                        }
                      >
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.class}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span
                        className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ background: TEAL }}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message panel */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          {!selectedStudent ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
              <MessageCircle size={48} className="opacity-30" />
              <p className="text-sm font-medium">
                Select a student to message their parents
              </p>
            </div>
          ) : (
            <>
              {/* Student header */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-border"
                style={{ background: TEAL_BG }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: TEAL }}
                >
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEAL }}>
                    {selectedStudent.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStudent.class}
                    {selectedStudent.rollNo
                      ? ` · Roll ${selectedStudent.rollNo}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Message history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No messages yet. Send the first message below.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const cat =
                      CATEGORY_COLORS[msg.category] ?? CATEGORY_COLORS.General;
                    return (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: cat.bg, color: cat.color }}
                          >
                            {msg.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!msg.read && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: TEAL_BG, color: TEAL }}
                            >
                              Unread
                            </span>
                          )}
                        </div>
                        <div className="bg-muted/40 rounded-lg px-3 py-2.5 text-sm text-foreground">
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose */}
              <div className="border-t border-border p-3 space-y-3">
                {/* Category selector */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {MESSAGE_CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.General;
                    return (
                      <button
                        key={cat}
                        type="button"
                        data-ocid={`parent_messages.category_${cat.toLowerCase().replace(/\s+/g, "_")}`}
                        onClick={() => setCategory(cat)}
                        className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all shrink-0"
                        style={
                          category === cat
                            ? {
                                background: cfg.bg,
                                color: cfg.color,
                                outline: `1.5px solid ${cfg.color}`,
                              }
                            : {
                                background: "oklch(var(--muted))",
                                color: "oklch(var(--muted-foreground))",
                              }
                        }
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Write a message about ${selectedStudent.name}...`}
                    data-ocid="parent_messages.message_textarea"
                    rows={2}
                    className="flex-1 text-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    data-ocid="parent_messages.send_button"
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="h-10 px-4 shrink-0"
                    style={{ background: TEAL, color: "white" }}
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
