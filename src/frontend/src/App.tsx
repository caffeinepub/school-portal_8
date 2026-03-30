import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import ParentLayout from "./components/ParentLayout";
import PrincipalLayout from "./components/PrincipalLayout";
import {
  notifications as mockNotifications,
  syllabus as mockSyllabus,
} from "./data/mockData";
import type { Student } from "./data/mockData";
import { PRINCIPALS } from "./data/principals";
import { useActor } from "./hooks/useActor";
import AddStudentPage from "./pages/AddStudentPage";
import Login from "./pages/Login";
import ParentView from "./pages/ParentView";
import PrincipalAnnouncementsPage from "./pages/PrincipalAnnouncementsPage";
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
  | "server";

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
 */
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
    if (!(cls in result)) {
      result[cls] = [];
    }
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

  // Persist session whenever role/ids change
  useEffect(() => {
    const session: SessionData = {
      role,
      activePrincipalId,
      parentStudentId,
      parentPrincipalId,
    };
    saveStorage("lords_session", session);
  }, [role, activePrincipalId, parentStudentId, parentPrincipalId]);

  // Derive namespace keys
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
  // Track which principals we've attempted to load from ICP (to avoid re-loading)
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

  // ICP backend load: when actor becomes ready and principal is logged in,
  // try to load data from ICP and use it if found (runs once per principal session).
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
            // Ensure all default classes are present
            for (const cls of DEFAULT_CLASSES) {
              if (!(cls in parsed)) parsed[cls] = [];
            }
            saveStorage(`lords_syllabus_${pid}`, parsed);
            setSyllabus(parsed);
          }
        }
      } catch {
        // silently ignore — localStorage remains the source
      }
    };

    loadFromICP();
  }, [actor, activePrincipalId]);

  // Save effects: write to localStorage AND sync to ICP backend (fire-and-forget)
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
      if (!parentStudent) {
        parentStudent = students.find((s) => s.id === parentStudentId);
      }
    }
    if (!parentStudent) {
      return (
        <>
          <ParentLayout
            studentName="Unknown"
            onLogout={() => {
              setRole(null);
              setParentStudentId(null);
              setParentPrincipalId(null);
              setLiveParentStudent(null);
              setLiveParentNotifications([]);
              setLiveParentSyllabus({});
              saveStorage("lords_session", {
                role: null,
                activePrincipalId: null,
                parentStudentId: null,
                parentPrincipalId: null,
              });
            }}
          >
            <div className="p-8 text-center text-gray-500">
              Student not found. Please log in again.
            </div>
          </ParentLayout>
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
            saveStorage("lords_session", {
              role: null,
              activePrincipalId: null,
              parentStudentId: null,
              parentPrincipalId: null,
            });
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
      server: "Server",
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
            saveStorage("lords_session", {
              role: null,
              activePrincipalId: null,
              parentStudentId: null,
              parentPrincipalId: null,
            });
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
        </PrincipalLayout>
        <Toaster />
      </>
    );
  }
}
