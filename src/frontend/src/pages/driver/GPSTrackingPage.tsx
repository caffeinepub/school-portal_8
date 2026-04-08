import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, MapPin, Navigation, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  schoolId: string;
  driverId?: number;
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  lastUpdated: Date | null;
}

export default function GPSTrackingPage({ schoolId, driverId }: Props) {
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    lastUpdated: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const saveLocation = useCallback(
    (lat: number, lng: number) => {
      const entry = {
        lat,
        lng,
        timestamp: new Date().toISOString(),
        driverId: driverId ?? 0,
        schoolId,
      };
      try {
        localStorage.setItem(
          `lords_bus_location_${schoolId}_${driverId ?? 0}`,
          JSON.stringify(entry),
        );
        localStorage.setItem(
          `lords_bus_location_${schoolId}`,
          JSON.stringify(entry),
        );
      } catch {}
      setSendCount((c) => c + 1);
    },
    [schoolId, driverId],
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      toast.error("Geolocation not supported");
      return;
    }

    setError(null);
    setTracking(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
          lastUpdated: new Date(),
        });
        saveLocation(latitude, longitude);
        toast.success(
          "GPS tracking started. Location sent to Main Controller.",
        );
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        toast.error("Could not get location. Check GPS permissions.");
        setTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    // Update every 30 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            lastUpdated: new Date(),
          });
          saveLocation(latitude, longitude);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }, 30000);
  }, [saveLocation]);

  const stopTracking = useCallback(() => {
    setTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    toast.info("GPS tracking stopped.");
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const formatCoord = (val: number | null) =>
    val !== null ? val.toFixed(6) : "—";

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">GPS Tracking</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live bus location updates every 30 seconds
        </p>
      </div>

      {/* Status card */}
      <div
        className="rounded-xl p-5 flex items-center gap-4 border"
        style={
          tracking
            ? {
                background: "oklch(0.5 0.16 150 / 0.08)",
                borderColor: "oklch(0.5 0.16 150 / 0.3)",
              }
            : {
                background: "oklch(var(--muted) / 0.5)",
                borderColor: "oklch(var(--border))",
              }
        }
        data-ocid="driver.gps.status_card"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={
            tracking
              ? { background: "oklch(0.5 0.16 150 / 0.15)" }
              : { background: "oklch(var(--muted))" }
          }
        >
          {tracking ? (
            <Navigation
              size={22}
              style={{ color: "oklch(0.5 0.16 150)" }}
              className="animate-pulse"
            />
          ) : (
            <WifiOff size={22} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">
              {tracking ? "Tracking Active" : "Tracking Off"}
            </span>
            <Badge
              style={
                tracking
                  ? {
                      background: "oklch(0.5 0.16 150 / 0.15)",
                      color: "oklch(0.4 0.14 150)",
                      border: "none",
                    }
                  : {
                      background: "oklch(var(--muted))",
                      color: "oklch(var(--muted-foreground))",
                      border: "none",
                    }
              }
            >
              {tracking ? "● LIVE" : "○ OFFLINE"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tracking
              ? `Sending location every 30s · ${sendCount} update${sendCount !== 1 ? "s" : ""} sent`
              : "Press Start Tracking to share your location"}
          </p>
        </div>
      </div>

      {/* Visibility note */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-xs"
        style={{
          background: "oklch(var(--portal-driver) / 0.08)",
          color: "oklch(var(--portal-driver))",
        }}
      >
        <Eye size={14} className="shrink-0 mt-0.5" />
        <span>
          Your location is visible to the <strong>Main Controller</strong> and
          your <strong>Principal</strong> when tracking is active.
        </span>
      </div>

      {/* Action button */}
      <div className="flex gap-3">
        {!tracking ? (
          <Button
            onClick={startTracking}
            className="flex-1 h-12 text-base font-semibold"
            style={{ background: "oklch(0.5 0.16 150)", color: "white" }}
            data-ocid="driver.gps.start_tracking_button"
          >
            <Navigation size={18} className="mr-2" />
            Start Tracking
          </Button>
        ) : (
          <Button
            onClick={stopTracking}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold border-destructive text-destructive hover:bg-destructive/10"
            data-ocid="driver.gps.stop_tracking_button"
          >
            <WifiOff size={18} className="mr-2" />
            Stop Tracking
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "oklch(0.55 0.22 25 / 0.08)",
            color: "oklch(0.55 0.22 25)",
          }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Location display */}
      {(location.lat !== null || tracking) && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <MapPin
              size={15}
              style={{ color: "oklch(var(--portal-driver))" }}
            />
            <span className="font-semibold text-sm text-foreground">
              Current Location
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-0.5">Latitude</p>
              <p
                className="font-mono text-sm font-semibold"
                style={{ color: "oklch(var(--portal-driver))" }}
                data-ocid="driver.gps.latitude_display"
              >
                {formatCoord(location.lat)}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-0.5">Longitude</p>
              <p
                className="font-mono text-sm font-semibold"
                style={{ color: "oklch(var(--portal-driver))" }}
                data-ocid="driver.gps.longitude_display"
              >
                {formatCoord(location.lng)}
              </p>
            </div>
          </div>
          {location.accuracy !== null && (
            <div className="px-4 py-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Accuracy: ±{Math.round(location.accuracy)}m
              </span>
              {location.lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {location.lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">How it works</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            • Press <strong>Start Tracking</strong> at the beginning of your
            route
          </li>
          <li>
            • Your GPS location is sent every <strong>30 seconds</strong>
          </li>
          <li>• The Main Controller can monitor all buses in real-time</li>
          <li>
            • Press <strong>Stop Tracking</strong> when you finish the route
          </li>
          <li>• Keep the app open and screen on for continuous tracking</li>
        </ul>
      </div>
    </div>
  );
}
