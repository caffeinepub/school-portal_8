import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import {
  AlertCircle,
  Archive,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  HardDrive,
  Image,
  Info,
  RefreshCw,
  Server,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import PrincipalDataBackupPage from "./PrincipalDataBackupPage";
import PrincipalDataServerPage from "./PrincipalDataServerPage";
import PrincipalErrorFixPage from "./PrincipalErrorFixPage";
import PrincipalStoragePage from "./PrincipalStoragePage";

interface Props {
  principalId: string;
  students: Student[];
}

type Tab =
  | "data-server"
  | "data-backup"
  | "storage"
  | "error-fix"
  | "class-records"
  | "icp-backend";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "data-server", label: "Data Server", icon: Database },
  { id: "data-backup", label: "Data Backup", icon: Archive },
  { id: "storage", label: "Storage & Backup", icon: HardDrive },
  { id: "error-fix", label: "Error Fix", icon: Wrench },
  { id: "class-records", label: "Class Records", icon: FolderOpen },
  { id: "icp-backend", label: "ICP Backend", icon: Globe },
];

type RecordType = "Diary" | "Timetable" | "Test Marks" | "Notice";

interface ClassRecord {
  type: RecordType;
  className: string;
  date: string;
  summary: string;
  raw: unknown;
}

function getIcon(type: RecordType) {
  switch (type) {
    case "Diary":
      return BookOpen;
    case "Timetable":
      return ClipboardList;
    case "Test Marks":
      return FileText;
    case "Notice":
      return Bell;
  }
}

function getColor(type: RecordType) {
  switch (type) {
    case "Diary":
      return "bg-emerald-100 text-emerald-700";
    case "Timetable":
      return "bg-blue-100 text-blue-700";
    case "Test Marks":
      return "bg-purple-100 text-purple-700";
    case "Notice":
      return "bg-amber-100 text-amber-700";
  }
}

function loadClassRecords(principalId: string): Record<string, ClassRecord[]> {
  const grouped: Record<string, ClassRecord[]> = {};
  const addRecord = (record: ClassRecord) => {
    if (!grouped[record.className]) grouped[record.className] = [];
    grouped[record.className].push(record);
  };

  try {
    const raw = localStorage.getItem(`lords_diary_${principalId}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const entry of data) {
          addRecord({
            type: "Diary",
            className: entry.className || "Unknown",
            date: entry.date || "",
            summary: `${(entry.subjects || []).length} subjects`,
            raw: entry,
          });
        }
      }
    }
  } catch {}

  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(`lords_timetable_${principalId}_`),
    );
    for (const key of keys) {
      const className = key.replace(`lords_timetable_${principalId}_`, "");
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(data) && data.length > 0) {
        addRecord({
          type: "Timetable",
          className,
          date: data[0]?.date || "",
          summary: `${data.length} exam rows`,
          raw: data,
        });
      }
    }
  } catch {}

  try {
    const noticesRaw = localStorage.getItem(
      `lords_notifications_${principalId}`,
    );
    if (noticesRaw) {
      const notices = JSON.parse(noticesRaw);
      if (Array.isArray(notices)) {
        for (const n of notices.slice(0, 10)) {
          addRecord({
            type: "Notice",
            className: "All Classes",
            date: n.date || "",
            summary: n.title || n.type || "Notice",
            raw: n,
          });
        }
      }
    }
  } catch {}

  return grouped;
}

interface IcpMediaItem {
  studentId: string;
  fileType: string;
  timestamp: string;
  caption: string;
  blobReferenceId: string;
}

function IcpBackendTab() {
  const { actor, isFetching } = useActor();
  const [canisterId, setCanisterId] = useState("");
  const [copied, setCopied] = useState(false);
  const [mediaItems, setMediaItems] = useState<IcpMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [canisterOnline, setCanisterOnline] = useState<boolean | null>(null);

  useEffect(() => {
    loadConfig()
      .then((cfg) => setCanisterId(cfg.backend_canister_id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoadingMedia(true);
    setMediaError("");
    actor
      .getAllMedia()
      .then((items) => {
        setMediaItems(
          items.map((item) => ({
            studentId: String(item.studentId),
            fileType: item.fileType,
            timestamp: item.timestamp,
            caption: item.caption,
            blobReferenceId: item.blobReferenceId,
          })),
        );
        setCanisterOnline(true);
      })
      .catch((err: unknown) => {
        setMediaError(String(err));
        setCanisterOnline(false);
      })
      .finally(() => setLoadingMedia(false));
  }, [actor, isFetching]);

  const handleCopy = () => {
    if (!canisterId) return;
    navigator.clipboard.writeText(canisterId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRefresh = () => {
    if (!actor) return;
    setLoadingMedia(true);
    setMediaError("");
    actor
      .getAllMedia()
      .then((items) => {
        setMediaItems(
          items.map((item) => ({
            studentId: String(item.studentId),
            fileType: item.fileType,
            timestamp: item.timestamp,
            caption: item.caption,
            blobReferenceId: item.blobReferenceId,
          })),
        );
        setCanisterOnline(true);
      })
      .catch((err: unknown) => {
        setMediaError(String(err));
        setCanisterOnline(false);
      })
      .finally(() => setLoadingMedia(false));
  };

  return (
    <div className="space-y-4">
      {/* Canister ID card */}
      <Card className="border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <Server size={16} className="text-blue-600" />
            ICP Canister ID
            {canisterOnline === true && (
              <span className="flex items-center gap-1 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-auto">
                <CheckCircle2 size={11} />
                Online
              </span>
            )}
            {canisterOnline === false && (
              <span className="flex items-center gap-1 text-xs font-normal text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-auto">
                <XCircle size={11} />
                Check Dashboard
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canisterId ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <code className="flex-1 text-sm font-mono text-slate-800 break-all">
                {canisterId}
              </code>
              <button
                type="button"
                data-ocid="server.canister_id.button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 shrink-0 transition-colors px-2 py-1 rounded"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading canister ID...
            </p>
          )}

          {/* FIX: Replaced broken .icp0.io link with proper links */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <strong>About the ICP canister:</strong> This Motoko canister
              stores media files (student photos/videos) securely on the
              Internet Computer. It does <strong>not</strong> serve raw HTTP
              data — accessing the canister URL directly returns a 503 error by
              design. Use the ICP Dashboard link below to check canister status
              and cycles.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {canisterId && (
              <a
                href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="server.icp_dashboard.link"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "oklch(0.52 0.18 255)" }}
              >
                <ExternalLink size={14} />
                View Canister on ICP Dashboard
              </a>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info size={12} />
              <span>
                Student data (marks, fees, attendance) is stored locally for
                instant access. Media files are stored on the ICP canister.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICP Media Data */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Image size={16} className="text-blue-600" />
              Media Files on ICP
              {mediaItems.length > 0 && (
                <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {mediaItems.length} files
                </span>
              )}
            </CardTitle>
            <button
              type="button"
              data-ocid="server.refresh_media.button"
              onClick={handleRefresh}
              disabled={loadingMedia || isFetching}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
            >
              <RefreshCw
                size={13}
                className={loadingMedia ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {(loadingMedia || isFetching) && (
            <div
              data-ocid="server.media.loading_state"
              className="flex items-center gap-2 py-4 text-sm text-muted-foreground"
            >
              <RefreshCw size={14} className="animate-spin" />
              Loading ICP media data...
            </div>
          )}

          {!loadingMedia && !isFetching && mediaError && (
            <div
              data-ocid="server.media.error_state"
              className="flex items-center gap-2 py-3 text-sm"
            >
              <AlertCircle size={14} className="text-amber-600" />
              <span className="text-amber-700">
                Could not load media: {mediaError}
              </span>
            </div>
          )}

          {!loadingMedia &&
            !isFetching &&
            !mediaError &&
            mediaItems.length === 0 && (
              <div
                data-ocid="server.media.empty_state"
                className="py-6 text-center text-sm text-muted-foreground"
              >
                No media files stored on ICP yet. Upload student photos or
                videos to see them here.
              </div>
            )}

          {!loadingMedia && mediaItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Student ID
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                      Caption
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mediaItems.map((item, i) => (
                    <tr
                      key={item.blobReferenceId}
                      data-ocid={`server.media.item.${i + 1}`}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-1.5 pr-3 text-muted-foreground font-mono text-xs">
                        {item.studentId}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            item.fileType === "photo"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.fileType === "photo" ? "📷" : "🎥"}{" "}
                          {String(item.fileType)}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 max-w-[160px] truncate text-foreground">
                        {item.caption || "—"}
                      </td>
                      <td className="py-1.5 text-xs text-muted-foreground">
                        {item.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Architecture info */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">
            Data Storage Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              label: "Student data (marks, fees, attendance, syllabus)",
              location: "Device (localStorage)",
              icon: "💾",
              note: "Fast, instant access — synced via 5-second refresh",
            },
            {
              label: "Messages & Notices to Parents",
              location: "Device (localStorage)",
              icon: "📢",
              note: "Broadcast instantly — parents see within 5 seconds",
            },
            {
              label: "Media files (photos, videos)",
              location: "ICP Canister",
              icon: "☁️",
              note: "Secure, permanent — stored on the Internet Computer",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 py-2 border-b border-slate-200 last:border-0"
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.note}</p>
              </div>
              <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 shrink-0">
                {item.location}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ClassRecordsTab({ principalId }: { principalId: string }) {
  const [records, setRecords] = useState<Record<string, ClassRecord[]>>({});
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const refreshRecords = () => setRecords(loadClassRecords(principalId));

  useEffect(() => {
    setRecords(loadClassRecords(principalId));
  }, [principalId]);

  const classes = Object.keys(records).sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          data-ocid="server.class_records.button"
          onClick={refreshRecords}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {classes.length === 0 && (
        <div
          data-ocid="server.class_records.empty_state"
          className="py-12 text-center text-muted-foreground text-sm"
        >
          No class records yet. Records appear here automatically when you send
          diary, timetable, test marks, or notices to parents.
        </div>
      )}

      {classes.map((cls) => (
        <Card key={cls} className="overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors"
            onClick={() => setExpandedClass(expandedClass === cls ? null : cls)}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={16} className="text-blue-600" />
              <span className="font-semibold text-sm">{cls}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {records[cls].length} records
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {expandedClass === cls ? "▲" : "▼"}
            </span>
          </button>

          {expandedClass === cls && (
            <div className="border-t border-border">
              {records[cls].map((rec, i) => {
                const Icon = getIcon(rec.type);
                return (
                  <div
                    key={`${rec.type}-${i}`}
                    data-ocid={`server.class_records.item.${i + 1}`}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0 ${getColor(rec.type)}`}
                    >
                      <Icon size={11} />
                      {rec.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {rec.summary}
                      </p>
                    </div>
                    {rec.date && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {rec.date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function PrincipalServerPage({ principalId, students }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("icp-backend");

  return (
    <div className="space-y-5">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Server size={20} style={{ color: "oklch(0.52 0.18 255)" }} />
            Server
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All server functions in one place — ICP backend, data management,
            backup, storage, diagnostics, and class records.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className="flex flex-wrap gap-1.5 border-b border-border pb-1"
            role="tablist"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                data-ocid={`server.${id.replace(/-/g, "_")}.tab`}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg transition-colors border-b-2 -mb-px ${
                  activeTab === id
                    ? "text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={
                  activeTab === id
                    ? {
                        borderColor: "oklch(0.52 0.18 255)",
                        color: "oklch(0.35 0.12 255)",
                      }
                    : {}
                }
              >
                <Icon size={14} />
                {label}
                {id === "icp-backend" && (
                  <span className="ml-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full leading-none">
                    Fixed
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        {activeTab === "data-server" && (
          <PrincipalDataServerPage
            principalId={principalId}
            students={students}
          />
        )}
        {activeTab === "data-backup" && (
          <PrincipalDataBackupPage principalId={principalId} />
        )}
        {activeTab === "storage" && (
          <PrincipalStoragePage principalId={principalId} />
        )}
        {activeTab === "error-fix" && (
          <PrincipalErrorFixPage principalId={principalId} />
        )}
        {activeTab === "class-records" && (
          <ClassRecordsTab principalId={principalId} />
        )}
        {activeTab === "icp-backend" && <IcpBackendTab />}
      </div>
    </div>
  );
}
