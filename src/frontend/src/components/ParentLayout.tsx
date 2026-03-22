import { GraduationCap, LogOut, Users } from "lucide-react";

interface Props {
  studentName: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function ParentLayout({
  studentName,
  onLogout,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-950 text-white px-4 lg:px-8 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">
            Lord's International School Group
          </div>
          <div className="text-indigo-300 text-xs">Parent Portal</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-800 rounded-lg px-3 py-1.5">
            <Users size={14} className="text-indigo-300" />
            <span className="text-sm font-medium">{studentName}</span>
          </div>
          <button
            type="button"
            data-ocid="parent.logout_button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-indigo-300 hover:text-white text-sm transition-colors px-2 py-1 rounded"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 lg:p-8">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-6">
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
