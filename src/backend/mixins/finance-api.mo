import FinanceTypes "../types/finance";
import UserTypes "../types/users";
import Common "../types/common";
import FinanceLib "../lib/finance";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  feeRecords : List.List<FinanceTypes.FeeRecord>,
  nextFinanceId : { var value : Nat },
  principals : List.List<UserTypes.PrincipalAccount>
) {
  public shared func addFeeRecord(schoolId : Common.SchoolId, callerPassword : Text, studentId : Common.UserId, amount : Nat, dueDate : Text, description : Text) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextFinanceId.value;
    nextFinanceId.value += 1;
    let _ = FinanceLib.addFeeRecord(feeRecords, id, studentId, amount, dueDate, description, schoolId);
    id
  };

  public query func getFeesByStudent(schoolId : Common.SchoolId, studentId : Common.UserId) : async [FinanceTypes.FeeRecord] {
    FinanceLib.getFeesByStudent(feeRecords, studentId, schoolId)
  };

  public query func getAllFees(schoolId : Common.SchoolId) : async [FinanceTypes.FeeRecord] {
    FinanceLib.getAllFees(feeRecords, schoolId)
  };

  public shared func markFeePaid(schoolId : Common.SchoolId, callerPassword : Text, id : Nat, paidDate : Text) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    FinanceLib.markFeePaid(feeRecords, id, paidDate, schoolId);
    true
  };

  public shared func updateFeeRecord(schoolId : Common.SchoolId, callerPassword : Text, record : FinanceTypes.FeeRecord) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    FinanceLib.updateFeeRecord(feeRecords, record);
    true
  };

  public shared func deleteFeeRecord(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    FinanceLib.deleteFeeRecord(feeRecords, id, schoolId);
    true
  };

  public query func getPendingFees(schoolId : Common.SchoolId) : async [FinanceTypes.FeeRecord] {
    FinanceLib.getPendingFees(feeRecords, schoolId)
  };

  public query func getTotalRevenue(schoolId : Common.SchoolId) : async Nat {
    FinanceLib.getTotalRevenue(feeRecords, schoolId)
  };
};
