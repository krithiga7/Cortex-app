import { autoDecisions } from "@/data/mock";
import { Cpu, TrendingUp, Shuffle, CheckCircle2 } from "lucide-react";

const iconMap = {
  assign: CheckCircle2,
  predict: TrendingUp,
  reroute: Shuffle,
  system: Cpu,
};

const colorMap = {
  assign: "text-green-700 border-green-200 bg-green-50",
  predict: "text-blue-700 border-blue-200 bg-blue-50",
  reroute: "text-yellow-700 border-yellow-200 bg-yellow-50",
  system: "text-gray-700 border-gray-200 bg-gray-50",
};

export function AutoDecisionsPanel() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-foreground">Auto Decisions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real-Time Decision Engine actions</p>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600">v2.4 · online</span>
      </div>
      <ul className="space-y-2.5">
        {autoDecisions.map((d) => {
          const Icon = iconMap[d.kind];
          return (
            <li
              key={d.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[d.kind]} animate-fade-in-up`}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug">{d.text}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 font-mono">{d.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
