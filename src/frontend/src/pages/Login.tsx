import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Student } from "@/data/mockData";
import {
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Props {
  onLogin: (role: string, studentId?: number) => void;
  students: Student[];
}

const PRINCIPAL_PASSWORD = "principal123";
const PARENT_PASSWORD = "parent123";

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

function GoogleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      role="img"
      aria-label="Google"
    >
      <title>Google</title>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export default function Login({ onLogin, students }: Props) {
  const [step, setStep] = useState<"google" | "portal">("google");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [showPrincipalLogin, setShowPrincipalLogin] = useState(false);
  const [principalPassword, setPrincipalPassword] = useState("");
  const [showPrincipalPass, setShowPrincipalPass] = useState(false);
  const [principalError, setPrincipalError] = useState("");

  const [showParentSelector, setShowParentSelector] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [showParentPass, setShowParentPass] = useState(false);
  const [parentError, setParentError] = useState("");

  function handleGoogleNext() {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Enter a valid email or phone number.");
      return;
    }
    setEmailError("");
    setStep("portal");
  }

  function handlePrincipalLogin() {
    if (principalPassword === PRINCIPAL_PASSWORD) {
      onLogin("principal");
    } else {
      setPrincipalError("Incorrect password. Please try again.");
    }
  }

  function handleParentLogin() {
    const matched = students.find((s) =>
      s.name.toLowerCase().includes(studentNameInput.trim().toLowerCase()),
    );
    if (!matched) {
      setParentError("No student found with that name.");
      return;
    }
    if (parentPassword !== PARENT_PASSWORD) {
      setParentError("Incorrect password. Please try again.");
      return;
    }
    onLogin("parent", matched.id);
  }

  if (step === "google") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="border border-gray-300 rounded-lg p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <GoogleLogo />
            </div>
            <h1 className="text-2xl font-normal text-gray-800 text-center mb-1">
              Sign in
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              to continue to Lord&apos;s School Portal
            </p>

            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email or phone"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleGoogleNext()}
                  data-ocid="login.input"
                  className="border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm text-sm h-14 px-3"
                  autoFocus
                />
                {emailError && (
                  <p
                    className="text-xs text-red-600 mt-1"
                    data-ocid="login.error_state"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                >
                  Forgot email?
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Not your computer? Use{" "}
                <button
                  type="button"
                  className="text-blue-700 hover:text-blue-900 underline"
                >
                  Guest mode
                </button>{" "}
                to sign in privately.{" "}
                <button
                  type="button"
                  className="text-blue-700 hover:text-blue-900 underline"
                >
                  Learn more
                </button>
              </p>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                Create account
              </button>
              <Button
                data-ocid="login.primary_button"
                onClick={handleGoogleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-sm"
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-gray-600 mt-6 px-2">
            <button type="button" className="hover:underline">
              English (United States)
            </button>
          </div>
          <div className="flex gap-4 text-xs text-gray-600 mt-2 px-2">
            <button type="button" className="hover:underline">
              Help
            </button>
            <button type="button" className="hover:underline">
              Privacy
            </button>
            <button type="button" className="hover:underline">
              Terms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Lord&apos;s International School Group
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Student Management Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("google")}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
            >
              Change
            </button>
          </div>

          <div className="space-y-3">
            <Button
              data-ocid="login.primary_button"
              variant="outline"
              onClick={() => onLogin("student")}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Login as Demo Student
            </Button>

            {!showPrincipalLogin ? (
              <Button
                data-ocid="login.secondary_button"
                variant="outline"
                onClick={() => {
                  setShowPrincipalLogin(true);
                  setPrincipalError("");
                  setPrincipalPassword("");
                }}
                className="w-full border-indigo-300 text-indigo-800 hover:bg-indigo-50 bg-indigo-50/50 font-semibold gap-2"
              >
                <ShieldCheck size={16} className="text-indigo-600" />
                Login as Principal
              </Button>
            ) : (
              <div className="space-y-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <p className="text-xs font-medium text-indigo-700 mb-2 flex items-center gap-1">
                  <ShieldCheck size={14} /> Enter Principal Password:
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
                {principalError && (
                  <p className="text-xs text-red-500">{principalError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    data-ocid="login.cancel_button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPrincipalLogin(false);
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
                    disabled={!principalPassword}
                    onClick={handlePrincipalLogin}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Enter
                  </Button>
                </div>
              </div>
            )}

            {!showParentSelector ? (
              <Button
                data-ocid="login.open_modal_button"
                variant="outline"
                onClick={() => {
                  setShowParentSelector(true);
                  setParentError("");
                  setParentPassword("");
                  setStudentNameInput("");
                }}
                className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-emerald-50/50 font-semibold gap-2"
              >
                <Users size={16} className="text-emerald-600" />
                Login as Parent
              </Button>
            ) : (
              <div className="space-y-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <p className="text-xs font-medium text-emerald-700 mb-2">
                  Enter your child&apos;s name to continue:
                </p>
                <Input
                  type="text"
                  placeholder="Type student name..."
                  value={studentNameInput}
                  onChange={(e) => {
                    setStudentNameInput(e.target.value);
                    setParentError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleParentLogin()}
                  className="bg-white"
                  data-ocid="login.input"
                  autoFocus
                />
                <div className="relative">
                  <Input
                    type={showParentPass ? "text" : "password"}
                    placeholder="Parent password"
                    value={parentPassword}
                    onChange={(e) => {
                      setParentPassword(e.target.value);
                      setParentError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleParentLogin()}
                    className="bg-white pr-10"
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
                      setShowParentSelector(false);
                      setStudentNameInput("");
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
                    disabled={!studentNameInput.trim() || !parentPassword}
                    onClick={handleParentLogin}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Continue
                  </Button>
                </div>
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
          &copy; {new Date().getFullYear()} Lord&apos;s International School
          Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
