import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import ParentLayout from "./components/ParentLayout";
import PrincipalLayout from "./components/PrincipalLayout";
import {
  notifications as mockNotifications,
  students as mockStudents,
  syllabus as mockSyllabus,
} from "./data/mockData";
import type { Student } from "./data/mockData";
import { PRINCIPALS } from "./data/principals";
import AddStudentPage from "./pages/AddStudentPage";
import Login from "./pages/Login";
import ParentView from "./pages/ParentView";
import PrincipalAnnouncementsPage from "./pages/PrincipalAnnouncementsPage";
import PrincipalClassView from "./pages/PrincipalClassView";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import PrincipalDiaryPage from "./pages/PrincipalDiaryPage";
import PrincipalDoubtChat from "./pages/PrincipalDoubtChat";
import PrincipalErrorFixPage from "./pages/PrincipalErrorFixPage";
import PrincipalExamTimetablePage from "./pages/PrincipalExamTimetablePage";
import PrincipalHolidaysPage from "./pages/PrincipalHolidaysPage";
import PrincipalSchoolInfoEditor from "./pages/PrincipalSchoolInfoEditor";
import PrincipalSendMessagePage from "./pages/PrincipalSendMessagePage";
import PrincipalStoragePage from "./pages/PrincipalStoragePage";
import PrincipalSyllabusPage from "./pages/PrincipalSyllabusPage";
import PrincipalTestMarksPage from "./pages/PrincipalTestMarksPage";
import StudentEditPage from "./pages/StudentEditPage";

type Role = "principal" | "parent" | null;
type PrincipalPage =
  | "list"
  | "edit"
  | "add"
  | "info"
  | "holidays"
  | "school-syllabus"
  | "announcements"
  | "doubt-chat"
  | "class-view"
  | "diary"
  | "exam-timetable"
  | "test-marks"
  | "send-message"
  | "error-fix"
  | "storage";

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

/**
 * Load syllabus with migration support.
 * Before v42, syllabus was stored as SyllabusSubject[] (flat array).
 * After v42, it became Record<string, SyllabusSubject[]> (class-wise).
 * If old array format is found, migrate it to class-wise format.
 * Also pre-populates DEFAULT_CLASSES so all class names are pre-listed.
 */
function loadSyllabus(principalId: string): ClassSyllabus {
  let result: ClassSyllabus = {};
  try {
    const raw = localStorage.getItem(`lords_syllabus_${principalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Old format was a flat array of SyllabusSubject
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          // Migrate: put old subjects under a "General" class key
          result = { General: parsed as SyllabusSubject[] };
          // Save migrated data back so it's not lost
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

  // Merge in default class keys (empty arrays) if they don't exist
  for (const cls of DEFAULT_CLASSES) {
    if (!(cls in result)) {
      result[cls] = [];
    }
  }

  return result;
}

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [activePrincipalId, setActivePrincipalId] = useState<string | null>(
    null,
  );
  const [parentPrincipalId, setParentPrincipalId] = useState<string | null>(
    null,
  );
  const [parentStudentId, setParentStudentId] = useState<number | null>(null);

  // Derive namespace keys
  const ns = activePrincipalId ?? "default";

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage(`lords_students_${ns}`, mockStudents),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadStorage(`lords_notifications_${ns}`, mockNotifications),
  );
  const [syllabus, setSyllabus] = useState<ClassSyllabus>(() =>
    loadSyllabus(ns),
  );

  // Live data for parent panel — refreshes every 5 seconds
  const [liveParentStudent, setLiveParentStudent] = useState<Student | null>(
    null,
  );
  const [liveParentNotifications, setLiveParentNotifications] = useState<
    Notification[]
  >([]);
  const [liveParentSyllabus, setLiveParentSyllabus] = useState<ClassSyllabus>(
    {},
  );

  useEffect(() => {
    if (role !== "parent" || !parentPrincipalId || parentStudentId === null)
      return;

    const refresh = () => {
      const principalStudents = loadStorage(
        `lords_students_${parentPrincipalId}`,
        mockStudents,
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

    refresh(); // initial load
    const interval = setInterval(refresh, 5000);

    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("lords_")) refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [role, parentPrincipalId, parentStudentId]);

  // Track whether a load is in progress to avoid premature saves
  const loadingRef = useRef(false);
  // Track the principal ID for save effects (avoids stale closures)
  const savedPrincipalIdRef = useRef<string | null>(activePrincipalId);
  useEffect(() => {
    savedPrincipalIdRef.current = activePrincipalId;
  }, [activePrincipalId]);

  // When principal changes, reload their data
  useEffect(() => {
    if (activePrincipalId) {
      loadingRef.current = true;
      setStudents(
        loadStorage(`lords_students_${activePrincipalId}`, mockStudents),
      );
      setNotifications(
        loadStorage(
          `lords_notifications_${activePrincipalId}`,
          mockNotifications,
        ),
      );
      setSyllabus(loadSyllabus(activePrincipalId));
      // Allow save effects to run after load settles
      setTimeout(() => {
        loadingRef.current = false;
      }, 0);
    }
  }, [activePrincipalId]);

  useEffect(() => {
    if (savedPrincipalIdRef.current && !loadingRef.current)
      saveStorage(`lords_students_${savedPrincipalIdRef.current}`, students);
  }, [students]);
  useEffect(() => {
    if (savedPrincipalIdRef.current && !loadingRef.current)
      saveStorage(
        `lords_notifications_${savedPrincipalIdRef.current}`,
        notifications,
      );
  }, [notifications]);
  useEffect(() => {
    if (savedPrincipalIdRef.current && !loadingRef.current)
      saveStorage(`lords_syllabus_${savedPrincipalIdRef.current}`, syllabus);
  }, [syllabus]);

  const [principalPage, setPrincipalPage] = useState<PrincipalPage>("list");
  const [prefilledClass, setPrefilledClass] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const handleUpdateStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteStudent = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setPrincipalPage("list");
    setSelectedStudentId(null);
  };

  const handleAddStudent = (newStudent: Omit<Student, "id">) => {
    setStudents((prev) => [...prev, { ...newStudent, id: Date.now() }]);
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
    if (r === "principal" && principalId) {
      setActivePrincipalId(principalId);
    }
    if (studentId !== undefined) setParentStudentId(studentId);
    if (principalId && r === "parent") setParentPrincipalId(principalId);
  };

  const handleRankStudents = (ranked: Student[]) => {
    setStudents(ranked);
  };

  const activePrincipalName =
    PRINCIPALS.find((p) => p.id === activePrincipalId)?.name ?? "Principal";

  if (!role) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (role === "parent") {
    // Use live data if available, otherwise fallback
    let parentStudent: Student | undefined = liveParentStudent ?? undefined;
    if (!parentStudent && parentStudentId !== null) {
      if (parentPrincipalId) {
        const principalStudents = loadStorage(
          `lords_students_${parentPrincipalId}`,
          mockStudents,
        );
        parentStudent = principalStudents.find(
          (s: Student) => s.id === parentStudentId,
        );
      }
      if (!parentStudent) {
        parentStudent = students.find((s) => s.id === parentStudentId);
      }
    }
    if (!parentStudent) parentStudent = mockStudents[0];

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

    return (
      <>
        <ParentLayout
          studentName={parentStudent.name}
          onLogout={() => {
            setRole(null);
            setParentStudentId(null);
            setParentPrincipalId(null);
            setLiveParentStudent(null);
            setLiveParentNotifications([]);
            setLiveParentSyllabus({});
          }}
        >
          <ParentView
            student={parentStudent}
            notifications={parentNotifications}
            syllabus={parentSyllabus}
            principalId={parentPrincipalId ?? "default"}
          />
        </ParentLayout>
        <Toaster />
      </>
    );
  }

  if (role === "principal") {
    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    const allNavLabels: Record<string, string> = {
      list: "All Students",
      add: "Add Student",
      info: "Edit School Info",
      holidays: "Manage Holidays",
      "school-syllabus": "Manage Syllabus",
      announcements: "Announcements",
      "doubt-chat": "Doubt Chat",
      "class-view": "Class View",
      diary: "Diary",
      "exam-timetable": "Exam Timetable",
      "test-marks": "Test Marks",
      "send-message": "Send Message to Parents",
      "error-fix": "Error Fix & Diagnostics",
      storage: "Storage & Backup",
      edit: "Edit Student",
    };

    return (
      <>
        <PrincipalLayout
          currentPage={principalPage}
          onPageChange={handlePrincipalPageChange}
          onLogout={() => {
            setRole(null);
            setActivePrincipalId(null);
            setPrincipalPage("list");
          }}
          pageLabel={allNavLabels[principalPage] ?? "Student Management"}
          principalName={activePrincipalName}
        >
          {principalPage === "list" && (
            <PrincipalDashboard
              students={students}
              onEditStudent={handleEditStudent}
              onNavigateToAdd={() => setPrincipalPage("add")}
              onRankStudents={handleRankStudents}
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
                setPrincipalPage("list");
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
          {principalPage === "error-fix" && (
            <PrincipalErrorFixPage
              principalId={activePrincipalId ?? "default"}
            />
          )}
          {principalPage === "storage" && (
            <PrincipalStoragePage
              principalId={activePrincipalId ?? "default"}
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
        </PrincipalLayout>
        <Toaster />
      </>
    );
  }
}
