import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { fetchDeptSheetTasks } from "@/lib/shared/dept-google-sheets";
import type { FinanceTaskRecord } from "@/lib/finance/config";

export type { FinanceTaskRecord } from "@/lib/finance/config";
export { FINANCE_OWNERS, FINANCE_STATUSES } from "@/lib/finance/config";

export type FinanceTasksSource = {
  tasks: FinanceTaskRecord[];
  source: "live" | "sheet" | "empty";
  error?: string;
};

function toIsoDate(v: string | null) { return v ? v.slice(0, 10) : ""; }

function fromSheet(t: Awaited<ReturnType<typeof fetchDeptSheetTasks>>["tasks"][number], monthKey: string): FinanceTaskRecord {
  return { id: `sheet-${t.row}`, monthKey, title: t.taskName, owner: t.owner, requester: t.requester, status: t.status, dueDate: t.dueDate, notes: t.notes, progressPercent: t.progress, priority: t.priority, fileLink: t.fileLink };
}

export async function loadFinanceTasks(monthKey: string): Promise<FinanceTasksSource> {
  if (!hasSupabaseClientEnv()) {
    const s = await fetchDeptSheetTasks("FINANCE");
    return s.tasks.length > 0
      ? { tasks: s.tasks.map((t) => fromSheet(t, monthKey)), source: "sheet" }
      : { tasks: [], source: "empty", error: "missing-env" };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("finance_tasks")
      .select("id, month_key, task_name, owner_name, request_source, status, due_date, result_note, progress_percent, priority, file_link")
      .eq("month_key", monthKey).order("due_date", { ascending: true });
    if (error) return { tasks: [], source: "empty", error: error.message };
    if (!data?.length) {
      const s = await fetchDeptSheetTasks("FINANCE");
      return s.tasks.length > 0
        ? { tasks: s.tasks.map((t) => fromSheet(t, monthKey)), source: "sheet" }
        : { tasks: [], source: "empty" };
    }
    return { source: "live", tasks: data.map((r) => ({ id: r.id, monthKey: r.month_key, title: r.task_name, owner: r.owner_name ?? "Unassigned", requester: r.request_source ?? "-", status: r.status ?? "Planned", dueDate: toIsoDate(r.due_date), notes: r.result_note ?? "", progressPercent: Number(r.progress_percent ?? 0), priority: r.priority ?? "Medium", fileLink: r.file_link ?? "" })) };
  } catch (e) { return { tasks: [], source: "empty", error: e instanceof Error ? e.message : "unknown" }; }
}
