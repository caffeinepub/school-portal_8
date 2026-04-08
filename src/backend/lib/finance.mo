import Types "../types/finance";
import Common "../types/common";
import List "mo:core/List";

module {
  public type FeeRecord = Types.FeeRecord;
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;

  public func addFeeRecord(
    fees : List.List<FeeRecord>,
    nextId : Nat,
    studentId : UserId,
    amount : Nat,
    dueDate : Text,
    description : Text,
    schoolId : SchoolId
  ) : FeeRecord {
    let r : FeeRecord = {
      id = nextId;
      studentId;
      amount;
      dueDate;
      paidDate = null;
      status = #unpaid;
      description;
      schoolId;
    };
    fees.add(r);
    r
  };

  public func getFeesByStudent(fees : List.List<FeeRecord>, studentId : UserId, schoolId : SchoolId) : [FeeRecord] {
    fees.filter(func(f) { f.studentId == studentId and f.schoolId == schoolId }).toArray()
  };

  public func getAllFees(fees : List.List<FeeRecord>, schoolId : SchoolId) : [FeeRecord] {
    fees.filter(func(f) { f.schoolId == schoolId }).toArray()
  };

  public func markFeePaid(fees : List.List<FeeRecord>, id : Nat, paidDate : Text, schoolId : SchoolId) : () {
    fees.mapInPlace(func(f) {
      if (f.id == id and f.schoolId == schoolId) {
        { f with status = #paid; paidDate = ?paidDate }
      } else { f }
    })
  };

  public func updateFeeRecord(fees : List.List<FeeRecord>, updated : FeeRecord) : () {
    fees.mapInPlace(func(f) {
      if (f.id == updated.id and f.schoolId == updated.schoolId) { updated }
      else { f }
    })
  };

  public func deleteFeeRecord(fees : List.List<FeeRecord>, id : Nat, schoolId : SchoolId) : () {
    let kept = fees.filter(func(f) { not (f.id == id and f.schoolId == schoolId) });
    fees.clear();
    fees.append(kept)
  };

  public func getPendingFees(fees : List.List<FeeRecord>, schoolId : SchoolId) : [FeeRecord] {
    fees.filter(func(f) { f.schoolId == schoolId and (f.status == #unpaid or f.status == #partial) }).toArray()
  };

  public func getTotalRevenue(fees : List.List<FeeRecord>, schoolId : SchoolId) : Nat {
    fees.foldLeft<Nat, FeeRecord>(0, func(acc, f) {
      if (f.schoolId == schoolId and f.status == #paid) { acc + f.amount }
      else { acc }
    })
  };
};
