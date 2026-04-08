import Common "common";

module {
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;
  public type Timestamp = Common.Timestamp;

  public type TargetPortal = { #principal; #teacher; #student; #driver };

  public type Notice = {
    id : Nat;
    title : Text;
    message : Text;
    targetPortals : [TargetPortal];
    priority : { #low; #medium; #high };
    createdBy : UserId;
    createdAt : Timestamp;
    schoolId : SchoolId;
  };

  public type ParentMessage = {
    id : Nat;
    teacherId : UserId;
    studentId : UserId;
    message : Text;
    timestamp : Timestamp;
    read : Bool;
    schoolId : SchoolId;
  };

  public type Inquiry = {
    id : Nat;
    studentName : Text;
    parentName : Text;
    phone : Text;
    email : Text;
    class_ : Text;
    status : { #new_; #inProgress; #closed };
    notes : Text;
    createdAt : Timestamp;
    schoolId : SchoolId;
  };

  public type DiaryEntry = {
    id : Nat;
    class_ : Text;
    section : Text;
    date : Text;
    content : Text;
    teacherId : UserId;
    schoolId : SchoolId;
    createdAt : Timestamp;
  };
};
