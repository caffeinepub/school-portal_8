import Common "common";

module {
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;
  public type Timestamp = Common.Timestamp;

  public type RouteStop = {
    name : Text;
    studentIds : [UserId];
  };

  public type TransportRoute = {
    id : Nat;
    driverName : Text;
    vehicleNo : Text;
    stops : [RouteStop];
    schoolId : SchoolId;
  };

  public type BusLocation = {
    driverId : UserId;
    latitude : Float;
    longitude : Float;
    timestamp : Timestamp;
    schoolId : SchoolId;
  };

  public type PickupAction = { #pickup; #drop };

  public type PickupLog = {
    id : Nat;
    driverId : UserId;
    studentId : UserId;
    action : PickupAction;
    timestamp : Timestamp;
    schoolId : SchoolId;
  };

  public type EmergencyAlert = {
    id : Nat;
    driverId : UserId;
    message : Text;
    location : Text;
    timestamp : Timestamp;
    schoolId : SchoolId;
    resolved : Bool;
  };

  public type MaintenanceType = { #fuel; #service };

  public type MaintenanceLog = {
    id : Nat;
    vehicleNo : Text;
    type_ : MaintenanceType;
    date : Text;
    cost : Nat;
    notes : Text;
    driverId : UserId;
    schoolId : SchoolId;
  };
};
