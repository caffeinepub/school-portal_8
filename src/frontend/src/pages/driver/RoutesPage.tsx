import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, RefreshCw, Sun, Sunset, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface RouteStop {
  name: string;
  studentIds: number[];
  students?: string[];
}

interface TransportRoute {
  id: number;
  vehicleNo: string;
  driverName: string;
  stops: RouteStop[];
}

interface Props {
  schoolId: string;
  driverId?: number;
  vehicleNo?: string;
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

const MOCK_ROUTES: TransportRoute[] = [
  {
    id: 1,
    vehicleNo: "RJ-12-AB-1234",
    driverName: "Ramu Singh",
    stops: [
      {
        name: "Station Road",
        studentIds: [1, 2],
        students: ["Arjun Sharma", "Priya Patel"],
      },
      { name: "Nehru Nagar", studentIds: [3], students: ["Rahul Kumar"] },
      {
        name: "Gandhi Chowk",
        studentIds: [4, 5],
        students: ["Anjali Singh", "Vikram Yadav"],
      },
      { name: "Market Area", studentIds: [6], students: ["Sunita Devi"] },
      { name: "Lords International School", studentIds: [], students: [] },
    ],
  },
];

export default function RoutesPage({ schoolId, vehicleNo }: Props) {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState(0);
  const [routeType, setRouteType] = useState<"morning" | "afternoon">(
    "morning",
  );

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const stored = loadStorage<TransportRoute[]>(
        `lords_routes_${schoolId}`,
        [],
      );
      setRoutes(stored.length > 0 ? stored : MOCK_ROUTES);
      setLoading(false);
    }, 400);
  }, [schoolId]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const stored = loadStorage<TransportRoute[]>(
        `lords_routes_${schoolId}`,
        [],
      );
      setRoutes(stored.length > 0 ? stored : MOCK_ROUTES);
      setLoading(false);
    }, 400);
  };

  const myRoutes = vehicleNo
    ? routes.filter((r) => r.vehicleNo === vehicleNo)
    : routes;

  const displayRoutes = myRoutes.length > 0 ? myRoutes : routes;

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (displayRoutes.length === 0) {
    return (
      <div
        className="max-w-2xl bg-card border border-border rounded-xl p-10 text-center"
        data-ocid="driver.routes.empty_state"
      >
        <MapPin size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Routes Assigned
        </h3>
        <p className="text-sm text-muted-foreground">
          Your principal has not assigned any routes yet. Contact your school
          administrator.
        </p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>
    );
  }

  const route = displayRoutes[activeRoute] ?? displayRoutes[0];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Route Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assigned stops and student list
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          data-ocid="driver.routes.refresh_button"
        >
          <RefreshCw size={13} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Route type toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setRouteType("morning")}
          data-ocid="driver.routes.morning_tab"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all"
          style={
            routeType === "morning"
              ? {
                  background: "oklch(var(--portal-driver))",
                  color: "white",
                  fontWeight: 600,
                }
              : { color: "oklch(var(--muted-foreground))" }
          }
        >
          <Sun size={14} /> Morning
        </button>
        <button
          type="button"
          onClick={() => setRouteType("afternoon")}
          data-ocid="driver.routes.afternoon_tab"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all"
          style={
            routeType === "afternoon"
              ? {
                  background: "oklch(var(--portal-driver))",
                  color: "white",
                  fontWeight: 600,
                }
              : { color: "oklch(var(--muted-foreground))" }
          }
        >
          <Sunset size={14} /> Afternoon
        </button>
      </div>

      {/* Route selector (if multiple routes) */}
      {displayRoutes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {displayRoutes.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRoute(i)}
              className="px-3 py-1.5 text-xs rounded-full border transition-all whitespace-nowrap"
              style={
                activeRoute === i
                  ? {
                      borderColor: "oklch(var(--portal-driver))",
                      background: "oklch(var(--portal-driver) / 0.1)",
                      color: "oklch(var(--portal-driver))",
                      fontWeight: 600,
                    }
                  : { borderColor: "oklch(var(--border))" }
              }
            >
              {r.vehicleNo}
            </button>
          ))}
        </div>
      )}

      {/* Vehicle info */}
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: "oklch(var(--portal-driver) / 0.08)",
          border: "1px solid oklch(var(--portal-driver) / 0.2)",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
          style={{ background: "oklch(var(--portal-driver) / 0.15)" }}
        >
          🚌
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">{route.vehicleNo}</p>
          <p className="text-sm text-muted-foreground">{route.driverName}</p>
        </div>
        <Badge
          className="shrink-0"
          style={{
            background: "oklch(var(--portal-driver) / 0.15)",
            color: "oklch(var(--portal-driver))",
            border: "none",
          }}
        >
          {route.stops.reduce((acc, s) => acc + (s.studentIds?.length ?? 0), 0)}{" "}
          Students
        </Badge>
      </div>

      {/* Stop sequence */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">
            {routeType === "morning" ? "Morning Pickup" : "Afternoon Drop"}{" "}
            Route
          </h3>
          <span className="text-xs text-muted-foreground">
            {route.stops.length} stops
          </span>
        </div>
        <div className="divide-y divide-border">
          {route.stops.map((stop, idx) => {
            const isSchool = idx === route.stops.length - 1;
            const stopKey = `${stop.name}-${idx}`;
            return (
              <div
                key={stopKey}
                className="flex gap-3 p-4"
                data-ocid={`driver.routes.stop_row_${idx}`}
              >
                {/* Number line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background: isSchool
                        ? "oklch(0.5 0.16 150)"
                        : "oklch(var(--portal-driver))",
                    }}
                  >
                    {isSchool ? "🏫" : idx + 1}
                  </div>
                  {idx < route.stops.length - 1 && (
                    <div
                      className="w-0.5 flex-1 mt-1 min-h-[16px]"
                      style={{
                        background: "oklch(var(--portal-driver) / 0.25)",
                      }}
                    />
                  )}
                </div>

                {/* Stop info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {stop.name}
                    </span>
                    {isSchool && (
                      <Badge
                        className="text-xs"
                        style={{
                          background: "oklch(0.5 0.16 150 / 0.15)",
                          color: "oklch(0.4 0.14 150)",
                          border: "none",
                        }}
                      >
                        School
                      </Badge>
                    )}
                  </div>
                  {stop.students && stop.students.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stop.students.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(var(--muted))",
                            color: "oklch(var(--muted-foreground))",
                          }}
                        >
                          <Users size={10} /> {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {!isSchool &&
                    (!stop.students || stop.students.length === 0) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No students at this stop
                      </p>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
