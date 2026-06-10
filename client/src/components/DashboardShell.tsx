import Sidebar from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-0 md:ml-64 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}
