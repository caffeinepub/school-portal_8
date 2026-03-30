import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRINCIPALS } from "@/data/principals";
import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
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

  const handleParentLogin = () => {
    if (!/^\d{10}$/.test(parentPwd)) {
      toast.error("Parent password must be a 10-digit number");
      return;
    }
    for (const principal of PRINCIPALS) {
      const students = loadStorage<{ id: number; parentPassword?: string }[]>(
        `lords_students_${principal.id}`,
        [],
      );
      const found = students.find(
        (s) => s.parentPassword && s.parentPassword === parentPwd,
      );
      if (found) {
        saveStorage("lords_session", {
          role: "parent",
          activePrincipalId: null,
          parentStudentId: found.id,
          parentPrincipalId: principal.id,
        });
        onLogin("parent", found.id, principal.id);
        return;
      }
    }
    toast.error(
      "Password not found. Please check your 10-digit parent password.",
    );
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

        {/* STEP: PARENT PASSWORD */}
        {effectiveStep === "parent-password" && (
          <div className="w-full max-w-sm">
            <button
              type="button"
              onClick={() => {
                setStep("portal");
                setParentPwd("");
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              ← Back
            </button>
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.42 0.16 150)" }}
              >
                <Users size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                Parent Login
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your 10-digit parent password
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
              <div>
                <label
                  htmlFor="parent-password"
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5"
                >
                  <Lock size={13} />
                  10-Digit Parent Password
                </label>
                <Input
                  id="parent-password"
                  data-ocid="login.parent_password.input"
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter 10-digit password"
                  maxLength={10}
                  value={parentPwd}
                  onChange={(e) =>
                    setParentPwd(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => handleKeyDown(e, handleParentLogin)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {parentPwd.length}/10 digits entered
                </p>
              </div>
              <Button
                data-ocid="login.parent_login.primary_button"
                className="w-full"
                style={{ background: "oklch(0.42 0.16 150)", color: "white" }}
                onClick={handleParentLogin}
                disabled={parentPwd.length !== 10}
              >
                Access Student Portal
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Password is set by your school principal.
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
