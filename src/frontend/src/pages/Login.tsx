import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Student } from "@/data/mockData";
import { students as mockStudents } from "@/data/mockData";
import { PRINCIPALS } from "@/data/principals";
import {
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Props {
  onLogin: (role: string, studentId?: number, principalId?: string) => void;
}

const _PARENT_PASSWORD = "parent123";

const SCHOOL_BRANCHES = [
  {
    id: "alwar",
    name: "Lords International School, Alwar (Chikani)",
    desc: "CBSE-affiliated day-cum-residential school",
    address: "Alwar-Bhiwadi Highway, Chikani, Alwar, Rajasthan - 301028",
    cityOffice: "1st Floor, Signature Tower, Scheme 10, Alwar",
    phones: ["+91 9929011007", "+91 9509891624"],
    admission: "+91 6350322874",
    email: "info@lordsschool.edu.in",
    email2: "principallis2005@gmail.com",
    website: "www.lordsschool.edu.in",
  },
  {
    id: "churu",
    name: "Lords International School, Churu (Main City)",
    desc: "CBSE-affiliated senior secondary school",
    address: "Bhaleri Road, Churu, Rajasthan - 331001",
    cityOffice: null,
    phones: ["01562-2219328", "+91 9414423066"],
    admission: null,
    email: "lis.churu@rediffmail.com",
    email2: "svermalords@gmail.com",
    website: "www.lischuru.in",
  },
  {
    id: "sadulpur",
    name: "Lords International School, Sadulpur (Rajgarh)",
    desc: "CBSE co-educational, Primary to Senior Secondary",
    address: "Hisar Road, Rajgarh (Sadulpur), Dist. Churu, Rajasthan - 331023",
    cityOffice: null,
    phones: ["+91 9414423066", "+91 9413204098"],
    admission: null,
    email: null,
    email2: null,
    website: null,
  },
];

const BRANCH_OCIDS: Record<string, string> = {
  alwar: "school.item.1",
  churu: "school.item.2",
  sadulpur: "school.item.3",
};

interface AccountRecord {
  name: string;
  email: string;
  password: string;
}

function getAccounts(): AccountRecord[] {
  try {
    const raw = localStorage.getItem("lords_accounts");
    if (raw) return JSON.parse(raw) as AccountRecord[];
  } catch {}
  return [];
}

function saveAccounts(accounts: AccountRecord[]) {
  localStorage.setItem("lords_accounts", JSON.stringify(accounts));
}

export default function Login({ onLogin }: Props) {
  const existingAccounts = getAccounts();
  const [step, setStep] = useState<"account" | "portal">(
    existingAccounts.length > 0 ? "portal" : "account",
  );
  const [authMode, setAuthMode] = useState<"signin" | "signup">(
    existingAccounts.length > 0 ? "signin" : "signup",
  );

  // Account form state
  const [acName, setAcName] = useState("");
  const [acEmail, setAcEmail] = useState("");
  const [acPassword, setAcPassword] = useState("");
  const [acConfirm, setAcConfirm] = useState("");
  const [showAcPass, setShowAcPass] = useState(false);
  const [showAcConfirm, setShowAcConfirm] = useState(false);
  const [acError, setAcError] = useState("");
  const [signedInName, setSignedInName] = useState("");

  // Principal login state
  const [showPrincipalLogin, setShowPrincipalLogin] = useState(false);
  const [selectedPrincipalId, setSelectedPrincipalId] = useState<string | null>(
    null,
  );
  const [principalPassword, setPrincipalPassword] = useState("");
  const [showPrincipalPass, setShowPrincipalPass] = useState(false);
  const [principalError, setPrincipalError] = useState("");

  // Parent login state
  const [showParentLogin, setShowParentLogin] = useState(false);
  const [parentPassword, setParentPassword] = useState("");
  const [showParentPass, setShowParentPass] = useState(false);
  const [parentError, setParentError] = useState("");
  const [parentStudentOptions, setParentStudentOptions] = useState<
    { student: Student; principalId: string }[]
  >([]);
  const [parentSelectStep, setParentSelectStep] = useState(false);

  function handleSignUp() {
    setAcError("");
    if (!acName.trim()) {
      setAcError("Please enter your full name.");
      return;
    }
    if (!acEmail.trim() || !acEmail.includes("@")) {
      setAcError("Please enter a valid email address.");
      return;
    }
    if (acPassword.length < 6) {
      setAcError("Password must be at least 6 characters.");
      return;
    }
    if (acPassword !== acConfirm) {
      setAcError("Passwords do not match.");
      return;
    }
    const accounts = getAccounts();
    if (accounts.find((a) => a.email.toLowerCase() === acEmail.toLowerCase())) {
      setAcError("An account with this email already exists. Please sign in.");
      return;
    }
    accounts.push({
      name: acName.trim(),
      email: acEmail.trim(),
      password: acPassword,
    });
    saveAccounts(accounts);
    setSignedInName(acName.trim());
    setStep("portal");
  }

  function handleSignIn() {
    setAcError("");
    if (!acEmail.trim()) {
      setAcError("Please enter your email.");
      return;
    }
    if (!acPassword) {
      setAcError("Please enter your password.");
      return;
    }
    const accounts = getAccounts();
    const found = accounts.find(
      (a) =>
        a.email.toLowerCase() === acEmail.toLowerCase() &&
        a.password === acPassword,
    );
    if (!found) {
      setAcError("Incorrect email or password.");
      return;
    }
    setSignedInName(found.name);
    setStep("portal");
  }

  function handlePrincipalLogin() {
    if (!selectedPrincipalId) {
      setPrincipalError("Please select a principal account.");
      return;
    }
    const principal = PRINCIPALS.find((p) => p.id === selectedPrincipalId);
    if (!principal) return;
    if (principalPassword === principal.password) {
      onLogin("principal", undefined, selectedPrincipalId);
    } else {
      setPrincipalError("Incorrect password. Please try again.");
    }
  }

  function handleParentPasswordSubmit() {
    if (!parentPassword.trim()) {
      setParentError("Please enter your password.");
      return;
    }
    if (parentPassword.length !== 10 || !/^\d{10}$/.test(parentPassword)) {
      setParentError("Parent password must be exactly 10 digits.");
      return;
    }

    // Search all principals' students for a matching parentPassword
    for (const p of PRINCIPALS) {
      let list: Student[] = mockStudents;
      try {
        const raw = localStorage.getItem(`lords_students_${p.id}`);
        if (raw) list = JSON.parse(raw) as Student[];
      } catch {}

      for (const s of list) {
        const storedParentPw = localStorage.getItem(
          `lords_parent_password_student_${s.id}_${p.id}`,
        );
        const effectivePw = storedParentPw ?? s.parentPassword ?? null;

        if (effectivePw && parentPassword === effectivePw) {
          setParentError("");
          onLogin("parent", s.id, p.id);
          return;
        }
      }
    }

    setParentError("Incorrect password. Please try again.");
  }

  function handleParentSelectStudent(student: Student, principalId: string) {
    onLogin("parent", student.id, principalId);
  }

  // ---------- Account Sign Up / Sign In Page ----------
  if (step === "account") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3 shadow-md">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Lord's International School Group
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Student Management Portal
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* Toggle */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAcError("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "signup"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <UserPlus size={14} /> Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAcError("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "signin"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LogIn size={14} /> Sign In
              </button>
            </div>

            {authMode === "signup" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </p>
                  <Input
                    placeholder="Enter your full name"
                    value={acName}
                    onChange={(e) => {
                      setAcName(e.target.value);
                      setAcError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                    data-ocid="login.name_input"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </p>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={acEmail}
                    onChange={(e) => {
                      setAcEmail(e.target.value);
                      setAcError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                    data-ocid="login.email_input"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Password
                  </p>
                  <div className="relative">
                    <Input
                      type={showAcPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={acPassword}
                      onChange={(e) => {
                        setAcPassword(e.target.value);
                        setAcError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                      className="pr-10"
                      data-ocid="login.password_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAcPass(!showAcPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showAcPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
                  </p>
                  <div className="relative">
                    <Input
                      type={showAcConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={acConfirm}
                      onChange={(e) => {
                        setAcConfirm(e.target.value);
                        setAcError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                      className="pr-10"
                      data-ocid="login.confirm_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAcConfirm(!showAcConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showAcConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {acError && (
                  <p
                    className="text-xs text-red-500"
                    data-ocid="login.error_state"
                  >
                    {acError}
                  </p>
                )}
                <Button
                  onClick={handleSignUp}
                  disabled={
                    !acName.trim() ||
                    !acEmail.trim() ||
                    !acPassword ||
                    !acConfirm
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold mt-1"
                  data-ocid="login.primary_button"
                >
                  Create Account & Continue
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAcError("");
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </p>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={acEmail}
                    onChange={(e) => {
                      setAcEmail(e.target.value);
                      setAcError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                    data-ocid="login.email_input"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Password
                  </p>
                  <div className="relative">
                    <Input
                      type={showAcPass ? "text" : "password"}
                      placeholder="Your password"
                      value={acPassword}
                      onChange={(e) => {
                        setAcPassword(e.target.value);
                        setAcError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      className="pr-10"
                      data-ocid="login.password_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAcPass(!showAcPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showAcPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {acError && (
                  <p
                    className="text-xs text-red-500"
                    data-ocid="login.error_state"
                  >
                    {acError}
                  </p>
                )}
                <Button
                  onClick={handleSignIn}
                  disabled={!acEmail.trim() || !acPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold mt-1"
                  data-ocid="login.primary_button"
                >
                  Sign In & Continue
                </Button>
                <p className="text-xs text-center text-gray-500">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAcError("");
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            &copy; {new Date().getFullYear()} Lord's International School Group.
            All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Portal Role Selection Page ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Lord's International School Group
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Student Management Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Signed-in badge */}
          <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
              {signedInName.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {signedInName || "User"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("account")}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
            >
              Change
            </button>
          </div>

          <div className="space-y-3">
            {/* Principal Login */}
            {!showPrincipalLogin ? (
              <Button
                data-ocid="login.secondary_button"
                variant="outline"
                onClick={() => {
                  setShowPrincipalLogin(true);
                  setPrincipalError("");
                  setPrincipalPassword("");
                  setSelectedPrincipalId(null);
                }}
                className="w-full border-indigo-300 text-indigo-800 hover:bg-indigo-50 bg-indigo-50/50 font-semibold gap-2"
              >
                <ShieldCheck size={16} className="text-indigo-600" />
                Login as Principal
              </Button>
            ) : (
              <div className="space-y-3 p-3 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                  <ShieldCheck size={14} /> Select Principal Account:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRINCIPALS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      data-ocid={`login.principal_card.${idx + 1}`}
                      onClick={() => {
                        setSelectedPrincipalId(p.id);
                        setPrincipalError("");
                        setPrincipalPassword("");
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${selectedPrincipalId === p.id ? "border-indigo-500 bg-indigo-100 text-indigo-900" : "border-indigo-100 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedPrincipalId === p.id ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}
                      >
                        {p.name.slice(-1)}
                      </div>
                      <span className="text-sm font-medium">{p.name}</span>
                      {selectedPrincipalId === p.id && (
                        <span className="ml-auto text-indigo-500 text-xs font-semibold">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedPrincipalId && (
                  <div className="space-y-2">
                    <p className="text-xs text-indigo-600">
                      Enter password for{" "}
                      <strong>
                        {
                          PRINCIPALS.find((p) => p.id === selectedPrincipalId)
                            ?.name
                        }
                      </strong>
                      :
                    </p>
                    <div className="relative">
                      <Input
                        type={showPrincipalPass ? "text" : "password"}
                        placeholder="Principal password"
                        value={principalPassword}
                        onChange={(e) => {
                          setPrincipalPassword(e.target.value);
                          setPrincipalError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handlePrincipalLogin()
                        }
                        className="bg-white pr-10"
                        data-ocid="login.input"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPrincipalPass(!showPrincipalPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPrincipalPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {principalError && (
                  <p
                    className="text-xs text-red-500"
                    data-ocid="login.error_state"
                  >
                    {principalError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    data-ocid="login.cancel_button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPrincipalLogin(false);
                      setSelectedPrincipalId(null);
                      setPrincipalPassword("");
                      setPrincipalError("");
                    }}
                    className="flex-1 text-gray-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="login.confirm_button"
                    size="sm"
                    disabled={!selectedPrincipalId || !principalPassword}
                    onClick={handlePrincipalLogin}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Enter
                  </Button>
                </div>
              </div>
            )}

            {/* Parent Login */}
            {!showParentLogin ? (
              <Button
                data-ocid="login.open_modal_button"
                variant="outline"
                onClick={() => {
                  setShowParentLogin(true);
                  setParentError("");
                  setParentPassword("");
                  setParentSelectStep(false);
                  setParentStudentOptions([]);
                }}
                className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-emerald-50/50 font-semibold gap-2"
              >
                <Users size={16} className="text-emerald-600" />
                Login as Parent
              </Button>
            ) : !parentSelectStep ? (
              <div className="space-y-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Users size={14} /> Parent Login
                </p>
                <p className="text-xs text-gray-600">
                  Enter your parent password to continue:
                </p>
                <div className="relative">
                  <Input
                    type={showParentPass ? "text" : "password"}
                    placeholder="Enter 10-digit password"
                    value={parentPassword}
                    onChange={(e) => {
                      setParentPassword(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      );
                      setParentError("");
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleParentPasswordSubmit()
                    }
                    className="bg-white pr-10"
                    data-ocid="login.input"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowParentPass(!showParentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showParentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {parentError && (
                  <p
                    className="text-xs text-red-500"
                    data-ocid="login.error_state"
                  >
                    {parentError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    data-ocid="login.cancel_button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowParentLogin(false);
                      setParentPassword("");
                      setParentError("");
                    }}
                    className="flex-1 text-gray-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="login.confirm_button"
                    size="sm"
                    disabled={!parentPassword.trim()}
                    onClick={handleParentPasswordSubmit}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Users size={14} /> Select Your Child
                </p>
                <p className="text-xs text-gray-600">
                  Tap your child's name to continue:
                </p>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {parentStudentOptions.map(({ student, principalId }) => (
                    <button
                      key={`${principalId}-${student.id}`}
                      type="button"
                      onClick={() =>
                        handleParentSelectStudent(student, principalId)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-emerald-100 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Class {student.class}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParentSelectStep(false);
                    setParentPassword("");
                  }}
                  className="w-full text-gray-500 text-xs"
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* School Information */}
        <div className="mt-8">
          <h2 className="text-center text-base font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
            <GraduationCap size={18} className="text-blue-600" />
            School Information
          </h2>
          <div className="space-y-4">
            {SCHOOL_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                data-ocid={BRANCH_OCIDS[branch.id]}
              >
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {branch.name}
                </h3>
                <p className="text-xs text-blue-600 mb-3">{branch.desc}</p>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex gap-2">
                    <MapPin
                      size={12}
                      className="text-gray-400 mt-0.5 flex-shrink-0"
                    />
                    <span>{branch.address}</span>
                  </div>
                  {branch.cityOffice && (
                    <div className="flex gap-2">
                      <MapPin
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <span>City Office: {branch.cityOffice}</span>
                    </div>
                  )}
                  {branch.phones.map((p) => (
                    <div key={p} className="flex gap-2">
                      <Phone
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <a href={`tel:${p}`} className="hover:text-blue-600">
                        {p}
                      </a>
                    </div>
                  ))}
                  {branch.admission && (
                    <div className="flex gap-2">
                      <Phone
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Admission/Counseling:{" "}
                        <a
                          href={`tel:${branch.admission}`}
                          className="hover:text-blue-600"
                        >
                          {branch.admission}
                        </a>
                      </span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex gap-2">
                      <Mail
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <a
                        href={`mailto:${branch.email}`}
                        className="hover:text-blue-600"
                      >
                        {branch.email}
                      </a>
                    </div>
                  )}
                  {branch.email2 && (
                    <div className="flex gap-2">
                      <Mail
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <a
                        href={`mailto:${branch.email2}`}
                        className="hover:text-blue-600"
                      >
                        {branch.email2}
                      </a>
                    </div>
                  )}
                  {branch.website && (
                    <div className="flex gap-2">
                      <Globe
                        size={12}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      <a
                        href={`https://${branch.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {branch.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 mb-4">
          &copy; {new Date().getFullYear()} Lord's International School Group.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}
