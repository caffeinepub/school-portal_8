import Common "common";

module {
  public type SchoolId = Common.SchoolId;
  public type Timestamp = Common.Timestamp;

  public type SchoolConfig = {
    schoolId : SchoolId;
    schoolName : Text;
    classes : [Text];
    sections : [Text];
    subjects : [Text];
  };

  public type ExamTimetable = {
    id : Nat;
    class_ : Text;
    section : Text;
    examName : Text;
    subjects : [ExamSlot];
    schoolId : SchoolId;
    createdAt : Timestamp;
  };

  public type ExamSlot = {
    subject : Text;
    date : Text;
    startTime : Text;
    endTime : Text;
  };
};
