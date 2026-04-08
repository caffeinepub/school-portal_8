import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DriverLayout from "./components/DriverLayout";
import MainControllerLayout from "./components/MainControllerLayout";
import PrincipalLayout from "./components/PrincipalLayout";
import StudentLayout from "./components/StudentLayout";
import StudentPortalLayout from "./components/StudentPortalLayout";
import TeacherLayout from "./components/TeacherLayout";
import {
  notifications as mockNotifications,
  syllabus as mockSyllabus,
} from "./data/mockData";
import type { Student } from "./data/mockData";
import { SCHOOLS } from "./data/schools";
import { useActor } from "./hooks/useActor";
import AddStudentPage from "./pages/AddStudentPage";
import Login from "./pages/Login";
import MainControllerPage from "./pages/MainControllerPage";
import PrincipalAnnouncementsPage from "./pages/PrincipalAnnouncementsPage";
import {
  CustomPanelPage,
  DynamicCustomPanelPage,
} from "./pages/PrincipalAppBuilderPage";
import type { CustomPanelDef } from "./pages/PrincipalAppBuilderPage";
import PrincipalClassView from "./pages/PrincipalClassView";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import PrincipalDiaryPage from "./pages/PrincipalDiaryPage";
import PrincipalDoubtChat from "./pages/PrincipalDoubtChat";
import PrincipalExamTimetablePage from "./pages/PrincipalExamTimetablePage";
import PrincipalHolidaysPage from "./pages/PrincipalHolidaysPage";
import PrincipalSchoolInfoEditor from "./pages/PrincipalSchoolInfoEditor";
import PrincipalSendMessagePage from "./pages/PrincipalSendMessagePage";
import PrincipalServerPage from "./pages/PrincipalServerPage";
import PrincipalSyllabusPage from "./pages/PrincipalSyllabusPage";
import PrincipalTestMarksPage from "./pages/PrincipalTestMarksPage";
import StudentEditPage from "./pages/StudentEditPage";
import StudentPortalView from "./pages/StudentPortalView";
import DriverEmergencyPage from "./pages/driver/EmergencyAlertPage";
import DriverGPSPage from "./pages/driver/GPSTrackingPage";
import DriverMaintenancePage from "./pages/driver/MaintenanceLogPage";
import DriverPickupDropPage from "./pages/driver/PickupDropPage";
import DriverRoutesPage from "./pages/driver/RoutesPage";
import AcademicOversight from "./pages/principal/AcademicOversight";
import Announcements from "./pages/principal/Announcements";
import FinancialDashboard from "./pages/principal/FinancialDashboard";
import InquiryManagement from "./pages/principal/InquiryManagement";
import UserManagement from "./pages/principal/UserManagement";
import DigitalLibraryPage from "./pages/student/DigitalLibraryPage";
import FeeStatusPage from "./pages/student/FeeStatusPage";
import PersonalDashboard from "./pages/student/PersonalDashboard";
import SubmissionsPage from "./pages/student/SubmissionsPage";
import TimetablePage from "./pages/student/TimetablePage";
import AssignmentsPage from "./pages/teacher/AssignmentsPage";
import AttendancePage from "./pages/teacher/AttendancePage";
import GradebookPage from "./pages/teacher/GradebookPage";
import LessonPlannerPage from "./pages/teacher/LessonPlannerPage";
import ParentMessagesPage from "./pages/teacher/ParentMessagesPage";

type Role =
  | "principal"
  | "teacher"
  | "student"
  | "driver"
  | "mainController"
  | null;
type PrincipalPage = string;

export type Notification = (typeof mockNotifications)[number];
export type SyllabusSubject = {
  subject: string;
  chapters: { name: string; status: string }[];
};
export type ClassSyllabus = Record<string, SyllabusSubject[]>;

const DEFAULT_CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
  "11-A",
  "11-B",
  "12-A",
  "12-B",
  "11-Science",
  "11-Commerce",
  "12-Science",
  "12-Commerce",
];

// Legacy compat: keep PRINCIPALS export
export { SCHOOLS as PRINCIPALS };

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function loadSyllabus(principalId: string): ClassSyllabus {
  let result: ClassSyllabus = {};
  try {
    const raw = localStorage.getItem(`lords_syllabus_${principalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          result = { General: parsed as SyllabusSubject[] };
          saveStorage(`lords_syllabus_${principalId}`, result);
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        result = parsed as ClassSyllabus;
      }
    } else {
      result = mockSyllabus;
    }
  } catch {
    result = mockSyllabus;
  }
  for (const cls of DEFAULT_CLASSES) {
    if (!(cls in result)) result[cls] = [];
  }
  return result;
}

interface SessionData {
  role: Role;
  activePrincipalId: string | null;
  parentStudentId: number | null;
  parentPrincipalId: string | null;
}

function loadSession(): SessionData {
  try {
    const raw = localStorage.getItem("lords_session");
    if (raw) return JSON.parse(raw) as SessionData;
  } catch {}
  return {
    role: null,
    activePrincipalId: null,
    parentStudentId: null,
    parentPrincipalId: null,
  };
}

function generateStrongPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 7; i++)
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  return `Lords@${suffix}`;
}

function generateUniquePasswords(count: number): string[] {
  const used = new Set<string>();
  const result: string[] = [];
  while (result.length < count) {
    const pwd = generateStrongPassword();
    if (!used.has(pwd)) {
      used.add(pwd);
      result.push(pwd);
    }
  }
  return result;
}

function generateUniquePassword(usedPasswords: Set<string>): string {
  let pwd: string;
  do {
    pwd = generateStrongPassword();
  } while (usedPasswords.has(pwd));
  return pwd;
}

function downloadPasswordCSV(updatedStudents: Student[]) {
  const rows = [
    ["Student Name", "Class", "Roll No", "Parent Password"],
    ...updatedStudents.map((s) => [
      s.name,
      s.class,
      String(s.rollNo),
      s.parentPassword ?? "",
    ]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student_passwords_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Placeholder pages for new portals ──

function TeacherPortalPage({
  schoolId,
  onLogout,
}: { schoolId: string; onLogout: () => void }) {
  const [page, setPage] = useState("attendance");
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const PAGE_LABELS: Record<string, string> = {
    attendance: "Attendance",
    gradebook: "Gradebook",
    "lesson-planner": "Lesson Planner",
    assignments: "Assignments",
    "parent-messages": "Parent Messages",
  };

  const renderPage = () => {
    if (page === "attendance") return <AttendancePage schoolId={schoolId} />;
    if (page === "gradebook") return <GradebookPage schoolId={schoolId} />;
    if (page === "lesson-planner")
      return <LessonPlannerPage schoolId={schoolId} />;
    if (page === "assignments") return <AssignmentsPage schoolId={schoolId} />;
    if (page === "parent-messages")
      return <ParentMessagesPage schoolId={schoolId} />;
    return <AttendancePage schoolId={schoolId} />;
  };

  return (
    <TeacherLayout
      currentPage={page}
      onPageChange={setPage}
      onLogout={onLogout}
      pageLabel={PAGE_LABELS[page] ?? "Teachers Portal"}
      schoolName={school?.shortName}
    >
      {renderPage()}
    </TeacherLayout>
  );
}

function DriverPortalPage({
  schoolId,
  onLogout,
}: { schoolId: string; onLogout: () => void }) {
  const [page, setPage] = useState("routes");
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const PAGE_LABELS: Record<string, string> = {
    routes: "Route Management",
    "gps-tracking": "GPS Tracking",
    "pickup-drop": "Pickup / Drop",
    "emergency-alert": "Emergency Alert",
    "maintenance-log": "Maintenance Log",
  };

  const renderPage = () => {
    if (page === "routes") return <DriverRoutesPage schoolId={schoolId} />;
    if (page === "gps-tracking") return <DriverGPSPage schoolId={schoolId} />;
    if (page === "pickup-drop")
      return <DriverPickupDropPage schoolId={schoolId} />;
    if (page === "emergency-alert")
      return <DriverEmergencyPage schoolId={schoolId} />;
    if (page === "maintenance-log")
      return <DriverMaintenancePage schoolId={schoolId} />;
    return null;
  };

  return (
    <DriverLayout
      currentPage={page}
      onPageChange={setPage}
      onLogout={onLogout}
      pageLabel={PAGE_LABELS[page]}
      schoolName={school?.shortName}
    >
      {renderPage()}
    </DriverLayout>
  );
}

export default function App() {
  const savedSession = loadSession();
  const { actor } = useActor();

  const [role, setRole] = useState<Role>(savedSession.role);
  const [activePrincipalId, setActivePrincipalId] = useState<string | null>(
    savedSession.activePrincipalId,
  );
  const [parentPrincipalId, setParentPrincipalId] = useState<string | null>(
    savedSession.parentPrincipalId,
  );
  const [parentStudentId, setParentStudentId] = useState<number | null>(
    savedSession.parentStudentId,
  );

  useEffect(() => {
    saveStorage("lords_session", {
      role,
      activePrincipalId,
      parentStudentId,
      parentPrincipalId,
    });
  }, [role, activePrincipalId, parentStudentId, parentPrincipalId]);

  const ns = activePrincipalId ?? "default";

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage(`lords_students_${ns}`, [] as Student[]),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadStorage(`lords_notifications_${ns}`, mockNotifications),
  );
  const [syllabus, setSyllabus] = useState<ClassSyllabus>(() =>
    loadSyllabus(ns),
  );

  const [liveParentStudent, setLiveParentStudent] = useState<Student | null>(
    null,
  );
  const [liveParentNotifications, setLiveParentNotifications] = useState<
    Notification[]
  >([]);
  const [liveParentSyllabus, setLiveParentSyllabus] = useState<ClassSyllabus>(
    {},
  );
  const [parentRefreshing, setParentRefreshing] = useState(false);

  useEffect(() => {
    if (role !== "student" || !parentPrincipalId || parentStudentId === null)
      return;
    const refresh = () => {
      const principalStudents = loadStorage(
        `lords_students_${parentPrincipalId}`,
        [] as Student[],
      );
      const found = principalStudents.find(
        (s: Student) => s.id === parentStudentId,
      );
      if (found) setLiveParentStudent(found);
      setLiveParentNotifications(
        loadStorage(
          `lords_notifications_${parentPrincipalId}`,
          mockNotifications,
        ),
      );
      setLiveParentSyllabus(loadSyllabus(parentPrincipalId));
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("lords_")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [role, parentPrincipalId, parentStudentId]);

  const loadingRef = useRef(false);
  const savedPrincipalIdRef = useRef<string | null>(activePrincipalId);
  const icpLoadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    savedPrincipalIdRef.current = activePrincipalId;
  }, [activePrincipalId]);

  useEffect(() => {
    if (activePrincipalId) {
      loadingRef.current = true;
      setStudents(
        loadStorage(`lords_students_${activePrincipalId}`, [] as Student[]),
      );
      setNotifications(
        loadStorage(
          `lords_notifications_${activePrincipalId}`,
          mockNotifications,
        ),
      );
      setSyllabus(loadSyllabus(activePrincipalId));
      setTimeout(() => {
        loadingRef.current = false;
      }, 0);
    }
  }, [activePrincipalId]);

  useEffect(() => {
    if (!actor || !activePrincipalId) return;
    const pid = activePrincipalId;
    if (icpLoadedRef.current.has(pid)) return;
    icpLoadedRef.current.add(pid);
    const loadFromICP = async () => {
      try {
        const [icpStudents, icpNotifications, icpSyllabus] = await Promise.all([
          actor.getData(`lords_students_${pid}`).catch(() => null),
          actor.getData(`lords_notifications_${pid}`).catch(() => null),
          actor.getData(`lords_syllabus_${pid}`).catch(() => null),
        ]);
        if (icpStudents) {
          const parsed = JSON.parse(icpStudents) as Student[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            saveStorage(`lords_students_${pid}`, parsed);
            setStudents(parsed);
          }
        }
        if (icpNotifications) {
          const parsed = JSON.parse(icpNotifications) as Notification[];
          if (Array.isArray(parsed)) {
            saveStorage(`lords_notifications_${pid}`, parsed);
            setNotifications(parsed);
          }
        }
        if (icpSyllabus) {
          const parsed = JSON.parse(icpSyllabus) as ClassSyllabus;
          if (typeof parsed === "object" && parsed !== null) {
            for (const cls of DEFAULT_CLASSES) {
              if (!(cls in parsed)) parsed[cls] = [];
            }
            saveStorage(`lords_syllabus_${pid}`, parsed);
            setSyllabus(parsed);
          }
        }
      } catch {}
    };
    loadFromICP();
  }, [actor, activePrincipalId]);

  useEffect(() => {
    if (!savedPrincipalIdRef.current || loadingRef.current) return;
    const pid = savedPrincipalIdRef.current;
    saveStorage(`lords_students_${pid}`, students);
    if (actor) {
      actor
        .setData(`lords_students_${pid}`, JSON.stringify(students))
        .catch(() => {});
    }
  }, [students, actor]);

  useEffect(() => {
    if (!savedPrincipalIdRef.current || loadingRef.current) return;
    const pid = savedPrincipalIdRef.current;
    saveStorage(`lords_notifications_${pid}`, notifications);
    if (actor) {
      actor
        .setData(`lords_notifications_${pid}`, JSON.stringify(notifications))
        .catch(() => {});
    }
  }, [notifications, actor]);

  useEffect(() => {
    if (!savedPrincipalIdRef.current || loadingRef.current) return;
    const pid = savedPrincipalIdRef.current;
    saveStorage(`lords_syllabus_${pid}`, syllabus);
    if (actor) {
      actor
        .setData(`lords_syllabus_${pid}`, JSON.stringify(syllabus))
        .catch(() => {});
    }
  }, [syllabus, actor]);

  const [principalPage, setPrincipalPage] =
    useState<PrincipalPage>("user-management");
  const [studentPage, setStudentPage] = useState<string>("dashboard");
  const [prefilledClass, setPrefilledClass] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const handleUpdateStudent = (updated: Student) =>
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  const handleDeleteStudent = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setPrincipalPage("list");
    setSelectedStudentId(null);
  };
  const handleAddStudent = (newStudent: Omit<Student, "id">) => {
    setStudents((prev) => {
      const withId: Student = { ...newStudent, id: Date.now() };
      if (!withId.parentPassword) {
        const usedPasswords = new Set(
          prev
            .map((s) => s.parentPassword)
            .filter((p): p is string => Boolean(p)),
        );
        withId.parentPassword = generateUniquePassword(usedPasswords);
      }
      return [...prev, withId];
    });
  };
  const handleBulkAddStudents = (newStudents: Omit<Student, "id">[]) => {
    setStudents((prev) => [
      ...prev,
      ...newStudents.map((s, i) => ({ ...s, id: Date.now() + i })),
    ]);
  };
  const handleEditStudent = (id: number) => {
    setSelectedStudentId(id);
    setPrincipalPage("edit");
  };
  const handleAddStudentToClass = (className: string) => {
    setPrefilledClass(className);
    setPrincipalPage("add");
  };
  const handlePrincipalPageChange = (p: string) => {
    setPrincipalPage(p as PrincipalPage);
    if (p !== "edit") setSelectedStudentId(null);
  };

  const handleLogin = (r: string, studentId?: number, principalId?: string) => {
    setRole(r as Role);
    if (r === "principal" && principalId) setActivePrincipalId(principalId);
    if (r === "teacher" && principalId) setActivePrincipalId(principalId);
    if (r === "driver" && principalId) setActivePrincipalId(principalId);
    if (studentId !== undefined) setParentStudentId(studentId);
    if (principalId && r === "student") setParentPrincipalId(principalId);
  };

  const handleLogout = () => {
    setRole(null);
    setActivePrincipalId(null);
    setParentStudentId(null);
    setParentPrincipalId(null);
    setLiveParentStudent(null);
    setLiveParentNotifications([]);
    setLiveParentSyllabus({});
    setPrincipalPage("list");
    saveStorage("lords_session", {
      role: null,
      activePrincipalId: null,
      parentStudentId: null,
      parentPrincipalId: null,
    });
  };

  const handleRankStudents = (ranked: Student[]) => setStudents(ranked);

  const handleAutoGeneratePasswords = () => {
    if (students.length === 0) return;
    const passwords = generateUniquePasswords(students.length);
    const updatedStudents = students.map((s, i) => ({
      ...s,
      parentPassword: passwords[i],
    }));
    setStudents(updatedStudents);
    downloadPasswordCSV(updatedStudents);
    toast.success(
      `Passwords generated for ${updatedStudents.length} students! CSV downloaded.`,
      {
        description:
          "Each student has a unique strong password (Lords@XXXXXXX format).",
        duration: 6000,
      },
    );
  };

  const activePrincipalName =
    SCHOOLS.find((p) => p.id === activePrincipalId)?.shortName ?? "Principal";

  // ── No session — show login ──
  if (!role) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // ── Main Controller ──
  if (role === "mainController") {
    return (
      <>
        <MainControllerPage onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // ── Teacher Portal ──
  if (role === "teacher") {
    return (
      <>
        <TeacherPortalPage
          schoolId={activePrincipalId ?? "p1"}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // ── Driver Portal ──
  if (role === "driver") {
    return (
      <>
        <DriverPortalPage
          schoolId={activePrincipalId ?? "p1"}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // ── Students Portal ──
  if (role === "student") {
    let parentStudent: Student | undefined = liveParentStudent ?? undefined;
    if (!parentStudent && parentStudentId !== null) {
      if (parentPrincipalId) {
        const principalStudents = loadStorage(
          `lords_students_${parentPrincipalId}`,
          [] as Student[],
        );
        parentStudent = principalStudents.find(
          (s: Student) => s.id === parentStudentId,
        );
      }
      if (!parentStudent)
        parentStudent = students.find((s) => s.id === parentStudentId);
    }

    if (!parentStudent) {
      return (
        <>
          <StudentPortalLayout studentName="Unknown" onLogout={handleLogout}>
            <div className="p-8 text-center text-muted-foreground">
              Student not found. Please log in again.
            </div>
          </StudentPortalLayout>
          <Toaster />
        </>
      );
    }

    const parentNotifications =
      liveParentNotifications.length > 0
        ? liveParentNotifications
        : parentPrincipalId
          ? loadStorage(
              `lords_notifications_${parentPrincipalId}`,
              mockNotifications,
            )
          : notifications;
    const parentSyllabus =
      Object.keys(liveParentSyllabus).length > 0
        ? liveParentSyllabus
        : parentPrincipalId
          ? loadSyllabus(parentPrincipalId)
          : syllabus;

    const effectivePrincipalId = parentPrincipalId ?? "default";

    const handleStudentRefresh = () => {
      if (!parentPrincipalId || parentStudentId === null || parentRefreshing)
        return;
      setParentRefreshing(true);
      const refreshFromICP = async () => {
        try {
          if (actor) {
            const raw = await actor.getData(
              `lords_students_${parentPrincipalId}`,
            );
            if (raw) {
              const parsed = JSON.parse(raw) as Student[];
              saveStorage(`lords_students_${parentPrincipalId}`, parsed);
              const found = parsed.find((s) => s.id === parentStudentId);
              if (found) setLiveParentStudent(found);
            }
          }
        } catch {}
        const principalStudents = loadStorage(
          `lords_students_${parentPrincipalId}`,
          [] as Student[],
        );
        const found = principalStudents.find(
          (s: Student) => s.id === parentStudentId,
        );
        if (found) setLiveParentStudent(found);
        setLiveParentNotifications(
          loadStorage(
            `lords_notifications_${parentPrincipalId}`,
            mockNotifications,
          ),
        );
        setLiveParentSyllabus(loadSyllabus(parentPrincipalId));
        toast.success("Data refreshed");
        setParentRefreshing(false);
      };
      void refreshFromICP();
    };

    const STUDENT_PAGE_LABELS: Record<string, string> = {
      dashboard: "Dashboard",
      "digital-library": "Digital Library",
      "fee-status": "Fee Status",
      submissions: "Submissions",
      timetable: "Timetable",
    };

    return (
      <>
        <StudentLayout
          currentPage={studentPage}
          onPageChange={setStudentPage}
          studentName={parentStudent.name}
          onLogout={handleLogout}
          pageLabel={STUDENT_PAGE_LABELS[studentPage] ?? "Students Portal"}
          onRefresh={handleStudentRefresh}
        >
          {studentPage === "dashboard" && (
            <PersonalDashboard
              student={parentStudent}
              notifications={parentNotifications}
              syllabus={parentSyllabus}
              principalId={effectivePrincipalId}
            />
          )}
          {studentPage === "digital-library" && (
            <DigitalLibraryPage
              student={parentStudent}
              syllabus={parentSyllabus}
              principalId={effectivePrincipalId}
            />
          )}
          {studentPage === "fee-status" && (
            <FeeStatusPage student={parentStudent} />
          )}
          {studentPage === "submissions" && (
            <SubmissionsPage
              student={parentStudent}
              principalId={effectivePrincipalId}
            />
          )}
          {studentPage === "timetable" && (
            <TimetablePage
              student={parentStudent}
              principalId={effectivePrincipalId}
            />
          )}
        </StudentLayout>
        <Toaster />
      </>
    );
  }

  // ── Principal Panel ──
  if (role === "principal") {
    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    const allNavLabels: Record<string, string> = {
      "user-management": "User Management",
      "financial-dashboard": "Financial Dashboard",
      "academic-oversight": "Academic Oversight",
      announcements: "Announcements",
      inquiries: "Inquiry Management",
      // Legacy pages
      list: "All Students",
      add: "Add Student",
      info: "Edit School Info",
      holidays: "Manage Holidays",
      "school-syllabus": "Manage Syllabus",
      "doubt-chat": "Doubt Chat",
      "class-view": "Class View",
      diary: "Diary",
      "exam-timetable": "Exam Timetable",
      "test-marks": "Test Marks",
      "send-message": "Send Message to Students",
      server: "Server",
      edit: "Edit Student",
    };

    const resolvePageLabel = (page: string): string => {
      if (page.startsWith("custom-")) {
        const panelId = page.replace("custom-", "");
        try {
          const raw = localStorage.getItem(
            `lords_dynamic_panels_${activePrincipalId ?? "default"}`,
          );
          if (raw) {
            const defs = JSON.parse(raw) as CustomPanelDef[];
            const def = defs.find((d) => d.id === panelId);
            if (def) return def.name;
          }
        } catch {}
        return "Custom Panel";
      }
      return allNavLabels[page] ?? "Student Management";
    };

    return (
      <>
        <PrincipalLayout
          currentPage={principalPage}
          onPageChange={handlePrincipalPageChange}
          onLogout={handleLogout}
          pageLabel={resolvePageLabel(principalPage)}
          principalName={activePrincipalName}
          principalId={activePrincipalId ?? "default"}
          onRefresh={() =>
            setStudents(loadStorage(`lords_students_${ns}`, [] as Student[]))
          }
        >
          {/* ── New Administrative Hub pages ── */}
          {principalPage === "user-management" && (
            <UserManagement
              principalId={activePrincipalId ?? "default"}
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAutoGeneratePasswords={handleAutoGeneratePasswords}
            />
          )}
          {principalPage === "financial-dashboard" && (
            <FinancialDashboard
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "academic-oversight" && (
            <AcademicOversight
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "announcements" && (
            <Announcements
              principalId={activePrincipalId ?? "default"}
              principalName={activePrincipalName}
            />
          )}
          {principalPage === "inquiries" && (
            <InquiryManagement principalId={activePrincipalId ?? "default"} />
          )}
          {/* ── Legacy pages (kept for backward compat) ── */}
          {principalPage === "list" && (
            <PrincipalDashboard
              students={students}
              onEditStudent={handleEditStudent}
              onNavigateToAdd={() => setPrincipalPage("add")}
              onRankStudents={handleRankStudents}
              onAutoGeneratePasswords={handleAutoGeneratePasswords}
            />
          )}
          {principalPage === "edit" && selectedStudent && (
            <StudentEditPage
              student={selectedStudent}
              principalId={activePrincipalId ?? "default"}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBack={() => setPrincipalPage("list")}
            />
          )}
          {principalPage === "add" && (
            <AddStudentPage
              onAddStudent={handleAddStudent}
              onBulkAddStudents={handleBulkAddStudents}
              defaultClass={prefilledClass}
              onBack={() => {
                setPrincipalPage("user-management");
                setPrefilledClass("");
              }}
            />
          )}
          {principalPage === "info" && <PrincipalSchoolInfoEditor />}
          {principalPage === "holidays" && (
            <PrincipalHolidaysPage
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
          {principalPage === "school-syllabus" && (
            <PrincipalSyllabusPage
              key={activePrincipalId ?? "default"}
              syllabus={syllabus}
              setSyllabus={setSyllabus}
            />
          )}
          {principalPage === "announcements" && (
            <PrincipalAnnouncementsPage
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
          {principalPage === "doubt-chat" && (
            <PrincipalDoubtChat
              students={students}
              principalId={activePrincipalId ?? "default"}
            />
          )}
          {principalPage === "class-view" && (
            <PrincipalClassView
              students={students}
              onEditStudent={handleEditStudent}
              onAddStudentToClass={handleAddStudentToClass}
              principalId={activePrincipalId ?? "default"}
            />
          )}
          {principalPage === "diary" && (
            <PrincipalDiaryPage
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "exam-timetable" && (
            <PrincipalExamTimetablePage
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "test-marks" && (
            <PrincipalTestMarksPage
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "server" && (
            <PrincipalServerPage
              principalId={activePrincipalId ?? "default"}
              students={students}
            />
          )}
          {principalPage === "send-message" && (
            <PrincipalSendMessagePage
              principalId={activePrincipalId ?? "default"}
              notifications={notifications}
              onSendNotification={(n) =>
                setNotifications((prev) => [n, ...prev])
              }
            />
          )}
          {principalPage.startsWith("custom-") &&
            (() => {
              const panelId = principalPage.replace("custom-", "");
              try {
                const raw = localStorage.getItem(
                  `lords_dynamic_panels_${activePrincipalId ?? "default"}`,
                );
                const defs: CustomPanelDef[] = raw
                  ? (JSON.parse(raw) as CustomPanelDef[])
                  : [];
                const def = defs.find((p) => p.id === panelId);
                if (def)
                  return (
                    <DynamicCustomPanelPage
                      panelDef={def}
                      principalId={activePrincipalId ?? "default"}
                      onNavigateToBuilder={() => setPrincipalPage("list")}
                    />
                  );
              } catch {}
              return <CustomPanelPage panelId={panelId} />;
            })()}
        </PrincipalLayout>
        <Toaster />
      </>
    );
  }

  return null;
}
