import { Bell, Search, Zap, LogOut, User } from "lucide-react";
import { authStore } from "@/store/auth";
import { useAuth } from "@/store/auth";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-sm text-muted-foreground w-72 shadow-sm">
            <Search className="h-4 w-4" />
            <span className="text-xs">Search requests, volunteers, IDs…</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-[11px] font-mono uppercase tracking-wider">Smart Alloc · {now}</span>
          </div>

          <button className="relative h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-gray-50 transition-colors">
            <Bell className="h-4 w-4 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 pulse-dot" />
          </button>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <User className="h-4 w-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="h-9 w-9 grid place-items-center rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
