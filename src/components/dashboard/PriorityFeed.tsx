import { NeedRequest } from "@/data/mock";
import { PriorityBadge } from "@/components/common/Badges";
import { Clock, MapPin, Users } from "lucide-react";

export function PriorityFeed({ requests }: { requests: NeedRequest[] }) {
  const sorted = [...requests].sort((a, b) => b.score - a.score).slice(0, 6);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-foreground">Live Priority Feed</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time intake · ranked by AI Priority Score</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 pulse-dot" />
          Streaming
        </span>
      </div>

      <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {sorted.map((r) => (
          <li
            key={r.id}
            className="group relative flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 transition-all animate-fade-in-up shadow-sm"
          >
            {r.priority === "High" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-red-500 pulse-alert" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={r.priority} />
                <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
                <span className="text-sm font-medium text-foreground">{r.type}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.people} people</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.createdAt}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Score</div>
              <div className="font-display text-xl font-bold text-foreground">{r.score}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
