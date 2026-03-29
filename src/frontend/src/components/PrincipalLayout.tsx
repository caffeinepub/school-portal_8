import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Info,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  NotebookPen,
  Send,
  Server,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const studentNavItems = [
  { id: "list", label: "All Students", icon: Users },
  { id: "class-view", label: "Class View", icon: LayoutGrid },
  { id: "add", label: "Add Student", icon: UserPlus },
  { id: "info", label: "School Info", icon: Info },
];

const schoolNavItems = [
  { id: "holidays", label: "Holidays", icon: Calendar },
  { id: "school-syllabus", label: "Syllabus", icon: BookOpen },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "diary", label: "Diary", icon: NotebookPen },
  { id: "exam-timetable", label: "Exam Timetable", icon: ClipboardList },
  { id: "test-marks", label: "Test Marks", icon: FileText },
];

const serverNavItem = [{ id: "server", label: "Server", icon: Server }];

const communicationNavItems = [
  { id: "doubt-chat", label: "Doubt Chat", icon: MessageCircle },
  { id: "send-message", label: "Send Message", icon: Send },
];

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  pageLabel?: string;
  principalName?: string;
}

export default function PrincipalLayout({
  currentPage,
  onPageChange,
  onLogout,
  children,
  pageLabel,
  principalName = "Principal",
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = [
    ...studentNavItems,
    ...schoolNavItems,
    ...communicationNavItems,
    ...serverNavItem,
  ];
  const currentLabel =
    pageLabel ??
    allItems.find((n) => n.id === currentPage)?.label ??
    "Student Management";

  const renderNavSection = (items: typeof studentNavItems) =>
    items.map(({ id, label, icon: Icon }) => (
      <button
        type="button"
        key={id}
        data-ocid="principal_nav.link"
        onClick={() => {
          onPageChange(id);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          currentPage === id
            ? "bg-indigo-600 text-white font-medium"
            : "text-indigo-300 hover:bg-indigo-800 hover:text-white"
        }`}
      >
        <Icon size={17} className="flex-shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    ));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Enter" && setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-indigo-950 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-indigo-800">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate">
              Lord&apos;s International School Group
            </div>
            <div className="text-indigo-300 text-xs font-medium mt-0.5">
              {principalName}
            </div>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} className="text-indigo-300" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
              Students
            </p>
            <div className="space-y-0.5">
              {renderNavSection(studentNavItems)}
            </div>
          </div>

          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
              School Management
            </p>
            <div className="space-y-0.5">
              {renderNavSection(schoolNavItems)}
            </div>
          </div>

          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
              Communication
            </p>
            <div className="space-y-0.5">
              {renderNavSection(communicationNavItems)}
            </div>
          </div>

          <div>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
              Server
            </p>
            <div className="space-y-0.5">{renderNavSection(serverNavItem)}</div>
          </div>
        </nav>

        <div className="p-3 border-t border-indigo-800">
          <button
            type="button"
            data-ocid="principal.logout_button"
            onClick={() => {
              onLogout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-indigo-300 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-800 text-base">
            {currentLabel}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="hidden sm:block text-sm text-gray-700 font-medium">
              {principalName}
            </span>
            <button
              type="button"
              data-ocid="principal.header_logout_button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm transition-colors px-2 py-1 rounded border border-red-200 hover:bg-red-50"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
