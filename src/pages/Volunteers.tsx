import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCortex, cortexStore } from "@/store/cortex";
import { AvailabilityBadge } from "@/components/common/Badges";
import { Volunteer } from "@/data/mock";
import { X, Award, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Volunteers() {
  const { volunteers, loading } = useCortex();
  const [sel, setSel] = useState<Volunteer | null>(null);

  // Show loading state
  if (loading) {
    return (
      <AppLayout title="Volunteer Network" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading volunteers...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Volunteer Network" subtitle="Trust-scored field operatives · live availability">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Skill</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Trust</th>
                <th className="text-right px-4 py-3">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSel(v)}
                  className={cn(
                    "border-t border-border cursor-pointer hover:bg-accent/5 transition-colors",
                    sel?.id === v.id && "bg-accent/10"
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.skill}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.location}</td>
                  <td className="px-4 py-3"><AvailabilityBadge value={v.availability} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${v.trust}%` }} />
                      </div>
                      <span className="text-xs font-mono">{v.trust}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); cortexStore.toggleVolunteerAvailability(v.id); }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-border hover:border-accent hover:text-accent transition"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sel ? (
          <aside className="glass-card p-5 h-fit sticky top-24 animate-slide-in-right">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-accent grid place-items-center text-accent-foreground font-display font-bold text-lg">
                  {sel.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-display text-lg font-bold">{sel.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{sel.id} · {sel.skill}</div>
                </div>
              </div>
              <button onClick={() => setSel(null)} className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-card">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Mini icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Tasks" value={sel.tasksCompleted} />
              <Mini icon={<Clock className="h-3.5 w-3.5" />} label="Avg" value={`${sel.avgResponse}m`} />
              <Mini icon={<Award className="h-3.5 w-3.5" />} label="Trust" value={`${sel.trust}%`} accent />
            </div>

            <div className="p-3 rounded-xl border border-border bg-background/40">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Reliability (last 7d)</div>
              <div className="flex items-end gap-1 h-20">
                {[60, 72, 68, 80, 78, 88, sel.trust].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-accent/30 to-accent" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </aside>
        ) : (
          <aside className="glass-card p-6 h-fit text-center text-sm text-muted-foreground">
            Select a volunteer to view performance profile.
          </aside>
        )}
      </div>
    </AppLayout>
  );
}

function Mini({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="p-2.5 rounded-lg border border-border bg-background/40">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
        {icon}{label}
      </div>
      <div className={cn("mt-1 font-display font-bold", accent ? "text-accent text-lg" : "text-foreground text-base")}>{value}</div>
    </div>
  );
}
