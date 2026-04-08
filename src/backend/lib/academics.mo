import Types "../types/academics";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type AttendanceRecord = Types.AttendanceRecord;
  public type ExamMark = Types.ExamMark;
  public type LessonPlan = Types.LessonPlan;
  public type Assignment = Types.Assignment;
  public type Submission = Types.Submission;
  public type Syllabus = Types.Syllabus;
  public type Timetable = Types.Timetable;
  public type DigitalResource = Types.DigitalResource;
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;

  // --- Attendance ---
  public func markAttendance(
    records : List.List<AttendanceRecord>,
    nextId : Nat,
    studentId : UserId,
    date : Text,
    status : Types.AttendanceStatus,
    teacherId : UserId,
    note : Text,
    schoolId : SchoolId
  ) : AttendanceRecord {
    let r : AttendanceRecord = {
      id = nextId;
      studentId;
      date;
      status;
      markedByTeacherId = teacherId;
      note;
      schoolId;
    };
    records.add(r);
    r
  };

  public func getAttendanceByStudent(records : List.List<AttendanceRecord>, studentId : UserId, schoolId : SchoolId) : [AttendanceRecord] {
    records.filter(func(r) { r.studentId == studentId and r.schoolId == schoolId }).toArray()
  };

  public func getAttendanceByDate(records : List.List<AttendanceRecord>, date : Text, schoolId : SchoolId) : [AttendanceRecord] {
    records.filter(func(r) { r.date == date and r.schoolId == schoolId }).toArray()
  };

  public func getAttendanceByClass(
    records : List.List<AttendanceRecord>,
    class_ : Text,
    date : Text,
    schoolId : SchoolId
  ) : [AttendanceRecord] {
    // Returns records for a date/school; class filtering done at API layer via student lookup
    records.filter(func(r) { r.date == date and r.schoolId == schoolId }).toArray()
  };

  // --- Marks ---
  public func addMark(
    marks : List.List<ExamMark>,
    nextId : Nat,
    studentId : UserId,
    examName : Text,
    subject : Text,
    maxMarks : Nat,
    obtainedMarks : Nat,
    teacherId : UserId,
    date : Text,
    schoolId : SchoolId
  ) : ExamMark {
    let m : ExamMark = {
      id = nextId;
      studentId;
      examName;
      subject;
      maxMarks;
      obtainedMarks;
      teacherId;
      date;
      schoolId;
    };
    marks.add(m);
    m
  };

  public func getMarksByStudent(marks : List.List<ExamMark>, studentId : UserId, schoolId : SchoolId) : [ExamMark] {
    marks.filter(func(m) { m.studentId == studentId and m.schoolId == schoolId }).toArray()
  };

  public func getMarksByExam(marks : List.List<ExamMark>, examName : Text, schoolId : SchoolId) : [ExamMark] {
    marks.filter(func(m) { m.examName == examName and m.schoolId == schoolId }).toArray()
  };

  public func updateMark(marks : List.List<ExamMark>, updated : ExamMark) : () {
    marks.mapInPlace(func(m) {
      if (m.id == updated.id and m.schoolId == updated.schoolId) { updated }
      else { m }
    })
  };

  public func deleteMark(marks : List.List<ExamMark>, id : Nat, schoolId : SchoolId) : () {
    let kept = marks.filter(func(m) { not (m.id == id and m.schoolId == schoolId) });
    marks.clear();
    marks.append(kept)
  };

  public func computeRank(marks : List.List<ExamMark>, studentId : UserId, examName : Text, schoolId : SchoolId) : Nat {
    // Sum obtained marks per student for this exam, then rank by descending total
    let examMarks = marks.filter(func(m) { m.examName == examName and m.schoolId == schoolId });
    // Collect unique student totals
    var studentTotals : List.List<(UserId, Nat)> = List.empty();
    examMarks.forEach(func(m) {
      switch (studentTotals.find(func(entry : (UserId, Nat)) : Bool { entry.0 == m.studentId })) {
        case (?(_, existing)) {
          studentTotals.mapInPlace(func(entry) {
            if (entry.0 == m.studentId) { (entry.0, entry.1 + m.obtainedMarks) }
            else { entry }
          })
        };
        case null {
          studentTotals.add((m.studentId, m.obtainedMarks))
        };
      }
    });
    // Find target student's total
    let targetTotal = switch (studentTotals.find(func(entry : (UserId, Nat)) : Bool { entry.0 == studentId })) {
      case (?(_, t)) { t };
      case null { 0 };
    };
    // Count how many students scored strictly higher
    let rank = studentTotals.foldLeft(0, func(acc, entry) {
      if (entry.1 > targetTotal) { acc + 1 } else { acc }
    });
    rank + 1
  };

  // --- Lesson Plans ---
  public func createLessonPlan(
    plans : List.List<LessonPlan>,
    nextId : Nat,
    class_ : Text,
    section : Text,
    subject : Text,
    weekOf : Text,
    content : Text,
    teacherId : UserId,
    schoolId : SchoolId
  ) : LessonPlan {
    let p : LessonPlan = {
      id = nextId;
      class_;
      section;
      subject;
      weekOf;
      content;
      teacherId;
      schoolId;
    };
    plans.add(p);
    p
  };

  public func getLessonPlansByClass(plans : List.List<LessonPlan>, class_ : Text, schoolId : SchoolId) : [LessonPlan] {
    plans.filter(func(p) { p.class_ == class_ and p.schoolId == schoolId }).toArray()
  };

  public func updateLessonPlan(plans : List.List<LessonPlan>, updated : LessonPlan) : () {
    plans.mapInPlace(func(p) {
      if (p.id == updated.id and p.schoolId == updated.schoolId) { updated }
      else { p }
    })
  };

  public func deleteLessonPlan(plans : List.List<LessonPlan>, id : Nat, schoolId : SchoolId) : () {
    let kept = plans.filter(func(p) { not (p.id == id and p.schoolId == schoolId) });
    plans.clear();
    plans.append(kept)
  };

  // --- Assignments ---
  public func createAssignment(
    assignments : List.List<Assignment>,
    nextId : Nat,
    class_ : Text,
    section : Text,
    subject : Text,
    title : Text,
    description : Text,
    dueDate : Text,
    teacherId : UserId,
    attachmentUrl : ?Text,
    schoolId : SchoolId
  ) : Assignment {
    let a : Assignment = {
      id = nextId;
      class_;
      section;
      subject;
      title;
      description;
      dueDate;
      teacherId;
      attachmentUrl;
      schoolId;
      createdAt = Time.now();
    };
    assignments.add(a);
    a
  };

  public func getAssignmentsByClass(assignments : List.List<Assignment>, class_ : Text, schoolId : SchoolId) : [Assignment] {
    assignments.filter(func(a) { a.class_ == class_ and a.schoolId == schoolId }).toArray()
  };

  public func deleteAssignment(assignments : List.List<Assignment>, id : Nat, schoolId : SchoolId) : () {
    let kept = assignments.filter(func(a) { not (a.id == id and a.schoolId == schoolId) });
    assignments.clear();
    assignments.append(kept)
  };

  // --- Submissions ---
  public func submitAssignment(
    submissions : List.List<Submission>,
    nextId : Nat,
    assignmentId : Nat,
    studentId : UserId,
    content : Text,
    attachmentUrl : ?Text,
    schoolId : SchoolId
  ) : Submission {
    let s : Submission = {
      id = nextId;
      assignmentId;
      studentId;
      content;
      attachmentUrl;
      submittedAt = Time.now();
      status = #submitted;
      schoolId;
    };
    submissions.add(s);
    s
  };

  public func getSubmissionsByAssignment(submissions : List.List<Submission>, assignmentId : Nat, schoolId : SchoolId) : [Submission] {
    submissions.filter(func(s) { s.assignmentId == assignmentId and s.schoolId == schoolId }).toArray()
  };

  public func getSubmissionsByStudent(submissions : List.List<Submission>, studentId : UserId, schoolId : SchoolId) : [Submission] {
    submissions.filter(func(s) { s.studentId == studentId and s.schoolId == schoolId }).toArray()
  };

  // --- Syllabus ---
  public func setSyllabus(
    syllabi : List.List<Syllabus>,
    nextId : Nat,
    class_ : Text,
    subject : Text,
    content : Text,
    teacherId : UserId,
    schoolId : SchoolId
  ) : Syllabus {
    // Upsert: replace existing syllabus for same class+subject+school
    let existing = syllabi.findIndex(func(s) { s.class_ == class_ and s.subject == subject and s.schoolId == schoolId });
    let syl : Syllabus = {
      id = nextId;
      class_;
      subject;
      content;
      teacherId;
      schoolId;
      updatedAt = Time.now();
    };
    switch (existing) {
      case (?idx) {
        syllabi.put(idx, syl);
      };
      case null {
        syllabi.add(syl);
      };
    };
    syl
  };

  public func getSyllabusByClass(syllabi : List.List<Syllabus>, class_ : Text, schoolId : SchoolId) : [Syllabus] {
    syllabi.filter(func(s) { s.class_ == class_ and s.schoolId == schoolId }).toArray()
  };

  // --- Timetable ---
  public func setTimetable(
    timetables : List.List<Timetable>,
    nextId : Nat,
    class_ : Text,
    section : Text,
    periods : [Types.Period],
    schoolId : SchoolId
  ) : Timetable {
    let tt : Timetable = {
      id = nextId;
      class_;
      section;
      periods;
      schoolId;
    };
    let existing = timetables.findIndex(func(t) { t.class_ == class_ and t.section == section and t.schoolId == schoolId });
    switch (existing) {
      case (?idx) { timetables.put(idx, tt) };
      case null { timetables.add(tt) };
    };
    tt
  };

  public func getTimetable(timetables : List.List<Timetable>, class_ : Text, section : Text, schoolId : SchoolId) : ?Timetable {
    timetables.find(func(t) { t.class_ == class_ and t.section == section and t.schoolId == schoolId })
  };

  // --- Digital Library ---
  public func addResource(
    resources : List.List<DigitalResource>,
    nextId : Nat,
    title : Text,
    type_ : { #note; #pdf; #video },
    url : Text,
    class_ : Text,
    subject : Text,
    uploadedBy : UserId,
    schoolId : SchoolId
  ) : DigitalResource {
    let r : DigitalResource = {
      id = nextId;
      title;
      type_;
      url;
      class_;
      subject;
      uploadedBy;
      createdAt = Time.now();
      schoolId;
    };
    resources.add(r);
    r
  };

  public func getResourcesByClass(resources : List.List<DigitalResource>, class_ : Text, schoolId : SchoolId) : [DigitalResource] {
    resources.filter(func(r) { r.class_ == class_ and r.schoolId == schoolId }).toArray()
  };

  public func deleteResource(resources : List.List<DigitalResource>, id : Nat, schoolId : SchoolId) : () {
    let kept = resources.filter(func(r) { not (r.id == id and r.schoolId == schoolId) });
    resources.clear();
    resources.append(kept)
  };
};
