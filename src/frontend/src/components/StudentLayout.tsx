import {
  BookOpen,
  Calendar,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const navSections = [
  {
    label: "My Academics",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "digital-library", label: "Digital Library", icon: BookOpen },
      { id: "fee-status", label: "Fee Status", icon: CreditCard },
      { id: "submissions", label: "Submissions", icon: Upload },
      { id: "timetable", label: "Timetable", icon: Calendar },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  pageLabel?: string;
  studentName?: string;
  onRefresh?: () => void;
}

export default function StudentLayout({
  currentPage,
  onPageChange,
  onLogout,
  children,
  pageLabel,
  studentName,
  onRefresh,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key &&
        (e.key.includes("lords_notices") ||
          e.key.includes("lords_diary") ||
          e.key.includes("lords_students") ||
          e.key.includes("lords_notifications"))
      ) {
        toast("New information received from school", {
          icon: "📩",
          duration: 3000,
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 800);
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(var(--portal-students))" }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sidebar-foreground leading-tight truncate">
              Lord&apos;s International
            </p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight">
              Students Portal
            </p>
          </div>
        </div>
        {studentName && (
          <div
            className="mt-3 px-2.5 py-1.5 rounded-lg text-xs font-medium truncate"
            style={{
              background: "oklch(var(--portal-students) / 0.18)",
              color: "oklch(var(--portal-students-light))",
            }}
          >
            {studentName}
          </div>
        )}
      </div>

      {/* Logout at top */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          data-ocid="student.logout_button"
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
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 text-sidebar-foreground/40">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  data-ocid={`student.${id.replace(/-/g, "_")}.link`}
                  onClick={() => {
                    onPageChange(id);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-nav-item w-full text-left${currentPage === id ? " active" : ""}`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <span className="badge-live text-xs">LIVE</span>
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
        className={`fixed inset-y-0 left-0 z-50 w-60 lg:hidden flex flex-col h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {pageLabel || "Students Portal"}
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
              data-ocid="student.refresh_button"
              onClick={handleRefresh}
              title="Refresh"
              className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-accent"
              style={{ borderColor: "oklch(var(--portal-students) / 0.3)" }}
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
                background: "oklch(var(--portal-students) / 0.1)",
                color: "oklch(var(--portal-students))",
              }}
            >
              Students Portal
            </span>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <div className="lg:hidden flex gap-1 px-3 py-2 overflow-x-auto border-b border-border bg-card shrink-0">
          {allNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPageChange(id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                currentPage === id
                  ? "font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              style={
                currentPage === id
                  ? {
                      background: "oklch(var(--portal-students) / 0.1)",
                      color: "oklch(var(--portal-students))",
                    }
                  : {}
              }
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
