import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ClipboardList,
  FileText,
  GraduationCap,
  Info,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  NotebookPen,
  Send,
  Server,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const studentNavItems = [
  { id: "list", label: "All Students", icon: Users },
  { id: "class-view", label: "Class View", icon: LayoutGrid },
  { id: "add", label: "Add Student", icon: UserPlus },
  { id: "info", label: "School Info", icon: Info },
];

const schoolNavItems = [
  { id: "holidays", label: "Holidays", icon: Calendar },
  { id: "school-syllabus", label: "Syllabus", icon: BookOpen },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "diary", label: "Diary", icon: NotebookPen },
  { id: "exam-timetable", label: "Exam Timetable", icon: ClipboardList },
  { id: "test-marks", label: "Test Marks", icon: FileText },
];

const communicationNavItems = [
  { id: "doubt-chat", label: "Doubt Chat", icon: MessageCircle },
  { id: "send-message", label: "Send Message", icon: Send },
];

const serverNavItem = [{ id: "server", label: "Server", icon: Server }];

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  pageLabel?: string;
  principalName?: string;
}

export default function PrincipalLayout({
  currentPage,
  onPageChange,
  onLogout,
  children,
  pageLabel,
  principalName,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allNavItems = [
    ...studentNavItems,
    ...schoolNavItems,
    ...communicationNavItems,
    ...serverNavItem,
  ];

  const renderNavSection = (items: typeof studentNavItems) =>
    items.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        data-ocid={`principal.${id.replace(/-/g, "_")}.link`}
        onClick={() => {
          onPageChange(id);
          setSidebarOpen(false);
        }}
        className={`sidebar-nav-item w-full text-left${
          currentPage === id ? " active" : ""
        }`}
      >
        <Icon size={16} className="shrink-0" />
        <span>{label}</span>
      </button>
    ));

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.60 0.19 255)" }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sidebar-foreground leading-tight truncate">
              Lord&apos;s International
            </p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight">
              School Group
            </p>
          </div>
        </div>
        {principalName && (
          <div
            className="mt-3 px-2.5 py-1.5 rounded-lg text-xs font-medium truncate"
            style={{
              background: "oklch(0.60 0.19 255 / 0.18)",
              color: "oklch(0.78 0.12 255)",
            }}
          >
            {principalName}
          </div>
        )}
      </div>

      {/* Logout — top of sidebar */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          data-ocid="principal.logout_button"
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150"
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
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
            Students
          </p>
          <div className="space-y-0.5">{renderNavSection(studentNavItems)}</div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
            School
          </p>
          <div className="space-y-0.5">{renderNavSection(schoolNavItems)}</div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
            Communication
          </p>
          <div className="space-y-0.5">
            {renderNavSection(communicationNavItems)}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
            Server & Data
          </p>
          <div className="space-y-0.5">{renderNavSection(serverNavItem)}</div>
        </div>
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border shrink-0 bg-card"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          {currentPage !== "list" && (
            <button
              type="button"
              data-ocid="principal.back_button"
              onClick={() => onPageChange("list")}
              className="hidden lg:flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">
              {pageLabel || "Student Management"}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "oklch(0.25 0.10 265 / 0.08)",
                color: "oklch(0.25 0.10 265)",
              }}
            >
              Principal Panel
            </span>
          </div>
        </header>

        {/* Nav tabs (mobile, all items) */}
        <div className="lg:hidden flex gap-1 px-3 py-2 overflow-x-auto border-b border-border bg-card shrink-0">
          {allNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPageChange(id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                currentPage === id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
