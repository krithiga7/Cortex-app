import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCortex, cortexStore } from "@/store/cortex";
import { PriorityBadge, StatusBadge } from "@/components/common/Badges";
import { Priority, RequestType, NeedRequest } from "@/data/mock";
import { Filter, Search, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const priorities: (Priority | "All")[] = ["All", "High", "Medium", "Low"];
const types: (RequestType | "All")[] = ["All", "Medical", "Food", "Shelter", "Water", "Clothes"];

export default function Requests() {
  const { requests, volunteers, loading } = useCortex();
  const [pf, setPf] = useState<typeof priorities[number]>("All");
  const [tf, setTf] = useState<typeof types[number]>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<NeedRequest | null>(null);

  // Show loading state
  if (loading) {
    return (
      <AppLayout title="Live Requests" subtitle="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const filtered = useMemo(
    () =>
      requests.filter((r) => {
        if (pf !== "All" && r.priority !== pf) return false;
        if (tf !== "All" && r.type !== tf) return false;
        if (q && !`${r.location} ${r.id} ${r.type}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [requests, pf, tf, q]
  );

  const suggested = (r: NeedRequest) => volunteers.find((v) => v.id === r.suggestedVolunteer);

  const dispatch = (r: NeedRequest) => {
    const v = suggested(r);
    if (!v) {
      toast.error("No suggested volunteer available");
      return;
    }
    cortexStore.assign(r.id, v.id);
    toast.success(`Dispatched ${v.name} → ${r.id}`);
    setSelected(null);
  };

  return (
    <AppLayout title="Live Requests" subtitle="Incoming community needs · ranked by AI Priority Score">
      <div className="glass-card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background/50 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, type, location…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setPf(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                pf === p ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                tf === t ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">People</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    "border-t border-border cursor-pointer hover:bg-accent/5 transition-colors",
                    selected?.id === r.id && "bg-accent/10"
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-3 font-medium">{r.type}</td>
                  <td className="px-4 py-3">{r.people}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.location}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 font-display font-bold">{r.score}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No requests match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected ? (
          <aside className="glass-card p-5 h-fit sticky top-24 animate-slide-in-right">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Request</div>
                <div className="font-display text-2xl font-bold">{selected.id}</div>
              </div>
              <button onClick={() => setSelected(null)} className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-card">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={selected.priority} />
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">{selected.createdAt}</span>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">{selected.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Type" value={selected.type} />
                <Stat label="People" value={selected.people} />
                <Stat label="Location" value={selected.location} />
                <Stat label="AI Score" value={selected.score} accent />
              </div>

              {suggested(selected) && (
                <div className="p-3 rounded-xl border border-accent/30 bg-accent/5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-accent mb-1">
                    Suggested Volunteer
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{suggested(selected)!.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {suggested(selected)!.skill} · Trust {suggested(selected)!.trust}%
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(selected)}
                      className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 glow-accent"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Dispatch
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : (
          <aside className="glass-card p-6 h-fit text-center text-sm text-muted-foreground">
            Select a request to view details and dispatch options.
          </aside>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-background/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
      <div className={cn("mt-1 font-display font-bold", accent ? "text-accent text-xl" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
