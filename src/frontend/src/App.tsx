import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import ParentLayout from "./components/ParentLayout";
import PrincipalLayout from "./components/PrincipalLayout";
import {
  notifications as mockNotifications,
  students as mockStudents,
  syllabus as mockSyllabus,
} from "./data/mockData";
import type { Student } from "./data/mockData";
import { PRINCIPALS } from "./data/principals";
import AbsentRecord from "./pages/AbsentRecord";
import AddStudentPage from "./pages/AddStudentPage";
import Dashboard from "./pages/Dashboard";
import ExaminationMarks from "./pages/ExaminationMarks";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import OnlineClasses from "./pages/OnlineClasses";
import ParentView from "./pages/ParentView";
import PrincipalAnnouncementsPage from "./pages/PrincipalAnnouncementsPage";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import PrincipalDoubtChat from "./pages/PrincipalDoubtChat";
import PrincipalHolidaysPage from "./pages/PrincipalHolidaysPage";
import PrincipalSchoolInfoEditor from "./pages/PrincipalSchoolInfoEditor";
import PrincipalSyllabusPage from "./pages/PrincipalSyllabusPage";
import Profile from "./pages/Profile";
import SchoolFees from "./pages/SchoolFees";
import SchoolInfo from "./pages/SchoolInfo";
import SchoolRecords from "./pages/SchoolRecords";
import StudentDoubts from "./pages/StudentDoubts";
import StudentEditPage from "./pages/StudentEditPage";
import StudentMedia from "./pages/StudentMedia";
import Syllabus from "./pages/Syllabus";
import TeacherChat from "./pages/TeacherChat";

type Role = "student" | "principal" | "parent" | null;
type PrincipalPage =
  | "list"
  | "edit"
  | "add"
  | "info"
  | "holidays"
  | "school-syllabus"
  | "announcements"
  | "doubt-chat";

export type Notification = (typeof mockNotifications)[number];
export type SyllabusSubject = (typeof mockSyllabus)[number];

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

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [page, setPage] = useState("dashboard");
  const [activePrincipalId, setActivePrincipalId] = useState<string | null>(
    null,
  );
  const [parentPrincipalId, setParentPrincipalId] = useState<string | null>(
    null,
  );

  // Derive namespace keys
  const ns = activePrincipalId ?? "default";

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage(`lords_students_${ns}`, mockStudents),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadStorage(`lords_notifications_${ns}`, mockNotifications),
  );
  const [syllabus, setSyllabus] = useState<SyllabusSubject[]>(() =>
    loadStorage(`lords_syllabus_${ns}`, mockSyllabus),
  );

  // When principal changes, reload their data
  useEffect(() => {
    if (activePrincipalId) {
      setStudents(
        loadStorage(`lords_students_${activePrincipalId}`, mockStudents),
      );
      setNotifications(
        loadStorage(
          `lords_notifications_${activePrincipalId}`,
          mockNotifications,
        ),
      );
      setSyllabus(
        loadStorage(`lords_syllabus_${activePrincipalId}`, mockSyllabus),
      );
    }
  }, [activePrincipalId]);

  useEffect(() => {
    if (activePrincipalId)
      saveStorage(`lords_students_${activePrincipalId}`, students);
  }, [students, activePrincipalId]);
  useEffect(() => {
    if (activePrincipalId)
      saveStorage(`lords_notifications_${activePrincipalId}`, notifications);
  }, [notifications, activePrincipalId]);
  useEffect(() => {
    if (activePrincipalId)
      saveStorage(`lords_syllabus_${activePrincipalId}`, syllabus);
  }, [syllabus, activePrincipalId]);

  const [principalPage, setPrincipalPage] = useState<PrincipalPage>("list");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [parentStudentId, setParentStudentId] = useState<number | null>(null);

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

  const activePrincipalName =
    PRINCIPALS.find((p) => p.id === activePrincipalId)?.name ?? "Principal";

  if (!role) {
    return (
      <>
        <Login onLogin={handleLogin} students={students} />
        <Toaster />
      </>
    );
  }

  if (role === "parent") {
    // Find student across parent's principal data (or fallback)
    let parentStudent = students.find((s) => s.id === parentStudentId);
    if (!parentStudent && parentPrincipalId) {
      const principalStudents = loadStorage(
        `lords_students_${parentPrincipalId}`,
        mockStudents,
      );
      parentStudent = principalStudents.find((s) => s.id === parentStudentId);
    }
    if (!parentStudent) parentStudent = mockStudents[0];

    const parentNotifications = parentPrincipalId
      ? loadStorage(
          `lords_notifications_${parentPrincipalId}`,
          mockNotifications,
        )
      : notifications;
    const parentSyllabus = parentPrincipalId
      ? loadStorage(`lords_syllabus_${parentPrincipalId}`, mockSyllabus)
      : syllabus;

    return (
      <>
        <ParentLayout
          studentName={parentStudent.name}
          onLogout={() => {
            setRole(null);
            setParentStudentId(null);
            setParentPrincipalId(null);
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
            />
          )}
          {principalPage === "edit" && selectedStudent && (
            <StudentEditPage
              student={selectedStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBack={() => setPrincipalPage("list")}
            />
          )}
          {principalPage === "add" && (
            <AddStudentPage
              onAddStudent={handleAddStudent}
              onBulkAddStudents={handleBulkAddStudents}
              onBack={() => setPrincipalPage("list")}
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
        </PrincipalLayout>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout
        currentPage={page}
        onPageChange={setPage}
        onLogout={() => setRole(null)}
      >
        {page === "dashboard" && <Dashboard />}
        {page === "profile" && <Profile />}
        {page === "marks" && <ExaminationMarks />}
        {page === "records" && <SchoolRecords />}
        {page === "syllabus" && <Syllabus syllabus={syllabus} />}
        {page === "fees" && <SchoolFees />}
        {page === "attendance" && <AbsentRecord />}
        {page === "classes" && <OnlineClasses />}
        {page === "doubts" && <StudentDoubts />}
        {page === "chat" && <TeacherChat />}
        {page === "info" && <SchoolInfo />}
        {page === "notifications" && (
          <Notifications notifications={notifications} />
        )}
        {page === "media" && <StudentMedia />}
      </Layout>
      <Toaster />
    </>
  );
}
