import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBackendSync } from "@/hooks/useBackendSync";
import type { PrincipalReply } from "@/pages/PrincipalDoubtChat";
import { loadReplies } from "@/pages/PrincipalDoubtChat";
import { Check, MessageCircle, Pencil, Send, X } from "lucide-react";
import { useState } from "react";

interface DoubtMessage {
  id: string;
  text: string;
  sentAt: string;
  edited: boolean;
}

interface Props {
  studentId: number;
  studentName: string;
  principalId?: string;
}

function loadMessages(principalId: string, studentId: number): DoubtMessage[] {
  try {
    const raw = localStorage.getItem(
      `lords_doubts_${principalId}_${studentId}`,
    );
    if (raw) return JSON.parse(raw) as DoubtMessage[];
    // Fallback: legacy key
    const legacyRaw = localStorage.getItem(`lords_doubts_${studentId}`);
    if (legacyRaw) return JSON.parse(legacyRaw) as DoubtMessage[];
  } catch {}
  return [];
}

function saveMessages(
  principalId: string,
  studentId: number,
  messages: DoubtMessage[],
) {
  localStorage.setItem(
    `lords_doubts_${principalId}_${studentId}`,
    JSON.stringify(messages),
  );
}

type TimelineItem =
  | { kind: "parent"; msg: DoubtMessage }
  | { kind: "principal"; reply: PrincipalReply };

export default function ParentDoubtChat({
  studentId,
  studentName,
  principalId = "default",
}: Props) {
  const { syncToBackend } = useBackendSync();
  const [messages, setMessages] = useState<DoubtMessage[]>(() =>
    loadMessages(principalId, studentId),
  );
  const [replies] = useState<PrincipalReply[]>(() =>
    loadReplies(principalId, studentId),
  );
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newMsg: DoubtMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text: trimmed,
      sentAt: new Date().toISOString(),
      edited: false,
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(principalId, studentId, updated);
    syncToBackend(`lords_doubts_${principalId}_${studentId}`, updated).catch(
      () => {},
    );
    setInputText("");
  };

  const startEdit = (msg: DoubtMessage) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const updated = messages.map((m) =>
      m.id === id ? { ...m, text: trimmed, edited: true } : m,
    );
    setMessages(updated);
    saveMessages(principalId, studentId, updated);
    syncToBackend(`lords_doubts_${principalId}_${studentId}`, updated).catch(
      () => {},
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const timeline: TimelineItem[] = [
    ...messages.map((msg) => ({ kind: "parent" as const, msg })),
    ...replies.map((reply) => ({ kind: "principal" as const, reply })),
  ].sort((a, b) => {
    const ta = a.kind === "parent" ? a.msg.sentAt : a.reply.sentAt;
    const tb = b.kind === "parent" ? b.msg.sentAt : b.reply.sentAt;
    return new Date(ta).getTime() - new Date(tb).getTime();
  });

  const renderItem = (item: TimelineItem, idx: number) => {
    if (item.kind === "principal") {
      const { reply } = item;
      return (
        <div
          key={reply.id}
          className="flex justify-start"
          data-ocid={`doubt_chat.reply.${idx + 1}`}
        >
          <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed">
              {reply.text}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-semibold text-indigo-600">
                Principal
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {new Date(reply.sentAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    const { msg } = item;
    return (
      <div
        key={msg.id}
        className="flex justify-end"
        data-ocid={`doubt_chat.item.${idx + 1}`}
      >
        <div className="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          {editingId === msg.id ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="text-sm bg-white text-gray-800 border-0 rounded-lg resize-none min-h-[60px]"
                data-ocid="doubt_chat.textarea"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={cancelEdit}
                  data-ocid="doubt_chat.cancel_button"
                >
                  <X size={12} className="mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-white text-indigo-700 hover:bg-gray-100"
                  onClick={() => saveEdit(msg.id)}
                  data-ocid="doubt_chat.save_button"
                >
                  <Check size={12} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-between mt-1.5 gap-3">
                <span className="text-indigo-200 text-xs">
                  {new Date(msg.sentAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.edited && " · edited"}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(msg)}
                  className="text-indigo-200 hover:text-white transition-colors"
                  data-ocid={`doubt_chat.edit_button.${idx + 1}`}
                >
                  <Pencil size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "500px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <MessageCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Doubt Chat</h3>
          <p className="text-xs text-gray-500">
            Send your doubts to the Principal
          </p>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1"
        style={{ maxHeight: "400px" }}
        data-ocid="doubt_chat.list"
      >
        {timeline.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="doubt_chat.empty_state"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <MessageCircle size={26} className="text-indigo-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">
              No messages yet. Send your first doubt to the principal.
            </p>
          </div>
        ) : (
          timeline.map((item, idx) => renderItem(item, idx))
        )}
      </div>

      <div className="flex gap-2 items-end border-t border-gray-100 pt-3">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type your doubt for ${studentName}'s principal...`}
          className="flex-1 resize-none text-sm min-h-[44px] max-h-[120px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          data-ocid="doubt_chat.input"
        />
        <Button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-4"
          data-ocid="doubt_chat.submit_button"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
