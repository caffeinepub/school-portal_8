// @ts-nocheck
import { chatMessages, teachers } from "@/data/mockData";
import { Send } from "lucide-react";
import { useState } from "react";

export default function TeacherChat() {
  const [selected, setSelected] = useState(teachers[0].id);
  const [input, setInput] = useState("");
  const messages = chatMessages[selected] || [];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "70vh" }}
    >
      <div className="flex h-full">
        <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Teachers</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {teachers.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selected === t.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                  {t.initials}
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-medium ${selected === t.id ? "text-blue-700" : "text-gray-800"}`}
                  >
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400">{t.subject}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">
              {teachers.find((t) => t.id === selected)?.name}
            </p>
            <p className="text-xs text-gray-400">
              {teachers.find((t) => t.id === selected)?.subject}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={`${msg.time}-${msg.from}`}
                className={`flex ${msg.isStudent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isStudent
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${msg.isStudent ? "text-blue-200" : "text-gray-400"}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setInput("")}
              className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
