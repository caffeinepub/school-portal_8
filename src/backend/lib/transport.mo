import Types "../types/transport";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type TransportRoute = Types.TransportRoute;
  public type BusLocation = Types.BusLocation;
  public type PickupLog = Types.PickupLog;
  public type EmergencyAlert = Types.EmergencyAlert;
  public type MaintenanceLog = Types.MaintenanceLog;
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;

  // Routes
  public func createRoute(
    routes : List.List<TransportRoute>,
    nextId : Nat,
    driverName : Text,
    vehicleNo : Text,
    stops : [Types.RouteStop],
    schoolId : SchoolId
  ) : TransportRoute {
    let r : TransportRoute = {
      id = nextId;
      driverName;
      vehicleNo;
      stops;
      schoolId;
    };
    routes.add(r);
    r
  };

  public func getRoute(routes : List.List<TransportRoute>, id : Nat, schoolId : SchoolId) : ?TransportRoute {
    routes.find(func(r) { r.id == id and r.schoolId == schoolId })
  };

  public func listRoutes(routes : List.List<TransportRoute>, schoolId : SchoolId) : [TransportRoute] {
    routes.filter(func(r) { r.schoolId == schoolId }).toArray()
  };

  public func updateRoute(routes : List.List<TransportRoute>, updated : TransportRoute) : () {
    routes.mapInPlace(func(r) {
      if (r.id == updated.id and r.schoolId == updated.schoolId) { updated }
      else { r }
    })
  };

  public func deleteRoute(routes : List.List<TransportRoute>, id : Nat, schoolId : SchoolId) : () {
    let kept = routes.filter(func(r) { not (r.id == id and r.schoolId == schoolId) });
    routes.clear();
    routes.append(kept)
  };

  // Bus Location
  public func updateBusLocation(
    locations : List.List<BusLocation>,
    driverId : UserId,
    latitude : Float,
    longitude : Float,
    schoolId : SchoolId
  ) : () {
    let loc : BusLocation = {
      driverId;
      latitude;
      longitude;
      timestamp = Time.now();
      schoolId;
    };
    let existing = locations.findIndex(func(l) { l.driverId == driverId and l.schoolId == schoolId });
    switch (existing) {
      case (?idx) { locations.put(idx, loc) };
      case null { locations.add(loc) };
    }
  };

  public func getBusLocation(locations : List.List<BusLocation>, driverId : UserId, schoolId : SchoolId) : ?BusLocation {
    locations.find(func(l) { l.driverId == driverId and l.schoolId == schoolId })
  };

  public func getAllBusLocations(locations : List.List<BusLocation>, schoolId : SchoolId) : [BusLocation] {
    locations.filter(func(l) { l.schoolId == schoolId }).toArray()
  };

  // Pickup Logs
  public func logPickup(
    logs : List.List<PickupLog>,
    nextId : Nat,
    driverId : UserId,
    studentId : UserId,
    action : Types.PickupAction,
    schoolId : SchoolId
  ) : PickupLog {
    let p : PickupLog = {
      id = nextId;
      driverId;
      studentId;
      action;
      timestamp = Time.now();
      schoolId;
    };
    logs.add(p);
    p
  };

  public func getPickupLogsByDriver(logs : List.List<PickupLog>, driverId : UserId, schoolId : SchoolId) : [PickupLog] {
    logs.filter(func(l) { l.driverId == driverId and l.schoolId == schoolId }).toArray()
  };

  public func getPickupLogsByStudent(logs : List.List<PickupLog>, studentId : UserId, schoolId : SchoolId) : [PickupLog] {
    logs.filter(func(l) { l.studentId == studentId and l.schoolId == schoolId }).toArray()
  };

  // Emergency Alerts
  public func createAlert(
    alerts : List.List<EmergencyAlert>,
    nextId : Nat,
    driverId : UserId,
    message : Text,
    location : Text,
    schoolId : SchoolId
  ) : EmergencyAlert {
    let a : EmergencyAlert = {
      id = nextId;
      driverId;
      message;
      location;
      timestamp = Time.now();
      schoolId;
      resolved = false;
    };
    alerts.add(a);
    a
  };

  public func listAlerts(alerts : List.List<EmergencyAlert>, schoolId : SchoolId) : [EmergencyAlert] {
    alerts.filter(func(a) { a.schoolId == schoolId }).toArray()
  };

  public func resolveAlert(alerts : List.List<EmergencyAlert>, id : Nat, schoolId : SchoolId) : () {
    alerts.mapInPlace(func(a) {
      if (a.id == id and a.schoolId == schoolId) { { a with resolved = true } }
      else { a }
    })
  };

  // Maintenance
  public func addMaintenanceLog(
    logs : List.List<MaintenanceLog>,
    nextId : Nat,
    vehicleNo : Text,
    type_ : Types.MaintenanceType,
    date : Text,
    cost : Nat,
    notes : Text,
    driverId : UserId,
    schoolId : SchoolId
  ) : MaintenanceLog {
    let l : MaintenanceLog = {
      id = nextId;
      vehicleNo;
      type_;
      date;
      cost;
      notes;
      driverId;
      schoolId;
    };
    logs.add(l);
    l
  };

  public func getMaintenanceLogs(logs : List.List<MaintenanceLog>, vehicleNo : Text, schoolId : SchoolId) : [MaintenanceLog] {
    logs.filter(func(l) { l.vehicleNo == vehicleNo and l.schoolId == schoolId }).toArray()
  };
};
