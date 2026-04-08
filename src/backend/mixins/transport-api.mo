import TransportTypes "../types/transport";
import UserTypes "../types/users";
import Common "../types/common";
import TransportLib "../lib/transport";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  routes : List.List<TransportTypes.TransportRoute>,
  busLocations : List.List<TransportTypes.BusLocation>,
  pickupLogs : List.List<TransportTypes.PickupLog>,
  emergencyAlerts : List.List<TransportTypes.EmergencyAlert>,
  maintenanceLogs : List.List<TransportTypes.MaintenanceLog>,
  nextTransportId : { var value : Nat },
  principals : List.List<UserTypes.PrincipalAccount>,
  drivers : List.List<UserTypes.Driver>
) {
  // Routes
  public shared func createRoute(schoolId : Common.SchoolId, callerPassword : Text, driverName : Text, vehicleNo : Text, stops : [TransportTypes.RouteStop]) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextTransportId.value;
    nextTransportId.value += 1;
    let _ = TransportLib.createRoute(routes, id, driverName, vehicleNo, stops, schoolId);
    id
  };

  public query func getRoute(schoolId : Common.SchoolId, id : Nat) : async ?TransportTypes.TransportRoute {
    TransportLib.getRoute(routes, id, schoolId)
  };

  public query func listRoutes(schoolId : Common.SchoolId) : async [TransportTypes.TransportRoute] {
    TransportLib.listRoutes(routes, schoolId)
  };

  public shared func updateRoute(schoolId : Common.SchoolId, callerPassword : Text, route : TransportTypes.TransportRoute) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    TransportLib.updateRoute(routes, route);
    true
  };

  public shared func deleteRoute(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    TransportLib.deleteRoute(routes, id, schoolId);
    true
  };

  // Live GPS
  public shared func updateBusLocation(schoolId : Common.SchoolId, driverPassword : Text, driverId : Common.UserId, latitude : Float, longitude : Float) : async Bool {
    if (not UsersLib.verifyDriverPassword(drivers, driverId, driverPassword, schoolId)) {
      return false;
    };
    TransportLib.updateBusLocation(busLocations, driverId, latitude, longitude, schoolId);
    true
  };

  public query func getBusLocation(schoolId : Common.SchoolId, driverId : Common.UserId) : async ?TransportTypes.BusLocation {
    TransportLib.getBusLocation(busLocations, driverId, schoolId)
  };

  public query func getAllBusLocations(schoolId : Common.SchoolId) : async [TransportTypes.BusLocation] {
    TransportLib.getAllBusLocations(busLocations, schoolId)
  };

  // Pickup/Drop
  public shared func logPickup(schoolId : Common.SchoolId, driverPassword : Text, driverId : Common.UserId, studentId : Common.UserId, action : TransportTypes.PickupAction) : async Nat {
    if (not UsersLib.verifyDriverPassword(drivers, driverId, driverPassword, schoolId)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextTransportId.value;
    nextTransportId.value += 1;
    let _ = TransportLib.logPickup(pickupLogs, id, driverId, studentId, action, schoolId);
    id
  };

  public query func getPickupLogsByDriver(schoolId : Common.SchoolId, driverId : Common.UserId) : async [TransportTypes.PickupLog] {
    TransportLib.getPickupLogsByDriver(pickupLogs, driverId, schoolId)
  };

  // Emergency
  public shared func createEmergencyAlert(schoolId : Common.SchoolId, driverPassword : Text, driverId : Common.UserId, message : Text, location : Text) : async Nat {
    if (not UsersLib.verifyDriverPassword(drivers, driverId, driverPassword, schoolId)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextTransportId.value;
    nextTransportId.value += 1;
    let _ = TransportLib.createAlert(emergencyAlerts, id, driverId, message, location, schoolId);
    id
  };

  public query func listEmergencyAlerts(schoolId : Common.SchoolId) : async [TransportTypes.EmergencyAlert] {
    TransportLib.listAlerts(emergencyAlerts, schoolId)
  };

  public shared func resolveEmergencyAlert(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    TransportLib.resolveAlert(emergencyAlerts, id, schoolId);
    true
  };

  // Maintenance
  public shared func addMaintenanceLog(schoolId : Common.SchoolId, callerPassword : Text, vehicleNo : Text, type_ : TransportTypes.MaintenanceType, date : Text, cost : Nat, notes : Text, driverId : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextTransportId.value;
    nextTransportId.value += 1;
    let _ = TransportLib.addMaintenanceLog(maintenanceLogs, id, vehicleNo, type_, date, cost, notes, driverId, schoolId);
    id
  };

  public query func getMaintenanceLogs(schoolId : Common.SchoolId, vehicleNo : Text) : async [TransportTypes.MaintenanceLog] {
    TransportLib.getMaintenanceLogs(maintenanceLogs, vehicleNo, schoolId)
  };
};
