import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type FinanceTaskRecord = {
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

export type FinanceTasksSource = {
  tasks: FinanceTaskRecord[];
  source: "live" | "demo";
  error?: string;
};

function toIsoDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export const FINANCE_OWNERS = [
  "CFO",
  "Finance Manager",
  "Accountant",
  "Budget Controller",
  "AR/AP Staff",
];

export const FINANCE_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_FINANCE_TASKS: FinanceTaskRecord[] = [
  { id: "demo-f-1", monthKey: "2026-03", title: "Monthly P&L close", owner: "CFO", requester: "CEO", status: "In Progress", dueDate: "2026-03-31", notes: "Awaiting AR aging data", progressPercent: 60, priority: "High" },
  { id: "demo-f-2", monthKey: "2026-03", title: "Reconcile bank statements", owner: "Accountant", requester: "Finance Manager", status: "Completed", dueDate: "2026-03-25", notes: "Done and signed off", progressPercent: 100, priority: "Medium" },
  { id: "demo-f-3", monthKey: "2026-03", title: "Budget vs Actual report", owner: "Budget Controller", requester: "CFO", status: "Planned", dueDate: "2026-04-05", notes: "", progressPercent: 0, priority: "High" },
  { id: "demo-f-4", monthKey: "2026-03", title: "Collect outstanding invoices", owner: "AR/AP Staff", requester: "Finance Manager", status: "In Progress", dueDate: "2026-03-30", notes: "3 clients pending", progressPercent: 40, priority: "Critical" },
];

export async function loadFinanceTasks(monthKey: string): Promise<FinanceTasksSource> {
  if (!hasSupabaseClientEnv()) {
    return { tasks: DEMO_FINANCE_TASKS, source: "demo", error: "missing-env" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("finance_tasks")
      .select("id, month_key, task_name, owner_name, request_source, status, due_date, result_note, progress_percent, priority, file_link")
      .eq("month_key", monthKey)
      .order("due_date", { ascending: true });

    if (error) return { tasks: DEMO_FINANCE_TASKS, source: "demo", error: error.message };
    if (!data?.length) return { tasks: DEMO_FINANCE_TASKS, source: "demo" };

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
    return { tasks: DEMO_FINANCE_TASKS, source: "demo", error: error instanceof Error ? error.message : "unknown" };
  }
}
