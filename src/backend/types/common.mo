import Time "mo:core/Time";

module {
  public type Timestamp = Time.Time; // Int nanoseconds
  public type SchoolId = Nat; // 1-5 for the 5 schools
  public type UserId = Nat;

  // Role variants for RBAC
  public type Role = {
    #principal;
    #teacher;
    #student;
    #driver;
    #mainController;
  };

  // Generic result type
  public type Result<T> = {
    #ok : T;
    #err : Text;
  };
};
