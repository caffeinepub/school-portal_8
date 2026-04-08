import UserTypes "../types/users";
import Common "../types/common";
import UsersLib "../lib/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  teachers : List.List<UserTypes.Teacher>,
  students : List.List<UserTypes.Student>,
  drivers : List.List<UserTypes.Driver>,
  principals : List.List<UserTypes.PrincipalAccount>,
  nextUserId : { var value : Nat }
) {

  // --- Authentication ---
  public shared func loginPrincipal(schoolId : Common.SchoolId, password : Text) : async Bool {
    UsersLib.verifyPrincipalPassword(principals, schoolId, password)
  };

  public shared func loginTeacher(email : Text, password : Text, schoolId : Common.SchoolId) : async Bool {
    UsersLib.verifyTeacherPassword(teachers, email, password, schoolId)
  };

  public shared func loginStudent(studentId : Common.UserId, password : Text, schoolId : Common.SchoolId) : async Bool {
    UsersLib.verifyStudentPassword(students, studentId, password, schoolId)
  };

  public shared func loginDriver(driverId : Common.UserId, password : Text, schoolId : Common.SchoolId) : async Bool {
    UsersLib.verifyDriverPassword(drivers, driverId, password, schoolId)
  };

  // --- Principal management ---
  public shared func setPrincipalPassword(schoolId : Common.SchoolId, oldPassword : Text, newPassword : Text) : async Bool {
    if (UsersLib.verifyPrincipalPassword(principals, schoolId, oldPassword)) {
      UsersLib.setPrincipalPassword(principals, schoolId, newPassword);
      true
    } else { false }
  };

  // --- Teacher CRUD ---
  public shared func addTeacher(schoolId : Common.SchoolId, callerPassword : Text, name : Text, email : Text, password : Text, assignedClass : Text, subjects : [Text]) : async Common.UserId {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextUserId.value;
    nextUserId.value += 1;
    let _ = UsersLib.createTeacher(teachers, id, name, email, password, assignedClass, subjects, schoolId);
    id
  };

  public query func getTeacher(schoolId : Common.SchoolId, id : Common.UserId) : async ?UserTypes.TeacherPublic {
    switch (UsersLib.getTeacher(teachers, id, schoolId)) {
      case (?t) { ?UsersLib.toTeacherPublic(t) };
      case null { null };
    }
  };

  public query func listTeachers(schoolId : Common.SchoolId) : async [UserTypes.TeacherPublic] {
    UsersLib.listTeachers(teachers, schoolId)
  };

  public shared func updateTeacher(schoolId : Common.SchoolId, callerPassword : Text, teacher : UserTypes.TeacherPublic) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    // Preserve password from existing record
    switch (UsersLib.getTeacher(teachers, teacher.id, schoolId)) {
      case (?existing) {
        let updated : UserTypes.Teacher = {
          id = teacher.id;
          name = teacher.name;
          email = teacher.email;
          password = existing.password;
          assignedClass = teacher.assignedClass;
          subjects = teacher.subjects;
          schoolId = teacher.schoolId;
        };
        UsersLib.updateTeacher(teachers, updated);
        true
      };
      case null { false };
    }
  };

  public shared func deleteTeacher(schoolId : Common.SchoolId, callerPassword : Text, id : Common.UserId) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    UsersLib.deleteTeacher(teachers, id, schoolId);
    true
  };

  public shared func resetTeacherPassword(schoolId : Common.SchoolId, callerPassword : Text, teacherId : Common.UserId, newPassword : Text) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    switch (UsersLib.getTeacher(teachers, teacherId, schoolId)) {
      case (?existing) {
        let updated : UserTypes.Teacher = { existing with password = newPassword };
        UsersLib.updateTeacher(teachers, updated);
        true
      };
      case null { false };
    }
  };

  // --- Student CRUD ---
  public shared func addStudent(schoolId : Common.SchoolId, callerPassword : Text, name : Text, class_ : Text, section : Text, rollNo : Nat, parentMobile : Text) : async Common.UserId {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextUserId.value;
    nextUserId.value += 1;
    let _ = UsersLib.createStudent(students, id, name, class_, section, rollNo, "", parentMobile, schoolId);
    id
  };

  public query func getStudent(schoolId : Common.SchoolId, id : Common.UserId) : async ?UserTypes.StudentPublic {
    switch (UsersLib.getStudent(students, id, schoolId)) {
      case (?s) { ?UsersLib.toStudentPublic(s) };
      case null { null };
    }
  };

  public query func listStudents(schoolId : Common.SchoolId) : async [UserTypes.StudentPublic] {
    UsersLib.listStudents(students, schoolId)
  };

  public query func listStudentsByClass(schoolId : Common.SchoolId, class_ : Text) : async [UserTypes.StudentPublic] {
    UsersLib.listStudentsByClass(students, class_, schoolId)
  };

  public shared func updateStudent(schoolId : Common.SchoolId, callerPassword : Text, student : UserTypes.StudentPublic) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    switch (UsersLib.getStudent(students, student.id, schoolId)) {
      case (?existing) {
        let updated : UserTypes.Student = {
          id = student.id;
          name = student.name;
          class_ = student.class_;
          section = student.section;
          rollNo = student.rollNo;
          password = existing.password;
          parentMobile = student.parentMobile;
          schoolId = student.schoolId;
          profilePictureUrl = student.profilePictureUrl;
        };
        UsersLib.updateStudent(students, updated);
        true
      };
      case null { false };
    }
  };

  public shared func deleteStudent(schoolId : Common.SchoolId, callerPassword : Text, id : Common.UserId) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    UsersLib.deleteStudent(students, id, schoolId);
    true
  };

  public shared func setStudentPassword(schoolId : Common.SchoolId, callerPassword : Text, studentId : Common.UserId, newPassword : Text) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    UsersLib.setStudentPassword(students, studentId, schoolId, newPassword);
    true
  };

  public shared func autoGenerateStudentPasswords(schoolId : Common.SchoolId, callerPassword : Text) : async [(Common.UserId, Text)] {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    UsersLib.autoGeneratePasswords(students, schoolId)
  };

  // --- Driver CRUD ---
  public shared func addDriver(schoolId : Common.SchoolId, callerPassword : Text, name : Text, password : Text, vehicleNo : Text, route : Text) : async Common.UserId {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextUserId.value;
    nextUserId.value += 1;
    let _ = UsersLib.createDriver(drivers, id, name, password, vehicleNo, route, schoolId);
    id
  };

  public query func getDriver(schoolId : Common.SchoolId, id : Common.UserId) : async ?UserTypes.DriverPublic {
    switch (UsersLib.getDriver(drivers, id, schoolId)) {
      case (?d) { ?UsersLib.toDriverPublic(d) };
      case null { null };
    }
  };

  public query func listDrivers(schoolId : Common.SchoolId) : async [UserTypes.DriverPublic] {
    UsersLib.listDrivers(drivers, schoolId)
  };

  public shared func updateDriver(schoolId : Common.SchoolId, callerPassword : Text, driver : UserTypes.DriverPublic) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    switch (UsersLib.getDriver(drivers, driver.id, schoolId)) {
      case (?existing) {
        let updated : UserTypes.Driver = {
          id = driver.id;
          name = driver.name;
          password = existing.password;
          vehicleNo = driver.vehicleNo;
          route = driver.route;
          schoolId = driver.schoolId;
        };
        UsersLib.updateDriver(drivers, updated);
        true
      };
      case null { false };
    }
  };

  public shared func deleteDriver(schoolId : Common.SchoolId, callerPassword : Text, id : Common.UserId) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    UsersLib.deleteDriver(drivers, id, schoolId);
    true
  };

  public shared func resetDriverPassword(schoolId : Common.SchoolId, callerPassword : Text, driverId : Common.UserId, newPassword : Text) : async Bool {
    if (not UsersLib.verifyPrincipalPassword(principals, schoolId, callerPassword)) {
      return false;
    };
    switch (UsersLib.getDriver(drivers, driverId, schoolId)) {
      case (?existing) {
        let updated : UserTypes.Driver = { existing with password = newPassword };
        UsersLib.updateDriver(drivers, updated);
        true
      };
      case null { false };
    }
  };
};
