import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Brain,
  Upload,
} from "lucide-react";

const volunteerItems = [
  { title: "My Dashboard", url: "/volunteer-dashboard", icon: LayoutDashboard },
  { title: "My Assignments", url: "/volunteer-assignments", icon: Activity },
  { title: "My Performance", url: "/volunteer-analytics", icon: BarChart3 },
  { title: "Upload Proof", url: "/volunteer-upload", icon: Upload },
];

export function VolunteerSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar">
      <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-md">
            <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 pulse-dot" />
        </div>
        <div>
          <div className="font-display font-bold text-lg tracking-tight text-foreground">CORTEX</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Volunteer Portal</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          My Tasks
        </div>
        {volunteerItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/volunteer-dashboard"}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.2)]"
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-3 p-4 rounded-xl border border-sidebar-border bg-green-50">
        <div className="flex items-center gap-2 text-xs text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Volunteer Online</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Ready for assignments. Stay available for emergencies.
        </p>
      </div>
    </aside>
  );
}
