import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentPublic {
    id: UserId;
    class: string;
    name: string;
    section: string;
    schoolId: SchoolId;
    profilePictureUrl?: string;
    rollNo: bigint;
    parentMobile: string;
}
export type Timestamp = bigint;
export interface ParentMessage {
    id: bigint;
    studentId: UserId;
    read: boolean;
    schoolId: SchoolId;
    message: string;
    teacherId: UserId;
    timestamp: Timestamp;
}
export interface DigitalResource {
    id: bigint;
    url: string;
    title: string;
    subject: string;
    class: string;
    createdAt: Timestamp;
    type: Variant_pdf_video_note;
    schoolId: SchoolId;
    uploadedBy: UserId;
}
export interface DiaryEntry {
    id: bigint;
    content: string;
    date: string;
    class: string;
    createdAt: Timestamp;
    section: string;
    schoolId: SchoolId;
    teacherId: UserId;
}
export interface ExamMark {
    id: bigint;
    studentId: UserId;
    subject: string;
    date: string;
    schoolId: SchoolId;
    teacherId: UserId;
    maxMarks: bigint;
    obtainedMarks: bigint;
    examName: string;
}
export interface Period {
    day: string;
    subject: string;
    teacherName: string;
    timeSlot: string;
}
export interface FeeRecord {
    id: bigint;
    status: FeeStatus;
    studentId: UserId;
    dueDate: string;
    description: string;
    paidDate?: string;
    schoolId: SchoolId;
    amount: bigint;
}
export interface LessonPlan {
    id: bigint;
    content: string;
    subject: string;
    class: string;
    section: string;
    schoolId: SchoolId;
    teacherId: UserId;
    weekOf: string;
}
export interface Notice {
    id: bigint;
    title: string;
    createdAt: Timestamp;
    createdBy: UserId;
    schoolId: SchoolId;
    message: string;
    targetPortals: Array<TargetPortal>;
    priority: Variant_low_high_medium;
}
export interface BusLocation {
    latitude: number;
    driverId: UserId;
    schoolId: SchoolId;
    longitude: number;
    timestamp: Timestamp;
}
export interface Assignment {
    id: bigint;
    attachmentUrl?: string;
    title: string;
    subject: string;
    class: string;
    createdAt: Timestamp;
    dueDate: string;
    section: string;
    description: string;
    schoolId: SchoolId;
    teacherId: UserId;
}
export interface AttendanceRecord {
    id: bigint;
    status: AttendanceStatus;
    studentId: UserId;
    date: string;
    note: string;
    markedByTeacherId: UserId;
    schoolId: SchoolId;
}
export interface Submission {
    id: bigint;
    attachmentUrl?: string;
    status: SubmissionStatus;
    content: string;
    studentId: UserId;
    submittedAt: Timestamp;
    schoolId: SchoolId;
    assignmentId: bigint;
}
export interface Syllabus {
    id: bigint;
    content: string;
    subject: string;
    class: string;
    updatedAt: Timestamp;
    schoolId: SchoolId;
    teacherId: UserId;
}
export interface TeacherPublic {
    id: UserId;
    subjects: Array<string>;
    name: string;
    assignedClass: string;
    email: string;
    schoolId: SchoolId;
}
export interface ExamTimetable {
    id: bigint;
    subjects: Array<ExamSlot>;
    class: string;
    createdAt: Timestamp;
    section: string;
    schoolId: SchoolId;
    examName: string;
}
export interface ExamSlot {
    startTime: string;
    subject: string;
    endTime: string;
    date: string;
}
export interface EmergencyAlert {
    id: bigint;
    driverId: UserId;
    resolved: boolean;
    schoolId: SchoolId;
    message: string;
    timestamp: Timestamp;
    location: string;
}
export interface TransportRoute {
    id: bigint;
    stops: Array<RouteStop>;
    schoolId: SchoolId;
    driverName: string;
    vehicleNo: string;
}
export interface PickupLog {
    id: bigint;
    driverId: UserId;
    action: PickupAction;
    studentId: UserId;
    schoolId: SchoolId;
    timestamp: Timestamp;
}
export interface Timetable {
    id: bigint;
    class: string;
    section: string;
    periods: Array<Period>;
    schoolId: SchoolId;
}
export interface MaintenanceLog {
    id: bigint;
    driverId: UserId;
    cost: bigint;
    date: string;
    type: MaintenanceType;
    schoolId: SchoolId;
    notes: string;
    vehicleNo: string;
}
export type UserId = bigint;
export interface DriverPublic {
    id: UserId;
    name: string;
    schoolId: SchoolId;
    route: string;
    vehicleNo: string;
}
export interface RouteStop {
    name: string;
    studentIds: Array<UserId>;
}
export type SchoolId = bigint;
export interface Inquiry {
    id: bigint;
    status: Variant_new_closed_inProgress;
    studentName: string;
    class: string;
    createdAt: Timestamp;
    email: string;
    schoolId: SchoolId;
    notes: string;
    phone: string;
    parentName: string;
}
export interface SchoolConfig {
    subjects: Array<string>;
    classes: Array<string>;
    schoolId: SchoolId;
    sections: Array<string>;
    schoolName: string;
}
export enum AttendanceStatus {
    present = "present",
    late = "late",
    absent = "absent"
}
export enum FeeStatus {
    paid = "paid",
    unpaid = "unpaid",
    partial = "partial"
}
export enum MaintenanceType {
    service = "service",
    fuel = "fuel"
}
export enum PickupAction {
    drop = "drop",
    pickup = "pickup"
}
export enum SubmissionStatus {
    graded = "graded",
    submitted = "submitted",
    pending = "pending"
}
export enum TargetPortal {
    principal = "principal",
    teacher = "teacher",
    student = "student",
    driver = "driver"
}
export enum Variant_low_high_medium {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Variant_new_closed_inProgress {
    new_ = "new",
    closed = "closed",
    inProgress = "inProgress"
}
export enum Variant_pdf_video_note {
    pdf = "pdf",
    video = "video",
    note = "note"
}
export interface backendInterface {
    addDigitalResource(schoolId: SchoolId, callerPassword: string, title: string, type: Variant_pdf_video_note, url: string, class: string, subject: string, uploadedBy: UserId): Promise<bigint>;
    addDriver(schoolId: SchoolId, callerPassword: string, name: string, password: string, vehicleNo: string, route: string): Promise<UserId>;
    addFeeRecord(schoolId: SchoolId, callerPassword: string, studentId: UserId, amount: bigint, dueDate: string, description: string): Promise<bigint>;
    addMaintenanceLog(schoolId: SchoolId, callerPassword: string, vehicleNo: string, type: MaintenanceType, date: string, cost: bigint, notes: string, driverId: UserId): Promise<bigint>;
    addMark(schoolId: SchoolId, callerPassword: string, studentId: UserId, examName: string, subject: string, maxMarks: bigint, obtainedMarks: bigint, teacherId: UserId, date: string): Promise<bigint>;
    addStudent(schoolId: SchoolId, callerPassword: string, name: string, class: string, section: string, rollNo: bigint, parentMobile: string): Promise<UserId>;
    addTeacher(schoolId: SchoolId, callerPassword: string, name: string, email: string, password: string, assignedClass: string, subjects: Array<string>): Promise<UserId>;
    autoGenerateStudentPasswords(schoolId: SchoolId, callerPassword: string): Promise<Array<[UserId, string]>>;
    changeMainControllerPassword(oldPassword: string, newPassword: string): Promise<boolean>;
    createAssignment(schoolId: SchoolId, callerPassword: string, class: string, section: string, subject: string, title: string, description: string, dueDate: string, teacherId: UserId, attachmentUrl: string | null): Promise<bigint>;
    createDiaryEntry(schoolId: SchoolId, callerPassword: string, class: string, section: string, date: string, content: string, teacherId: UserId): Promise<bigint>;
    createEmergencyAlert(schoolId: SchoolId, driverPassword: string, driverId: UserId, message: string, location: string): Promise<bigint>;
    createExamTimetable(schoolId: SchoolId, callerPassword: string, class: string, section: string, examName: string, subjects: Array<ExamSlot>): Promise<bigint>;
    createInquiry(schoolId: SchoolId, studentName: string, parentName: string, phone: string, email: string, class: string): Promise<bigint>;
    createLessonPlan(schoolId: SchoolId, callerPassword: string, class: string, section: string, subject: string, weekOf: string, content: string, teacherId: UserId): Promise<bigint>;
    createNotice(schoolId: SchoolId, callerPassword: string, title: string, message: string, targetPortals: Array<TargetPortal>, priority: Variant_low_high_medium, createdBy: UserId): Promise<bigint>;
    createRoute(schoolId: SchoolId, callerPassword: string, driverName: string, vehicleNo: string, stops: Array<RouteStop>): Promise<bigint>;
    deleteAssignment(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteDiaryEntry(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteDigitalResource(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteDriver(schoolId: SchoolId, callerPassword: string, id: UserId): Promise<boolean>;
    deleteExamTimetable(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteFeeRecord(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteLessonPlan(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteMark(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteNotice(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteRoute(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    deleteStudent(schoolId: SchoolId, callerPassword: string, id: UserId): Promise<boolean>;
    deleteTeacher(schoolId: SchoolId, callerPassword: string, id: UserId): Promise<boolean>;
    exportAllData(password: string): Promise<string>;
    getAllBusLocations(schoolId: SchoolId): Promise<Array<BusLocation>>;
    getAllFees(schoolId: SchoolId): Promise<Array<FeeRecord>>;
    getAssignmentsByClass(schoolId: SchoolId, class: string): Promise<Array<Assignment>>;
    getAttendanceByClass(schoolId: SchoolId, class: string, date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(schoolId: SchoolId, studentId: UserId): Promise<Array<AttendanceRecord>>;
    getBusLocation(schoolId: SchoolId, driverId: UserId): Promise<BusLocation | null>;
    getDiaryByClass(schoolId: SchoolId, class: string): Promise<Array<DiaryEntry>>;
    getDigitalResourcesByClass(schoolId: SchoolId, class: string): Promise<Array<DigitalResource>>;
    getDriver(schoolId: SchoolId, id: UserId): Promise<DriverPublic | null>;
    getExamTimetablesByClass(schoolId: SchoolId, class: string): Promise<Array<ExamTimetable>>;
    getFeesByStudent(schoolId: SchoolId, studentId: UserId): Promise<Array<FeeRecord>>;
    getLessonPlansByClass(schoolId: SchoolId, class: string): Promise<Array<LessonPlan>>;
    getMaintenanceLogs(schoolId: SchoolId, vehicleNo: string): Promise<Array<MaintenanceLog>>;
    getMarksByExam(schoolId: SchoolId, examName: string): Promise<Array<ExamMark>>;
    getMarksByStudent(schoolId: SchoolId, studentId: UserId): Promise<Array<ExamMark>>;
    getParentMessagesByStudent(schoolId: SchoolId, studentId: UserId): Promise<Array<ParentMessage>>;
    getPendingFees(schoolId: SchoolId): Promise<Array<FeeRecord>>;
    getPickupLogsByDriver(schoolId: SchoolId, driverId: UserId): Promise<Array<PickupLog>>;
    getRoute(schoolId: SchoolId, id: bigint): Promise<TransportRoute | null>;
    getSchoolConfig(schoolId: SchoolId): Promise<SchoolConfig | null>;
    getStudent(schoolId: SchoolId, id: UserId): Promise<StudentPublic | null>;
    getStudentRank(schoolId: SchoolId, studentId: UserId, examName: string): Promise<bigint>;
    getSubmissionsByAssignment(schoolId: SchoolId, assignmentId: bigint): Promise<Array<Submission>>;
    getSubmissionsByStudent(schoolId: SchoolId, studentId: UserId): Promise<Array<Submission>>;
    getSyllabusByClass(schoolId: SchoolId, class: string): Promise<Array<Syllabus>>;
    getTeacher(schoolId: SchoolId, id: UserId): Promise<TeacherPublic | null>;
    getTimetable(schoolId: SchoolId, class: string, section: string): Promise<Timetable | null>;
    getTotalRevenue(schoolId: SchoolId): Promise<bigint>;
    listDrivers(schoolId: SchoolId): Promise<Array<DriverPublic>>;
    listEmergencyAlerts(schoolId: SchoolId): Promise<Array<EmergencyAlert>>;
    listInquiries(schoolId: SchoolId): Promise<Array<Inquiry>>;
    listNotices(schoolId: SchoolId): Promise<Array<Notice>>;
    listRoutes(schoolId: SchoolId): Promise<Array<TransportRoute>>;
    listStudents(schoolId: SchoolId): Promise<Array<StudentPublic>>;
    listStudentsByClass(schoolId: SchoolId, class: string): Promise<Array<StudentPublic>>;
    listTeachers(schoolId: SchoolId): Promise<Array<TeacherPublic>>;
    logPickup(schoolId: SchoolId, driverPassword: string, driverId: UserId, studentId: UserId, action: PickupAction): Promise<bigint>;
    loginDriver(driverId: UserId, password: string, schoolId: SchoolId): Promise<boolean>;
    loginMainController(password: string): Promise<boolean>;
    loginPrincipal(schoolId: SchoolId, password: string): Promise<boolean>;
    loginStudent(studentId: UserId, password: string, schoolId: SchoolId): Promise<boolean>;
    loginTeacher(email: string, password: string, schoolId: SchoolId): Promise<boolean>;
    markAttendance(schoolId: SchoolId, callerPassword: string, studentId: UserId, date: string, status: AttendanceStatus, teacherId: UserId, note: string): Promise<bigint>;
    markFeePaid(schoolId: SchoolId, callerPassword: string, id: bigint, paidDate: string): Promise<boolean>;
    markParentMessageRead(schoolId: SchoolId, id: bigint): Promise<boolean>;
    resetDriverPassword(schoolId: SchoolId, callerPassword: string, driverId: UserId, newPassword: string): Promise<boolean>;
    resetTeacherPassword(schoolId: SchoolId, callerPassword: string, teacherId: UserId, newPassword: string): Promise<boolean>;
    resolveEmergencyAlert(schoolId: SchoolId, callerPassword: string, id: bigint): Promise<boolean>;
    sendParentMessage(schoolId: SchoolId, callerPassword: string, teacherId: UserId, studentId: UserId, message: string): Promise<bigint>;
    setPrincipalPassword(schoolId: SchoolId, oldPassword: string, newPassword: string): Promise<boolean>;
    setSchoolConfig(callerPassword: string, config: SchoolConfig): Promise<boolean>;
    setStudentPassword(schoolId: SchoolId, callerPassword: string, studentId: UserId, newPassword: string): Promise<boolean>;
    setSyllabus(schoolId: SchoolId, callerPassword: string, class: string, subject: string, content: string, teacherId: UserId): Promise<bigint>;
    setTimetable(schoolId: SchoolId, callerPassword: string, class: string, section: string, periods: Array<Period>): Promise<bigint>;
    submitAssignment(schoolId: SchoolId, studentPassword: string, assignmentId: bigint, studentId: UserId, content: string, attachmentUrl: string | null): Promise<bigint>;
    updateBusLocation(schoolId: SchoolId, driverPassword: string, driverId: UserId, latitude: number, longitude: number): Promise<boolean>;
    updateDriver(schoolId: SchoolId, callerPassword: string, driver: DriverPublic): Promise<boolean>;
    updateExamTimetable(schoolId: SchoolId, callerPassword: string, timetable: ExamTimetable): Promise<boolean>;
    updateFeeRecord(schoolId: SchoolId, callerPassword: string, record: FeeRecord): Promise<boolean>;
    updateInquiryStatus(schoolId: SchoolId, callerPassword: string, id: bigint, status: Variant_new_closed_inProgress, notes: string): Promise<boolean>;
    updateLessonPlan(schoolId: SchoolId, callerPassword: string, plan: LessonPlan): Promise<boolean>;
    updateMark(schoolId: SchoolId, callerPassword: string, mark: ExamMark): Promise<boolean>;
    updateRoute(schoolId: SchoolId, callerPassword: string, route: TransportRoute): Promise<boolean>;
    updateStudent(schoolId: SchoolId, callerPassword: string, student: StudentPublic): Promise<boolean>;
    updateTeacher(schoolId: SchoolId, callerPassword: string, teacher: TeacherPublic): Promise<boolean>;
}
