import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { type SupplyChainTaskRecord, DEMO_SC_TASKS } from "@/lib/supply-chain/config";

export type { SupplyChainTaskRecord } from "@/lib/supply-chain/config";
export { SC_OWNERS, SC_STATUSES, DEMO_SC_TASKS } from "@/lib/supply-chain/config";

export type ScTasksSource = {
  tasks: SupplyChainTaskRecord[];
  source: "live" | "demo";
  error?: string;
};

function toIsoDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export async function loadScTasks(monthKey: string): Promise<ScTasksSource> {
  if (!hasSupabaseClientEnv()) {
    return { tasks: DEMO_SC_TASKS, source: "demo", error: "missing-env" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sc_tasks")
      .select("id, month_key, task_name, owner_name, request_source, status, due_date, result_note, progress_percent, priority, file_link")
      .eq("month_key", monthKey)
      .order("due_date", { ascending: true });

    if (error) return { tasks: DEMO_SC_TASKS, source: "demo", error: error.message };
    if (!data?.length) return { tasks: DEMO_SC_TASKS, source: "demo" };

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
        priority: row.priority ?? "Medium",
        fileLink: row.file_link ?? "",
      })),
    };
  } catch (error) {
    return { tasks: DEMO_SC_TASKS, source: "demo", error: error instanceof Error ? error.message : "unknown" };
  }
}
