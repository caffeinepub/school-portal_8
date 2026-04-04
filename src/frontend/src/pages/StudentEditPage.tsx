import { FileType } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student } from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import {
  deleteMediaBlob,
  getMediaBlobUrl,
  saveMediaBlob,
} from "@/utils/mediaStorage";
import {
  ArrowLeft,
  Camera,
  Copy,
  Edit2,
  Film,
  Image as ImageIcon,
  PlayCircle,
  Save,
  Send,
  Share2,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  blobReferenceId: string;
  url: string;
  fileType: "photo" | "video";
  caption: string;
  uploadedAt: string;
}

function loadMedia(studentId: number): MediaItem[] {
  try {
    const raw = localStorage.getItem(`lords_media_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveMedia(studentId: number, items: MediaItem[]) {
  try {
    localStorage.setItem(`lords_media_${studentId}`, JSON.stringify(items));
  } catch {}
}

interface Props {
  student: Student;
  principalId: string;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: number) => void;
  onBack: () => void;
}

export default function StudentEditPage({
  student,
  principalId,
  onUpdateStudent,
  onDeleteStudent,
  onBack,
}: Props) {
  const { actor } = useActor();
  const [draft, setDraft] = useState<Student>({
    ...student,
    marks: student.marks.map((m) => ({ ...m })),
    fees: student.fees.map((f) => ({ ...f })),
    attendance: student.attendance.map((a) => ({ ...a })),
  });

  const [copiedParentPwd, setCopiedParentPwd] = useState(false);
  const [copiedParentMobile, setCopiedParentMobile] = useState(false);

  const handleCopyParentPwd = () => {
    if (draft.parentPassword) {
      navigator.clipboard.writeText(String(draft.parentPassword));
      setCopiedParentPwd(true);
      setTimeout(() => setCopiedParentPwd(false), 2000);
    }
  };

  const handleCopyParentMobile = () => {
    if (draft.parentMobile) {
      navigator.clipboard.writeText(String(draft.parentMobile));
      setCopiedParentMobile(true);
      setTimeout(() => setCopiedParentMobile(false), 2000);
    }
  };

  const handleShareWhatsAppPwd = () => {
    const pwd = draft.parentPassword ?? "";
    const msg = `🏫 *Lord's International School Group*\nStudent: ${draft.name} | Class: ${draft.class}\nParent Login: Open the school portal\nPassword: ${pwd}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShareWhatsAppMobile = () => {
    const mobile = draft.parentMobile ?? "";
    const msg = `🏫 *Lord's International School Group*\nStudent: ${draft.name} | Class: ${draft.class}\nParent Login: Open the school portal\nMobile Login: ${mobile}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSendToParentPortal = () => {
    const pwd = draft.parentPassword ?? "";
    const mobile = draft.parentMobile ?? "";
    const msg = `*Lord's International School Group*\nParent Portal Login Credentials for ${draft.name} (${draft.class})\n\nLogin Password: ${pwd}\nOR Mobile Number: ${mobile}\n\nLogin at the school portal anytime from any device.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const [media, setMedia] = useState<MediaItem[]>(() => loadMedia(student.id));
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      for (const item of media) {
        const url = await getMediaBlobUrl(item.id);
        if (url && !cancelled) {
          setBlobUrls((prev) => {
            if (prev[item.id]) return prev;
            return { ...prev, [item.id]: url };
          });
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  function setField<K extends keyof Student>(key: K, value: Student[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function setMark(
    idx: number,
    field: "pt1" | "pt2" | "pt3" | "term1" | "term2",
    value: number,
  ) {
    setDraft((prev) => ({
      ...prev,
      marks: prev.marks.map((m, i) =>
        i === idx ? { ...m, [field]: value } : m,
      ),
    }));
  }

  function setFee(
    idx: number,
    field: keyof Student["fees"][0],
    value: string | number,
  ) {
    setDraft((prev) => ({
      ...prev,
      fees: prev.fees.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
    }));
  }

  function addFeeRow() {
    setDraft((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          id: Date.now(),
          type: "New Fee",
          amount: 0,
          paid: 0,
          dueDate: "-",
          paidDate: "-",
          status: "Pending",
        },
      ],
    }));
  }

  function removeFeeRow(idx: number) {
    setDraft((prev) => ({
      ...prev,
      fees: prev.fees.filter((_, i) => i !== idx),
    }));
  }

  function setAttendance(idx: number, status: string) {
    setDraft((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a, i) =>
        i === idx ? { ...a, status } : a,
      ),
    }));
  }

  function addAttendanceRow() {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const dayStr = today
      .toLocaleDateString("en-IN", { weekday: "short" })
      .slice(0, 3);
    setDraft((prev) => ({
      ...prev,
      attendance: [
        ...prev.attendance,
        { date: dateStr, day: dayStr, status: "Present" },
      ],
    }));
  }

  function addMarkRow() {
    setDraft((prev) => ({
      ...prev,
      marks: [
        ...prev.marks,
        {
          subject: "New Subject",
          pt1: 0,
          pt2: 0,
          pt3: 0,
          term1: 0,
          term2: 0,
          max: 100,
        },
      ],
    }));
  }

  function removeMarkRow(idx: number) {
    setDraft((prev) => ({
      ...prev,
      marks: prev.marks.filter((_, i) => i !== idx),
    }));
  }

  function handleSend() {
    // Update React state (triggers useEffect save to ICP in background)
    onUpdateStudent(draft);

    // Immediately write updated student into the students array in localStorage
    // so parent login works instantly without waiting for React useEffect
    try {
      const allStudents: {
        id: number;
        parentPassword?: string;
        parentMobile?: string;
      }[] = JSON.parse(
        localStorage.getItem(`lords_students_${principalId}`) ?? "[]",
      );
      const idx = allStudents.findIndex((s) => s.id === draft.id);
      if (idx !== -1) {
        allStudents[idx] = { ...allStudents[idx], ...draft };
      } else {
        allStudents.push(draft);
      }
      localStorage.setItem(
        `lords_students_${principalId}`,
        JSON.stringify(allStudents),
      );
      // Instant broadcast so parent tabs refresh immediately
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `lords_students_${principalId}`,
          newValue: JSON.stringify(allStudents),
        }),
      );
    } catch {
      // fallback: broadcast with current value
      const raw = localStorage.getItem(`lords_students_${principalId}`);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `lords_students_${principalId}`,
          newValue: raw ?? "[]",
        }),
      );
    }
    toast.success(`${draft.name}'s data saved and sent to parents!`);
  }

  async function handleUploadMedia(file: File, replaceItem?: MediaItem) {
    const isVideo = file.type.startsWith("video/");
    const fileType: "photo" | "video" = isVideo ? "video" : "photo";
    try {
      const blobReferenceId = crypto.randomUUID();
      const newItem: MediaItem = {
        id: blobReferenceId,
        blobReferenceId,
        url: "",
        fileType,
        caption: replaceItem ? replaceItem.caption : "",
        uploadedAt: new Date().toISOString(),
      };

      if (replaceItem) {
        await deleteMediaBlob(replaceItem.id);
        actor?.deleteMedia(replaceItem.blobReferenceId).catch(() => {});
      }
      await saveMediaBlob(blobReferenceId, file);

      // Generate blob URL and store in state
      const objUrl = URL.createObjectURL(file);
      setBlobUrls((prev) => ({ ...prev, [blobReferenceId]: objUrl }));

      let updatedMedia: MediaItem[];
      if (replaceItem) {
        updatedMedia = media.map((m) =>
          m.id === replaceItem.id ? newItem : m,
        );
      } else {
        updatedMedia = [...media, newItem];
      }

      setMedia(updatedMedia);
      saveMedia(student.id, updatedMedia);

      actor
        ?.addMedia({
          studentId: BigInt(student.id),
          fileType: fileType === "photo" ? FileType.photo : FileType.video,
          timestamp: newItem.uploadedAt,
          caption: newItem.caption,
          blobReferenceId,
        })
        .catch(() => {});

      toast.success(replaceItem ? "Media replaced!" : "Media uploaded!");
    } catch {
      toast.error("Failed to save media. Storage quota may be exceeded.");
    }
  }

  async function handleDeleteMedia(item: MediaItem) {
    const updatedMedia = media.filter((m) => m.id !== item.id);
    setMedia(updatedMedia);
    saveMedia(student.id, updatedMedia);
    deleteMediaBlob(item.id).catch(() => {});
    actor?.deleteMedia(item.blobReferenceId).catch(() => {});
    setBlobUrls((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    toast.success("Media deleted.");
  }

  async function handleSaveCaption(item: MediaItem, newCaption: string) {
    const updatedMedia = media.map((m) =>
      m.id === item.id ? { ...m, caption: newCaption } : m,
    );
    setMedia(updatedMedia);
    saveMedia(student.id, updatedMedia);
    setEditingCaption(null);
    actor?.updateCaption(item.blobReferenceId, newCaption).catch(() => {});
    toast.success("Caption updated.");
  }

  const totalPresent = draft.attendance.filter(
    (a) => a.status === "Present",
  ).length;
  const totalLate = draft.attendance.filter((a) => a.status === "Late").length;
  const totalAbsent = draft.attendance.filter(
    (a) => a.status === "Absent",
  ).length;
  const attPct = draft.attendance.length
    ? Math.round((totalPresent / draft.attendance.length) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            data-ocid="student_edit.cancel_button"
            onClick={onBack}
            className="gap-1.5"
          >
            <ArrowLeft size={14} />
            Back to Students
          </Button>
          <div className="flex items-center gap-3 ml-1">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {draft.profilePicture ? (
                <img
                  src={draft.profilePicture}
                  alt={draft.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                draft.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{draft.name}</h2>
              <p className="text-sm text-gray-500">
                Class {draft.class} · Roll #{draft.rollNo}
              </p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={14} />
              Delete Student
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {student.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {student.name}'s record from the
                school portal. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="student_edit.delete_cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="student_edit.delete_confirm_button"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  toast.success(`${student.name} has been removed.`);
                  onDeleteStudent(student.id);
                }}
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs defaultValue="profile">
          <TabsList className="w-full rounded-none border-b border-gray-200 bg-gray-50 h-auto p-0">
            {["profile", "marks", "fees", "attendance", "media"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                data-ocid={`student_edit.${t}_tab`}
                className="flex-1 rounded-none py-3 text-sm capitalize data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl select-none">
                  {draft.profilePicture ? (
                    <img
                      src={draft.profilePicture}
                      alt={draft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    draft.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  data-ocid="student_edit.upload_button"
                  onClick={() => {
                    const input = document.getElementById(
                      `profile-pic-input-${draft.id}`,
                    );
                    if (input) (input as HTMLInputElement).click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-md transition-colors"
                  title="Upload profile picture"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <input
                  id={`profile-pic-input-${draft.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setDraft((prev) => ({
                        ...prev,
                        profilePicture: ev.target?.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click the camera icon to upload a profile photo
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(
                [
                  ["name", "Full Name", "text"],
                  ["class", "Class", "text"],
                  ["rollNo", "Roll Number", "number"],
                  ["dob", "Date of Birth", "text"],
                  ["bloodGroup", "Blood Group", "text"],
                  ["admissionYear", "Admission Year", "text"],
                  ["phone", "Phone Number", "text"],
                  ["email", "Email Address", "email"],
                  ["parentName", "Parent/Guardian Name", "text"],
                  ["parentPhone", "Parent Phone", "text"],
                ] as [keyof Student, string, string][]
              ).map(([key, label, type]) => (
                <div key={key}>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">
                    {label}
                  </Label>
                  <Input
                    data-ocid={`student_edit.${key}_input`}
                    type={type}
                    value={String(draft[key])}
                    onChange={(e) =>
                      setField(
                        key,
                        (type === "number"
                          ? Number(e.target.value)
                          : e.target.value) as Student[typeof key],
                      )
                    }
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Address
                </Label>
                <Input
                  data-ocid="student_edit.address_input"
                  value={draft.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Student Login Password
                </Label>
                <Input
                  data-ocid="student_edit.password_input"
                  type="text"
                  placeholder="Set a password for this student"
                  value={draft.password ?? ""}
                  onChange={(e) => setField("password", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Students use this password to log in to their dashboard.
                </p>
              </div>

              {/* Parent Login Credentials — enhanced section */}
              <div className="sm:col-span-2">
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: "oklch(0.25 0.10 265 / 0.25)",
                    background: "oklch(0.97 0.02 265)",
                  }}
                >
                  {/* Section header */}
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 border-b"
                    style={{
                      borderColor: "oklch(0.25 0.10 265 / 0.18)",
                      background: "oklch(0.25 0.10 265 / 0.06)",
                    }}
                  >
                    <Shield
                      size={15}
                      style={{ color: "oklch(0.35 0.12 265)" }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.25 0.10 265)" }}
                    >
                      Parent Login Credentials
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "oklch(0.72 0.18 80 / 0.20)",
                        color: "oklch(0.45 0.18 80)",
                      }}
                    >
                      Secure
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Password field */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Parent Login Password
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          data-ocid="student_edit.parent_password_input"
                          type="text"
                          placeholder="Enter parent login password"
                          value={draft.parentPassword ?? ""}
                          onChange={(e) =>
                            setField("parentPassword", e.target.value)
                          }
                          className="font-mono tracking-widest"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-ocid="student_edit.copy_parent_password_button"
                          onClick={handleCopyParentPwd}
                          title="Copy parent password"
                          className="shrink-0 px-3"
                          style={
                            copiedParentPwd
                              ? {
                                  color: "oklch(0.55 0.18 150)",
                                  borderColor: "oklch(0.55 0.18 150 / 0.4)",
                                }
                              : {}
                          }
                        >
                          <Copy size={14} />
                          <span className="ml-1 text-xs">
                            {copiedParentPwd ? "Copied!" : "Copy"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-ocid="student_edit.share_parent_password_button"
                          onClick={handleShareWhatsAppPwd}
                          title="Share via WhatsApp"
                          className="shrink-0 px-3 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Share2 size={14} />
                          <span className="ml-1 text-xs">WhatsApp</span>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {`${(draft.parentPassword ?? "").length} chars — unique password for this student`}
                      </p>
                    </div>

                    {/* Mobile field */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Mobile Number (alternate login)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          data-ocid="student_edit.parent_mobile_input"
                          type="text"
                          placeholder="10-digit mobile number"
                          value={draft.parentMobile ?? ""}
                          onChange={(e) =>
                            setField(
                              "parentMobile",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="font-mono tracking-widest"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-ocid="student_edit.copy_parent_mobile_button"
                          onClick={handleCopyParentMobile}
                          title="Copy mobile number"
                          className="shrink-0 px-3"
                          style={
                            copiedParentMobile
                              ? {
                                  color: "oklch(0.55 0.18 150)",
                                  borderColor: "oklch(0.55 0.18 150 / 0.4)",
                                }
                              : {}
                          }
                        >
                          <Copy size={14} />
                          <span className="ml-1 text-xs">
                            {copiedParentMobile ? "Copied!" : "Copy"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-ocid="student_edit.share_parent_mobile_button"
                          onClick={handleShareWhatsAppMobile}
                          title="Share via WhatsApp"
                          className="shrink-0 px-3 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Share2 size={14} />
                          <span className="ml-1 text-xs">WhatsApp</span>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {`${(draft.parentMobile ?? "").length}/10 digits — parent can also log in with this`}
                      </p>
                    </div>

                    {/* Send to Parent Portal button */}
                    <Button
                      type="button"
                      data-ocid="student_edit.send_to_parent_portal_button"
                      onClick={handleSendToParentPortal}
                      className="w-full gap-2 font-semibold"
                      style={{
                        background: "oklch(0.25 0.10 265)",
                        color: "white",
                      }}
                    >
                      <Send size={15} />
                      Send to Parent Portal (via WhatsApp)
                    </Button>
                    <p className="text-xs text-center text-muted-foreground -mt-2">
                      Sends login instructions + credentials to parent via
                      WhatsApp in one tap
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Marks Tab */}
          <TabsContent value="marks" className="p-6">
            {/* Rank Field */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <Label className="text-sm font-semibold text-indigo-800 whitespace-nowrap">
                Class Rank
              </Label>
              <Input
                data-ocid="student_edit.rank_input"
                type="number"
                min={1}
                value={draft.rank ?? ""}
                onChange={(e) => setField("rank", Number(e.target.value))}
                className="w-24 h-8 text-sm"
              />
              <span className="text-sm text-indigo-600">
                Set the student's class rank
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      PT 1
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      PT 2
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      PT 3
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Term 1
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Term 2
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Max
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Grade
                    </th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.marks.map((m, idx) => {
                    const total = m.pt1 + m.pt2 + m.pt3 + m.term1 + m.term2;
                    const pct = Math.round((total / (m.max * 5)) * 100);
                    const gradeLabel =
                      pct >= 90
                        ? "A+"
                        : pct >= 80
                          ? "A"
                          : pct >= 70
                            ? "B"
                            : pct >= 60
                              ? "C"
                              : "D";
                    const gradeColor =
                      pct >= 75
                        ? "bg-green-100 text-green-700"
                        : pct >= 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700";
                    return (
                      <tr
                        key={`mark-${m.subject}-${idx}`}
                        data-ocid={`student_edit.marks.row.${idx + 1}`}
                      >
                        <td className="py-3 pr-3">
                          <Input
                            value={m.subject}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                marks: prev.marks.map((mk, i) =>
                                  i === idx
                                    ? { ...mk, subject: e.target.value }
                                    : mk,
                                ),
                              }))
                            }
                            className="w-32 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <Input
                            type="number"
                            min={0}
                            max={m.max}
                            value={m.pt1}
                            onChange={(e) =>
                              setMark(idx, "pt1", Number(e.target.value))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <Input
                            type="number"
                            min={0}
                            max={m.max}
                            value={m.pt2}
                            onChange={(e) =>
                              setMark(idx, "pt2", Number(e.target.value))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <Input
                            type="number"
                            min={0}
                            max={m.max}
                            value={m.pt3}
                            onChange={(e) =>
                              setMark(idx, "pt3", Number(e.target.value))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <Input
                            type="number"
                            min={0}
                            max={m.max}
                            value={m.term1}
                            onChange={(e) =>
                              setMark(idx, "term1", Number(e.target.value))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <Input
                            type="number"
                            min={0}
                            max={m.max}
                            value={m.term2}
                            onChange={(e) =>
                              setMark(idx, "term2", Number(e.target.value))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <Badge className="bg-indigo-100 text-indigo-700 border-0 font-semibold">
                            {total}
                          </Badge>
                        </td>
                        <td className="py-3 pr-3">
                          <Input
                            type="number"
                            min={1}
                            value={m.max}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                marks: prev.marks.map((mk, i) =>
                                  i === idx
                                    ? { ...mk, max: Number(e.target.value) }
                                    : mk,
                                ),
                              }))
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <Badge className={gradeColor}>{gradeLabel}</Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMarkRow(idx)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMarkRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Subject
            </Button>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Amount (₹)
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Paid (₹)
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Due Date
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.fees.map((f, idx) => (
                    <tr
                      key={f.id}
                      data-ocid={`student_edit.fees.row.${idx + 1}`}
                    >
                      <td className="py-3 pr-4">
                        <Input
                          value={f.type}
                          onChange={(e) => setFee(idx, "type", e.target.value)}
                          className="w-36 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          value={f.amount}
                          onChange={(e) =>
                            setFee(idx, "amount", Number(e.target.value))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="number"
                          value={f.paid}
                          onChange={(e) =>
                            setFee(idx, "paid", Number(e.target.value))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          value={f.dueDate}
                          onChange={(e) =>
                            setFee(idx, "dueDate", e.target.value)
                          }
                          className="w-28 h-8 text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={f.status}
                          onValueChange={(v) => setFee(idx, "status", v)}
                        >
                          <SelectTrigger
                            data-ocid={`student_edit.fees.select.${idx + 1}`}
                            className="w-32 h-8 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeRow(idx)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFeeRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Fee Row
            </Button>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Present",
                  value: totalPresent,
                  color: "text-green-600 bg-green-50",
                },
                {
                  label: "Absent",
                  value: totalAbsent,
                  color: "text-red-600 bg-red-50",
                },
                {
                  label: "Late",
                  value: totalLate,
                  color: "text-yellow-600 bg-yellow-50",
                },
                {
                  label: "Attendance",
                  value: `${attPct}%`,
                  color: "text-indigo-600 bg-indigo-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-lg p-3 ${stat.color}`}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Day
                    </th>
                    <th className="text-left pb-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {draft.attendance.map((a, idx) => (
                    <tr
                      key={`${a.date}-${idx}`}
                      data-ocid={`student_edit.attendance.row.${idx + 1}`}
                    >
                      <td className="py-2.5 pr-4">
                        <Input
                          value={a.date}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              attendance: prev.attendance.map((att, i) =>
                                i === idx
                                  ? { ...att, date: e.target.value }
                                  : att,
                              ),
                            }))
                          }
                          className="w-24 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2.5 pr-4">
                        <Input
                          value={a.day}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              attendance: prev.attendance.map((att, i) =>
                                i === idx
                                  ? { ...att, day: e.target.value }
                                  : att,
                              ),
                            }))
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2.5">
                        <Select
                          value={a.status}
                          onValueChange={(v) => setAttendance(idx, v)}
                        >
                          <SelectTrigger
                            data-ocid={`student_edit.attendance.select.${idx + 1}`}
                            className="w-32 h-8 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addAttendanceRow}
              className="mt-4 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              + Add Attendance Row
            </Button>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="p-6">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleUploadMedia(file);
                e.target.value = "";
              }}
            />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const replaceItem = media.find((m) => m.id === replacingId);
                if (file && replaceItem)
                  await handleUploadMedia(file, replaceItem);
                setReplacingId(null);
                e.target.value = "";
              }}
            />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Student Media</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload photos and videos for {draft.name}. Students can view
                  these in their portal.
                </p>
              </div>
              <Button
                data-ocid="student_edit.media.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload size={15} />
                Upload Media
              </Button>
            </div>

            {media.length === 0 ? (
              <div
                data-ocid="student_edit.media.empty_state"
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Film size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  No media uploaded yet
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Click "Upload Media" to add photos or videos for this student.
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  Max file size: 100MB per file
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map((item, idx) => (
                  <div
                    key={item.id}
                    data-ocid={`student_edit.media.item.${idx + 1}`}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group"
                  >
                    <div className="relative bg-black aspect-video">
                      {blobUrls[item.id] ? (
                        item.fileType === "photo" ? (
                          <img
                            src={blobUrls[item.id]}
                            alt={item.caption || "Photo"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={blobUrls[item.id]}
                            controls
                            className="w-full h-full object-contain"
                          >
                            <track kind="captions" />
                          </video>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.fileType === "photo"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.fileType === "photo" ? (
                            <ImageIcon size={11} />
                          ) : (
                            <PlayCircle size={11} />
                          )}
                          {item.fileType === "photo" ? "Photo" : "Video"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 space-y-2">
                      {editingCaption === item.id ? (
                        <div className="flex gap-2">
                          <Input
                            data-ocid={`student_edit.media.caption_input.${idx + 1}`}
                            value={captionDraft}
                            onChange={(e) => setCaptionDraft(e.target.value)}
                            placeholder="Add a caption..."
                            className="h-8 text-sm flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveCaption(item, captionDraft);
                              if (e.key === "Escape") setEditingCaption(null);
                            }}
                          />
                          <Button
                            size="sm"
                            data-ocid={`student_edit.media.save_button.${idx + 1}`}
                            className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() =>
                              handleSaveCaption(item, captionDraft)
                            }
                          >
                            <Save size={13} />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-indigo-600 text-left w-full transition-colors"
                          onClick={() => {
                            setEditingCaption(item.id);
                            setCaptionDraft(item.caption);
                          }}
                        >
                          {item.caption || (
                            <span className="text-gray-400 italic">
                              Click to add caption...
                            </span>
                          )}
                        </button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-ocid={`student_edit.media.edit_button.${idx + 1}`}
                          className="flex-1 h-8 gap-1.5 text-xs border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
                          onClick={() => {
                            setReplacingId(item.id);
                            replaceInputRef.current?.click();
                          }}
                        >
                          <Edit2 size={12} />
                          Replace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-ocid={`student_edit.media.delete_button.${idx + 1}`}
                          className="flex-1 h-8 gap-1.5 text-xs border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteMedia(item)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <Button
          variant="outline"
          data-ocid="student_edit.back_button"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          data-ocid="student_edit.save_button"
          onClick={handleSend}
          className="gap-2"
          style={{ background: "oklch(0.25 0.10 265)", color: "white" }}
        >
          <Send size={15} />
          Send (Save &amp; Send to Parents)
        </Button>
      </div>
    </div>
  );
}
