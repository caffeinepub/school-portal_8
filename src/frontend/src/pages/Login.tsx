import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Student } from "@/data/mockData";
import { PRINCIPALS } from "@/data/principals";
import {
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Props {
  onLogin: (role: string, studentId?: number, principalId?: string) => void;
}

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

interface GoogleUser {
  email: string;
  name: string;
  signedIn: boolean;
}

export default function Login({ onLogin }: Props) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("lords_google_user") || "null");
    } catch {
      return null;
    }
  });
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleError, setGoogleError] = useState("");

  // Portal state
  const [portalView, setPortalView] = useState<
    "select" | "principal" | "parent"
  >("select");

  // Principal login state
  const [selectedPrincipal, setSelectedPrincipal] = useState("");
  const [principalPassword, setPrincipalPassword] = useState("");
  const [showPrincipalPw, setShowPrincipalPw] = useState(false);
  const [principalError, setPrincipalError] = useState("");

  // Parent login state
  const [parentPassword, setParentPassword] = useState("");
  const [parentError, setParentError] = useState("");

  function handleGoogleSignIn() {
    if (!googleEmail.includes("@")) {
      setGoogleError("Please enter a valid email address.");
      return;
    }
    const user: GoogleUser = {
      email: googleEmail,
      name: googleEmail.split("@")[0],
      signedIn: true,
    };
    localStorage.setItem("lords_google_user", JSON.stringify(user));
    setGoogleUser(user);
  }

  function handleGoogleSignOut() {
    localStorage.removeItem("lords_google_user");
    setGoogleUser(null);
    setGoogleEmail("");
    setGoogleError("");
  }

  const handlePrincipalLogin = () => {
    const principal = PRINCIPALS.find((p) => p.id === selectedPrincipal);
    if (!principal) {
      setPrincipalError("Please select a school.");
      return;
    }
    if (principalPassword !== principal.password) {
      setPrincipalError("Incorrect password. Please try again.");
      return;
    }
    onLogin("principal", undefined, principal.id);
  };

  const handleParentLogin = () => {
    for (const principal of PRINCIPALS) {
      try {
        const raw = localStorage.getItem(`lords_students_${principal.id}`);
        if (!raw) continue;
        const students: Student[] = JSON.parse(raw);
        const match = students.find(
          (s) =>
            s.parentPassword !== undefined &&
            s.parentPassword !== null &&
            s.parentPassword !== "" &&
            String(s.parentPassword) === parentPassword.trim(),
        );
        if (match) {
          onLogin("parent", match.id, principal.id);
          return;
        }
      } catch {
        // skip this principal
      }
    }
    setParentError(
      "No student found with this password. Please check with your school.",
    );
  };

  // ---- Google Sign-In screen ----
  if (!googleUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Google logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-bold" style={{ color: "#4285F4" }}>
                G
              </span>
              <span className="text-4xl font-bold" style={{ color: "#EA4335" }}>
                o
              </span>
              <span className="text-4xl font-bold" style={{ color: "#FBBC04" }}>
                o
              </span>
              <span className="text-4xl font-bold" style={{ color: "#4285F4" }}>
                g
              </span>
              <span className="text-4xl font-bold" style={{ color: "#34A853" }}>
                l
              </span>
              <span className="text-4xl font-bold" style={{ color: "#EA4335" }}>
                e
              </span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={24} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-normal text-gray-800">Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">
                to continue to Lord&apos;s International School Group
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email or phone"
                value={googleEmail}
                onChange={(e) => {
                  setGoogleEmail(e.target.value);
                  setGoogleError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGoogleSignIn()}
                className="rounded-lg border-gray-300"
                data-ocid="login.email_input"
              />
              {googleError && (
                <p className="text-xs text-red-500">{googleError}</p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={!googleEmail.trim()}
                  className="rounded-lg px-6"
                  style={{ backgroundColor: "#1a73e8" }}
                  data-ocid="login.primary_button"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Lord&apos;s International School Group &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  // ---- Portal: role selector or login forms ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-indigo-950 text-white px-6 py-4 flex items-center gap-3 shadow-md">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
          <GraduationCap size={20} />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">
            Lord&apos;s International School Group
          </div>
          <div className="text-indigo-300 text-xs">School Portal</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block text-xs text-indigo-300 bg-indigo-800 px-2 py-1 rounded-lg">
            {googleUser.email}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Role selector */}
        {portalView === "select" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-950">
                Welcome, {googleUser.name}
              </h2>
              <p className="text-slate-500 mt-1">
                Choose your portal to continue
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                data-ocid="portal.principal.button"
                onClick={() => setPortalView("principal")}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group text-left"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                  <ShieldCheck
                    size={24}
                    className="text-indigo-600 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-bold text-indigo-950 text-lg">Principal</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Manage students, marks, and school records
                </p>
              </button>
              <button
                type="button"
                data-ocid="portal.parent.button"
                onClick={() => setPortalView("parent")}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group text-left"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                  <Users
                    size={24}
                    className="text-emerald-600 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-bold text-indigo-950 text-lg">Parent</h3>
                <p className="text-slate-500 text-sm mt-1">
                  View your child&apos;s academic progress
                </p>
              </button>
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="button"
                data-ocid="portal.signout.button"
                onClick={handleGoogleSignOut}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50"
              >
                <LogOut size={14} />
                Sign out ({googleUser.email})
              </button>
            </div>
          </div>
        )}

        {/* Principal login */}
        {portalView === "principal" && (
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setPortalView("select");
                setPrincipalError("");
                setPrincipalPassword("");
              }}
              className="text-indigo-600 text-sm flex items-center gap-1 mb-6 hover:underline"
            >
              ← Back
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-indigo-950 text-lg">
                    Principal Login
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Select your school and enter password
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="principal-select"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Select School
                  </label>
                  <select
                    id="principal-select"
                    data-ocid="principal.select"
                    value={selectedPrincipal}
                    onChange={(e) => {
                      setSelectedPrincipal(e.target.value);
                      setPrincipalError("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">-- Select School --</option>
                    {PRINCIPALS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="principal-password"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="principal-password"
                      data-ocid="principal.input"
                      type={showPrincipalPw ? "text" : "password"}
                      placeholder="Enter principal password"
                      value={principalPassword}
                      onChange={(e) => {
                        setPrincipalPassword(e.target.value);
                        setPrincipalError("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handlePrincipalLogin()
                      }
                      className="pr-10 rounded-xl border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrincipalPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPrincipalPw ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
                {principalError && (
                  <p
                    data-ocid="principal.error_state"
                    className="text-red-500 text-sm"
                  >
                    {principalError}
                  </p>
                )}
                <Button
                  data-ocid="principal.submit_button"
                  onClick={handlePrincipalLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
                >
                  <LogIn size={16} className="mr-2" />
                  Login as Principal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Parent login */}
        {portalView === "parent" && (
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setPortalView("select");
                setParentError("");
                setParentPassword("");
              }}
              className="text-indigo-600 text-sm flex items-center gap-1 mb-6 hover:underline"
            >
              ← Back
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-indigo-950 text-lg">
                    Parent Login
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Enter the 10-digit password provided by your school
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="parent-password"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Parent Password
                  </label>
                  <Input
                    id="parent-password"
                    data-ocid="parent.input"
                    type="password"
                    placeholder="Enter 10-digit password"
                    value={parentPassword}
                    onChange={(e) => {
                      setParentPassword(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      );
                      setParentError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleParentLogin()}
                    className="rounded-xl border-slate-200 tracking-widest"
                    maxLength={10}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {parentPassword.length}/10 digits
                  </p>
                </div>
                {parentError && (
                  <p
                    data-ocid="parent.error_state"
                    className="text-red-500 text-sm"
                  >
                    {parentError}
                  </p>
                )}
                <Button
                  data-ocid="parent.submit_button"
                  onClick={handleParentLogin}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                >
                  <LogIn size={16} className="mr-2" />
                  Login as Parent
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* School Information */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-indigo-950 text-center mb-6">
            Our Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHOOL_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                data-ocid={BRANCH_OCIDS[branch.id]}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-indigo-950 text-sm leading-snug mb-1">
                  {branch.name}
                </h3>
                <p className="text-indigo-500 text-xs mb-3">{branch.desc}</p>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex gap-2">
                    <MapPin
                      size={12}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phones.map((ph) => (
                    <div key={ph} className="flex gap-2">
                      <Phone
                        size={12}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span>{ph}</span>
                    </div>
                  ))}
                  {branch.email && (
                    <div className="flex gap-2">
                      <Mail
                        size={12}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span>{branch.email}</span>
                    </div>
                  )}
                  {branch.website && (
                    <div className="flex gap-2">
                      <Globe
                        size={12}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span>{branch.website}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
