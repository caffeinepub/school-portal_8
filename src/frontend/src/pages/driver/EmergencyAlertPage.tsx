import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Siren,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EmergencyAlert {
  id: number;
  message: string;
  location: string;
  timestamp: string;
  resolved: boolean;
  type: string;
}

interface Props {
  schoolId: string;
}

const EMERGENCY_TYPES = [
  { id: "breakdown", label: "Vehicle Breakdown", emoji: "🔧" },
  { id: "accident", label: "Accident", emoji: "💥" },
  { id: "medical", label: "Medical Emergency", emoji: "🏥" },
  { id: "other", label: "Other Emergency", emoji: "⚠️" },
];

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

export default function EmergencyAlertPage({ schoolId }: Props) {
  const storageKey = `lords_emergency_alerts_${schoolId}`;

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() =>
    loadStorage<EmergencyAlert[]>(storageKey, []),
  );
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string>("breakdown");
  const [sending, setSending] = useState(false);
  const [locationStr, setLocationStr] = useState("Location unavailable");

  useEffect(() => {
    // Try to get location for pre-fill
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStr(
            `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          );
        },
        () => setLocationStr("Location unavailable"),
        { timeout: 5000 },
      );
    }
  }, []);

  useEffect(() => {
    saveStorage(storageKey, alerts);
  }, [alerts, storageKey]);

  const handleSendAlert = () => {
    if (!description.trim()) {
      toast.error("Please describe the emergency before sending.");
      return;
    }
    setSending(true);

    // Get fresh location
    const tryGetLocation = (cb: (loc: string) => void) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            cb(
              `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
            ),
          () => cb(locationStr),
          { timeout: 5000 },
        );
      } else {
        cb(locationStr);
      }
    };

    tryGetLocation((loc) => {
      const typeMeta = EMERGENCY_TYPES.find((t) => t.id === selectedType);
      const newAlert: EmergencyAlert = {
        id: Date.now(),
        message: `[${typeMeta?.label ?? "Emergency"}] ${description.trim()}`,
        location: loc,
        timestamp: new Date().toISOString(),
        resolved: false,
        type: selectedType,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      setDescription("");
      setSending(false);

      toast.error("🚨 EMERGENCY ALERT SENT to Principal & Main Controller!", {
        duration: 8000,
        description: `Type: ${typeMeta?.label}. Location: ${loc}`,
      });
    });
  };

  const handleMarkResolved = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    );
    toast.success("Alert marked as resolved.");
  };

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Emergency Alert</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          One-tap notification to Principal & Main Controller
        </p>
      </div>

      {/* Unresolved badge */}
      {unresolvedCount > 0 && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: "oklch(0.55 0.22 25 / 0.1)",
            color: "oklch(0.55 0.22 25)",
          }}
        >
          <Siren size={15} className="shrink-0" />
          {unresolvedCount} unresolved alert{unresolvedCount > 1 ? "s" : ""} —
          contact your principal to resolve
        </div>
      )}

      {/* Emergency type selector */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Emergency Type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EMERGENCY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              data-ocid={`driver.emergency.type_${type.id}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all"
              style={
                selectedType === type.id
                  ? {
                      borderColor: "oklch(0.55 0.22 25)",
                      background: "oklch(0.55 0.22 25 / 0.1)",
                      color: "oklch(0.45 0.2 25)",
                    }
                  : {
                      borderColor: "oklch(var(--border))",
                      color: "oklch(var(--foreground))",
                    }
              }
            >
              <span className="text-lg">{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          className="text-sm font-semibold text-foreground block mb-2"
          htmlFor="emergency-desc"
        >
          Describe the Emergency
        </label>
        <Textarea
          id="emergency-desc"
          placeholder="Briefly describe what happened (e.g., 'Bus broke down on Bhaleri Road near petrol pump, all students safe')..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-sm"
          data-ocid="driver.emergency.description_input"
        />
      </div>

      {/* Location */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{
          background: "oklch(var(--muted) / 0.5)",
          color: "oklch(var(--muted-foreground))",
        }}
      >
        <MapPin size={13} className="shrink-0" />
        <span>Auto-location: {locationStr}</span>
      </div>

      {/* BIG RED BUTTON */}
      <button
        type="button"
        onClick={handleSendAlert}
        disabled={sending || !description.trim()}
        data-ocid="driver.emergency.send_alert_button"
        className="w-full flex items-center justify-center gap-3 rounded-xl text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: sending
            ? "oklch(0.55 0.22 25 / 0.7)"
            : "oklch(0.55 0.22 25)",
          padding: "18px 24px",
          fontSize: "1.1rem",
          boxShadow: "0 4px 20px oklch(0.55 0.22 25 / 0.4)",
        }}
        onMouseEnter={(e) => {
          if (!sending)
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.48 0.22 25)";
        }}
        onMouseLeave={(e) => {
          if (!sending)
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.22 25)";
        }}
      >
        <AlertTriangle size={24} className="shrink-0" />
        {sending ? "SENDING ALERT..." : "SEND EMERGENCY ALERT"}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        This will immediately notify your <strong>Principal</strong> and the{" "}
        <strong>Main Controller</strong>
      </p>

      {/* Alert history */}
      {alerts.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">
                Alert History
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {alerts.length} total
            </span>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="px-4 py-3"
                data-ocid={`driver.emergency.alert_row_${alert.id}`}
              >
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge
                        style={
                          alert.resolved
                            ? {
                                background: "oklch(0.5 0.16 150 / 0.12)",
                                color: "oklch(0.4 0.14 150)",
                                border: "none",
                              }
                            : {
                                background: "oklch(0.55 0.22 25 / 0.12)",
                                color: "oklch(0.55 0.22 25)",
                                border: "none",
                              }
                        }
                      >
                        {alert.resolved ? "Resolved" : "Unresolved"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(alert.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin size={11} />
                      {alert.location}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkResolved(alert.id)}
                      data-ocid={`driver.emergency.resolve_button_${alert.id}`}
                      className="shrink-0 h-7 text-xs"
                      style={{
                        borderColor: "oklch(0.5 0.16 150 / 0.4)",
                        color: "oklch(0.4 0.14 150)",
                      }}
                    >
                      <CheckCircle2 size={12} className="mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
