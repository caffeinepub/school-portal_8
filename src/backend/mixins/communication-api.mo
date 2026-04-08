import CommTypes "../types/communication";
import UserTypes "../types/users";
import Common "../types/common";
import CommLib "../lib/communication";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  notices : List.List<CommTypes.Notice>,
  parentMessages : List.List<CommTypes.ParentMessage>,
  inquiries : List.List<CommTypes.Inquiry>,
  diaryEntries : List.List<CommTypes.DiaryEntry>,
  nextCommId : { var value : Nat },
  principals : List.List<UserTypes.PrincipalAccount>
) {
  // Notices
  public shared func createNotice(schoolId : Common.SchoolId, callerPassword : Text, title : Text, message : Text, targetPortals : [CommTypes.TargetPortal], priority : { #low; #medium; #high }, createdBy : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextCommId.value;
    nextCommId.value += 1;
    let _ = CommLib.createNotice(notices, id, title, message, targetPortals, priority, createdBy, schoolId);
    id
  };

  public query func listNotices(schoolId : Common.SchoolId) : async [CommTypes.Notice] {
    CommLib.listNotices(notices, schoolId)
  };

  public shared func deleteNotice(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    CommLib.deleteNotice(notices, id, schoolId);
    true
  };

  // Parent Messages
  public shared func sendParentMessage(schoolId : Common.SchoolId, callerPassword : Text, teacherId : Common.UserId, studentId : Common.UserId, message : Text) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextCommId.value;
    nextCommId.value += 1;
    let _ = CommLib.sendParentMessage(parentMessages, id, teacherId, studentId, message, schoolId);
    id
  };

  public query func getParentMessagesByStudent(schoolId : Common.SchoolId, studentId : Common.UserId) : async [CommTypes.ParentMessage] {
    CommLib.getMessagesByStudent(parentMessages, studentId, schoolId)
  };

  public shared func markParentMessageRead(schoolId : Common.SchoolId, id : Nat) : async Bool {
    CommLib.markMessageRead(parentMessages, id, schoolId);
    true
  };

  // Inquiries
  public shared func createInquiry(schoolId : Common.SchoolId, studentName : Text, parentName : Text, phone : Text, email : Text, class_ : Text) : async Nat {
    let id = nextCommId.value;
    nextCommId.value += 1;
    let _ = CommLib.createInquiry(inquiries, id, studentName, parentName, phone, email, class_, schoolId);
    id
  };

  public query func listInquiries(schoolId : Common.SchoolId) : async [CommTypes.Inquiry] {
    CommLib.listInquiries(inquiries, schoolId)
  };

  public shared func updateInquiryStatus(schoolId : Common.SchoolId, callerPassword : Text, id : Nat, status : { #new_; #inProgress; #closed }, notes : Text) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    CommLib.updateInquiryStatus(inquiries, id, status, notes, schoolId);
    true
  };

  // Diary
  public shared func createDiaryEntry(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, section : Text, date : Text, content : Text, teacherId : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextCommId.value;
    nextCommId.value += 1;
    let _ = CommLib.createDiaryEntry(diaryEntries, id, class_, section, date, content, teacherId, schoolId);
    id
  };

  public query func getDiaryByClass(schoolId : Common.SchoolId, class_ : Text) : async [CommTypes.DiaryEntry] {
    CommLib.getDiaryByClass(diaryEntries, class_, schoolId)
  };

  public shared func deleteDiaryEntry(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    CommLib.deleteDiaryEntry(diaryEntries, id, schoolId);
    true
  };
};
