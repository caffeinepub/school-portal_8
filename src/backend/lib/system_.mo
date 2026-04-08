import Types "../types/system_";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type SchoolConfig = Types.SchoolConfig;
  public type ExamTimetable = Types.ExamTimetable;
  public type SchoolId = Common.SchoolId;

  public func getSchoolConfig(configs : List.List<SchoolConfig>, schoolId : SchoolId) : ?SchoolConfig {
    configs.find(func(c) { c.schoolId == schoolId })
  };

  public func setSchoolConfig(configs : List.List<SchoolConfig>, config : SchoolConfig) : () {
    let existing = configs.findIndex(func(c) { c.schoolId == config.schoolId });
    switch (existing) {
      case (?idx) { configs.put(idx, config) };
      case null { configs.add(config) };
    }
  };

  public func createExamTimetable(
    timetables : List.List<ExamTimetable>,
    nextId : Nat,
    class_ : Text,
    section : Text,
    examName : Text,
    subjects : [Types.ExamSlot],
    schoolId : SchoolId
  ) : ExamTimetable {
    let tt : ExamTimetable = {
      id = nextId;
      class_;
      section;
      examName;
      subjects;
      schoolId;
      createdAt = Time.now();
    };
    timetables.add(tt);
    tt
  };

  public func getExamTimetablesByClass(timetables : List.List<ExamTimetable>, class_ : Text, schoolId : SchoolId) : [ExamTimetable] {
    timetables.filter(func(t) { t.class_ == class_ and t.schoolId == schoolId }).toArray()
  };

  public func updateExamTimetable(timetables : List.List<ExamTimetable>, updated : ExamTimetable) : () {
    timetables.mapInPlace(func(t) {
      if (t.id == updated.id and t.schoolId == updated.schoolId) { updated }
      else { t }
    })
  };

  public func deleteExamTimetable(timetables : List.List<ExamTimetable>, id : Nat, schoolId : SchoolId) : () {
    let kept = timetables.filter(func(t) { not (t.id == id and t.schoolId == schoolId) });
    timetables.clear();
    timetables.append(kept)
  };

  // Main Controller password: plain text for MVP
  public func verifyMainControllerPassword(storedPassword : Text, password : Text) : Bool {
    storedPassword == password
  };

  // No hashing needed in MVP; identity function
  public func hashPassword(password : Text) : Text {
    password
  };
};
