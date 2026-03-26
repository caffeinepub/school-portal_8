import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Student } from "@/data/mockData";
import {
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Save,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  principalId: string;
  students: Student[];
}

export default function PrincipalParentSettings({
  principalId,
  students,
}: Props) {
  const storageKey = `lords_parent_password_${principalId}`;
  const currentSaved = localStorage.getItem(storageKey) ?? "parent123";

  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const parentNames = [
    ...new Set(students.map((s) => s.parentName).filter(Boolean)),
  ];

  function handleSave() {
    if (!newPassword.trim()) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(storageKey, newPassword);
      setSaving(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Parent password updated successfully!");
    }, 600);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <KeyRound className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parent Settings</h2>
          <p className="text-sm text-gray-500">
            Manage the parent login password and view registered parents
          </p>
        </div>
      </div>

      {/* Current Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-4 w-4 text-indigo-500" />
          <h3 className="font-semibold text-gray-900">Parent Login Password</h3>
        </div>

        {/* Current */}
        <div className="space-y-1">
          <Label className="text-sm text-gray-600">Current Password</Label>
          <div className="relative">
            <Input
              data-ocid="parent_settings.input"
              type={showCurrent ? "text" : "password"}
              readOnly
              value={currentSaved}
              className="pr-10 bg-gray-50 cursor-default"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <Label className="text-sm text-gray-600">New Password</Label>
          <div className="relative">
            <Input
              data-ocid="parent_settings.input"
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label className="text-sm text-gray-600">Confirm New Password</Label>
          <div className="relative">
            <Input
              data-ocid="parent_settings.input"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          data-ocid="parent_settings.save_button"
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Update Password"}
        </Button>
      </div>

      {/* Parent Login Info */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-indigo-800">
            How Parent Login Works
          </h3>
        </div>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Parents log in by entering their <strong>child's name</strong> and the{" "}
          <strong>parent password</strong> set above. The system searches for
          the child's name across all student records. Make sure the parent
          knows the exact name of their child as registered.
        </p>
      </div>

      {/* Parent Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900">
              Registered Parents Summary
            </h3>
          </div>
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 border-0"
          >
            {students.length} students
          </Badge>
        </div>

        {students.length === 0 ? (
          <div
            data-ocid="parent_settings.empty_state"
            className="text-center py-8 text-gray-400"
          >
            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No students added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student, idx) => (
              <div
                key={student.id}
                data-ocid={`parent_settings.row.${idx + 1}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Class {student.class || "—"} · Roll No{" "}
                      {student.rollNo || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700 font-medium">
                    {student.parentName || "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {student.parentPhone || "No phone"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {parentNames.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>{parentNames.length}</strong> unique parent name
              {parentNames.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
