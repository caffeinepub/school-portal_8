import { Badge } from "@/components/ui/badge";
import { notifications } from "@/data/mockData";
import {
  Bell,
  BookOpen,
  CalendarX,
  ClipboardList,
  CreditCard,
  Film,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  PlayCircle,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Your Profile", icon: User },
  { id: "marks", label: "Examination Marks", icon: ClipboardList },
  { id: "records", label: "School Records", icon: FolderOpen },
  { id: "syllabus", label: "School Syllabus", icon: BookOpen },
  { id: "fees", label: "School Fees", icon: CreditCard },
  { id: "attendance", label: "Absent Record", icon: CalendarX },
  { id: "media", label: "My Photos & Videos", icon: Film },
  { id: "classes", label: "Online Classes", icon: PlayCircle },
  { id: "doubts", label: "Student Doubts", icon: HelpCircle },
  { id: "chat", label: "Teacher Chat", icon: MessageCircle },
  { id: "info", label: "School Information", icon: Info },
  { id: "notifications", label: "Notifications", icon: Bell },
];

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({
  currentPage,
  onPageChange,
  onLogout,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-900 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">
              Lord's International School Group
            </div>
            <div className="text-gray-400 text-xs">Student Portal</div>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}_link`}
              onClick={() => {
                onPageChange(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentPage === id
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
              {id === "notifications" && unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0 min-w-[20px] justify-center">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            type="button"
            data-ocid="nav.logout_button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
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
            {navItems.find((n) => n.id === currentPage)?.label || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              AS
            </div>
            <span className="hidden sm:block text-sm text-gray-700 font-medium">
              Aarav Sharma
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
