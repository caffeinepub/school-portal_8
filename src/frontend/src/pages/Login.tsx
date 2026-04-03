import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRINCIPALS } from "@/data/principals";
import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
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

type Step = "welcome" | "portal" | "principal-select" | "parent-password";

const SCHOOL_INFO = [
  {
    name: "Lords International School, Alwar (Chikani)",
    address: "Alwar-Bhiwadi Highway, Chikani, Alwar, Rajasthan - 301028",
    phone: "+91 9929011007 | +91 9509891624",
    email: "info@lordsschool.edu.in",
    website: "www.lordsschool.edu.in",
  },
  {
    name: "Lords International School, Churu",
    address: "Bhaleri Road, Churu, Rajasthan - 331001",
    phone: "01562-2219328 | +91 9414423066",
    email: "lis.churu@rediffmail.com",
    website: "www.lischuru.in",
  },
  {
    name: "Lords International School, Sadulpur (Rajgarh)",
    address: "Hisar Road, Rajgarh (Sadulpur), Dist. Churu, Rajasthan - 331023",
    phone: "+91 9414423066 | +91 9413204098",
    email: "",
    website: "",
  },
];

export default function Login({ onLogin }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPrincipalIdx, setSelectedPrincipalIdx] = useState<
    number | null
  >(null);
  const [password, setPassword] = useState("");
  const [parentPwd, setParentPwd] = useState("");
  const [parentLoginLoading, setParentLoginLoading] = useState(false);

  const savedUser = loadStorage<{ email: string; name: string } | null>(
    "lords_user",
    null,
  );

  const handleEmailContinue = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      saveStorage("lords_user", {
        email: email.trim(),
        name: email.split("@")[0],
        signedIn: true,
      });
      setLoading(false);
      setStep("portal");
    }, 600);
  };

  const handlePrincipalLogin = () => {
    if (selectedPrincipalIdx === null) {
      toast.error("Please select a school");
      return;
    }
    const principal = PRINCIPALS[selectedPrincipalIdx];
    if (password === principal.password) {
      saveStorage("lords_session", {
        role: "principal",
        activePrincipalId: principal.id,
        parentStudentId: null,
        parentPrincipalId: null,
      });
      onLogin("principal", undefined, principal.id);
    } else {
      toast.error("Incorrect password. Please try again.");
    }
  };

  // Multi-device support: password-only match with no device fingerprinting or session lock.
  // The same 10-digit parent password works from any number of devices simultaneously.
  const handleParentLogin = () => {
    if (!/^\d{10}$/.test(parentPwd)) {
      toast.error("Password or mobile number must be a 10-digit number");
      return;
    }
    setParentLoginLoading(true);
    // Small delay for loading UX, then do the sync match
    setTimeout(() => {
      for (const principal of PRINCIPALS) {
        const students = loadStorage<
          { id: number; parentPassword?: string; parentMobile?: string }[]
        >(`lords_students_${principal.id}`, []);
        for (const s of students) {
          // Check parentPassword
          const storedPwd = localStorage.getItem(
            `lords_parent_password_student_${s.id}_${principal.id}`,
          );
          const effectivePwd = storedPwd ?? s.parentPassword ?? null;
          if (
            effectivePwd &&
            parentPwd.trim() === String(effectivePwd).trim()
          ) {
            saveStorage("lords_session", {
              role: "parent",
              activePrincipalId: null,
              parentStudentId: s.id,
              parentPrincipalId: principal.id,
            });
            onLogin("parent", s.id, principal.id);
            setParentLoginLoading(false);
            return;
          }
          // Check parentMobile
          const storedMobile = localStorage.getItem(
            `lords_parent_mobile_student_${s.id}_${principal.id}`,
          );
          const effectiveMobile = storedMobile ?? s.parentMobile ?? null;
          if (
            effectiveMobile &&
            parentPwd.trim() === String(effectiveMobile).trim()
          ) {
            saveStorage("lords_session", {
              role: "parent",
              activePrincipalId: null,
              parentStudentId: s.id,
              parentPrincipalId: principal.id,
            });
            onLogin("parent", s.id, principal.id);
            setParentLoginLoading(false);
            return;
          }
        }
      }
      setParentLoginLoading(false);
      toast.error(
        "Incorrect password. Please check your credentials or contact the school.",
      );
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
  };

  const effectiveStep = step === "welcome" && savedUser ? "portal" : step;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.985 0.004 255)" }}
    >
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
        {/* STEP: WELCOME */}
        {effectiveStep === "welcome" && (
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.25 0.10 265)" }}
              >
                <GraduationCap size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Welcome
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to access the school portal
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="login-email"
                    data-ocid="login.email.input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleEmailContinue)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>
              <Button
                data-ocid="login.continue.primary_button"
                className="w-full"
                style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
                onClick={handleEmailContinue}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                {loading ? "Signing in..." : "Continue"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your email identifies your session. No external account needed.
              </p>
            </div>
          </div>
        )}

        {/* STEP: PORTAL */}
        {effectiveStep === "portal" && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                School Portal
              </h1>
              <p className="text-muted-foreground text-sm">
                Choose your login type to continue
              </p>
              {savedUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signed in as{" "}
                  <span className="font-medium">{savedUser.email}</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <button
                type="button"
                data-ocid="login.principal.primary_button"
                onClick={() => setStep("principal-select")}
                className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-200 shadow-card hover:shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                  style={{ background: "oklch(0.25 0.10 265 / 0.1)" }}
                >
                  <ShieldCheck
                    size={24}
                    style={{ color: "oklch(0.25 0.10 265)" }}
                  />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">
                  Principal Login
                </h3>
                <p className="text-muted-foreground text-sm">
                  Manage students, marks, fees, announcements, and school data
                </p>
              </button>
              <button
                type="button"
                data-ocid="login.parent.primary_button"
                onClick={() => setStep("parent-password")}
                className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-200 shadow-card hover:shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                  style={{ background: "oklch(0.58 0.16 150 / 0.1)" }}
                >
                  <Users size={24} style={{ color: "oklch(0.42 0.16 150)" }} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">
                  Parent Login
                </h3>
                <p className="text-muted-foreground text-sm">
                  View your child&apos;s academic records, notices, diary, and
                  more
                </p>
              </button>
            </div>
            <div className="border-t border-border pt-8">
              <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Our Schools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SCHOOL_INFO.map((school) => (
                  <div
                    key={school.name}
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

        {/* STEP: PRINCIPAL SELECT */}
        {effectiveStep === "principal-select" && (
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                setStep("portal");
                setSelectedPrincipalIdx(null);
                setPassword("");
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back
            </button>
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.25 0.10 265)" }}
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
            <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
              <fieldset>
                <legend className="block text-sm font-medium text-foreground mb-2">
                  Select School
                </legend>
                <div className="space-y-2">
                  {PRINCIPALS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      data-ocid={`login.principal_${idx + 1}.radio`}
                      onClick={() => setSelectedPrincipalIdx(idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        selectedPrincipalIdx === idx
                          ? "border-primary bg-primary/5 font-medium"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {selectedPrincipalIdx !== null && (
                <div>
                  <label
                    htmlFor="principal-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5"
                  >
                    <Lock size={13} />
                    Password
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
                style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
                onClick={handlePrincipalLogin}
                disabled={selectedPrincipalIdx === null}
              >
                Login as Principal
              </Button>
            </div>
          </div>
        )}

        {/* STEP: PARENT PASSWORD — Fully redesigned */}
        {effectiveStep === "parent-password" && (
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                setStep("portal");
                setParentPwd("");
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-ocid="login.back.button"
            >
              ← Back
            </button>

            {/* Logo + Heading */}
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "oklch(0.25 0.10 265)" }}
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
                Parent Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Lord&apos;s International School Group
              </p>
            </div>

            {/* Login Card */}
            <div
              className="rounded-2xl border shadow-md p-6 mb-6"
              style={{
                background: "oklch(1 0 0)",
                borderColor: "oklch(0.88 0.018 260)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-5 pb-4"
                style={{ borderBottom: "1px solid oklch(0.92 0.01 260)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.25 0.10 265 / 0.1)" }}
                >
                  <Shield size={15} style={{ color: "oklch(0.25 0.10 265)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Parent Portal Login
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enter your 10-digit password or mobile number
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="parent-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2"
                  >
                    <Lock size={13} style={{ color: "oklch(0.25 0.10 265)" }} />
                    Password or Mobile Number
                  </label>
                  <div className="relative">
                    <Input
                      id="parent-password"
                      data-ocid="login.parent_password.input"
                      type="password"
                      inputMode="numeric"
                      placeholder="Enter 10-digit password"
                      maxLength={10}
                      value={parentPwd}
                      onChange={(e) =>
                        setParentPwd(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, handleParentLogin)}
                      autoFocus
                      className="h-12 text-base tracking-widest pr-16"
                      style={{ borderColor: "oklch(0.78 0.05 265)" }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums"
                      style={{
                        color:
                          parentPwd.length === 10
                            ? "oklch(0.50 0.18 150)"
                            : "oklch(0.55 0.04 260)",
                      }}
                    >
                      {parentPwd.length}/10
                    </span>
                  </div>
                  {parentPwd.length > 0 && parentPwd.length < 10 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {10 - parentPwd.length} more digit
                      {10 - parentPwd.length !== 1 ? "s" : ""} required
                    </p>
                  )}
                </div>

                <Button
                  data-ocid="login.parent_login.primary_button"
                  className="w-full h-11 text-base font-semibold gap-2"
                  style={{
                    background:
                      parentPwd.length === 10
                        ? "oklch(0.25 0.10 265)"
                        : "oklch(0.75 0.04 265)",
                    color: "white",
                    transition: "background 0.2s",
                  }}
                  onClick={handleParentLogin}
                  disabled={parentPwd.length !== 10 || parentLoginLoading}
                >
                  {parentLoginLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={15} />
                  )}
                  {parentLoginLoading
                    ? "Verifying..."
                    : "Login to Parent Portal"}
                </Button>
              </div>

              {/* Security note */}
              <div
                className="mt-4 pt-4 flex items-start gap-2"
                style={{ borderTop: "1px solid oklch(0.92 0.01 260)" }}
              >
                <Shield
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: "oklch(0.50 0.18 150)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.45 0.05 260)" }}
                >
                  Your password is set by the school principal. Contact your
                  school if you need help logging in. Each student has a unique
                  private password.
                </p>
              </div>
            </div>

            {/* How to login */}
            <div
              className="rounded-xl border p-4 mb-6"
              style={{
                background: "oklch(0.97 0.01 260)",
                borderColor: "oklch(0.90 0.015 260)",
              }}
            >
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Phone size={12} style={{ color: "oklch(0.52 0.18 255)" }} />
                How to login
              </p>
              <ul className="space-y-1">
                {[
                  "Enter your 10-digit parent password (set by principal)",
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

            {/* School info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Our Schools
              </p>
              {SCHOOL_INFO.map((school) => (
                <div
                  key={school.name}
                  className="bg-card border border-border rounded-xl p-3 shadow-xs"
                >
                  <p className="font-semibold text-foreground text-xs mb-1">
                    {school.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {school.address}
                  </p>
                  {school.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📞 {school.phone}
                    </p>
                  )}
                </div>
              ))}
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
