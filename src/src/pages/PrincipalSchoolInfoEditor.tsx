import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Check,
  ImagePlus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LS_KEY = "lords_school_info";

export interface DetailRow {
  label: string;
  value: string;
  type: "address" | "phone" | "email" | "website";
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  photo: string | null;
  details: DetailRow[];
}

export interface CustomSection {
  id: string;
  title: string;
  body: string;
  photo: string | null;
}

export interface SchoolInfoData {
  groupName: string;
  tagline: string;
  aboutText: string;
  branches: Branch[];
  customSections: CustomSection[];
}

const DEFAULT_DATA: SchoolInfoData = {
  groupName: "Lord's International School Group",
  tagline: "CBSE Affiliated · Excellence in Education",
  aboutText:
    "Lord's International School Group is a group of CBSE-affiliated institutions spread across Rajasthan, committed to providing quality education and holistic development of students.",
  branches: [
    {
      id: "alwar",
      name: "Lords International School, Alwar (Chikani)",
      description:
        "A prominent CBSE-affiliated day-cum-residential school located on the Alwar-Bhiwadi Highway.",
      photo: null,
      details: [
        {
          label: "Address",
          value: "Alwar-Bhiwadi Highway, Chikani, Alwar, Rajasthan - 301028",
          type: "address",
        },
        {
          label: "City Office",
          value: "1st Floor, Signature Tower, Scheme 10, Alwar",
          type: "address",
        },
        {
          label: "Main School",
          value: "+91 9929011007 / +91 9509891624",
          type: "phone",
        },
        {
          label: "Admission/Counseling",
          value: "+91 6350322874",
          type: "phone",
        },
        {
          label: "Email",
          value: "info@lordsschool.edu.in / principallis2005@gmail.com",
          type: "email",
        },
        { label: "Website", value: "www.lordsschool.edu.in", type: "website" },
      ],
    },
    {
      id: "churu",
      name: "Lords International School, Churu (Main City)",
      description:
        "A CBSE-affiliated senior secondary school serving the Churu district.",
      photo: null,
      details: [
        {
          label: "Address",
          value: "Bhaleri Road, Churu, Rajasthan - 331001",
          type: "address",
        },
        {
          label: "Phone",
          value: "01562-2219328 / +91 9414423066",
          type: "phone",
        },
        {
          label: "Email",
          value: "lis.churu@rediffmail.com / svermalords@gmail.com",
          type: "email",
        },
        {
          label: "Website",
          value: "www.lischuru.in / www.lordschuru.in",
          type: "website",
        },
      ],
    },
    {
      id: "sadulpur",
      name: "Lords International School, Sadulpur (Rajgarh)",
      description:
        "Located in the Rajgarh tehsil of Churu, this CBSE-affiliated branch is co-educational, offering classes from Primary to Senior Secondary.",
      photo: null,
      details: [
        {
          label: "Address",
          value:
            "Hisar Road, Rajgarh (Sadulpur), Dist. Churu, Rajasthan - 331023",
          type: "address",
        },
        {
          label: "Phone",
          value: "+91 9414423066 / +91 9413204098",
          type: "phone",
        },
      ],
    },
  ],
  customSections: [],
};

function loadData(): SchoolInfoData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as SchoolInfoData;
  } catch {}
  return DEFAULT_DATA;
}

function saveData(data: SchoolInfoData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

function SavedBadge({ show }: { show: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-emerald-600 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <Check size={12} /> Saved
    </span>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  data,
  onChange,
}: {
  data: SchoolInfoData;
  onChange: (patch: Partial<SchoolInfoData>) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    toast.success("School overview saved!");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600" />
            School Overview
          </span>
          <SavedBadge show={saved} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="groupName">School Group Name</Label>
          <Input
            id="groupName"
            data-ocid="school_overview.input"
            value={data.groupName}
            onChange={(e) => onChange({ groupName: e.target.value })}
            placeholder="School group name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            data-ocid="school_tagline.input"
            value={data.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. CBSE Affiliated · Excellence in Education"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="aboutText">About the Group</Label>
          <Textarea
            id="aboutText"
            data-ocid="school_about.textarea"
            value={data.aboutText}
            onChange={(e) => onChange({ aboutText: e.target.value })}
            rows={5}
            placeholder="Write about the school group..."
          />
        </div>
        <Button
          data-ocid="school_overview.save_button"
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Save Overview
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Branch Card ────────────────────────────────────────────────────────────────
function BranchCard({
  branch,
  index,
  onUpdate,
  onDelete,
}: {
  branch: Branch;
  index: number;
  onUpdate: (b: Branch) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof Branch>(key: K, value: Branch[K]) =>
    onUpdate({ ...branch, [key]: value });

  const updateDetail = (i: number, patch: Partial<DetailRow>) =>
    onUpdate({
      ...branch,
      details: branch.details.map((d, idx) =>
        idx === i ? { ...d, ...patch } : d,
      ),
    });

  const addDetail = () =>
    onUpdate({
      ...branch,
      details: [...branch.details, { label: "", value: "", type: "phone" }],
    });

  const removeDetail = (i: number) =>
    onUpdate({
      ...branch,
      details: branch.details.filter((_, idx) => idx !== i),
    });

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    updateField("photo", b64);
    toast.success("Photo uploaded");
  };

  return (
    <Card className="border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
              {index + 1}
            </span>
            Branch {index + 1}
          </span>
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <span className="text-xs text-red-500">Delete branch?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 px-2 text-xs"
                data-ocid="branch.confirm_button"
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                data-ocid="branch.cancel_button"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              data-ocid="branch.delete_button"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={13} /> Delete
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">
            Branch Photo / Thumbnail
          </Label>
          {branch.photo && (
            <div className="relative inline-block">
              <img
                src={branch.photo}
                alt="branch"
                className="h-32 rounded-lg object-cover border border-indigo-100"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-red-500 hover:text-red-700"
                data-ocid="branch.delete_button"
                onClick={() => updateField("photo", null)}
              >
                <X size={13} />
              </button>
            </div>
          )}
          <div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              data-ocid="branch.upload_button"
              onClick={() => photoRef.current?.click()}
            >
              <ImagePlus size={13} />
              {branch.photo ? "Replace Photo" : "Upload Photo"}
            </Button>
          </div>
        </div>

        {/* Name & Description */}
        <div className="space-y-1.5">
          <Label className="text-xs">Branch Name</Label>
          <Input
            value={branch.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Branch name"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={branch.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
            placeholder="Brief description of this branch"
          />
        </div>

        {/* Details table */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">
            Contact & Address Details
          </Label>
          <div className="space-y-2">
            {branch.details.map((detail, i) => (
              <div
                key={detail.label + String(i)}
                className="flex gap-2 items-start"
              >
                <Input
                  className="w-28 flex-shrink-0 text-xs"
                  value={detail.label}
                  onChange={(e) => updateDetail(i, { label: e.target.value })}
                  placeholder="Label"
                />
                <Input
                  className="flex-1 text-xs"
                  value={detail.value}
                  onChange={(e) => updateDetail(i, { value: e.target.value })}
                  placeholder="Value"
                />
                <Select
                  value={detail.type}
                  onValueChange={(v) =>
                    updateDetail(i, { type: v as DetailRow["type"] })
                  }
                >
                  <SelectTrigger className="w-24 text-xs flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="address">Address</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0 text-red-400 hover:text-red-600"
                  onClick={() => removeDetail(i)}
                >
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs"
            data-ocid="branch.secondary_button"
            onClick={addDetail}
          >
            <PlusCircle size={12} /> Add Detail Row
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Branches Tab ───────────────────────────────────────────────────────────────
function BranchesTab({
  branches,
  onChange,
}: {
  branches: Branch[];
  onChange: (branches: Branch[]) => void;
}) {
  const updateBranch = (i: number, b: Branch) =>
    onChange(branches.map((br, idx) => (idx === i ? b : br)));

  const deleteBranch = (i: number) =>
    onChange(branches.filter((_, idx) => idx !== i));

  const addBranch = () =>
    onChange([
      ...branches,
      {
        id: `branch-${Date.now()}`,
        name: "New Branch",
        description: "",
        photo: null,
        details: [],
      },
    ]);

  return (
    <div className="space-y-4">
      {branches.map((branch, i) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          index={i}
          onUpdate={(b) => updateBranch(i, b)}
          onDelete={() => deleteBranch(i)}
        />
      ))}
      <Button
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        data-ocid="branch.primary_button"
        onClick={addBranch}
      >
        <PlusCircle size={15} /> Add New Branch
      </Button>
    </div>
  );
}

// ─── Custom Section Card ────────────────────────────────────────────────────────
function SectionCard({
  section,
  index,
  onUpdate,
  onDelete,
}: {
  section: CustomSection;
  index: number;
  onUpdate: (s: CustomSection) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof CustomSection>(
    key: K,
    value: CustomSection[K],
  ) => onUpdate({ ...section, [key]: value });

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    updateField("photo", b64);
    toast.success("Photo uploaded");
  };

  return (
    <Card className="border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-indigo-600 border-indigo-200"
          >
            Section {index + 1}
          </Badge>
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <span className="text-xs text-red-500">Delete section?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 px-2 text-xs"
                data-ocid="section.confirm_button"
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                data-ocid="section.cancel_button"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              data-ocid="section.delete_button"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={13} /> Delete
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Section Title</Label>
          <Input
            value={section.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Achievements, Vision, Facilities"
            data-ocid="section.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Content</Label>
          <Textarea
            value={section.body}
            onChange={(e) => updateField("body", e.target.value)}
            rows={4}
            placeholder="Write content for this section..."
            data-ocid="section.textarea"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">
            Section Photo (optional)
          </Label>
          {section.photo && (
            <div className="relative inline-block">
              <img
                src={section.photo}
                alt="section"
                className="h-32 rounded-lg object-cover border border-indigo-100"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-red-500 hover:text-red-700"
                onClick={() => updateField("photo", null)}
              >
                <X size={13} />
              </button>
            </div>
          )}
          <div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              data-ocid="section.upload_button"
              onClick={() => photoRef.current?.click()}
            >
              <ImagePlus size={13} />
              {section.photo ? "Replace Photo" : "Upload Photo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Sections Tab ────────────────────────────────────────────────────────
function CustomSectionsTab({
  sections,
  onChange,
}: {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}) {
  const updateSection = (i: number, s: CustomSection) =>
    onChange(sections.map((sec, idx) => (idx === i ? s : sec)));

  const deleteSection = (i: number) =>
    onChange(sections.filter((_, idx) => idx !== i));

  const addSection = () =>
    onChange([
      ...sections,
      { id: `section-${Date.now()}`, title: "", body: "", photo: null },
    ]);

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <div
          data-ocid="custom_sections.empty_state"
          className="text-center py-12 text-gray-400"
        >
          <Building2 size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No custom sections yet.</p>
          <p className="text-xs mt-1">
            Add sections like achievements, vision, or facilities.
          </p>
        </div>
      )}
      {sections.map((section, i) => (
        <SectionCard
          key={section.id}
          section={section}
          index={i}
          onUpdate={(s) => updateSection(i, s)}
          onDelete={() => deleteSection(i)}
        />
      ))}
      <Button
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        data-ocid="custom_sections.primary_button"
        onClick={addSection}
      >
        <PlusCircle size={15} /> Add New Section
      </Button>
    </div>
  );
}

// ─── Main Editor ────────────────────────────────────────────────────────────────
export default function PrincipalSchoolInfoEditor() {
  const [data, setData] = useState<SchoolInfoData>(loadData);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((newData: SchoolInfoData) => {
    setData(newData);
    saveData(newData);
    setSavedIndicator(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedIndicator(false), 2000);
  }, []);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit School Information</h2>
            <p className="text-indigo-200 text-sm mt-0.5">
              Changes are auto-saved and visible to all users.
            </p>
          </div>
          <span
            className={`flex items-center gap-1.5 text-sm font-medium bg-white/20 px-3 py-1.5 rounded-full transition-opacity duration-300 ${
              savedIndicator ? "opacity-100" : "opacity-0"
            }`}
          >
            <Check size={13} /> Auto-saved
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview" data-ocid="school_info.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="branches" data-ocid="school_info.tab">
            Branches
          </TabsTrigger>
          <TabsTrigger value="custom" data-ocid="school_info.tab">
            Custom Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            data={data}
            onChange={(patch) => handleChange({ ...data, ...patch })}
          />
        </TabsContent>

        <TabsContent value="branches" className="mt-4">
          <BranchesTab
            branches={data.branches}
            onChange={(branches) => handleChange({ ...data, branches })}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <CustomSectionsTab
            sections={data.customSections}
            onChange={(customSections) =>
              handleChange({ ...data, customSections })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
