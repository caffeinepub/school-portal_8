import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRINCIPALS } from "@/data/principals";
import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  HardDrive,
  Image,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

interface StorageItem {
  key: string;
  label: string;
  size: number;
  type:
    | "students"
    | "syllabus"
    | "notifications"
    | "media"
    | "diary"
    | "exam"
    | "other";
}

function getLabel(key: string): { label: string; type: StorageItem["type"] } {
  if (key.includes("lords_students_"))
    return { label: "Student Records", type: "students" };
  if (key.includes("lords_syllabus_"))
    return { label: "Syllabus Data", type: "syllabus" };
  if (key.includes("lords_notifications_"))
    return { label: "Notices & Messages", type: "notifications" };
  if (key.includes("lords_diary_"))
    return { label: "Diary Entries", type: "diary" };
  if (key.includes("lords_exam_"))
    return { label: "Exam Timetable", type: "exam" };
  if (key.includes("lords_test_marks_"))
    return { label: "Test Marks", type: "exam" };
  if (
    key.includes("lords_media_") ||
    key.includes("profile_pic") ||
    key.includes("_pic_") ||
    key.includes("image") ||
    key.includes("photo")
  )
    return { label: "Media / Photos", type: "media" };
  if (key.includes("lords_doubt_"))
    return { label: "Doubt Chat", type: "other" };
  if (key.includes("lords_"))
    return {
      label: key.replace("lords_", "").replace(/_/g, " "),
      type: "other",
    };
  return { label: key, type: "other" };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getPrincipalSuffix(key: string): string {
  const match = key.match(/_(p[1-5])/);
  return match ? match[1] : "";
}

function scanStorage(): StorageItem[] {
  const items: StorageItem[] = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith("lords_") && !key.includes("profile")) continue;
    const val = localStorage.getItem(key) ?? "";
    const size = val.length * 2;
    const { label, type } = getLabel(key);
    items.push({ key, label, size, type });
  }
  return items.sort((a, b) => b.size - a.size);
}

function getTypeIcon(type: StorageItem["type"]) {
  if (type === "media") return <Image size={15} className="text-purple-500" />;
  if (type === "students")
    return <Database size={15} className="text-indigo-500" />;
  return <HardDrive size={15} className="text-gray-400" />;
}

interface Props {
  principalId: string;
}

export default function PrincipalStorageBackupPage({ principalId }: Props) {
  const [items, setItems] = useState<StorageItem[]>(() => scanStorage());
  const [backupStatus, setBackupStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [restoreStatus, setRestoreStatus] = useState<
    "idle" | "success" | "error" | "working"
  >("idle");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const principalName =
    PRINCIPALS.find((p) => p.id === principalId)?.name ?? "Principal";

  const refresh = () => setItems(scanStorage());

  const myItems = items.filter(
    (i) =>
      i.key.includes(`_${principalId}`) ||
      i.key.includes(`_${principalId}_`) ||
      getPrincipalSuffix(i.key) === principalId,
  );
  const otherItems = items.filter((i) => !myItems.includes(i));

  const handleBackup = () => {
    try {
      const backup: Record<string, unknown> = {
        _meta: {
          exportedAt: new Date().toISOString(),
          principalId,
          principalName,
        },
      };
      for (const key of Object.keys(localStorage)) {
        backup[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lords_school_backup_${principalId}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus("success");
      setTimeout(() => setBackupStatus("idle"), 3000);
    } catch {
      setBackupStatus("error");
      setTimeout(() => setBackupStatus("idle"), 3000);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreStatus("working");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<
          string,
          unknown
        >;
        for (const [key, value] of Object.entries(data)) {
          if (key === "_meta") continue;
          if (key.startsWith("lords_")) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
        refresh();
        setRestoreStatus("success");
        setTimeout(() => setRestoreStatus("idle"), 4000);
      } catch {
        setRestoreStatus("error");
        setTimeout(() => setRestoreStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDelete = (key: string) => {
    localStorage.removeItem(key);
    refresh();
    setDeleteConfirm(null);
  };

  const renderItem = (item: StorageItem) => (
    <div
      key={item.key}
      className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        {getTypeIcon(item.type)}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {item.label}
          </p>
          <p className="text-xs text-gray-400 truncate">{item.key}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">
          {formatSize(item.size)}
        </Badge>
        {deleteConfirm === item.key ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2 text-gray-500"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDelete(item.key)}
            >
              Delete
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
            onClick={() => setDeleteConfirm(item.key)}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <HardDrive className="text-indigo-600" size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                Storage & Backup
              </h2>
              <p className="text-sm text-gray-500">
                {principalName} &mdash; view, backup, and restore all saved
                files
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="font-medium text-gray-800">Backup & Restore</h3>
        <p className="text-sm text-gray-500">
          Export all data as a JSON file and restore it later. Use this if files
          stop showing or data seems missing.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleBackup}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Download size={15} /> Export Backup
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} /> Restore from Backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestore}
          />
        </div>
        {backupStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={15} /> Backup downloaded successfully.
          </div>
        )}
        {backupStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={15} /> Backup failed. Please try again.
          </div>
        )}
        {restoreStatus === "working" && (
          <div className="flex items-center gap-2 text-indigo-600 text-sm">
            <RefreshCw size={15} className="animate-spin" /> Restoring data...
          </div>
        )}
        {restoreStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={15} /> Data restored successfully. Please reload
            the app to see changes.
          </div>
        )}
        {restoreStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={15} /> Restore failed. Make sure the file is a
            valid Lords School backup.
          </div>
        )}
      </div>

      {/* My files */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-1">Your Saved Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Files and data stored for {principalName}. Delete if data is corrupted
          or no longer needed.
        </p>
        {myItems.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No data found for this account.
          </p>
        ) : (
          <div>{myItems.map(renderItem)}</div>
        )}
      </div>

      {/* Other app data */}
      {otherItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-1">Other App Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Shared app data not specific to your account (user accounts,
            settings, etc.).
          </p>
          <div>{otherItems.map(renderItem)}</div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        All data is stored securely in your browser. Use Export Backup regularly
        to prevent data loss.
      </p>
    </div>
  );
}
