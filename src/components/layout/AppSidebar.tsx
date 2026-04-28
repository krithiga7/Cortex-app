import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Radio,
  Users,
  Activity,
  BarChart3,
  Settings as SettingsIcon,
  Brain,
  Upload,
  Target,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Live Requests", url: "/requests", icon: Radio },
  { title: "Volunteers", url: "/volunteers", icon: Users },
  { title: "Assignments", url: "/assignments", icon: Activity },
  { title: "Data Ingestion", url: "/data-ingestion", icon: Upload },
  { title: "Matching Engine", url: "/matching-engine", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar">
      <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 pulse-dot" />
        </div>
        <div>
          <div className="font-display font-bold text-lg tracking-tight text-foreground">CORTEX</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Resource Engine</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Operations
        </div>
        {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.2)]"
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-3 p-4 rounded-xl border border-sidebar-border bg-blue-50">
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Engine Online</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Real-Time Decision Engine running. Smart Allocation active.
        </p>
      </div>
    </aside>
  );
}
