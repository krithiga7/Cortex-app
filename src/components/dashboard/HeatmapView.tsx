import { NeedRequest } from "@/data/mock";
import { cn } from "@/lib/utils";

export function HeatmapView({ requests }: { requests: NeedRequest[] }) {
  const radius = (p: NeedRequest) => 18 + p.score / 4;
  const colorFor = (p: NeedRequest) =>
    p.priority === "High" ? "hsl(0 84% 60%)" : p.priority === "Medium" ? "hsl(38 100% 60%)" : "hsl(217 91% 60%)";

  return (
    <div className="relative h-[420px] rounded-2xl border border-border overflow-hidden glass-card grid-bg">
      {/* Faux Chennai boundary */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          {requests.map((r) => (
            <radialGradient key={r.id} id={`g-${r.id}`}>
              <stop offset="0%" stopColor={colorFor(r)} stopOpacity="0.6" />
              <stop offset="60%" stopColor={colorFor(r)} stopOpacity="0.15" />
              <stop offset="100%" stopColor={colorFor(r)} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* abstract city outline */}
        <path
          d="M10,30 Q20,10 45,15 T85,25 Q95,40 90,60 T75,90 Q50,95 30,85 T10,60 Z"
          fill="hsl(210 20% 94% / 0.5)"
          stroke="hsl(217 91% 60% / 0.25)"
          strokeWidth="0.3"
        />

        {/* grid roads */}
        {[25, 45, 65, 85].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="92" stroke="hsl(217 91% 60% / 0.08)" strokeWidth="0.15" />
        ))}
        {[25, 45, 65, 85].map((y) => (
          <line key={`h${y}`} x1="10" y1={y} x2="92" y2={y} stroke="hsl(217 91% 60% / 0.08)" strokeWidth="0.15" />
        ))}

        {requests.map((r) => (
          <circle
            key={`heat-${r.id}`}
            cx={r.x}
            cy={r.y}
            r={radius(r) / 5}
            fill={`url(#g-${r.id})`}
          />
        ))}

        {requests.map((r) => (
          <g key={`pin-${r.id}`}>
            <circle cx={r.x} cy={r.y} r={1.2} fill={colorFor(r)} />
            <circle
              cx={r.x}
              cy={r.y}
              r={2.2}
              fill="none"
              stroke={colorFor(r)}
              strokeOpacity="0.6"
              strokeWidth="0.25"
            >
              {r.priority === "High" && (
                <animate attributeName="r" from="2" to="5" dur="1.6s" repeatCount="indefinite" />
              )}
              {r.priority === "High" && (
                <animate attributeName="stroke-opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" />
              )}
            </circle>
          </g>
        ))}
      </svg>

      {/* Labels */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-background/70 border border-border backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Live Heatmap · Chennai
        </span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-md bg-background/70 border border-border backdrop-blur">
        <Legend color="bg-destructive" label="High" />
        <Legend color="bg-warning" label="Medium" />
        <Legend color="bg-accent" label="Low" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </div>
  );
}
