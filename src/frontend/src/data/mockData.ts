export interface StudentMark {
  subject: string;
  pt1: number;
  pt2: number;
  pt3: number;
  term1: number;
  term2: number;
  max: number;
}

export interface StudentFee {
  id: number;
  type: string;
  amount: number;
  paid: number;
  dueDate: string;
  paidDate: string;
  status: string;
}

export interface StudentAttendance {
  date: string;
  day: string;
  status: string;
}

export interface Student {
  id: number;
  name: string;
  class: string;
  rollNo: number;
  dob: string;
  address: string;
  phone: string;
  email: string;
  parentName: string;
  parentPhone: string;
  bloodGroup: string;
  admissionYear: string;
  marks: StudentMark[];
  fees: StudentFee[];
  attendance: StudentAttendance[];
  rank: number;
  password?: string;
  parentPassword?: string;
  profilePicture?: string;
}

// No demo/example students — all student lists start empty
export const students: Student[] = [];

export const notifications = [
  {
    id: 1,
    type: "Announcement",
    title: "Welcome to Lord's International School Group Portal",
    message:
      "This portal provides real-time updates on attendance, marks, fees, diary, and school announcements. Parents are encouraged to check regularly.",
    date: "2026-03-01",
    time: "09:00 AM",
    priority: "high",
    read: false,
  },
  {
    id: 2,
    type: "Holiday",
    title: "Summer Vacation Schedule",
    message:
      "School will remain closed from May 15 to June 15, 2026 for summer vacation. New session starts June 16.",
    date: "2026-04-01",
    time: "10:00 AM",
    priority: "medium",
    read: false,
  },
  {
    id: 3,
    type: "Announcement",
    title: "Annual Sports Day — April 20, 2026",
    message:
      "Annual Sports Day will be held on April 20, 2026. All students must wear sports uniforms. Parents are welcome to attend.",
    date: "2026-04-05",
    time: "11:00 AM",
    priority: "medium",
    read: false,
  },
];

export type SyllabusSubject = {
  subject: string;
  chapters: { name: string; status: string }[];
};
export type ClassSyllabus = Record<string, SyllabusSubject[]>;

export const syllabus: ClassSyllabus = {};

// ---- Legacy exports (used by older pages, kept for TypeScript compatibility) ----

export const attendance: StudentAttendance[] = [];
export const fees: StudentFee[] = [];
export const marks: StudentMark[] = [];

export function getCurrentStudent(): Student | undefined {
  return undefined;
}

export const schoolRecords: Array<{
  id: number;
  type: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}> = [];

export const doubts: Array<{
  id: number;
  subject: string;
  question: string;
  answer: string;
  status: string;
  date: string;
  teacher: string;
}> = [];

export const teachers: Array<{
  id: number;
  name: string;
  subject: string;
  avatar: string;
}> = [];

export const chatMessages: Array<{
  id: number;
  teacherId: number;
  sender: string;
  message: string;
  time: string;
  isTeacher: boolean;
}> = [];

export const onlineClasses: Array<{
  id: number;
  subject: string;
  teacher: string;
  date: string;
  time: string;
  duration: string;
  link: string;
  status: string;
}> = [];
