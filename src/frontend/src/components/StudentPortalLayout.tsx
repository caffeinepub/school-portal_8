import { GraduationCap, LogOut, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  studentName: string;
  onLogout: () => void;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function StudentPortalLayout({
  studentName,
  onLogout,
  children,
  onRefresh,
}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Listen for storage events to show "New data received" toast
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
      window.dispatchEvent(
        new StorageEvent("storage", { key: "lords_refresh" }),
      );
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="px-4 lg:px-8 py-3.5 flex items-center gap-3"
        style={{ background: "oklch(var(--sidebar))" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "oklch(0.42 0.16 150)" }}
        >
          <GraduationCap size={17} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight text-sidebar-foreground">
            Lord&apos;s International School Group
          </div>
          <div className="text-xs text-sidebar-foreground/50">
            Students Portal
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "oklch(0.42 0.16 150 / 0.18)" }}
          >
            <Users size={13} style={{ color: "oklch(0.68 0.12 150)" }} />
            <span
              className="text-sm font-medium max-w-[120px] truncate"
              style={{ color: "oklch(0.92 0.04 150)" }}
            >
              {studentName}
            </span>
          </div>
          {lastUpdated && (
            <span
              className="hidden sm:block text-xs"
              style={{ color: "oklch(0.78 0.08 150)" }}
            >
              Updated: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            data-ocid="student.refresh_button"
            onClick={handleRefresh}
            title="Refresh data"
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border transition-colors"
            style={{
              color: "oklch(0.85 0.06 150)",
              borderColor: "oklch(0.42 0.16 150 / 0.3)",
              background: "oklch(0.42 0.16 150 / 0.12)",
            }}
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </button>
          <button
            type="button"
            data-ocid="student.logout_button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              color: "oklch(0.72 0.18 25)",
              borderColor: "oklch(0.55 0.22 25 / 0.25)",
              background: "oklch(0.55 0.22 25 / 0.08)",
            }}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Live indicator banner */}
      <div
        className="px-4 lg:px-8 py-1.5 flex items-center gap-2 text-xs"
        style={{
          background: "oklch(0.42 0.16 150 / 0.08)",
          borderBottom: "1px solid oklch(0.42 0.16 150 / 0.15)",
        }}
      >
        <span className="badge-live">LIVE</span>
        <span style={{ color: "oklch(0.40 0.12 150)" }}>
          Data updates every 3 seconds — messages from principal appear
          instantly
        </span>
      </div>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-6">{children}</main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} Lord&apos;s International School
        Group. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "oklch(0.52 0.18 255)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
