import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderArchive } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Snapshot {
  timestamp: string;
  principalId: string;
  data: Record<string, unknown>;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

function collectData(principalId: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const suffix = `_${principalId}`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("lords_") && key.endsWith(suffix)) {
      try {
        result[key] = JSON.parse(localStorage.getItem(key) ?? "");
      } catch {
        result[key] = localStorage.getItem(key);
      }
    }
  }
  return result;
}

function loadSnapshots(principalId: string): Snapshot[] {
  try {
    const raw = localStorage.getItem(`lords_backup_snapshots_${principalId}`);
    if (raw) return JSON.parse(raw) as Snapshot[];
  } catch {}
  return [];
}

function saveSnapshots(principalId: string, snapshots: Snapshot[]) {
  localStorage.setItem(
    `lords_backup_snapshots_${principalId}`,
    JSON.stringify(snapshots),
  );
}

function autoSaveSnapshot(principalId: string): Snapshot[] {
  const data = collectData(principalId);
  const snapshot: Snapshot = {
    timestamp: new Date().toISOString(),
    principalId,
    data,
  };
  const existing = loadSnapshots(principalId);
  const updated = [snapshot, ...existing].slice(0, 5);
  saveSnapshots(principalId, updated);
  return updated;
}

function downloadJSON(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  principalId: string;
}

export default function PrincipalDataBackupPage({ principalId }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [fileInput, setFileInput] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updated = autoSaveSnapshot(principalId);
    setSnapshots(updated);
  }, [principalId]);

  const handleSaveNow = () => {
    const updated = autoSaveSnapshot(principalId);
    setSnapshots(updated);
    toast.success("Backup saved successfully!");
  };

  const handleRestore = (snapshot: Snapshot) => {
    if (
      !window.confirm(
        `Restore backup from ${formatDate(snapshot.timestamp)}? This will overwrite current data.`,
      )
    )
      return;
    for (const [key, value] of Object.entries(snapshot.data)) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
    toast.success("Data restored successfully! Please refresh the page.");
  };

  const handleDownload = (snapshot: Snapshot) => {
    const date = snapshot.timestamp.slice(0, 10);
    downloadJSON(snapshot, `lords-backup-${principalId}-${date}.json`);
  };

  const handleExportLatest = () => {
    if (snapshots.length === 0) {
      toast.error("No backup available. Click 'Save Backup Now' first.");
      return;
    }
    handleDownload(snapshots[0]);
  };

  const handleUploadRestore = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a backup file first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as Snapshot;
        if (!parsed.data || typeof parsed.data !== "object") {
          toast.error(
            "Invalid backup file. The file must have a 'data' field.",
          );
          return;
        }
        for (const [key, value] of Object.entries(parsed.data)) {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch {}
        }
        toast.success("Backup restored from file! Please refresh the page.");
        setFileInput("");
        if (fileRef.current) fileRef.current.value = "";
      } catch {
        toast.error(
          "Failed to parse backup file. Make sure it's a valid JSON.",
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl" data-ocid="data_backup.page">
      {/* Header */}
      <Card className="border-indigo-100 bg-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <FolderArchive size={22} className="text-indigo-600" />
            Data Backup
          </CardTitle>
          <p className="text-sm text-indigo-700 mt-1">
            All your data is automatically saved on each visit. You can restore
            any previous backup anytime.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            data-ocid="data_backup.primary_button"
            onClick={handleSaveNow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save Backup Now
          </Button>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-800">
            Backup History (Last 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div
              data-ocid="data_backup.empty_state"
              className="text-center py-8 text-gray-400"
            >
              No backups yet. Click &ldquo;Save Backup Now&rdquo; to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snap, idx) => (
                <div
                  key={snap.timestamp}
                  data-ocid={`data_backup.item.${idx + 1}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(snap.timestamp)}
                      </span>
                      <Badge className="bg-green-100 text-green-700 text-xs font-medium">
                        Auto-saved
                      </Badge>
                      {idx === 0 && (
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {Object.keys(snap.data).length} data keys saved
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`data_backup.secondary_button.${idx + 1}`}
                      onClick={() => handleRestore(snap)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`data_backup.edit_button.${idx + 1}`}
                      onClick={() => handleDownload(snap)}
                      className="text-gray-600 border-gray-200 hover:bg-gray-100"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore from File */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-800">
            Restore from File
          </CardTitle>
          <p className="text-sm text-gray-500">
            Upload a previously downloaded backup (.json) to restore all data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              data-ocid="data_backup.upload_button"
              value={fileInput}
              onChange={(e) => setFileInput(e.target.value)}
              className="flex-1 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-200 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-md px-2 py-1.5"
            />
            <Button
              data-ocid="data_backup.submit_button"
              onClick={handleUploadRestore}
              className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
            >
              Upload & Restore
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Latest */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-800">
            Export Latest Backup
          </CardTitle>
          <p className="text-sm text-gray-500">
            Download your most recent backup as a JSON file for safekeeping.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            data-ocid="data_backup.secondary_button"
            variant="outline"
            onClick={handleExportLatest}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            Export Latest Backup as JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
