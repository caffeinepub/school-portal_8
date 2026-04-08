// Shared TypeScript types matching backend contracts and frontend session state

export type PortalRole =
  | "principal"
  | "teacher"
  | "student"
  | "driver"
  | "mainController";

export interface SessionState {
  role: PortalRole | null;
  schoolId: bigint | null;
  userId: bigint | null;
  name: string;
  principalId: string | null;
  // Legacy student portal fields
  parentStudentId: number | null;
  parentPrincipalId: string | null;
}

export interface School {
  id: string; // e.g. "p1"
  numericId: bigint; // ICP SchoolId
  name: string;
  shortName: string;
  location: string;
  password: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface TeacherSession {
  schoolId: bigint;
  teacherId: bigint;
  name: string;
  email: string;
  password: string;
}

export interface DriverSession {
  schoolId: bigint;
  driverId: bigint;
  name: string;
  vehicleNo: string;
  password: string;
}

export interface StudentSession {
  schoolId: bigint;
  studentId: bigint;
  name: string;
  class: string;
  password: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface CustomPanelDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdAt?: string;
  visibleToParents?: boolean;
}
