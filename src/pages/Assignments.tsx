import { AppLayout } from "@/components/layout/AppLayout";
import { useCortex, cortexStore } from "@/store/cortex";
import { StatusBadge, PriorityBadge } from "@/components/common/Badges";
import { ArrowRight, Clock, RefreshCw, Hand } from "lucide-react";
import { toast } from "sonner";

export default function Assignments() {
  const { assignments, requests, volunteers, loading } = useCortex();

  // Show loading state
  if (loading) {
    return (
      <AppLayout title="Assignments" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Assignments" subtitle="Smart Allocation decisions · timeline view">
      <div className="space-y-3">
        {assignments.map((a) => {
          const req = requests.find((r) => r.id === a.requestId);
          const vol = volunteers.find((v) => v.id === a.volunteerId);
          if (!req || !vol) return null;
          return (
            <div key={a.id} className="glass-card p-5 animate-fade-in-up">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                  <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Request</div>
                    <div className="font-display font-bold text-lg">{req.id}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{req.type} · {req.location}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent" />
                  <div className="p-3 rounded-xl border border-accent/30 bg-accent/5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Volunteer</div>
                    <div className="font-display font-bold text-lg">{vol.id}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{vol.name} · {vol.skill}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PriorityBadge priority={req.priority} />
                  <StatusBadge status={req.status} />
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="font-mono">ETA {a.eta}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => toast("Reassignment requested", { description: `Searching nearest volunteer for ${req.id}` })}
                    className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:border-accent hover:text-accent transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reassign
                  </button>
                  <button
                    onClick={() => { cortexStore.updateRequestStatus(req.id, "Resolved"); toast.success(`${req.id} resolved`); }}
                    className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5"
                  >
                    <Hand className="h-3.5 w-3.5" /> Override
                  </button>
                </div>
              </div>

              <div className="mt-4 relative">
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-accent"
                    style={{ width: req.status === "Resolved" ? "100%" : req.status === "In Progress" ? "65%" : "30%" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  <span>Dispatched · {a.startedAt}</span>
                  <span>En route</span>
                  <span>On site</span>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="glass-card p-12 text-center text-muted-foreground">
            No active assignments. Dispatch from the Live Requests page.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
