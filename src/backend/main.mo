import List "mo:core/List";

import UserTypes "types/users";
import AcademicTypes "types/academics";
import FinanceTypes "types/finance";
import TransportTypes "types/transport";
import CommTypes "types/communication";
import SysTypes "types/system_";

import MixinUsers "mixins/users-api";
import MixinAcademics "mixins/academics-api";
import MixinFinance "mixins/finance-api";
import MixinTransport "mixins/transport-api";
import MixinCommunication "mixins/communication-api";
import MixinSystem "mixins/system-api";

import Migration "migration";

(with migration = Migration.run)
actor {

  // --- Shared counters ---
  var nextUserId : { var value : Nat } = { var value = 1 };
  var nextAcademicId : { var value : Nat } = { var value = 1 };
  var nextFinanceId : { var value : Nat } = { var value = 1 };
  var nextTransportId : { var value : Nat } = { var value = 1 };
  var nextCommId : { var value : Nat } = { var value = 1 };
  var nextSysId : { var value : Nat } = { var value = 1 };

  // --- Main Controller ---
  var mainControllerPasswordHash : { var value : Text } = { var value = "Admin@Lords2026" };

  // --- Users state ---
  let teachers = List.empty<UserTypes.Teacher>();
  let students = List.empty<UserTypes.Student>();
  let drivers = List.empty<UserTypes.Driver>();

  // Pre-seed 5 principal accounts
  let principals : List.List<UserTypes.PrincipalAccount> = List.fromArray([
    { id = 1; name = "Lords School Alwar/Chikani"; password = "Lordsalwar@2026"; schoolId = 1; email = "alwar@lords.edu" },
    { id = 2; name = "Lords School Churu";         password = "Lordschuru@2026"; schoolId = 2; email = "churu@lords.edu" },
    { id = 3; name = "Lords School Sadulpur";      password = "Lordssadulpur@2026"; schoolId = 3; email = "sadulpur@lords.edu" },
    { id = 4; name = "Lords School Principal 4";   password = "Lords4@2026"; schoolId = 4; email = "p4@lords.edu" },
    { id = 5; name = "Lords School Principal 5";   password = "Lords5@2026"; schoolId = 5; email = "p5@lords.edu" },
  ]);

  // --- Academics state ---
  let attendanceRecords = List.empty<AcademicTypes.AttendanceRecord>();
  let examMarks = List.empty<AcademicTypes.ExamMark>();
  let lessonPlans = List.empty<AcademicTypes.LessonPlan>();
  let assignments = List.empty<AcademicTypes.Assignment>();
  let submissions = List.empty<AcademicTypes.Submission>();
  let syllabi = List.empty<AcademicTypes.Syllabus>();
  let timetables = List.empty<AcademicTypes.Timetable>();
  let digitalResources = List.empty<AcademicTypes.DigitalResource>();

  // --- Finance state ---
  let feeRecords = List.empty<FinanceTypes.FeeRecord>();

  // --- Transport state ---
  let routes = List.empty<TransportTypes.TransportRoute>();
  let busLocations = List.empty<TransportTypes.BusLocation>();
  let pickupLogs = List.empty<TransportTypes.PickupLog>();
  let emergencyAlerts = List.empty<TransportTypes.EmergencyAlert>();
  let maintenanceLogs = List.empty<TransportTypes.MaintenanceLog>();

  // --- Communication state ---
  let notices = List.empty<CommTypes.Notice>();
  let parentMessages = List.empty<CommTypes.ParentMessage>();
  let inquiries = List.empty<CommTypes.Inquiry>();
  let diaryEntries = List.empty<CommTypes.DiaryEntry>();

  // --- System state ---
  let schoolConfigs = List.empty<SysTypes.SchoolConfig>();
  let examTimetables = List.empty<SysTypes.ExamTimetable>();

  // --- Mixin inclusions ---
  include MixinUsers(teachers, students, drivers, principals, nextUserId);
  include MixinAcademics(attendanceRecords, examMarks, lessonPlans, assignments, submissions, syllabi, timetables, digitalResources, nextAcademicId, principals, students);
  include MixinFinance(feeRecords, nextFinanceId, principals);
  include MixinTransport(routes, busLocations, pickupLogs, emergencyAlerts, maintenanceLogs, nextTransportId, principals, drivers);
  include MixinCommunication(notices, parentMessages, inquiries, diaryEntries, nextCommId, principals);
  include MixinSystem(schoolConfigs, examTimetables, nextSysId, mainControllerPasswordHash, principals, teachers, students, drivers);
};
