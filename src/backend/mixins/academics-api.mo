import AcademicTypes "../types/academics";
import Common "../types/common";
import UserTypes "../types/users";
import AcademicsLib "../lib/academics";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  attendanceRecords : List.List<AcademicTypes.AttendanceRecord>,
  examMarks : List.List<AcademicTypes.ExamMark>,
  lessonPlans : List.List<AcademicTypes.LessonPlan>,
  assignments : List.List<AcademicTypes.Assignment>,
  submissions : List.List<AcademicTypes.Submission>,
  syllabi : List.List<AcademicTypes.Syllabus>,
  timetables : List.List<AcademicTypes.Timetable>,
  digitalResources : List.List<AcademicTypes.DigitalResource>,
  nextAcademicId : { var value : Nat },
  principals : List.List<UserTypes.PrincipalAccount>,
  students : List.List<UserTypes.Student>
) {

  // --- Attendance ---
  public shared func markAttendance(schoolId : Common.SchoolId, callerPassword : Text, studentId : Common.UserId, date : Text, status : AcademicTypes.AttendanceStatus, teacherId : Common.UserId, note : Text) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.markAttendance(attendanceRecords, id, studentId, date, status, teacherId, note, schoolId);
    id
  };

  public query func getAttendanceByStudent(schoolId : Common.SchoolId, studentId : Common.UserId) : async [AcademicTypes.AttendanceRecord] {
    AcademicsLib.getAttendanceByStudent(attendanceRecords, studentId, schoolId)
  };

  public query func getAttendanceByClass(schoolId : Common.SchoolId, class_ : Text, date : Text) : async [AcademicTypes.AttendanceRecord] {
    // Return records for students in the given class on a given date
    let byDate = AcademicsLib.getAttendanceByDate(attendanceRecords, date, schoolId);
    let classStudents = UsersLib.listStudentsByClass(students, class_, schoolId);
    let studentIds : [Common.UserId] = classStudents.map<UserTypes.StudentPublic, Common.UserId>(func(s) { s.id });
    byDate.filter(func(r) {
      studentIds.find(func(id) { id == r.studentId }) != null
    })
  };

  // --- Marks ---
  public shared func addMark(schoolId : Common.SchoolId, callerPassword : Text, studentId : Common.UserId, examName : Text, subject : Text, maxMarks : Nat, obtainedMarks : Nat, teacherId : Common.UserId, date : Text) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.addMark(examMarks, id, studentId, examName, subject, maxMarks, obtainedMarks, teacherId, date, schoolId);
    id
  };

  public query func getMarksByStudent(schoolId : Common.SchoolId, studentId : Common.UserId) : async [AcademicTypes.ExamMark] {
    AcademicsLib.getMarksByStudent(examMarks, studentId, schoolId)
  };

  public query func getMarksByExam(schoolId : Common.SchoolId, examName : Text) : async [AcademicTypes.ExamMark] {
    AcademicsLib.getMarksByExam(examMarks, examName, schoolId)
  };

  public shared func updateMark(schoolId : Common.SchoolId, callerPassword : Text, mark : AcademicTypes.ExamMark) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.updateMark(examMarks, mark);
    true
  };

  public shared func deleteMark(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.deleteMark(examMarks, id, schoolId);
    true
  };

  public query func getStudentRank(schoolId : Common.SchoolId, studentId : Common.UserId, examName : Text) : async Nat {
    AcademicsLib.computeRank(examMarks, studentId, examName, schoolId)
  };

  // --- Lesson Plans ---
  public shared func createLessonPlan(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, section : Text, subject : Text, weekOf : Text, content : Text, teacherId : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.createLessonPlan(lessonPlans, id, class_, section, subject, weekOf, content, teacherId, schoolId);
    id
  };

  public query func getLessonPlansByClass(schoolId : Common.SchoolId, class_ : Text) : async [AcademicTypes.LessonPlan] {
    AcademicsLib.getLessonPlansByClass(lessonPlans, class_, schoolId)
  };

  public shared func updateLessonPlan(schoolId : Common.SchoolId, callerPassword : Text, plan : AcademicTypes.LessonPlan) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.updateLessonPlan(lessonPlans, plan);
    true
  };

  public shared func deleteLessonPlan(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.deleteLessonPlan(lessonPlans, id, schoolId);
    true
  };

  // --- Assignments ---
  public shared func createAssignment(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, section : Text, subject : Text, title : Text, description : Text, dueDate : Text, teacherId : Common.UserId, attachmentUrl : ?Text) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.createAssignment(assignments, id, class_, section, subject, title, description, dueDate, teacherId, attachmentUrl, schoolId);
    id
  };

  public query func getAssignmentsByClass(schoolId : Common.SchoolId, class_ : Text) : async [AcademicTypes.Assignment] {
    AcademicsLib.getAssignmentsByClass(assignments, class_, schoolId)
  };

  public shared func deleteAssignment(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.deleteAssignment(assignments, id, schoolId);
    true
  };

  // --- Submissions ---
  public shared func submitAssignment(schoolId : Common.SchoolId, studentPassword : Text, assignmentId : Nat, studentId : Common.UserId, content : Text, attachmentUrl : ?Text) : async Nat {
    if (not UsersLib.verifyStudentPassword(students, studentId, studentPassword, schoolId)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.submitAssignment(submissions, id, assignmentId, studentId, content, attachmentUrl, schoolId);
    id
  };

  public query func getSubmissionsByAssignment(schoolId : Common.SchoolId, assignmentId : Nat) : async [AcademicTypes.Submission] {
    AcademicsLib.getSubmissionsByAssignment(submissions, assignmentId, schoolId)
  };

  public query func getSubmissionsByStudent(schoolId : Common.SchoolId, studentId : Common.UserId) : async [AcademicTypes.Submission] {
    AcademicsLib.getSubmissionsByStudent(submissions, studentId, schoolId)
  };

  // --- Syllabus ---
  public shared func setSyllabus(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, subject : Text, content : Text, teacherId : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.setSyllabus(syllabi, id, class_, subject, content, teacherId, schoolId);
    id
  };

  public query func getSyllabusByClass(schoolId : Common.SchoolId, class_ : Text) : async [AcademicTypes.Syllabus] {
    AcademicsLib.getSyllabusByClass(syllabi, class_, schoolId)
  };

  // --- Timetable ---
  public shared func setTimetable(schoolId : Common.SchoolId, callerPassword : Text, class_ : Text, section : Text, periods : [AcademicTypes.Period]) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.setTimetable(timetables, id, class_, section, periods, schoolId);
    id
  };

  public query func getTimetable(schoolId : Common.SchoolId, class_ : Text, section : Text) : async ?AcademicTypes.Timetable {
    AcademicsLib.getTimetable(timetables, class_, section, schoolId)
  };

  // --- Digital Library ---
  public shared func addDigitalResource(schoolId : Common.SchoolId, callerPassword : Text, title : Text, type_ : { #note; #pdf; #video }, url : Text, class_ : Text, subject : Text, uploadedBy : Common.UserId) : async Nat {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextAcademicId.value;
    nextAcademicId.value += 1;
    let _ = AcademicsLib.addResource(digitalResources, id, title, type_, url, class_, subject, uploadedBy, schoolId);
    id
  };

  public query func getDigitalResourcesByClass(schoolId : Common.SchoolId, class_ : Text) : async [AcademicTypes.DigitalResource] {
    AcademicsLib.getResourcesByClass(digitalResources, class_, schoolId)
  };

  public shared func deleteDigitalResource(schoolId : Common.SchoolId, callerPassword : Text, id : Nat) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    AcademicsLib.deleteResource(digitalResources, id, schoolId);
    true
  };
};
