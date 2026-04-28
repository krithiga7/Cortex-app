import { Priority, RequestStatus, Availability } from "@/data/mock";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority, pulse = true }: { priority: Priority; pulse?: boolean }) {
  const map = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono uppercase tracking-wider",
        map[priority]
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-yellow-500" : "bg-green-500",
          pulse && priority === "High" && "pulse-dot"
        )}
      />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, string> = {
    Pending: "bg-gray-100 text-gray-700 border-gray-200",
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Resolved: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium", map[status])}>
      {status}
    </span>
  );
}

export function AvailabilityBadge({ value }: { value: Availability }) {
  const map: Record<Availability, string> = {
    Available: "bg-green-100 text-green-700 border-green-200",
    Busy: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Offline: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const dot: Record<Availability, string> = {
    Available: "bg-green-500",
    Busy: "bg-yellow-500",
    Offline: "bg-gray-500",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium", map[value])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[value], value === "Available" && "pulse-dot")} />
      {value}
    </span>
  );
}
