import Common "common";

module {
  public type SchoolId = Common.SchoolId;
  public type UserId = Common.UserId;

  public type PrincipalAccount = {
    id : UserId;
    name : Text;
    password : Text; // hashed
    schoolId : SchoolId;
    email : Text;
  };

  public type Teacher = {
    id : UserId;
    name : Text;
    email : Text;
    password : Text;
    assignedClass : Text;
    subjects : [Text];
    schoolId : SchoolId;
  };

  public type Driver = {
    id : UserId;
    name : Text;
    password : Text;
    vehicleNo : Text;
    route : Text;
    schoolId : SchoolId;
  };

  public type Student = {
    id : UserId;
    name : Text;
    class_ : Text;
    section : Text;
    rollNo : Nat;
    password : Text; // used by parent to log in
    parentMobile : Text;
    schoolId : SchoolId;
    profilePictureUrl : ?Text;
  };

  public type MainController = {
    password : Text;
  };

  // Shared (API-safe) versions without passwords
  public type TeacherPublic = {
    id : UserId;
    name : Text;
    email : Text;
    assignedClass : Text;
    subjects : [Text];
    schoolId : SchoolId;
  };

  public type StudentPublic = {
    id : UserId;
    name : Text;
    class_ : Text;
    section : Text;
    rollNo : Nat;
    parentMobile : Text;
    schoolId : SchoolId;
    profilePictureUrl : ?Text;
  };

  public type DriverPublic = {
    id : UserId;
    name : Text;
    vehicleNo : Text;
    route : Text;
    schoolId : SchoolId;
  };
};
