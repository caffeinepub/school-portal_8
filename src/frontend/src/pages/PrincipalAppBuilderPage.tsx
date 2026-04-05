import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Award,
  Banknote,
  BookMarked,
  Bus,
  CalendarCheck,
  ChevronLeft,
  FileOutput,
  FlaskConical,
  GraduationCap,
  Heart,
  HeartHandshake,
  Loader2,
  Package,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type FieldType = "text" | "number" | "date" | "select" | "textarea";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

export interface CustomPanelDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: FieldDef[];
  createdAt: string;
  visibleToParents: boolean;
}

interface PanelRecord {
  id: string;
  panelId: string;
  data: Record<string, string>;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  actionPanelId?: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadPanels(principalId: string): CustomPanelDef[] {
  try {
    const raw = localStorage.getItem(`lords_dynamic_panels_${principalId}`);
    if (raw) return JSON.parse(raw) as CustomPanelDef[];
  } catch {}
  return [];
}

function savePanels(principalId: string, panels: CustomPanelDef[]) {
  try {
    const key = `lords_dynamic_panels_${principalId}`;
    localStorage.setItem(key, JSON.stringify(panels));
    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue: JSON.stringify(panels) }),
    );
  } catch {}
}

function loadRecords(principalId: string, panelId: string): PanelRecord[] {
  try {
    const raw = localStorage.getItem(
      `lords_panel_records_${principalId}_${panelId}`,
    );
    if (raw) return JSON.parse(raw) as PanelRecord[];
  } catch {}
  return [];
}

function saveRecords(
  principalId: string,
  panelId: string,
  records: PanelRecord[],
) {
  try {
    localStorage.setItem(
      `lords_panel_records_${principalId}_${panelId}`,
      JSON.stringify(records),
    );
  } catch {}
}

function loadChatHistory(principalId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`lords_appbuilder_chat_v2_${principalId}`);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {}
  return [];
}

function saveChatHistory(principalId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      `lords_appbuilder_chat_v2_${principalId}`,
      JSON.stringify(messages),
    );
  } catch {}
}

// ─── Field builder helpers ────────────────────────────────────────────────────

function makeField(
  label: string,
  type: FieldType,
  options?: string[],
): FieldDef {
  return {
    id: label.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    label,
    type,
    options,
    required: false,
  };
}

// ─── Template definitions ─────────────────────────────────────────────────────

interface TemplateDef {
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  fields: FieldDef[];
}

const TEMPLATES: TemplateDef[] = [
  {
    name: "Transport Tracker",
    icon: "Bus",
    description: "Track student bus routes and pickup/drop times",
    keywords: ["transport", "bus", "route", "vehicle"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Bus Number", "text"),
      makeField("Route", "text"),
      makeField("Driver Name", "text"),
      makeField("Pickup Time", "text"),
      makeField("Drop Time", "text"),
    ],
  },
  {
    name: "Fee Reminder",
    icon: "Banknote",
    description: "Manage fee payments and send reminders",
    keywords: ["fee", "fees", "payment", "reminder"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Fee Type", "text"),
      makeField("Amount", "number"),
      makeField("Due Date", "date"),
      makeField("Status", "select", ["Paid", "Pending", "Overdue"]),
      makeField("Notes", "textarea"),
    ],
  },
  {
    name: "Health Records",
    icon: "Heart",
    description: "Student health and medical records",
    keywords: ["health", "medical", "doctor", "medicine", "sick"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Date", "date"),
      makeField("Issue / Complaint", "text"),
      makeField("Treatment", "text"),
      makeField("Doctor Name", "text"),
      makeField("Follow-up Date", "date"),
    ],
  },
  {
    name: "Library Records",
    icon: "BookMarked",
    description: "Book issuance and library management",
    keywords: ["library", "book", "books", "reading", "borrow"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Book Title", "text"),
      makeField("Book Number", "text"),
      makeField("Issue Date", "date"),
      makeField("Return Date", "date"),
      makeField("Status", "select", ["Issued", "Returned", "Overdue"]),
    ],
  },
  {
    name: "Homework Tracker",
    icon: "Pencil",
    description: "Track homework assignments by class and subject",
    keywords: ["homework", "hw", "assignment", "task"],
    fields: [
      makeField("Class", "text"),
      makeField("Subject", "text"),
      makeField("Homework Description", "textarea"),
      makeField("Due Date", "date"),
      makeField("Status", "select", ["Assigned", "Submitted", "Pending"]),
    ],
  },
  {
    name: "Behavior Records",
    icon: "AlertCircle",
    description: "Track student behavior incidents and conduct",
    keywords: ["behavior", "behaviour", "conduct", "discipline", "incident"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Date", "date"),
      makeField("Incident Type", "select", ["Positive", "Warning", "Serious"]),
      makeField("Description", "textarea"),
      makeField("Action Taken", "text"),
    ],
  },
  {
    name: "Staff Management",
    icon: "UserCheck",
    description: "Manage staff records and information",
    keywords: ["staff", "teacher", "employee", "faculty"],
    fields: [
      makeField("Staff Name", "text"),
      makeField("Designation", "text"),
      makeField("Department", "text"),
      makeField("Phone", "text"),
      makeField("Email", "text"),
      makeField("Join Date", "date"),
      makeField("Status", "select", ["Active", "On Leave", "Resigned"]),
    ],
  },
  {
    name: "Events Calendar",
    icon: "Trophy",
    description: "School events, sports day, functions",
    keywords: ["event", "events", "sports", "sport", "function", "activity"],
    fields: [
      makeField("Event Name", "text"),
      makeField("Date", "date"),
      makeField("Venue", "text"),
      makeField("Class / Grade", "text"),
      makeField("Description", "textarea"),
      makeField("Status", "select", ["Upcoming", "Ongoing", "Completed"]),
    ],
  },
  {
    name: "Inventory",
    icon: "Package",
    description: "School inventory and stock management",
    keywords: ["inventory", "store", "stock", "supply", "supplies"],
    fields: [
      makeField("Item Name", "text"),
      makeField("Category", "text"),
      makeField("Quantity", "number"),
      makeField("Unit", "text"),
      makeField("Location", "text"),
      makeField("Last Updated", "date"),
      makeField("Notes", "textarea"),
    ],
  },
  {
    name: "Attendance Sheet",
    icon: "CalendarCheck",
    description: "Track daily student attendance",
    keywords: ["attendance", "absent", "present"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Date", "date"),
      makeField("Status", "select", ["Present", "Absent", "Late"]),
      makeField("Remarks", "text"),
    ],
  },
  {
    name: "Complaint Register",
    icon: "AlertCircle",
    description: "Log and track complaints and grievances",
    keywords: ["complaint", "grievance", "issue", "problem"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Date", "date"),
      makeField("Complaint Type", "text"),
      makeField("Description", "textarea"),
      makeField("Status", "select", ["Open", "In Progress", "Resolved"]),
      makeField("Action Taken", "text"),
    ],
  },
  {
    name: "Scholarship Records",
    icon: "Award",
    description: "Manage student scholarship applications and awards",
    keywords: ["scholarship", "award", "merit", "bursary"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Scholarship Name", "text"),
      makeField("Amount", "number"),
      makeField("Award Date", "date"),
      makeField("Status", "select", ["Applied", "Approved", "Disbursed"]),
    ],
  },
  {
    name: "Transfer Certificate",
    icon: "FileOutput",
    description: "Issue and track transfer certificates",
    keywords: ["transfer", "tc", "leaving", "migration"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Father Name", "text"),
      makeField("Date of Leaving", "date"),
      makeField("Reason", "text"),
      makeField("Conduct", "select", ["Good", "Excellent", "Satisfactory"]),
      makeField("TC Number", "text"),
    ],
  },
  {
    name: "Canteen Records",
    icon: "GraduationCap",
    description: "Manage canteen subscriptions and records",
    keywords: ["canteen", "lunch", "food", "meal", "tiffin"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Plan", "select", ["Monthly", "Daily", "Weekly"]),
      makeField("Amount", "number"),
      makeField("Start Date", "date"),
      makeField("Remarks", "text"),
    ],
  },
  {
    name: "Alumni Records",
    icon: "GraduationCap",
    description: "Track alumni and past student information",
    keywords: ["alumni", "alumni", "old student", "past student", "graduate"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Year of Passing", "text"),
      makeField("Class", "text"),
      makeField("Current Status", "text"),
      makeField("Phone", "text"),
      makeField("Email", "text"),
      makeField("Achievement", "textarea"),
    ],
  },
  {
    name: "Visitor Log",
    icon: "UserPlus",
    description: "Log visitors and track entry/exit",
    keywords: ["visitor", "visit", "guest", "entry", "log"],
    fields: [
      makeField("Visitor Name", "text"),
      makeField("Purpose", "text"),
      makeField("Meeting With", "text"),
      makeField("Date", "date"),
      makeField("In Time", "text"),
      makeField("Out Time", "text"),
      makeField("ID Proof", "text"),
    ],
  },
  {
    name: "Maintenance Log",
    icon: "Wrench",
    description: "Track school maintenance and repair requests",
    keywords: ["maintenance", "repair", "fix", "broken", "infrastructure"],
    fields: [
      makeField("Issue Title", "text"),
      makeField("Location", "text"),
      makeField("Reported Date", "date"),
      makeField("Assigned To", "text"),
      makeField("Status", "select", ["Pending", "In Progress", "Completed"]),
      makeField("Cost", "number"),
    ],
  },
  {
    name: "Counseling Records",
    icon: "HeartHandshake",
    description: "Student counseling sessions and outcomes",
    keywords: ["counseling", "counselling", "guidance", "therapy"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Date", "date"),
      makeField("Counselor Name", "text"),
      makeField("Issue", "textarea"),
      makeField("Outcome", "text"),
      makeField("Next Session", "date"),
    ],
  },
  {
    name: "Lab Records",
    icon: "FlaskConical",
    description: "Science lab experiments and observations",
    keywords: ["lab", "laboratory", "experiment", "science", "practical"],
    fields: [
      makeField("Student Name", "text"),
      makeField("Class", "text"),
      makeField("Experiment Name", "text"),
      makeField("Date", "date"),
      makeField("Equipment Used", "text"),
      makeField("Observation", "textarea"),
      makeField("Result", "text"),
    ],
  },
];

// First 8 templates for Quick Create
const QUICK_CREATE_TEMPLATES = TEMPLATES.slice(0, 8);

// ─── AI Engine ────────────────────────────────────────────────────────────────

function inferFieldType(label: string): FieldType {
  const l = label.toLowerCase();
  if (/date|dob|day/.test(l)) return "date";
  if (/amount|number|count|qty|marks|score|cost|price/.test(l)) return "number";
  if (
    /description|notes|remarks|comment|details|observation|outcome|issue/.test(
      l,
    )
  )
    return "textarea";
  if (/status|type|category|plan|conduct|result/.test(l)) return "select";
  return "text";
}

function extractFieldsFromText(text: string): FieldDef[] {
  // Try to extract field names from "with fields: X, Y, Z" or "fields X and Y"
  const fieldMatch = /(?:with\s+)?fields?[:\s]+(.+)/i.exec(text);
  if (fieldMatch) {
    const raw = fieldMatch[1];
    const parts = raw
      .split(/,|\s+and\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.map((label) => {
      const type = inferFieldType(label);
      return {
        id: label.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        label: label.charAt(0).toUpperCase() + label.slice(1),
        type,
        options:
          type === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
      };
    });
  }
  return [
    makeField("Name", "text"),
    makeField("Date", "date"),
    makeField("Notes", "textarea"),
  ];
}

function extractPanelName(text: string): string {
  const stopWords = new Set([
    "add",
    "create",
    "make",
    "build",
    "a",
    "an",
    "the",
    "new",
    "for",
    "me",
    "section",
    "panel",
    "page",
    "tracker",
    "record",
    "records",
  ]);
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w.toLowerCase()));
  if (words.length === 0) return "Custom Panel";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface ProcessResult {
  response: string;
  newPanels: CustomPanelDef[];
  actionPanelId?: string;
}

let pendingClearConfirm = false;

function processMessage(
  input: string,
  panels: CustomPanelDef[],
  _principalId: string,
): ProcessResult {
  const lower = input.toLowerCase().trim();
  let newPanels = [...panels];

  // Confirm clear
  if (lower === "confirm clear") {
    if (pendingClearConfirm) {
      pendingClearConfirm = false;
      return {
        response: "✓ All custom panels have been deleted.",
        newPanels: [],
      };
    }
    return {
      response: "No clear operation is pending. Type 'clear all' first.",
      newPanels,
    };
  }

  // Clear all
  if (lower === "clear all") {
    if (newPanels.length === 0) {
      return { response: "No panels to clear.", newPanels };
    }
    pendingClearConfirm = true;
    return {
      response: `⚠️ This will delete all ${newPanels.length} panel(s). Type **confirm clear** to proceed, or anything else to cancel.`,
      newPanels,
    };
  }
  // Reset pending if user types something else
  pendingClearConfirm = false;

  // Show panels
  if (
    lower === "show panels" ||
    lower === "list panels" ||
    lower === "my panels"
  ) {
    if (newPanels.length === 0) {
      return {
        response:
          "No custom panels yet. Try: **add transport tracker** or **create fee reminder**.",
        newPanels,
      };
    }
    const list = newPanels
      .map((p) => `• **${p.name}** (${p.fields.length} fields)`)
      .join("\n");
    return {
      response: `**Your panels (${newPanels.length}):**\n${list}`,
      newPanels,
    };
  }

  // Help
  if (lower === "help" || lower === "?" || lower === "what can you do") {
    const templateNames = TEMPLATES.map((t) => `• ${t.name}`).join("\n");
    return {
      response: `**I can create custom panels for your school!**\n\n**Available templates:**\n${templateNames}\n\n**Commands:**\n• add [panel name] — create a panel\n• remove [panel name] — delete a panel\n• show panels — list all panels\n• undo — remove the last panel\n• clear all — delete all panels\n\n**Examples:**\n• \'add transport tracker\'\n• \'create health records for students\'\n• \'make a visitor log with fields: name, date, purpose\'`,
      newPanels,
    };
  }

  // Undo
  if (lower === "undo") {
    if (newPanels.length === 0) {
      return {
        response: "Nothing to undo — no panels have been created.",
        newPanels,
      };
    }
    const removed = newPanels[newPanels.length - 1];
    return {
      response: `✓ Removed **${removed.name}** from your panels.`,
      newPanels: newPanels.slice(0, -1),
    };
  }

  // Remove / delete by name
  const removeMatch = /^(?:remove|delete)\s+(.+)/i.exec(lower);
  if (removeMatch) {
    const target = removeMatch[1].toLowerCase();
    const idx = newPanels.findIndex(
      (p) =>
        p.name.toLowerCase().includes(target) ||
        target.includes(p.name.toLowerCase()),
    );
    if (idx === -1) {
      return {
        response: `I couldn't find a panel matching "${removeMatch[1]}". Type **show panels** to see your panels.`,
        newPanels,
      };
    }
    const removed = newPanels[idx];
    newPanels = newPanels.filter((_, i) => i !== idx);
    return {
      response: `✓ **${removed.name}** has been removed from your sidebar.`,
      newPanels,
    };
  }

  // Check if it's a creation command
  const isCreation = /^(?:add|create|make|build|new|i need|i want)\s+/i.test(
    lower,
  );
  if (
    !isCreation &&
    !lower.includes("tracker") &&
    !lower.includes("records") &&
    !lower.includes("log")
  ) {
    return {
      response: `I'm not sure what you mean. Try:\n• **add transport tracker**\n• **create fee reminder**\n• **add health records**\n\nType **help** for all available panels and commands.`,
      newPanels,
    };
  }

  // Match a template
  const matched = TEMPLATES.find((t) =>
    t.keywords.some((kw) => lower.includes(kw)),
  );

  const now = new Date().toISOString();

  if (matched) {
    // Check if already exists
    const existing = newPanels.find(
      (p) => p.name.toLowerCase() === matched.name.toLowerCase(),
    );
    if (existing) {
      return {
        response: `**${matched.name}** is already in your sidebar. Open it using the button below or from the sidebar.`,
        newPanels,
        actionPanelId: existing.id,
      };
    }
    const newPanel: CustomPanelDef = {
      id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: matched.name,
      icon: matched.icon,
      description: matched.description,
      fields: matched.fields,
      createdAt: now,
      visibleToParents: false,
    };
    newPanels = [...newPanels, newPanel];
    const fieldNames = matched.fields
      .map((f) => f.label)
      .slice(0, 5)
      .join(", ");
    const extra =
      matched.fields.length > 5 ? ` +${matched.fields.length - 5} more` : "";
    return {
      response: `✓ **${matched.name}** created with ${matched.fields.length} fields: ${fieldNames}${extra}.\n\nOpen it from the sidebar or tap the button below to start adding records!`,
      newPanels,
      actionPanelId: newPanel.id,
    };
  }

  // Free-form panel
  const panelName = extractPanelName(input);
  const fields = extractFieldsFromText(input);
  const newPanel: CustomPanelDef = {
    id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: panelName,
    icon: "LayoutGrid",
    description: `Custom section: ${panelName}`,
    fields,
    createdAt: now,
    visibleToParents: false,
  };
  newPanels = [...newPanels, newPanel];
  const fieldNames = fields.map((f) => f.label).join(", ");
  return {
    response: `✓ **${panelName}** created with ${fields.length} fields: ${fieldNames}.\n\nOpen it from the sidebar or tap the button below to start adding records!`,
    newPanels,
    actionPanelId: newPanel.id,
  };
}

// ─── Icon resolver ────────────────────────────────────────────────────────────

function getIconForPanel(iconName: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    Bus: <Bus size={18} />,
    Banknote: <Banknote size={18} />,
    Heart: <Heart size={18} />,
    BookMarked: <BookMarked size={18} />,
    Pencil: <Pencil size={18} />,
    AlertCircle: <AlertCircle size={18} />,
    UserCheck: <UserCheck size={18} />,
    Trophy: <Trophy size={18} />,
    Package: <Package size={18} />,
    CalendarCheck: <CalendarCheck size={18} />,
    Award: <Award size={18} />,
    FileOutput: <FileOutput size={18} />,
    GraduationCap: <GraduationCap size={18} />,
    UserPlus: <UserPlus size={18} />,
    Wrench: <Wrench size={18} />,
    HeartHandshake: <HeartHandshake size={18} />,
    FlaskConical: <FlaskConical size={18} />,
  };
  return map[iconName] ?? <Wand2 size={18} />;
}

// ─── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) => {
    const k = `md-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={k}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={k}>{part.slice(1, -1)}</em>;
    }
    return <span key={k}>{part}</span>;
  });
}

// ─── Quick create buttons config ──────────────────────────────────────────────

const QUICK_BUTTONS = QUICK_CREATE_TEMPLATES.map((t) => ({
  label: t.name,
  prompt: `add ${t.name.toLowerCase()}`,
  icon: getIconForPanel(t.icon),
}));

// ─── Main component ───────────────────────────────────────────────────────────

interface AppBuilderProps {
  principalId: string;
  onNavigateToPanel?: (panelId: string) => void;
}

export default function PrincipalAppBuilderPage({
  principalId,
  onNavigateToPanel,
}: AppBuilderProps) {
  const [panels, setPanels] = useState<CustomPanelDef[]>(() =>
    loadPanels(principalId),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadChatHistory(principalId),
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processMessage(trimmed, panels, principalId);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: result.response,
        timestamp: new Date().toISOString(),
        actionPanelId: result.actionPanelId,
      };
      const final = [...withUser, assistantMsg];
      setMessages(final);
      saveChatHistory(principalId, final);

      if (JSON.stringify(result.newPanels) !== JSON.stringify(panels)) {
        setPanels(result.newPanels);
        savePanels(principalId, result.newPanels);
      }
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const deletePanel = (panelId: string) => {
    const updated = panels.filter((p) => p.id !== panelId);
    setPanels(updated);
    savePanels(principalId, updated);
  };

  const clearChat = () => {
    setMessages([]);
    saveChatHistory(principalId, []);
  };

  const getRecordCount = (panelId: string) =>
    loadRecords(principalId, panelId).length;

  const PROMPT_CHIPS = [
    "Add transport tracker",
    "Create fee reminder",
    "Add health records",
    "Make a homework log",
    "Create visitor log",
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto" data-ocid="app_builder.page">
      {/* Header */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "oklch(0.88 0.018 260)",
          background: "oklch(1 0 0)",
        }}
      >
        <div
          className="h-1.5"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.25 0.10 265), oklch(0.60 0.19 255), oklch(0.72 0.18 80))",
          }}
        />
        <div className="px-6 py-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.25 0.10 265 / 0.10)" }}
          >
            <Wand2 size={22} style={{ color: "oklch(0.25 0.10 265)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              AI App Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Create any section or feature by chatting — no coding needed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Chat ── */}
        <div
          className="lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col"
          style={{
            borderColor: "oklch(0.88 0.018 260)",
            background: "oklch(1 0 0)",
            minHeight: "560px",
            maxHeight: "640px",
          }}
          data-ocid="app_builder.panel"
        >
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "oklch(0.91 0.01 260)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: "oklch(0.52 0.18 255)" }} />
              <span className="text-sm font-semibold text-foreground">
                App Builder Assistant
              </span>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
              >
                Clear chat
              </button>
            )}
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "oklch(0.25 0.10 265 / 0.08)" }}
                >
                  <Wand2
                    size={24}
                    style={{ color: "oklch(0.25 0.10 265 / 0.6)" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  What would you like to build?
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Type in plain language — I\'ll create the panel for you.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={`${msg.role}-${msg.timestamp}`}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                      }`}
                      style={{
                        background:
                          msg.role === "user"
                            ? "oklch(0.25 0.10 265)"
                            : "oklch(0.96 0.01 260)",
                        color:
                          msg.role === "user"
                            ? "oklch(0.98 0.005 260)"
                            : "oklch(0.18 0.04 260)",
                      }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {renderMarkdown(msg.text)}
                      </p>
                      {msg.actionPanelId && onNavigateToPanel && (
                        <button
                          type="button"
                          data-ocid="app_builder.open_panel.button"
                          onClick={() =>
                            onNavigateToPanel(msg.actionPanelId as string)
                          }
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: "oklch(0.60 0.19 255 / 0.18)",
                            color: "oklch(0.98 0.005 260)",
                            border: "1px solid oklch(0.60 0.19 255 / 0.35)",
                          }}
                        >
                          <Trophy size={12} />▶ Open Panel
                        </button>
                      )}
                      <p
                        className="text-[10px] mt-1 opacity-60"
                        style={{
                          textAlign: msg.role === "user" ? "right" : "left",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5"
                      style={{ background: "oklch(0.96 0.01 260)" }}
                    >
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "oklch(0.55 0.10 265)",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt chips (shown always below messages/empty state) */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    data-ocid="app_builder.prompt_chip.button"
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-accent"
                    style={{
                      borderColor: "oklch(0.75 0.08 265 / 0.4)",
                      color: "oklch(0.35 0.10 265)",
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </ScrollArea>

          {/* Input */}
          <div
            className="flex gap-2 p-3 border-t"
            style={{ borderColor: "oklch(0.91 0.01 260)" }}
          >
            <Input
              data-ocid="app_builder.input"
              placeholder="Type: add transport tracker, create fee reminder, help…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              data-ocid="app_builder.submit_button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
              className="shrink-0"
            >
              {isTyping ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </Button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* My Panels */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(1 0 0)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "oklch(0.91 0.01 260)" }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  My Panels
                </p>
                <p className="text-xs text-muted-foreground">
                  {panels.length} panel{panels.length !== 1 ? "s" : ""} created
                </p>
              </div>
            </div>
            <div
              className="p-3 space-y-2"
              data-ocid="app_builder.my_panels.panel"
            >
              {panels.length === 0 ? (
                <p
                  className="text-xs text-center py-5"
                  style={{ color: "oklch(0.58 0.04 260)" }}
                  data-ocid="app_builder.my_panels.empty_state"
                >
                  No panels yet. Chat to create one!
                </p>
              ) : (
                panels.map((p, idx) => {
                  const count = getRecordCount(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "oklch(0.96 0.02 265)" }}
                      data-ocid={`app_builder.my_panels.item.${idx + 1}`}
                    >
                      <span
                        className="shrink-0"
                        style={{ color: "oklch(0.35 0.12 265)" }}
                      >
                        {getIconForPanel(p.icon)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {count} record{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {onNavigateToPanel && (
                        <button
                          type="button"
                          data-ocid="app_builder.open_panel.button"
                          onClick={() => onNavigateToPanel(p.id)}
                          className="text-xs px-2 py-1 rounded-md font-medium transition-all"
                          style={{
                            background: "oklch(0.25 0.10 265 / 0.12)",
                            color: "oklch(0.35 0.12 265)",
                          }}
                        >
                          Open
                        </button>
                      )}
                      <button
                        type="button"
                        data-ocid="app_builder.delete_panel.delete_button"
                        onClick={() => deletePanel(p.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Create */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: "oklch(0.88 0.018 260)",
              background: "oklch(1 0 0)",
            }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "oklch(0.91 0.01 260)" }}
            >
              <p className="text-sm font-semibold text-foreground">
                Quick Create
              </p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {QUICK_BUTTONS.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  data-ocid="app_builder.quick_create.button"
                  onClick={() => sendMessage(btn.prompt)}
                  disabled={isTyping}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-all hover:bg-accent"
                  style={{
                    background: "oklch(0.97 0.005 260)",
                    color: "oklch(0.30 0.05 260)",
                  }}
                >
                  <span style={{ color: "oklch(0.45 0.10 265)" }}>
                    {btn.icon}
                  </span>
                  <span className="truncate">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DynamicCustomPanelPage ───────────────────────────────────────────────────

interface DynamicPanelProps {
  panelDef: CustomPanelDef;
  principalId: string;
  onNavigateToBuilder: () => void;
}

export function DynamicCustomPanelPage({
  panelDef,
  principalId,
  onNavigateToBuilder,
}: DynamicPanelProps) {
  const [records, setRecords] = useState<PanelRecord[]>(() =>
    loadRecords(principalId, panelDef.id),
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newRecord: PanelRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      panelId: panelDef.id,
      data: { ...formData },
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveRecords(principalId, panelDef.id, updated);
    setFormData({});
    setShowForm(false);
  };

  const handleDelete = (recordId: string) => {
    const updated = records.filter((r) => r.id !== recordId);
    setRecords(updated);
    saveRecords(principalId, panelDef.id, updated);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "oklch(0.88 0.018 260)",
          background: "oklch(1 0 0)",
        }}
      >
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.25 0.10 265), oklch(0.60 0.19 255))",
          }}
        />
        <div className="px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            data-ocid="custom_panel.back_button"
            onClick={onNavigateToBuilder}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1"
          >
            <ChevronLeft size={16} />
            <span>Builder</span>
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.25 0.10 265 / 0.10)" }}
          >
            <span style={{ color: "oklch(0.35 0.12 265)" }}>
              {getIconForPanel(panelDef.icon)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {panelDef.name}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {records.length} record{records.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {panelDef.description}
            </p>
          </div>
          <button
            type="button"
            data-ocid="custom_panel.add_record.button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: showForm
                ? "oklch(0.96 0.01 260)"
                : "oklch(0.25 0.10 265)",
              color: showForm ? "oklch(0.35 0.10 265)" : "white",
            }}
          >
            {showForm ? <X size={14} /> : <span>+ Add New Record</span>}
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{
            borderColor: "oklch(0.88 0.018 260)",
            background: "oklch(1 0 0)",
          }}
          data-ocid="custom_panel.add_record.modal"
        >
          <h3 className="text-sm font-semibold text-foreground">
            New Record — {panelDef.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {panelDef.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label
                  htmlFor={`field-${field.id}`}
                  className="text-xs font-medium"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`field-${field.id}`}
                    data-ocid={`custom_panel.${field.id}.textarea`}
                    placeholder={field.label}
                    value={formData[field.id] ?? ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    rows={3}
                    className="text-sm"
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={formData[field.id] ?? ""}
                    onValueChange={(val) => handleFieldChange(field.id, val)}
                  >
                    <SelectTrigger
                      id={`field-${field.id}`}
                      data-ocid={`custom_panel.${field.id}.select`}
                      className="text-sm"
                    >
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`field-${field.id}`}
                    data-ocid={`custom_panel.${field.id}.input`}
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : "text"
                    }
                    placeholder={field.label}
                    value={formData[field.id] ?? ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid="custom_panel.save_record.submit_button"
              onClick={handleSubmit}
              style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
              className="text-sm"
            >
              Save Record
            </Button>
            <Button
              data-ocid="custom_panel.cancel_record.cancel_button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setFormData({});
              }}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Records list */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div
            className="rounded-xl border p-10 flex flex-col items-center text-center"
            style={{
              borderColor: "oklch(0.91 0.01 260)",
              background: "oklch(0.99 0.002 260)",
            }}
            data-ocid="custom_panel.records.empty_state"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: "oklch(0.25 0.10 265 / 0.08)" }}
            >
              <span style={{ color: "oklch(0.35 0.12 265)" }}>
                {getIconForPanel(panelDef.icon)}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">
              No records yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "+ Add New Record" to add the first entry.
            </p>
          </div>
        ) : (
          records.map((record, idx) => (
            <div
              key={record.id}
              className="rounded-xl border p-4"
              style={{
                borderColor: "oklch(0.88 0.018 260)",
                background: "oklch(1 0 0)",
              }}
              data-ocid={`custom_panel.records.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.25 0.10 265 / 0.08)",
                    color: "oklch(0.35 0.12 265)",
                  }}
                >
                  #{idx + 1}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  data-ocid={`custom_panel.records.delete_button.${idx + 1}`}
                  onClick={() => handleDelete(record.id)}
                  className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {panelDef.fields.map((field) => {
                  const val = record.data[field.id];
                  if (!val) return null;
                  return (
                    <div key={field.id}>
                      <p
                        className="text-[10px] uppercase tracking-wide font-semibold mb-0.5"
                        style={{ color: "oklch(0.55 0.04 260)" }}
                      >
                        {field.label}
                      </p>
                      <p className="text-sm text-foreground break-words">
                        {val}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Backward compat export ───────────────────────────────────────────────────

export function CustomPanelPage({ panelId: _panelId }: { panelId: string }) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      Panel not found. Go to App Builder to create panels.
    </div>
  );
}
