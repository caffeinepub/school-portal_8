import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/data/mockData";
import { Eye, EyeOff, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";

interface Props {
  onLogin: (role: string, studentId?: number) => void;
  students: Student[];
}

const PRINCIPAL_PASSWORD = "principal123";
const PARENT_PASSWORD = "parent123";

export default function Login({ onLogin, students }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Principal login state
  const [showPrincipalLogin, setShowPrincipalLogin] = useState(false);
  const [principalPassword, setPrincipalPassword] = useState("");
  const [showPrincipalPass, setShowPrincipalPass] = useState(false);
  const [principalError, setPrincipalError] = useState("");

  // Parent login state
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [parentPassword, setParentPassword] = useState("");
  const [showParentPass, setShowParentPass] = useState(false);
  const [parentError, setParentError] = useState("");

  function handlePrincipalLogin() {
    if (principalPassword === PRINCIPAL_PASSWORD) {
      onLogin("principal");
    } else {
      setPrincipalError("Incorrect password. Please try again.");
    }
  }

  function handleParentLogin() {
    if (!selectedStudentId) return;
    if (parentPassword === PARENT_PASSWORD) {
      onLogin("parent", Number(selectedStudentId));
    } else {
      setParentError("Incorrect password. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lord's Group</h1>
          <p className="text-gray-500 text-sm mt-1">
            Student Management Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {(["signin", "signup"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {tab === "signin" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="student@school.edu"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button
                data-ocid="login.submit_button"
                onClick={() => onLogin("student")}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="student@school.edu"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  className="mt-1"
                />
              </div>
              <Button
                data-ocid="login.submit_button"
                onClick={() => onLogin("student")}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Create Account
              </Button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="bg-white px-3">or quick access</span>
              </div>
            </div>

            <Button
              data-ocid="login.primary_button"
              variant="outline"
              onClick={() => onLogin("student")}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Login as Demo Student
            </Button>

            {/* Principal Login */}
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

            {/* Parent Login */}
            {!showParentSelector ? (
              <Button
                data-ocid="login.open_modal_button"
                variant="outline"
                onClick={() => {
                  setShowParentSelector(true);
                  setParentError("");
                  setParentPassword("");
                }}
                className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-emerald-50/50 font-semibold gap-2"
              >
                <Users size={16} className="text-emerald-600" />
                Login as Parent
              </Button>
            ) : (
              <div className="space-y-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <p className="text-xs font-medium text-emerald-700 mb-2">
                  Select your child to continue:
                </p>
                <Select
                  onValueChange={setSelectedStudentId}
                  value={selectedStudentId}
                >
                  <SelectTrigger data-ocid="login.select" className="bg-white">
                    <SelectValue placeholder="Choose student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — Class {s.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <p className="text-xs text-red-500">{parentError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    data-ocid="login.cancel_button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowParentSelector(false);
                      setSelectedStudentId("");
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
                    disabled={!selectedStudentId || !parentPassword}
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

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Lord's Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
