import Common "common";

module {
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;
  public type Timestamp = Common.Timestamp;

  public type AttendanceStatus = { #present; #absent; #late };

  public type AttendanceRecord = {
    id : Nat;
    studentId : UserId;
    date : Text; // ISO date string YYYY-MM-DD
    status : AttendanceStatus;
    markedByTeacherId : UserId;
    note : Text;
    schoolId : SchoolId;
  };

  public type ExamMark = {
    id : Nat;
    studentId : UserId;
    examName : Text;
    subject : Text;
    maxMarks : Nat;
    obtainedMarks : Nat;
    teacherId : UserId;
    date : Text;
    schoolId : SchoolId;
  };

  public type LessonPlan = {
    id : Nat;
    class_ : Text;
    section : Text;
    subject : Text;
    weekOf : Text;
    content : Text;
    teacherId : UserId;
    schoolId : SchoolId;
  };

  public type Assignment = {
    id : Nat;
    class_ : Text;
    section : Text;
    subject : Text;
    title : Text;
    description : Text;
    dueDate : Text;
    teacherId : UserId;
    attachmentUrl : ?Text;
    schoolId : SchoolId;
    createdAt : Timestamp;
  };

  public type SubmissionStatus = { #pending; #submitted; #graded };

  public type Submission = {
    id : Nat;
    assignmentId : Nat;
    studentId : UserId;
    content : Text;
    attachmentUrl : ?Text;
    submittedAt : Timestamp;
    status : SubmissionStatus;
    schoolId : SchoolId;
  };

  public type Syllabus = {
    id : Nat;
    class_ : Text;
    subject : Text;
    content : Text;
    teacherId : UserId;
    schoolId : SchoolId;
    updatedAt : Timestamp;
  };

  public type Timetable = {
    id : Nat;
    class_ : Text;
    section : Text;
    periods : [Period];
    schoolId : SchoolId;
  };

  public type Period = {
    day : Text;
    timeSlot : Text;
    subject : Text;
    teacherName : Text;
  };

  public type DigitalResource = {
    id : Nat;
    title : Text;
    type_ : { #note; #pdf; #video };
    url : Text;
    class_ : Text;
    subject : Text;
    uploadedBy : UserId;
    createdAt : Timestamp;
    schoolId : SchoolId;
  };
};
