import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types/database";

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
  done: "bg-emerald-100 text-emerald-700"
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700"
};

export function TaskStatusBadge({
  value,
  kind
}: {
  value: TaskStatus | TaskPriority;
  kind: "status" | "priority";
}) {
  const styles =
    kind === "status"
      ? statusStyles[value as TaskStatus]
      : priorityStyles[value as TaskPriority];

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", styles)}>
      {value.replace("_", " ")}
    </span>
  );
}
