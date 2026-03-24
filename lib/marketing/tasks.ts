import { marketingTaskTracker, marketingWorkbookContext } from "@/lib/demo-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type MarketingTaskRecord = {
  id: string;
  monthKey: string;
  title: string;
  owner: string;
  requester: string;
  status: string;
  dueDate: string;
  notes: string;
  progressPercent: number;
  priority: string;
  fileLink?: string;
};

export type MarketingTasksSource = {
  tasks: MarketingTaskRecord[];
  source: "live" | "demo";
  error?: string;
};

function toIsoDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function getMarketingDemoTasks(): MarketingTaskRecord[] {
  return marketingTaskTracker.map((task, index) => ({
    id: `demo-marketing-task-${index + 1}`,
    monthKey: marketingWorkbookContext.monthKey,
    title: task.notes.split(".")[0] || `Marketing task ${index + 1}`,
    owner: task.owner,
    requester: task.requester,
    status: task.status,
    dueDate: task.dueDate,
    notes: task.notes,
    progressPercent:
      task.status === "Completed"
        ? 100
        : task.status === "In Progress"
          ? 65
          : task.status === "Under Review"
            ? 80
            : task.status === "Failed"
              ? 0
              : task.status === "Planned"
                ? 20
                : 10,
    priority: task.status === "Failed" ? "High" : task.status === "In Progress" ? "Medium" : "Low",
    fileLink: "",
  }));
}

export async function loadMarketingTasks(monthKey = marketingWorkbookContext.monthKey): Promise<MarketingTasksSource> {
  if (!hasSupabaseClientEnv()) {
    return { tasks: getMarketingDemoTasks(), source: "demo", error: "missing-env" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("marketing_tasks")
      .select("id, month_key, task_name, owner_name, request_source, status, due_date, result_note, progress_percent, priority, file_link")
      .eq("month_key", monthKey)
      .order("due_date", { ascending: true });

    if (error) {
      return { tasks: getMarketingDemoTasks(), source: "demo", error: error.message };
    }

    if (!data?.length) {
      return { tasks: getMarketingDemoTasks(), source: "demo" };
    }

    return {
      source: "live",
      tasks: data.map((row) => ({
        id: row.id,
        monthKey: row.month_key,
        title: row.task_name,
        owner: row.owner_name ?? "Unassigned",
        requester: row.request_source ?? "-",
        status: row.status ?? "Planned",
        dueDate: toIsoDate(row.due_date),
        notes: row.result_note ?? "",
        progressPercent: Number(row.progress_percent ?? 0),
        priority: row.priority ?? "Low",
        fileLink: row.file_link ?? "",
      })),
    };
  } catch (error) {
    return {
      tasks: getMarketingDemoTasks(),
      source: "demo",
      error: error instanceof Error ? error.message : "unknown-error",
    };
  }
}
