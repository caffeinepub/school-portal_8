import Types "../types/users";
import Common "../types/common";
import List "mo:core/List";

module {
  public type Teacher = Types.Teacher;
  public type TeacherPublic = Types.TeacherPublic;
  public type Driver = Types.Driver;
  public type DriverPublic = Types.DriverPublic;
  public type Student = Types.Student;
  public type StudentPublic = Types.StudentPublic;
  public type PrincipalAccount = Types.PrincipalAccount;
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;

  // --- Teacher ---
  public func createTeacher(
    teachers : List.List<Teacher>,
    nextId : Nat,
    name : Text,
    email : Text,
    password : Text,
    assignedClass : Text,
    subjects : [Text],
    schoolId : SchoolId
  ) : Teacher {
    let t : Teacher = {
      id = nextId;
      name;
      email;
      password;
      assignedClass;
      subjects;
      schoolId;
    };
    teachers.add(t);
    t
  };

  public func getTeacher(teachers : List.List<Teacher>, id : UserId, schoolId : SchoolId) : ?Teacher {
    teachers.find(func(t) { t.id == id and t.schoolId == schoolId })
  };

  public func getTeacherByEmail(teachers : List.List<Teacher>, email : Text, schoolId : SchoolId) : ?Teacher {
    teachers.find(func(t) { t.email == email and t.schoolId == schoolId })
  };

  public func listTeachers(teachers : List.List<Teacher>, schoolId : SchoolId) : [TeacherPublic] {
    let filtered = teachers.filter(func(t) { t.schoolId == schoolId });
    filtered.map<Teacher, TeacherPublic>(toTeacherPublic).toArray()
  };

  public func updateTeacher(teachers : List.List<Teacher>, updated : Teacher) : () {
    teachers.mapInPlace(func(t) {
      if (t.id == updated.id and t.schoolId == updated.schoolId) { updated }
      else { t }
    })
  };

  public func deleteTeacher(teachers : List.List<Teacher>, id : UserId, schoolId : SchoolId) : () {
    let kept = teachers.filter(func(t) { not (t.id == id and t.schoolId == schoolId) });
    teachers.clear();
    teachers.append(kept)
  };

  public func verifyTeacherPassword(teachers : List.List<Teacher>, email : Text, password : Text, schoolId : SchoolId) : Bool {
    switch (teachers.find(func(t) { t.email == email and t.schoolId == schoolId })) {
      case (?t) { t.password == password };
      case null { false };
    }
  };

  // --- Student ---
  public func createStudent(
    students : List.List<Student>,
    nextId : Nat,
    name : Text,
    class_ : Text,
    section : Text,
    rollNo : Nat,
    password : Text,
    parentMobile : Text,
    schoolId : SchoolId
  ) : Student {
    let s : Student = {
      id = nextId;
      name;
      class_;
      section;
      rollNo;
      password;
      parentMobile;
      schoolId;
      profilePictureUrl = null;
    };
    students.add(s);
    s
  };

  public func getStudent(students : List.List<Student>, id : UserId, schoolId : SchoolId) : ?Student {
    students.find(func(s) { s.id == id and s.schoolId == schoolId })
  };

  public func getStudentByPassword(students : List.List<Student>, password : Text, schoolId : SchoolId) : ?Student {
    students.find(func(s) { s.password == password and s.schoolId == schoolId })
  };

  public func listStudents(students : List.List<Student>, schoolId : SchoolId) : [StudentPublic] {
    let filtered = students.filter(func(s) { s.schoolId == schoolId });
    filtered.map<Student, StudentPublic>(toStudentPublic).toArray()
  };

  public func listStudentsByClass(students : List.List<Student>, class_ : Text, schoolId : SchoolId) : [StudentPublic] {
    let filtered = students.filter(func(s) { s.class_ == class_ and s.schoolId == schoolId });
    filtered.map<Student, StudentPublic>(toStudentPublic).toArray()
  };

  public func updateStudent(students : List.List<Student>, updated : Student) : () {
    students.mapInPlace(func(s) {
      if (s.id == updated.id and s.schoolId == updated.schoolId) { updated }
      else { s }
    })
  };

  public func deleteStudent(students : List.List<Student>, id : UserId, schoolId : SchoolId) : () {
    let kept = students.filter(func(s) { not (s.id == id and s.schoolId == schoolId) });
    students.clear();
    students.append(kept)
  };

  public func setStudentPassword(students : List.List<Student>, id : UserId, schoolId : SchoolId, password : Text) : () {
    students.mapInPlace(func(s) {
      if (s.id == id and s.schoolId == schoolId) { { s with password } }
      else { s }
    })
  };

  public func verifyStudentPassword(students : List.List<Student>, id : UserId, password : Text, schoolId : SchoolId) : Bool {
    switch (students.find(func(s) { s.id == id and s.schoolId == schoolId })) {
      case (?s) { s.password == password };
      case null { false };
    }
  };

  // Generate unique passwords for all students in a school using simple deterministic pattern
  public func autoGeneratePasswords(students : List.List<Student>, schoolId : SchoolId) : [(UserId, Text)] {
    let schoolStudents = students.filter(func(s) { s.schoolId == schoolId }).toArray();
    var results : List.List<(UserId, Text)> = List.empty();
    var i = 0;
    while (i < schoolStudents.size()) {
      let s = schoolStudents[i];
      let pwd = "Lords@" # s.id.toText() # "x" # i.toText() # "K";
      results.add((s.id, pwd));
      i += 1;
    };
    let pairs = results.toArray();
    // Apply passwords back to students list
    for ((sid, pwd) in pairs.values()) {
      students.mapInPlace(func(st) {
        if (st.id == sid and st.schoolId == schoolId) { { st with password = pwd } }
        else { st }
      });
    };
    pairs
  };

  // --- Driver ---
  public func createDriver(
    drivers : List.List<Driver>,
    nextId : Nat,
    name : Text,
    password : Text,
    vehicleNo : Text,
    route : Text,
    schoolId : SchoolId
  ) : Driver {
    let d : Driver = {
      id = nextId;
      name;
      password;
      vehicleNo;
      route;
      schoolId;
    };
    drivers.add(d);
    d
  };

  public func getDriver(drivers : List.List<Driver>, id : UserId, schoolId : SchoolId) : ?Driver {
    drivers.find(func(d) { d.id == id and d.schoolId == schoolId })
  };

  public func listDrivers(drivers : List.List<Driver>, schoolId : SchoolId) : [DriverPublic] {
    let filtered = drivers.filter(func(d) { d.schoolId == schoolId });
    filtered.map<Driver, DriverPublic>(toDriverPublic).toArray()
  };

  public func updateDriver(drivers : List.List<Driver>, updated : Driver) : () {
    drivers.mapInPlace(func(d) {
      if (d.id == updated.id and d.schoolId == updated.schoolId) { updated }
      else { d }
    })
  };

  public func deleteDriver(drivers : List.List<Driver>, id : UserId, schoolId : SchoolId) : () {
    let kept = drivers.filter(func(d) { not (d.id == id and d.schoolId == schoolId) });
    drivers.clear();
    drivers.append(kept)
  };

  public func verifyDriverPassword(drivers : List.List<Driver>, id : UserId, password : Text, schoolId : SchoolId) : Bool {
    switch (drivers.find(func(d) { d.id == id and d.schoolId == schoolId })) {
      case (?d) { d.password == password };
      case null { false };
    }
  };

  // --- Principal ---
  public func getPrincipalAccount(principals : List.List<PrincipalAccount>, schoolId : SchoolId) : ?PrincipalAccount {
    principals.find(func(p) { p.schoolId == schoolId })
  };

  public func verifyPrincipalPassword(principals : List.List<PrincipalAccount>, schoolId : SchoolId, password : Text) : Bool {
    switch (principals.find(func(p) { p.schoolId == schoolId })) {
      case (?p) { p.password == password };
      case null { false };
    }
  };

  public func setPrincipalPassword(principals : List.List<PrincipalAccount>, schoolId : SchoolId, password : Text) : () {
    principals.mapInPlace(func(p) {
      if (p.schoolId == schoolId) { { p with password } }
      else { p }
    })
  };

  // --- Shared helpers ---
  public func toTeacherPublic(t : Teacher) : TeacherPublic {
    {
      id = t.id;
      name = t.name;
      email = t.email;
      assignedClass = t.assignedClass;
      subjects = t.subjects;
      schoolId = t.schoolId;
    }
  };

  public func toStudentPublic(s : Student) : StudentPublic {
    {
      id = s.id;
      name = s.name;
      class_ = s.class_;
      section = s.section;
      rollNo = s.rollNo;
      parentMobile = s.parentMobile;
      schoolId = s.schoolId;
      profilePictureUrl = s.profilePictureUrl;
    }
  };

  public func toDriverPublic(d : Driver) : DriverPublic {
    {
      id = d.id;
      name = d.name;
      vehicleNo = d.vehicleNo;
      route = d.route;
      schoolId = d.schoolId;
    }
  };
};
