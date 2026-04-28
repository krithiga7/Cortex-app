import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  icon,
  accent = "default",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon: ReactNode;
  accent?: "default" | "alert" | "success" | "cyan";
}) {
  const accentMap = {
    default: "from-white to-gray-50",
    alert: "from-red-50 to-white",
    success: "from-green-50 to-white",
    cyan: "from-blue-50 to-white",
  };
  const ringMap = {
    default: "border-gray-200",
    alert: "border-red-200",
    success: "border-green-200",
    cyan: "border-blue-200",
  };
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 bg-gradient-to-br shadow-sm hover:shadow-md transition-shadow",
        accentMap[accent],
        ringMap[accent]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-foreground tracking-tight">
            {value}
          </div>
          {delta && (
            <div className="mt-1 text-xs text-muted-foreground">{delta}</div>
          )}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg grid place-items-center border",
            accent === "alert" && "bg-red-100 border-red-200 text-red-600",
            accent === "success" && "bg-green-100 border-green-200 text-green-600",
            accent === "cyan" && "bg-blue-100 border-blue-200 text-blue-600",
            accent === "default" && "bg-gray-100 border-gray-200 text-gray-700"
          )}
        >
          {icon}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}
