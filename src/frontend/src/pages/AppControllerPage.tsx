import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Award,
  Banknote,
  BookMarked,
  Bus,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Copy,
  FlaskConical,
  GraduationCap,
  Heart,
  HeartHandshake,
  Key,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Pencil,
  RefreshCw,
  Send,
  Server,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../data/mockData";
import { PRINCIPALS } from "../data/principals";

// ─── Storage helpers ──────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "dashboard"
  | "students"
  | "passwords"
  | "broadcast"
  | "panel-builder"
  | "settings";

type FieldType = "text" | "number" | "date" | "select" | "textarea";

interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

interface CustomPanelDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: FieldDef[];
  createdAt: string;
  visibleToParents: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  actionPanelId?: string;
}

interface BroadcastRecord {
  id: string;
  title: string;
  body: string;
  category: string;
  target: string;
  sentAt: string;
}

interface Props {
  onLogout: () => void;
}

// ─── Panel builder helpers (mirrors PrincipalAppBuilderPage) ──────────────────

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
    keywords: ["event", "events", "sports", "function", "activity"],
    fields: [
      makeField("Event Name", "text"),
      makeField("Date", "date"),
      makeField("Venue", "text"),
      makeField("Class / Grade", "text"),
      makeField("Organizer", "text"),
    ],
  },
  {
    name: "Visitor Log",
    icon: "UserPlus",
    description: "Log all school visitors",
    keywords: ["visitor", "visit", "guest", "log"],
    fields: [
      makeField("Visitor Name", "text"),
      makeField("Purpose", "text"),
      makeField("Date", "date"),
      makeField("Time In", "text"),
      makeField("Time Out", "text"),
      makeField("Person to Meet", "text"),
    ],
  },
  {
    name: "Inventory Records",
    icon: "Package",
    description: "School supplies and inventory management",
    keywords: ["inventory", "stock", "supply", "supplies", "equipment"],
    fields: [
      makeField("Item Name", "text"),
      makeField("Quantity", "number"),
      makeField("Category", "text"),
      makeField("Purchase Date", "date"),
      makeField("Status", "select", ["Available", "Low Stock", "Out of Stock"]),
    ],
  },
];

let pendingClearConfirm = false;

interface ProcessResult {
  response: string;
  newPanels: CustomPanelDef[];
  actionPanelId?: string;
}

function processMessage(
  input: string,
  panels: CustomPanelDef[],
): ProcessResult {
  const lower = input.toLowerCase().trim();
  let newPanels = [...panels];

  if (lower === "confirm clear") {
    if (pendingClearConfirm) {
      pendingClearConfirm = false;
      return {
        response: "✓ All custom panels have been deleted.",
        newPanels: [],
      };
    }
    return { response: "No clear operation is pending.", newPanels };
  }

  if (lower === "clear all") {
    if (newPanels.length === 0)
      return { response: "No panels to clear.", newPanels };
    pendingClearConfirm = true;
    return {
      response: `⚠️ This will delete all ${newPanels.length} panel(s). Type **confirm clear** to proceed.`,
      newPanels,
    };
  }
  pendingClearConfirm = false;

  if (["show panels", "list panels", "my panels"].includes(lower)) {
    if (newPanels.length === 0)
      return {
        response: "No custom panels yet. Try: **add transport tracker**",
        newPanels,
      };
    const list = newPanels
      .map((p) => `• **${p.name}** (${p.fields.length} fields)`)
      .join("\n");
    return {
      response: `**Your panels (${newPanels.length}):**\n${list}`,
      newPanels,
    };
  }

  if (["help", "?", "what can you do"].includes(lower)) {
    const tNames = TEMPLATES.map((t) => `• ${t.name}`).join("\n");
    return {
      response: `**Available templates:**\n${tNames}\n\n**Commands:**\n• add [name] — create panel\n• remove [name] — delete panel\n• show panels — list all\n• undo — remove last\n• clear all — delete all\n\n**Free-form:** \'create a vehicle log with fields: name, date, purpose\'`,
      newPanels,
    };
  }

  if (lower === "undo") {
    if (newPanels.length === 0)
      return { response: "Nothing to undo.", newPanels };
    const removed = newPanels[newPanels.length - 1];
    return {
      response: `✓ Removed **${removed.name}**.`,
      newPanels: newPanels.slice(0, -1),
    };
  }

  const removeMatch = /^(?:remove|delete)\s+(.+)/i.exec(lower);
  if (removeMatch) {
    const target = removeMatch[1].toLowerCase();
    const idx = newPanels.findIndex(
      (p) =>
        p.name.toLowerCase().includes(target) ||
        target.includes(p.name.toLowerCase()),
    );
    if (idx === -1)
      return {
        response: `No panel matching "${removeMatch[1]}" found. Type **show panels** to see all panels.`,
        newPanels,
      };
    const removed = newPanels[idx];
    return {
      response: `✓ **${removed.name}** removed from sidebar.`,
      newPanels: newPanels.filter((_, i) => i !== idx),
    };
  }

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
      response:
        "Not sure what you mean. Try:\n\u2022 **add transport tracker**\n\u2022 **create fee reminder**\n\nType **help** for all options.",
      newPanels,
    };
  }

  const matched = TEMPLATES.find((t) =>
    t.keywords.some((kw) => lower.includes(kw)),
  );
  const now = new Date().toISOString();

  if (matched) {
    const existing = newPanels.find(
      (p) => p.name.toLowerCase() === matched.name.toLowerCase(),
    );
    if (existing)
      return {
        response: `**${matched.name}** already exists in the sidebar.`,
        newPanels,
        actionPanelId: existing.id,
      };
    const newPanel: CustomPanelDef = {
      id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: matched.name,
      icon: matched.icon,
      description: matched.description,
      fields: matched.fields,
      createdAt: now,
      visibleToParents: false,
    };
    return {
      response: `✓ **${matched.name}** added to the principal's sidebar with ${matched.fields.length} fields. Parents won't see this panel by default.`,
      newPanels: [...newPanels, newPanel],
      actionPanelId: newPanel.id,
    };
  }

  // Free-form
  const panelName = extractPanelName(input);
  const fields = extractFieldsFromText(input);
  if (panelName === "Custom Panel" && fields.length === 3) {
    return {
      response: `I created a basic custom panel. To add specific fields, use: **create ${panelName} with fields: field1, field2, field3**`,
      newPanels,
    };
  }
  const newPanel: CustomPanelDef = {
    id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: panelName,
    icon: "LayoutGrid",
    description: `Custom panel for ${panelName}`,
    fields,
    createdAt: now,
    visibleToParents: false,
  };
  return {
    response: `✓ **${panelName}** created with ${fields.length} fields: ${fields.map((f) => f.label).join(", ")}. It now appears in the selected principal's sidebar.`,
    newPanels: [...newPanels, newPanel],
    actionPanelId: newPanel.id,
  };
}

// ─── Password generation ──────────────────────────────────────────────────────

function generateStrongPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 7; i++)
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  return `Lords@${suffix}`;
}

function generateUniquePasswords(count: number): string[] {
  const used = new Set<string>();
  const result: string[] = [];
  while (result.length < count) {
    const pwd = generateStrongPassword();
    if (!used.has(pwd)) {
      used.add(pwd);
      result.push(pwd);
    }
  }
  return result;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Tab sidebar items ────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "passwords", label: "Passwords", icon: Key },
  { id: "broadcast", label: "Broadcast", icon: MessageSquare },
  { id: "panel-builder", label: "Panel Builder", icon: Wand2 },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppControllerPage({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: "oklch(0.26 0.05 265)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.72 0.18 80)" }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-bold leading-tight truncate"
              style={{ color: "oklch(0.92 0.02 260)" }}
            >
              Lord's International
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: "oklch(0.65 0.05 260)" }}
            >
              App Controller
            </p>
          </div>
        </div>
        <div
          className="mt-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: "oklch(0.72 0.18 80 / 0.2)",
            color: "oklch(0.85 0.12 80)",
          }}
        >
          ⚙️ Admin Access
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          data-ocid="app_controller.logout_button"
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-all"
          style={{
            background: "oklch(0.55 0.22 25 / 0.12)",
            color: "oklch(0.72 0.18 25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.22 25 / 0.22)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.22 25 / 0.12)";
          }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p
          className="text-xs font-semibold uppercase tracking-wider px-2 mb-3"
          style={{ color: "oklch(0.55 0.05 265)" }}
        >
          Control Centre
        </p>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-ocid={`app_controller.${id.replace(/-/g, "_")}.link`}
            onClick={() => {
              setActiveTab(id);
              setSidebarOpen(false);
            }}
            className={`sidebar-nav-item w-full text-left${activeTab === id ? " active" : ""}`}
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-56 shrink-0 h-full"
        style={{ background: "oklch(var(--sidebar))" }}
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 lg:hidden cursor-default"
          style={{ background: "rgba(0,0,0,0.5)", border: "none" }}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 lg:hidden flex flex-col h-full transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "oklch(var(--sidebar))" }}
      >
        <div className="flex items-center justify-end px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border shrink-0 bg-card"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">
              {TABS.find((t) => t.id === activeTab)?.label ?? "App Controller"}
            </h1>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{
              background: "oklch(0.72 0.18 80 / 0.12)",
              color: "oklch(0.55 0.18 80)",
            }}
          >
            App Controller
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "passwords" && <PasswordsTab />}
          {activeTab === "broadcast" && <BroadcastTab />}
          {activeTab === "panel-builder" && <PanelBuilderTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const stats = PRINCIPALS.map((p) => {
    const students = loadStorage<Student[]>(`lords_students_${p.id}`, []);
    const notices = loadStorage<unknown[]>(`lords_notifications_${p.id}`, []);
    return {
      principal: p,
      studentCount: students.length,
      noticeCount: notices.length,
      students,
    };
  });

  const totalStudents = stats.reduce((sum, s) => sum + s.studentCount, 0);
  const activePrincipals = stats.filter((s) => s.studentCount > 0).length;
  const totalNotices = stats.reduce((sum, s) => sum + s.noticeCount, 0);

  return (
    <div className="space-y-6" data-ocid="app_controller.dashboard.section">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Students
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "oklch(0.25 0.10 265)" }}
                >
                  {totalStudents}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.25 0.10 265 / 0.1)" }}
              >
                <Users size={22} style={{ color: "oklch(0.25 0.10 265)" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Schools
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "oklch(0.42 0.16 150)" }}
                >
                  {activePrincipals}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.42 0.16 150 / 0.1)" }}
              >
                <GraduationCap
                  size={22}
                  style={{ color: "oklch(0.42 0.16 150)" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Notices
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "oklch(0.55 0.18 80)" }}
                >
                  {totalNotices}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.55 0.18 80 / 0.1)" }}
              >
                <MessageSquare
                  size={22}
                  style={{ color: "oklch(0.55 0.18 80)" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All Schools Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map(({ principal, studentCount, noticeCount }) => (
            <div
              key={principal.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "oklch(0.25 0.10 265)" }}
                >
                  {principal.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {principal.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {principal.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {studentCount}
                  </span>{" "}
                  students
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {noticeCount}
                  </span>{" "}
                  notices
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ICP info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Server size={14} /> ICP Backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground">
              {import.meta.env.VITE_CANISTER_ID_BACKEND ?? "Not available"}
            </span>
            <Badge variant="outline" className="text-xs">
              Canister ID
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All data syncs to this ICP canister in real time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────────────────────

function StudentsTab() {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>(
    PRINCIPALS[0].id,
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setStudents(
      loadStorage<Student[]>(`lords_students_${selectedPrincipalId}`, []),
    );
    setFilterClass("all");
  }, [selectedPrincipalId]);

  const classes = Array.from(new Set(students.map((s) => s.class))).sort();
  const filtered =
    filterClass === "all"
      ? students
      : students.filter((s) => s.class === filterClass);

  const byClass = filtered.reduce<Record<string, Student[]>>((acc, s) => {
    acc[s.class] = acc[s.class] ?? [];
    acc[s.class].push(s);
    return acc;
  }, {});

  const saveStudents = (updated: Student[]) => {
    saveStorage(`lords_students_${selectedPrincipalId}`, updated);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `lords_students_${selectedPrincipalId}`,
        newValue: JSON.stringify(updated),
      }),
    );
    setStudents(updated);
  };

  const handleAdd = () => {
    if (!newName.trim() || !newClass.trim()) {
      toast.error("Name and class are required");
      return;
    }
    const updated = [
      ...students,
      {
        id: Date.now(),
        name: newName.trim(),
        class: newClass.trim(),
        rollNo: newRoll.trim() || "",
        parentPassword: "",
        parentMobile: "",
      } as unknown as Student,
    ];
    saveStudents(updated);
    setNewName("");
    setNewClass("");
    setNewRoll("");
    setShowAdd(false);
    toast.success(
      `Student "${newName.trim()}" added to ${selectedPrincipalId}`,
    );
  };

  const handleDelete = (id: number) => {
    const updated = students.filter((s) => s.id !== id);
    saveStudents(updated);
    setDeleteId(null);
    toast.success("Student deleted");
  };

  return (
    <div className="space-y-4" data-ocid="app_controller.students.section">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Select School</Label>
          <Select
            value={selectedPrincipalId}
            onValueChange={setSelectedPrincipalId}
          >
            <SelectTrigger data-ocid="app_controller.students.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRINCIPALS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Filter by Class</Label>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger data-ocid="app_controller.students_class.select">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            data-ocid="app_controller.add_student.primary_button"
            onClick={() => setShowAdd((v) => !v)}
            style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
          >
            <UserPlus size={15} className="mr-1.5" />
            Add Student
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="border-dashed">
          <CardContent className="pt-4 space-y-3">
            <h3 className="text-sm font-semibold">
              Add New Student to{" "}
              {PRINCIPALS.find((p) => p.id === selectedPrincipalId)?.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Student Name *</Label>
                <Input
                  data-ocid="app_controller.student_name.input"
                  placeholder="Full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Class *</Label>
                <Input
                  data-ocid="app_controller.student_class.input"
                  placeholder="e.g. Class 10"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Roll Number</Label>
                <Input
                  data-ocid="app_controller.student_roll.input"
                  placeholder="Roll no."
                  value={newRoll}
                  onChange={(e) => setNewRoll(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="app_controller.student_save.primary_button"
                onClick={handleAdd}
                style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
              >
                Save Student
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground">
        {students.length} students • {classes.length} classes
      </div>

      {Object.keys(byClass).length === 0 ? (
        <Card data-ocid="app_controller.students.empty_state">
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p>No students found for this school.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byClass).map(([cls, clsStudents]) => (
            <Card key={cls}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{cls}</CardTitle>
                  <Badge variant="secondary">
                    {clsStudents.length} students
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {clsStudents.map((s, idx) => (
                    <div
                      key={s.id}
                      data-ocid={`app_controller.students.item.${idx + 1}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {s.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Roll: {String(s.rollNo ?? "—")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {deleteId === s.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              data-ocid={`app_controller.confirm_delete.confirm_button.${idx + 1}`}
                              onClick={() => handleDelete(s.id)}
                              className="h-7 px-2 text-xs"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`app_controller.cancel_delete.cancel_button.${idx + 1}`}
                              onClick={() => setDeleteId(null)}
                              className="h-7 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <button
                            type="button"
                            data-ocid={`app_controller.students.delete_button.${idx + 1}`}
                            onClick={() => setDeleteId(s.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Passwords Tab ────────────────────────────────────────────────────────────

function PasswordsTab() {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>(
    PRINCIPALS[0].id,
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState("all");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setStudents(
      loadStorage<Student[]>(`lords_students_${selectedPrincipalId}`, []),
    );
    setFilterClass("all");
  }, [selectedPrincipalId]);

  const classes = Array.from(new Set(students.map((s) => s.class))).sort();
  const filtered =
    filterClass === "all"
      ? students
      : students.filter((s) => s.class === filterClass);

  const handleGenerateAll = () => {
    if (students.length === 0) {
      toast.error("No students found.");
      return;
    }
    setGenerating(true);
    const passwords = generateUniquePasswords(students.length);
    const updated = students.map((s, i) => ({
      ...s,
      parentPassword: passwords[i],
    }));

    // Update student objects
    saveStorage(`lords_students_${selectedPrincipalId}`, updated);

    // Also write to centralized password map
    const pwdMap: Record<string, { password: string; mobile: string }> = {};
    for (const s of updated)
      pwdMap[String(s.id)] = {
        password: s.parentPassword ?? "",
        mobile: s.parentMobile ?? "",
      };
    saveStorage(`lords_parent_passwords_${selectedPrincipalId}`, pwdMap);

    // Broadcast
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `lords_students_${selectedPrincipalId}`,
        newValue: JSON.stringify(updated),
      }),
    );

    // Download CSV
    const principalName =
      PRINCIPALS.find((p) => p.id === selectedPrincipalId)?.name ??
      selectedPrincipalId;
    downloadCSV(
      [
        ["Student Name", "Class", "Roll No", "Parent Password"],
        ...updated.map((s) => [
          s.name,
          s.class,
          String(s.rollNo ?? ""),
          s.parentPassword ?? "",
        ]),
      ],
      `AppController_Passwords_${principalName}_${new Date().toISOString().slice(0, 10)}.csv`,
    );

    setStudents(updated);
    setGenerating(false);
    toast.success(
      `Passwords generated for ${updated.length} students! CSV downloaded.`,
    );
  };

  const copyPassword = (pwd: string) => {
    navigator.clipboard
      .writeText(pwd)
      .then(() => toast.success("Copied!"))
      .catch(() => {
        toast.error("Copy failed");
      });
  };

  return (
    <div className="space-y-4" data-ocid="app_controller.passwords.section">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Select School</Label>
          <Select
            value={selectedPrincipalId}
            onValueChange={setSelectedPrincipalId}
          >
            <SelectTrigger data-ocid="app_controller.passwords.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRINCIPALS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Filter by Class</Label>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger data-ocid="app_controller.passwords_class.select">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            data-ocid="app_controller.generate_passwords.primary_button"
            onClick={handleGenerateAll}
            disabled={generating || students.length === 0}
            style={{ background: "oklch(0.42 0.16 150)", color: "white" }}
          >
            {generating ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Key size={14} className="mr-1.5" />
            )}
            Generate All Passwords
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            Generates unique strong passwords (Lords@XXXXXXX format) for all{" "}
            {students.length} students and auto-downloads a CSV file.
          </p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card data-ocid="app_controller.passwords.empty_state">
          <CardContent className="py-10 text-center text-muted-foreground">
            <Key size={36} className="mx-auto mb-3 opacity-30" />
            <p>No students found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">
              Parent Passwords —{" "}
              {PRINCIPALS.find((p) => p.id === selectedPrincipalId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {filtered.map((s, idx) => (
                <div
                  key={s.id}
                  data-ocid={`app_controller.passwords.item.${idx + 1}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.class}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs px-2 py-1 rounded border"
                      style={{
                        background: "oklch(0.97 0.01 260)",
                        borderColor: "oklch(0.88 0.018 260)",
                      }}
                    >
                      {s.parentPassword || "(not set)"}
                    </span>
                    {s.parentPassword && (
                      <button
                        type="button"
                        data-ocid={`app_controller.copy_password.secondary_button.${idx + 1}`}
                        onClick={() => copyPassword(s.parentPassword ?? "")}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Copy password"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Broadcast Tab ────────────────────────────────────────────────────────────

function BroadcastTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(() =>
    loadStorage<BroadcastRecord[]>("lords_appcontroller_broadcasts", []),
  );

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);

    const notice = {
      id: Date.now(),
      type: category,
      title: title.trim(),
      message: body.trim(),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      sentByAppController: true,
    };

    const targets =
      target === "all" ? PRINCIPALS : PRINCIPALS.filter((p) => p.id === target);

    for (const principal of targets) {
      const existing = loadStorage<unknown[]>(
        `lords_notifications_${principal.id}`,
        [],
      );
      const updated = [notice, ...existing];
      saveStorage(`lords_notifications_${principal.id}`, updated);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `lords_notifications_${principal.id}`,
          newValue: JSON.stringify(updated),
        }),
      );
    }

    const record: BroadcastRecord = {
      id: String(Date.now()),
      title: title.trim(),
      body: body.trim(),
      category,
      target:
        target === "all"
          ? "All Schools"
          : (PRINCIPALS.find((p) => p.id === target)?.name ?? target),
      sentAt: new Date().toISOString(),
    };
    const updatedBroadcasts = [record, ...broadcasts].slice(0, 20);
    setBroadcasts(updatedBroadcasts);
    saveStorage("lords_appcontroller_broadcasts", updatedBroadcasts);

    // Auto-download CSV
    downloadCSV(
      [
        ["Title", "Category", "Message", "Target", "Sent At"],
        [
          title.trim(),
          category,
          body.trim(),
          record.target,
          new Date().toLocaleString(),
        ],
      ],
      `Broadcast_${category}_${new Date().toISOString().slice(0, 10)}.csv`,
    );

    setTitle("");
    setBody("");
    setSending(false);
    toast.success(`Message sent to ${record.target}! CSV downloaded.`);
  };

  return (
    <div className="space-y-6" data-ocid="app_controller.broadcast.section">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send Message to Parents</CardTitle>
          <CardDescription>
            Message is instantly visible in all parent portals under the Notices
            tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-ocid="app_controller.broadcast_category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Notice",
                    "Announcement",
                    "Holiday",
                    "Fees",
                    "Marks",
                    "Syllabus",
                    "General",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Target School</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger data-ocid="app_controller.broadcast_target.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {PRINCIPALS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Message Title</Label>
            <Input
              data-ocid="app_controller.broadcast_title.input"
              placeholder="e.g. Holiday Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Message Body</Label>
            <Textarea
              data-ocid="app_controller.broadcast_body.textarea"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            data-ocid="app_controller.broadcast.primary_button"
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
          >
            {sending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Send size={14} className="mr-1.5" />
            )}
            Send to All Parents
          </Button>
        </CardContent>
      </Card>

      {broadcasts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Broadcasts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {broadcasts.slice(0, 5).map((b, idx) => (
              <div
                key={b.id}
                data-ocid={`app_controller.broadcasts.item.${idx + 1}`}
                className="p-3 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {b.body}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {b.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2
                    size={12}
                    style={{ color: "oklch(0.42 0.16 150)" }}
                  />
                  <span className="text-xs text-muted-foreground">
                    Sent to {b.target} • {new Date(b.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Panel Builder Tab ────────────────────────────────────────────────────────

function PanelBuilderTab() {
  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string>(
    PRINCIPALS[0].id,
  );
  const [panels, setPanels] = useState<CustomPanelDef[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(
      `lords_dynamic_panels_${selectedPrincipalId}`,
    );
    setPanels(raw ? (JSON.parse(raw) as CustomPanelDef[]) : []);
    const chatRaw = localStorage.getItem(
      `lords_appbuilder_chat_v2_${selectedPrincipalId}`,
    );
    setChatMessages(chatRaw ? (JSON.parse(chatRaw) as ChatMessage[]) : []);
  }, [selectedPrincipalId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const savePanels = (newPanels: CustomPanelDef[]) => {
    const key = `lords_dynamic_panels_${selectedPrincipalId}`;
    localStorage.setItem(key, JSON.stringify(newPanels));
    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue: JSON.stringify(newPanels) }),
    );
    setPanels(newPanels);
  };

  const saveChatHistory = (msgs: ChatMessage[]) => {
    localStorage.setItem(
      `lords_appbuilder_chat_v2_${selectedPrincipalId}`,
      JSON.stringify(msgs),
    );
    setChatMessages(msgs);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      role: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const newHistory = [...chatMessages, userMsg];
    saveChatHistory(newHistory);
    setInput("");
    setProcessing(true);

    setTimeout(() => {
      const result = processMessage(userMsg.text, panels);
      savePanels(result.newPanels);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: result.response,
        timestamp: new Date().toISOString(),
        actionPanelId: result.actionPanelId,
      };
      saveChatHistory([...newHistory, assistantMsg]);
      setProcessing(false);
    }, 400);
  };

  const renderText = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");

  return (
    <div className="space-y-4" data-ocid="app_controller.panel_builder.section">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">
            Add panels to which school's sidebar?
          </Label>
          <Select
            value={selectedPrincipalId}
            onValueChange={(v) => {
              setSelectedPrincipalId(v);
            }}
          >
            <SelectTrigger data-ocid="app_controller.panel_builder.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRINCIPALS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="secondary" className="mb-1">
          {panels.length} custom panels
        </Badge>
      </div>

      <Card
        style={{ height: "420px", display: "flex", flexDirection: "column" }}
      >
        <CardHeader className="py-3 px-4 shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 size={14} style={{ color: "oklch(0.55 0.18 80)" }} />
            Panel Builder Chat
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 px-4">
          {chatMessages.length === 0 && (
            <div className="py-6 text-center">
              <Sparkles size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">
                Type a command to create a panel.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try: <em>"add transport tracker"</em> or <em>"help"</em>
              </p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div
              key={msg.timestamp + msg.role}
              className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                style={
                  msg.role === "user"
                    ? {
                        background: "oklch(0.25 0.10 265)",
                        color: "white",
                        borderRadius: "14px 14px 4px 14px",
                      }
                    : {
                        background: "oklch(0.94 0.012 260)",
                        color: "oklch(0.18 0.04 265)",
                        borderRadius: "14px 14px 14px 4px",
                      }
                }
                // biome-ignore lint/security/noDangerouslySetInnerHtml: formatted chat
                dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
              />
            </div>
          ))}
          {processing && (
            <div className="flex justify-start mb-3">
              <div
                className="px-3 py-2 rounded-xl"
                style={{ background: "oklch(0.94 0.012 260)" }}
              >
                <Loader2
                  size={14}
                  className="animate-spin text-muted-foreground"
                />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </ScrollArea>
        <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
          <Input
            data-ocid="app_controller.panel_builder.input"
            placeholder="e.g. add transport tracker, help, show panels…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={processing}
            className="flex-1"
          />
          <Button
            data-ocid="app_controller.panel_builder.primary_button"
            onClick={handleSend}
            disabled={processing || !input.trim()}
            style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
          >
            <Send size={14} />
          </Button>
        </div>
      </Card>

      {panels.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Current Custom Panels</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {panels.map((panel, idx) => (
                <div
                  key={panel.id}
                  data-ocid={`app_controller.panels.item.${idx + 1}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium">{panel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {panel.fields.length} fields
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`app_controller.panels.delete_button.${idx + 1}`}
                    onClick={() => {
                      const updated = panels.filter((p) => p.id !== panel.id);
                      savePanels(updated);
                      toast.success(`Removed "${panel.name}"`);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const actualCurrent = loadStorage<string>(
    "lords_app_controller_password",
    "Admin@Lords2026",
  );
  const canisterId =
    import.meta.env.VITE_CANISTER_ID_BACKEND ?? "Not available";

  const handleSavePwd = () => {
    if (currentPwd !== actualCurrent) {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    saveStorage("lords_app_controller_password", newPwd);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("App Controller password updated");
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  return (
    <div
      className="space-y-6 max-w-xl"
      data-ocid="app_controller.settings.section"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key size={16} /> App Controller Password
          </CardTitle>
          <CardDescription>
            Change the App Controller login password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-1 block">Current Password</Label>
            <Input
              data-ocid="app_controller.current_password.input"
              type="password"
              placeholder="Enter current password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">New Password</Label>
            <Input
              data-ocid="app_controller.new_password.input"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Confirm New Password</Label>
            <Input
              data-ocid="app_controller.confirm_password.input"
              type="password"
              placeholder="Repeat new password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </div>
          <Button
            data-ocid="app_controller.save_password.primary_button"
            onClick={handleSavePwd}
            disabled={saving || !currentPwd || !newPwd || !confirmPwd}
            style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
          >
            {saving ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={14} className="mr-1.5" />
            ) : (
              <Key size={14} className="mr-1.5" />
            )}
            {saved ? "Saved!" : "Save Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server size={16} /> ICP Backend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block">Canister ID</Label>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 font-mono text-sm px-3 py-2 rounded-lg border"
                style={{
                  background: "oklch(0.97 0.01 260)",
                  borderColor: "oklch(0.88 0.018 260)",
                }}
              >
                {canisterId}
              </code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            All school data syncs to this Internet Computer canister.
          </p>
          {canisterId !== "Not available" && (
            <a
              href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
              style={{ color: "oklch(0.52 0.18 255)" }}
            >
              View on ICP Dashboard ↗
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap size={16} /> About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">App:</strong> Lord&apos;s
            International School Group Portal
          </p>
          <p>
            <strong className="text-foreground">Version:</strong> 73
          </p>
          <p>
            <strong className="text-foreground">Schools:</strong>{" "}
            {PRINCIPALS.length} registered
          </p>
          <p>
            <strong className="text-foreground">Default Password:</strong>{" "}
            Admin@Lords2026
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
