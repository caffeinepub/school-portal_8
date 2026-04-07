import {
  AlertCircle,
  Award,
  Banknote,
  Bell,
  BookMarked,
  BookOpen,
  Bus,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  Clipboard,
  ClipboardList,
  FileOutput,
  FileText,
  FlaskConical,
  GraduationCap,
  Heart,
  HeartHandshake,
  Info,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  NotebookPen,
  Package,
  Pencil,
  RefreshCw,
  Send,
  Server,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Inline type for the dynamic panels (mirrors CustomPanelDef)
interface CustomPanelDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdAt?: string;
  visibleToParents?: boolean;
}

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

// Icon map for dynamic panels
function getIconComponent(iconName: string): React.ElementType {
  const map: Record<string, React.ElementType> = {
    Bus,
    Heart,
    BookMarked,
    Banknote,
    Pencil,
    AlertCircle,
    UserCheck,
    Trophy,
    Package,
    CalendarCheck,
    Award,
    FileOutput,
    GraduationCap,
    UserPlus,
    Wrench,
    HeartHandshake,
    FlaskConical,
    LayoutGrid,
    // Fallback aliases
    MessageSquareWarning: MessageCircle,
    Bell,
    Clipboard,
    CalendarDays,
  };
  return map[iconName] ?? LayoutGrid;
}

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  pageLabel?: string;
  principalName?: string;
  principalId?: string;
  onRefresh?: () => void;
}

export default function PrincipalLayout({
  currentPage,
  onPageChange,
  onLogout,
  children,
  pageLabel,
  principalName,
  principalId,
  onRefresh,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [customPanelDefs, setCustomPanelDefs] = useState<CustomPanelDef[]>([]);

  // Load dynamic panels on mount and watch for storage changes
  useEffect(() => {
    const pid = principalId ?? "default";

    const loadPanels = () => {
      try {
        const dynamicKey = `lords_dynamic_panels_${pid}`;
        const dynamicRaw = localStorage.getItem(dynamicKey);
        if (dynamicRaw) {
          const defs = JSON.parse(dynamicRaw) as CustomPanelDef[];
          setCustomPanelDefs(defs);
          return;
        }
        // Backward compat: old lords_custom_panels_ key (simple string array)
        const oldKey = `lords_custom_panels_${pid}`;
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw) {
          const ids = JSON.parse(oldRaw) as string[];
          const defs: CustomPanelDef[] = ids.map((id) => ({
            id,
            name: id
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            icon: "LayoutGrid",
            description: "",
          }));
          setCustomPanelDefs(defs);
          return;
        }
        setCustomPanelDefs([]);
      } catch {
        setCustomPanelDefs([]);
      }
    };

    loadPanels();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith("lords_dynamic_panels_") ||
        e.key?.startsWith("lords_custom_panels_")
      ) {
        loadPanels();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [principalId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    window.dispatchEvent(new StorageEvent("storage", { key: "lords_refresh" }));
    window.dispatchEvent(new CustomEvent("lords_full_refresh"));
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1000);
  };

  const allNavItems = [
    ...studentNavItems,
    ...schoolNavItems,
    ...communicationNavItems,
    ...serverNavItem,
  ];

  const renderNavSection = (
    items: { id: string; label: string; icon: React.ElementType }[],
  ) =>
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

        {/* Custom Panels section */}
        {customPanelDefs.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
              Custom Panels
            </p>
            <div className="space-y-0.5">
              {customPanelDefs.map((panel) => {
                const Icon = getIconComponent(panel.icon);
                return (
                  <button
                    key={panel.id}
                    type="button"
                    data-ocid={`principal.custom_${panel.id.replace(/-/g, "_").replace(/[^a-z0-9_]/gi, "")}.link`}
                    onClick={() => {
                      onPageChange(`custom-${panel.id}`);
                      setSidebarOpen(false);
                    }}
                    className={`sidebar-nav-item w-full text-left${
                      currentPage === `custom-${panel.id}` ? " active" : ""
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{panel.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:block text-xs text-muted-foreground">
                Updated: {lastUpdated}
              </span>
            )}
            <button
              type="button"
              data-ocid="principal.refresh_button"
              onClick={handleRefresh}
              title="Refresh data"
              className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-accent"
              style={{ borderColor: "oklch(0.75 0.05 265 / 0.3)" }}
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline text-xs">Refresh</span>
            </button>
            <span
              className="hidden md:block text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "oklch(0.25 0.10 265 / 0.08)",
                color: "oklch(0.25 0.10 265)",
              }}
            >
              Principal Panel
            </span>
          </div>
        </header>

        {/* Nav tabs (mobile) */}
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
