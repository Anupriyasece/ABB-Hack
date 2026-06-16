import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageSquare, 
  Network, 
  GitBranch, 
  Shield, 
  AlertCircle, 
  Zap,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Upload
} from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { href: "/dashboard/:programId/home", label: "Home", icon: Home },
  { href: "/dashboard/:programId/narratives", label: "Narratives", icon: MessageSquare },
  { href: "/dashboard/:programId/knowledge-graph", label: "Knowledge Graph", icon: Network },
  { href: "/dashboard/:programId/process-flow", label: "Process Flow", icon: GitBranch },
  { href: "/dashboard/:programId/safety", label: "Safety", icon: Shield },
  { href: "/dashboard/:programId/alarms", label: "Alarms", icon: AlertCircle },
  { href: "/dashboard/:programId/digital-twin", label: "Digital Twin", icon: Zap },
  { href: "/upload", label: "Upload File", icon: Upload },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [, params] = useRoute("/dashboard/:programId/:page");
  const programId = params?.programId;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">PSIP</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">PLC Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isAbsolute = item.href.startsWith("/upload");
            const isActive = isAbsolute ? params?.page === "upload" : params?.page === item.href.split("/").pop();
            const href = isAbsolute ? "/upload" : `/dashboard/${programId}/${item.href.split("/").pop()}`;

            return (
              <a
                key={item.href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
          {/* Theme Toggle */}
          <Button
            onClick={toggleTheme}
            variant="outline"
            className="w-full justify-start gap-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
          </Button>

          {/* User Section */}
          {user && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
