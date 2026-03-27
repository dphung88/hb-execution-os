import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type HrTaskRecord = {
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

export type HrTasksSource = {
  tasks: HrTaskRecord[];
  source: "live" | "demo";
  error?: string;
};

function toIsoDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export const HR_OWNERS = [
  "HR Director",
  "HR Manager",
  "Recruiter",
  "Payroll Staff",
  "Training Coordinator",
];

export const HR_STATUSES = [
  "Planned",
  "In Progress",
  "Under Review",
  "Completed",
  "Failed",
];

export const DEMO_HR_TASKS: HrTaskRecord[] = [
  { id: "demo-hr-1", monthKey: "2026-03", title: "Quarterly headcount review", owner: "HR Director", requester: "CEO", status: "In Progress", dueDate: "2026-03-31", notes: "Awaiting dept. submissions", progressPercent: 50, priority: "High" },
  { id: "demo-hr-2", monthKey: "2026-03", title: "Process March payroll", owner: "Payroll Staff", requester: "HR Manager", status: "Completed", dueDate: "2026-03-25", notes: "Paid on time", progressPercent: 100, priority: "Critical" },
  { id: "demo-hr-3", monthKey: "2026-03", title: "Post 3 open positions", owner: "Recruiter", requester: "HR Director", status: "In Progress", dueDate: "2026-03-28", notes: "2 of 3 posted", progressPercent: 65, priority: "High" },
  { id: "demo-hr-4", monthKey: "2026-03", title: "Run Q1 compliance training", owner: "Training Coordinator", requester: "HR Manager", status: "Planned", dueDate: "2026-04-05", notes: "", progressPercent: 0, priority: "Medium" },
];

export async function loadHrTasks(monthKey: string): Promise<HrTasksSource> {
  if (!hasSupabaseClientEnv()) {
    return { tasks: DEMO_HR_TASKS, source: "demo", error: "missing-env" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hr_tasks")
      .select("id, month_key, task_name, owner_name, request_source, status, due_date, result_note, progress_percent, priority, file_link")
      .eq("month_key", monthKey)
      .order("due_date", { ascending: true });

    if (error) return { tasks: DEMO_HR_TASKS, source: "demo", error: error.message };
    if (!data?.length) return { tasks: DEMO_HR_TASKS, source: "demo" };

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
    return { tasks: DEMO_HR_TASKS, source: "demo", error: error instanceof Error ? error.message : "unknown" };
  }
}
