import Common "common";

module {
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;
  public type Timestamp = Common.Timestamp;

  public type FeeStatus = { #paid; #unpaid; #partial };

  public type FeeRecord = {
    id : Nat;
    studentId : UserId;
    amount : Nat;
    dueDate : Text;
    paidDate : ?Text;
    status : FeeStatus;
    description : Text;
    schoolId : SchoolId;
  };
};
