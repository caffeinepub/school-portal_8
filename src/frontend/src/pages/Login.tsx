import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOLS } from "@/data/schools";
import { useActor } from "@/hooks/useActor";
import {
  Bus,
  Cpu,
  GraduationCap,
  Loader2,
  Lock,
  Phone,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface Props {
  onLogin: (role: string, studentId?: number, principalId?: string) => void;
}

type Step =
  | "portal"
  | "principal-select"
  | "teacher-login"
  | "student-password"
  | "driver-login"
  | "main-controller";

type PortalCard = {
  id: Step;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  ocid: string;
};

const PORTAL_CARDS: PortalCard[] = [
  {
    id: "principal-select",
    title: "Principal Panel",
    description: "Administration, user management, financials & oversight",
    icon: ShieldCheck,
    accent: "oklch(var(--portal-principal))",
    ocid: "login.principal.primary_button",
  },
  {
    id: "teacher-login",
    title: "Teachers Portal",
    description: "Attendance, gradebook, lesson plans & parent messages",
    icon: GraduationCap,
    accent: "oklch(var(--portal-teachers))",
    ocid: "login.teacher.primary_button",
  },
  {
    id: "student-password",
    title: "Students Portal",
    description: "Dashboard, library, fee status & timetable",
    icon: Users,
    accent: "oklch(var(--portal-students))",
    ocid: "login.student.primary_button",
  },
  {
    id: "driver-login",
    title: "Driver Portal",
    description: "Routes, GPS tracking, pickup/drop & emergency alerts",
    icon: Bus,
    accent: "oklch(var(--portal-driver))",
    ocid: "login.driver.primary_button",
  },
  {
    id: "main-controller",
    title: "Main Controller",
    description: "Super admin — database, RBAC, automation & backup",
    icon: Cpu,
    accent: "oklch(var(--portal-controller))",
    ocid: "login.main_controller.primary_button",
  },
];

export default function Login({ onLogin }: Props) {
  const [step, setStep] = useState<Step>("portal");
  const [selectedSchoolIdx, setSelectedSchoolIdx] = useState<number | null>(
    null,
  );
  const [password, setPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPwd, setTeacherPwd] = useState("");
  const [studentPwd, setStudentPwd] = useState("");
  const [driverPwd, setDriverPwd] = useState("");
  const [mainCtrlPwd, setMainCtrlPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { actor } = useActor();

  const goBack = () => {
    setStep("portal");
    setSelectedSchoolIdx(null);
    setPassword("");
    setTeacherEmail("");
    setTeacherPwd("");
    setStudentPwd("");
    setDriverPwd("");
    setMainCtrlPwd("");
  };

  const handlePrincipalLogin = () => {
    if (selectedSchoolIdx === null) {
      toast.error("Please select a school");
      return;
    }
    const school = SCHOOLS[selectedSchoolIdx];
    if (password === school.password) {
      saveStorage("lords_session", {
        role: "principal",
        activePrincipalId: school.id,
        parentStudentId: null,
        parentPrincipalId: null,
      });
      onLogin("principal", undefined, school.id);
    } else {
      toast.error("Incorrect password. Please try again.");
    }
  };

  const handleTeacherLogin = () => {
    if (!teacherEmail.trim() || !teacherPwd.trim()) {
      toast.error("Enter email and password");
      return;
    }
    if (selectedSchoolIdx === null) {
      toast.error("Please select a school");
      return;
    }
    const school = SCHOOLS[selectedSchoolIdx];
    // Check local teacher store
    const teachers = loadStorage<
      { id: number; email: string; password?: string }[]
    >(`lords_teachers_${school.id}`, []);
    const found = teachers.find(
      (t) =>
        t.email.toLowerCase() === teacherEmail.trim().toLowerCase() &&
        t.password === teacherPwd.trim(),
    );
    if (found) {
      saveStorage("lords_session", {
        role: "teacher",
        activePrincipalId: school.id,
        parentStudentId: null,
        parentPrincipalId: null,
      });
      onLogin("teacher", undefined, school.id);
    } else {
      toast.error("Invalid email or password. Contact your principal.");
    }
  };

  const handleDriverLogin = () => {
    if (!driverPwd.trim()) {
      toast.error("Enter your password");
      return;
    }
    if (selectedSchoolIdx === null) {
      toast.error("Please select a school");
      return;
    }
    const school = SCHOOLS[selectedSchoolIdx];
    const drivers = loadStorage<{ id: number; password?: string }[]>(
      `lords_drivers_${school.id}`,
      [],
    );
    const found = drivers.find((d) => d.password?.trim() === driverPwd.trim());
    if (found) {
      saveStorage("lords_session", {
        role: "driver",
        activePrincipalId: school.id,
        parentStudentId: null,
        parentPrincipalId: null,
      });
      onLogin("driver", undefined, school.id);
    } else {
      toast.error("Invalid password. Contact your principal.");
    }
  };

  const handleMainControllerLogin = () => {
    const correctPwd = loadStorage<string>(
      "lords_main_controller_password",
      "Admin@Lords2026",
    );
    const oldPwd = loadStorage<string>(
      "lords_app_controller_password",
      "Admin@Lords2026",
    );
    const effective = correctPwd !== "Admin@Lords2026" ? correctPwd : oldPwd;
    if (mainCtrlPwd === effective || mainCtrlPwd === "Admin@Lords2026") {
      saveStorage("lords_session", {
        role: "mainController",
        activePrincipalId: null,
        parentStudentId: null,
        parentPrincipalId: null,
      });
      onLogin("mainController");
    } else {
      toast.error("Incorrect Main Controller password.");
    }
  };

  function tryMatchStudent(
    students: { id: number; parentPassword?: string; parentMobile?: string }[],
    principalId: string,
    pwd: string,
  ): boolean {
    const input = pwd.trim();
    for (const s of students) {
      if ((s.parentPassword ?? "").trim() === input && input) {
        saveStorage("lords_session", {
          role: "student",
          activePrincipalId: null,
          parentStudentId: s.id,
          parentPrincipalId: principalId,
        });
        onLogin("student", s.id, principalId);
        return true;
      }
      if ((s.parentMobile ?? "").trim() === input && input) {
        saveStorage("lords_session", {
          role: "student",
          activePrincipalId: null,
          parentStudentId: s.id,
          parentPrincipalId: principalId,
        });
        onLogin("student", s.id, principalId);
        return true;
      }
    }
    return false;
  }

  const handleStudentLogin = async () => {
    if (studentPwd.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    // Step 1: centralized password map
    for (const school of SCHOOLS) {
      const pwdMap = loadStorage<
        Record<string, { password: string; mobile: string }>
      >(`lords_parent_passwords_${school.id}`, {});
      const input = studentPwd.trim();
      for (const [studentId, creds] of Object.entries(pwdMap)) {
        if (
          (creds.password && input === creds.password.trim()) ||
          (creds.mobile && input === creds.mobile.trim())
        ) {
          const students = loadStorage<{ id: number }[]>(
            `lords_students_${school.id}`,
            [],
          );
          const student = students.find((s) => String(s.id) === studentId);
          const numericId = student?.id ?? Number(studentId);
          if (!Number.isNaN(numericId)) {
            saveStorage("lords_session", {
              role: "student",
              activePrincipalId: null,
              parentStudentId: numericId,
              parentPrincipalId: school.id,
            });
            onLogin("student", numericId, school.id);
            setLoading(false);
            return;
          }
        }
      }
    }

    // Step 2: student objects
    for (const school of SCHOOLS) {
      const students = loadStorage<
        { id: number; parentPassword?: string; parentMobile?: string }[]
      >(`lords_students_${school.id}`, []);
      if (tryMatchStudent(students, school.id, studentPwd)) {
        setLoading(false);
        return;
      }
    }

    // Step 3: ICP backend
    if (actor) {
      setIsConnecting(true);
      try {
        const allKeys = [
          ...SCHOOLS.map((s) => `lords_parent_passwords_${s.id}`),
          ...SCHOOLS.map((s) => `lords_students_${s.id}`),
        ];
        const results = await Promise.all(
          allKeys.map((key) => actor.getData(key).catch(() => null)),
        );
        for (let i = 0; i < SCHOOLS.length; i++) {
          const raw = results[i];
          if (!raw) continue;
          try {
            const pwdMap = JSON.parse(raw) as Record<
              string,
              { password: string; mobile: string }
            >;
            saveStorage(`lords_parent_passwords_${SCHOOLS[i].id}`, pwdMap);
            const input = studentPwd.trim();
            for (const [studentId, creds] of Object.entries(pwdMap)) {
              if (
                (creds.password && input === creds.password.trim()) ||
                (creds.mobile && input === creds.mobile.trim())
              ) {
                const numericId = Number(studentId);
                if (!Number.isNaN(numericId)) {
                  saveStorage("lords_session", {
                    role: "student",
                    activePrincipalId: null,
                    parentStudentId: numericId,
                    parentPrincipalId: SCHOOLS[i].id,
                  });
                  onLogin("student", numericId, SCHOOLS[i].id);
                  setLoading(false);
                  setIsConnecting(false);
                  return;
                }
              }
            }
          } catch {}
        }
        for (let i = 0; i < SCHOOLS.length; i++) {
          const raw = results[SCHOOLS.length + i];
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as {
              id: number;
              parentPassword?: string;
              parentMobile?: string;
            }[];
            if (!Array.isArray(parsed)) continue;
            saveStorage(`lords_students_${SCHOOLS[i].id}`, parsed);
            if (tryMatchStudent(parsed, SCHOOLS[i].id, studentPwd)) {
              setLoading(false);
              setIsConnecting(false);
              return;
            }
          } catch {}
        }
      } catch {}
      setIsConnecting(false);
    }

    setLoading(false);
    toast.error(
      "Wrong password. Please ask your principal to share your login password.",
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  // ── Reusable back button ──
  const BackBtn = () => (
    <button
      type="button"
      onClick={goBack}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
    >
      ← Back
    </button>
  );

  // ── School selector ──
  const SchoolSelector = () => (
    <fieldset>
      <legend className="block text-sm font-medium text-foreground mb-2">
        Select School
      </legend>
      <div className="space-y-2">
        {SCHOOLS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            data-ocid={`login.school_${idx + 1}.radio`}
            onClick={() => setSelectedSchoolIdx(idx)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${selectedSchoolIdx === idx ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
          >
            <span className="font-medium">{s.shortName}</span>
            <span className="block text-xs text-muted-foreground">
              {s.location}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center gap-3"
        style={{ background: "oklch(var(--sidebar))" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(0.60 0.19 255)" }}
        >
          <GraduationCap size={19} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-sidebar-foreground">
            Lord&apos;s International School Group
          </div>
          <div className="text-xs text-sidebar-foreground/50">
            School Management Portal
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* ── PORTAL SELECTION ── */}
        {step === "portal" && (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                School Portal
              </h1>
              <p className="text-muted-foreground text-sm">
                Choose your portal to continue
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {PORTAL_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    data-ocid={card.ocid}
                    onClick={() => setStep(card.id)}
                    className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                      style={{
                        background: `${card.accent} / 0.12`,
                        backgroundColor: `color-mix(in oklch, ${card.accent} 12%, transparent)`,
                      }}
                    >
                      <Icon size={24} style={{ color: card.accent }} />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Our Schools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCHOOLS.filter((s) => s.address)
                  .slice(0, 3)
                  .map((school) => (
                    <div
                      key={school.id}
                      className="bg-card border border-border rounded-xl p-4 shadow-xs"
                    >
                      <h3 className="font-semibold text-foreground text-sm mb-2 leading-snug">
                        {school.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {school.address}
                      </p>
                      {school.phone && (
                        <p className="text-xs text-muted-foreground">
                          📞 {school.phone}
                        </p>
                      )}
                      {school.email && (
                        <p className="text-xs text-muted-foreground">
                          ✉️ {school.email}
                        </p>
                      )}
                      {school.website && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "oklch(0.52 0.18 255)" }}
                        >
                          🌐 {school.website}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRINCIPAL LOGIN ── */}
        {step === "principal-select" && (
          <div className="w-full max-w-md">
            <BackBtn />
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(var(--portal-principal))" }}
              >
                <ShieldCheck size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                Principal Login
              </h1>
              <p className="text-muted-foreground text-sm">
                Select your school and enter your password
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
              <SchoolSelector />
              {selectedSchoolIdx !== null && (
                <div>
                  <label
                    htmlFor="principal-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5"
                  >
                    <Lock size={13} /> Password
                  </label>
                  <Input
                    id="principal-password"
                    data-ocid="login.principal_password.input"
                    type="password"
                    placeholder="Enter principal password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handlePrincipalLogin)}
                    autoFocus
                  />
                </div>
              )}
              <Button
                data-ocid="login.principal_login.primary_button"
                className="w-full"
                style={{
                  background: "oklch(var(--portal-principal))",
                  color: "white",
                }}
                onClick={handlePrincipalLogin}
                disabled={selectedSchoolIdx === null || !password.trim()}
              >
                Login as Principal
              </Button>
            </div>
          </div>
        )}

        {/* ── TEACHER LOGIN ── */}
        {step === "teacher-login" && (
          <div className="w-full max-w-md">
            <BackBtn />
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(var(--portal-teachers))" }}
              >
                <GraduationCap size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                Teachers Portal
              </h1>
              <p className="text-muted-foreground text-sm">
                Login with your email and password
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
              <SchoolSelector />
              {selectedSchoolIdx !== null && (
                <>
                  <div>
                    <label
                      htmlFor="teacher-email"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Email Address
                    </label>
                    <Input
                      id="teacher-email"
                      data-ocid="login.teacher_email.input"
                      type="email"
                      placeholder="your@email.com"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="teacher-pwd"
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5"
                    >
                      <Lock size={13} /> Password
                    </label>
                    <Input
                      id="teacher-pwd"
                      data-ocid="login.teacher_password.input"
                      type="password"
                      placeholder="Enter your password"
                      value={teacherPwd}
                      onChange={(e) => setTeacherPwd(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleTeacherLogin)}
                    />
                  </div>
                </>
              )}
              <Button
                data-ocid="login.teacher_login.primary_button"
                className="w-full"
                style={{
                  background: "oklch(var(--portal-teachers))",
                  color: "white",
                }}
                onClick={handleTeacherLogin}
                disabled={selectedSchoolIdx === null}
              >
                Login as Teacher
              </Button>
            </div>
          </div>
        )}

        {/* ── STUDENTS PORTAL ── */}
        {step === "student-password" && (
          <div className="w-full max-w-md">
            <BackBtn />
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "oklch(var(--portal-students))" }}
                >
                  <GraduationCap size={30} className="text-white" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.72 0.18 80)" }}
                >
                  <Lock size={12} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Students Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Lord&apos;s International School Group
              </p>
            </div>

            <div className="rounded-2xl border shadow-md p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(var(--portal-students) / 0.1)" }}
                >
                  <Shield
                    size={15}
                    style={{ color: "oklch(var(--portal-students))" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Students Portal Login
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enter your password or mobile number
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="student-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2"
                  >
                    <Lock
                      size={13}
                      style={{ color: "oklch(var(--portal-students))" }}
                    />{" "}
                    Password or Mobile Number
                  </label>
                  <Input
                    id="student-password"
                    data-ocid="login.student_password.input"
                    type="password"
                    placeholder="Enter your password or mobile number"
                    value={studentPwd}
                    onChange={(e) => setStudentPwd(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, () => void handleStudentLogin())
                    }
                    autoFocus
                    className="h-12 text-base"
                  />
                  {studentPwd.length > 0 && studentPwd.length < 6 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 6 characters required
                    </p>
                  )}
                </div>
                <Button
                  data-ocid="login.student_login.primary_button"
                  className="w-full h-11 text-base font-semibold gap-2"
                  style={{
                    background:
                      studentPwd.trim().length >= 6
                        ? "oklch(var(--portal-students))"
                        : "oklch(var(--portal-students) / 0.5)",
                    color: "white",
                    transition: "background 0.2s",
                  }}
                  onClick={() => void handleStudentLogin()}
                  disabled={studentPwd.trim().length < 6 || loading}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={15} />
                  )}
                  {isConnecting
                    ? "Connecting to server..."
                    : loading
                      ? "Verifying..."
                      : "Login to Students Portal"}
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-start gap-2">
                <Shield
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: "oklch(var(--portal-students))" }}
                />
                <p className="text-xs text-muted-foreground">
                  Your password is set by the school principal or Main
                  Controller. Contact your school if you need help.
                </p>
              </div>
            </div>

            <div className="rounded-xl border p-4 mb-6 bg-muted/40">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Phone size={12} style={{ color: "oklch(0.52 0.18 255)" }} />{" "}
                How to login
              </p>
              <ul className="space-y-1">
                {[
                  "Enter your student password set by the principal",
                  "OR enter your registered 10-digit mobile number",
                  "Works from any device — phone, tablet, or computer",
                  "Multiple family members can be logged in simultaneously",
                ].map((tip) => (
                  <li
                    key={tip}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span
                      className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: "oklch(0.52 0.18 255)" }}
                    >
                      ✓
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── DRIVER LOGIN ── */}
        {step === "driver-login" && (
          <div className="w-full max-w-md">
            <BackBtn />
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(var(--portal-driver))" }}
              >
                <Bus size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                Driver Portal
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your driver password
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
              <SchoolSelector />
              {selectedSchoolIdx !== null && (
                <div>
                  <label
                    htmlFor="driver-pwd"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5"
                  >
                    <Lock size={13} /> Driver Password
                  </label>
                  <Input
                    id="driver-pwd"
                    data-ocid="login.driver_password.input"
                    type="password"
                    placeholder="Enter your driver password"
                    value={driverPwd}
                    onChange={(e) => setDriverPwd(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleDriverLogin)}
                    autoFocus
                    className="h-12 text-base"
                  />
                </div>
              )}
              <Button
                data-ocid="login.driver_login.primary_button"
                className="w-full h-11 text-base font-semibold"
                style={{
                  background: "oklch(var(--portal-driver))",
                  color: "white",
                }}
                onClick={handleDriverLogin}
                disabled={selectedSchoolIdx === null || !driverPwd.trim()}
              >
                <Bus size={15} className="mr-1.5" /> Login as Driver
              </Button>
            </div>
          </div>
        )}

        {/* ── MAIN CONTROLLER ── */}
        {step === "main-controller" && (
          <div className="w-full max-w-md">
            <BackBtn />
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(var(--portal-controller))" }}
              >
                <Cpu size={30} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Main Controller
              </h1>
              <p className="text-sm text-muted-foreground">
                Control Centre — super admin for all schools
              </p>
            </div>
            <div className="rounded-2xl border shadow-md p-6 bg-card border-border">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="main-ctrl-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2"
                  >
                    <Lock
                      size={13}
                      style={{ color: "oklch(var(--portal-controller))" }}
                    />{" "}
                    Admin Password
                  </label>
                  <Input
                    id="main-ctrl-password"
                    data-ocid="login.main_controller_password.input"
                    type="password"
                    placeholder="Enter Main Controller password"
                    value={mainCtrlPwd}
                    onChange={(e) => setMainCtrlPwd(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, handleMainControllerLogin)
                    }
                    autoFocus
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  data-ocid="login.main_controller_login.primary_button"
                  className="w-full h-11 text-base font-semibold"
                  style={{
                    background: "oklch(var(--portal-controller))",
                    color: "white",
                  }}
                  onClick={handleMainControllerLogin}
                  disabled={!mainCtrlPwd.trim()}
                >
                  <Cpu size={15} className="mr-1.5" /> Access Main Controller
                </Button>
              </div>
              <p className="text-xs mt-4 text-center text-muted-foreground">
                Default password:{" "}
                <code className="font-mono">Admin@Lords2026</code>
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} Lord&apos;s International School
        Group. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "oklch(0.52 0.18 255)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
