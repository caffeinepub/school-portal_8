import SysTypes "../types/system_";
import UserTypes "../types/users";
import Common "../types/common";
import SysLib "../lib/system_";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  schoolConfigs : List.List<SysTypes.SchoolConfig>,
  examTimetables : List.List<SysTypes.ExamTimetable>,
  nextSysId : { var value : Nat },
  mainControllerPasswordHash : { var value : Text },
  principals : List.List<UserTypes.PrincipalAccount>,
  teachers : List.List<UserTypes.Teacher>,
  students : List.List<UserTypes.Student>,
  drivers : List.List<UserTypes.Driver>
) {
  // Main Controller auth
  public shared func loginMainController(password : Text) : async Bool {
    SysLib.verifyMainControllerPassword(mainControllerPasswordHash.value, password)
  };

  public shared func changeMainControllerPassword(oldPassword : Text, newPassword : Text) : async Bool {
    if (not SysLib.verifyMainControllerPassword(mainControllerPasswordHash.value, oldPassword)) {
      return false;
    };
    mainControllerPasswordHash.value := newPassword;
    true
  };

  // School Config
  public query func getSchoolConfig(schoolId : Common.SchoolId) : async ?SysTypes.SchoolConfig {
    SysLib.getSchoolConfig(schoolConfigs, schoolId)
  };

  public shared func setSchoolConfig(callerPassword : Text, config : SysTypes.SchoolConfig) : async Bool {
    if (not SysLib.verifyMainControllerPassword(mainControllerPasswordHash.value, callerPassword)) {
      return false;
    };
    SysLib.setSchoolConfig(schoolConfigs, config);
    true
  };

  // Exam Timetables
  public shared func createExamTimetable(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, section : Text, examName : Text, subjects : [SysTypes.ExamSlot]) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextSysId.value;
    nextSysId.value += 1;
    let _ = SysLib.createExamTimetable(examTimetables, id, class_, section, examName, subjects, schoolId);
    id
  };

  public query func getExamTimetablesByClass(schoolId : Common.SchoolId, class_ : Text) : async [SysTypes.ExamTimetable] {
    SysLib.getExamTimetablesByClass(examTimetables, class_, schoolId)
  };

  public shared func updateExamTimetable(schoolId : Common.SchoolId, callerPassword : Text, timetable : SysTypes.ExamTimetable) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    SysLib.updateExamTimetable(examTimetables, timetable);
    true
  };

  public shared func deleteExamTimetable(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    SysLib.deleteExamTimetable(examTimetables, id, schoolId);
    true
  };

  // Export / Backup (Main Controller only)
  public query func exportAllData(password : Text) : async Text {
    if (not SysLib.verifyMainControllerPassword(mainControllerPasswordHash.value, password)) {
      Runtime.trap("Unauthorized");
    };
    let principalCount = principals.size().toText();
    let teacherCount = teachers.size().toText();
    let studentCount = students.size().toText();
    let driverCount = drivers.size().toText();
    "{\"principals\":" # principalCount #
    ",\"teachers\":" # teacherCount #
    ",\"students\":" # studentCount #
    ",\"drivers\":" # driverCount # "}"
  };
};
