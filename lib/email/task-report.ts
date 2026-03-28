import { createAdminClient } from "@/lib/supabase/admin";

export type DeptSummary = {
  dept: string;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  overdueItems: { task: string; owner: string; due: string; status: string }[];
};

const DEPT_TABLES: { dept: string; table: string }[] = [
  { dept: "CEO Office",    table: "tasks" },
  { dept: "Sales",         table: "kpi_data" },   // sales uses kpi_data — skip tasks
  { dept: "Marketing",     table: "marketing_tasks" },
  { dept: "Finance",       table: "finance_tasks" },
  { dept: "HR",            table: "hr_tasks" },
  { dept: "Medical",       table: "medical_tasks" },
  { dept: "IT",            table: "it_tasks" },
  { dept: "Supply Chain",  table: "sc_tasks" },
];

// Sales doesn't have a generic task table — skip it in the loop
const TASK_TABLES = DEPT_TABLES.filter((d) => d.dept !== "Sales");

export async function buildTaskReportSummaries(periodKey: string): Promise<DeptSummary[]> {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const summaries: DeptSummary[] = [];

  for (const { dept, table } of TASK_TABLES) {
    try {
      // CEO Office uses "tasks" table with different column names
      const isCeo = table === "tasks";
      const monthCol = isCeo ? "created_at" : "month_key";

      let query = admin
        .from(table)
        .select(isCeo
          ? "id, title, owner, status, due_date, priority"
          : "id, task_name, owner_name, status, due_date, priority"
        );

      if (!isCeo) {
        query = query.eq("month_key", periodKey) as typeof query;
      }

      const { data, error } = await query;
      if (error || !data) continue;

      const rows = data as Record<string, string>[];
      const total = rows.length;
      const completed = rows.filter((r) => r.status?.toLowerCase() === "completed").length;
      const inProgress = rows.filter((r) => r.status?.toLowerCase() === "in progress").length;
      const overdueRows = rows.filter((r) => {
        const due = r.due_date;
        return due && due < today && !["Completed", "Failed"].includes(r.status ?? "");
      });

      summaries.push({
        dept,
        total,
        completed,
        inProgress,
        overdue: overdueRows.length,
        overdueItems: overdueRows.slice(0, 5).map((r) => ({
          task:   r.task_name ?? r.title ?? "—",
          owner:  r.owner_name ?? r.owner ?? "—",
          due:    r.due_date ?? "—",
          status: r.status ?? "—",
        })),
      });
    } catch {
      // Skip table on error (might not exist yet)
    }
  }

  return summaries;
}

export function buildReportHtml(
  summaries: DeptSummary[],
  periodKey: string,
  generatedAt: string,
): string {
  const statusColor = (pct: number) =>
    pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";

  const deptRows = summaries.map((s) => {
    const completionPct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    const color = statusColor(completionPct);

    const overdueHtml = s.overdueItems.length
      ? `<ul style="margin:6px 0 0;padding-left:16px;font-size:12px;color:#991b1b;">
          ${s.overdueItems.map((o) => `<li>${o.task} — ${o.owner} (due ${o.due})</li>`).join("")}
        </ul>`
      : `<p style="font-size:12px;color:#6b7280;margin:4px 0 0;">No overdue tasks</p>`;

    return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${s.dept}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">${s.total}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#16a34a;font-weight:600;">${s.completed}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#2563eb;">${s.inProgress}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">
          <span style="background:${color};color:#fff;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700;">${completionPct}%</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
          ${s.overdue > 0
            ? `<span style="color:#dc2626;font-weight:600;">${s.overdue} overdue</span>${overdueHtml}`
            : `<span style="color:#16a34a;font-size:12px;">All clear</span>`
          }
        </td>
      </tr>
    `;
  }).join("");

  const totalTasks     = summaries.reduce((s, d) => s + d.total, 0);
  const totalCompleted = summaries.reduce((s, d) => s + d.completed, 0);
  const totalOverdue   = summaries.reduce((s, d) => s + d.overdue, 0);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:720px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:#0f172a;padding:32px 32px 24px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#7dd3fc;">HB Execution OS</p>
      <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#fff;">Weekly Task Report</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;">Period: ${periodKey} &nbsp;·&nbsp; Generated: ${generatedAt}</p>
    </div>

    <!-- Summary strip -->
    <div style="display:flex;background:#f1f5f9;padding:20px 32px;gap:32px;">
      <div>
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b;">Total Tasks</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#0f172a;">${totalTasks}</p>
      </div>
      <div>
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b;">Completed</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#16a34a;">${totalCompleted}</p>
      </div>
      <div>
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b;">Overdue</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${totalOverdue > 0 ? "#dc2626" : "#16a34a"};">${totalOverdue}</p>
      </div>
    </div>

    <!-- Table -->
    <div style="padding:24px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Department</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Total</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Done</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">In Progress</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Completion</th>
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Overdue</th>
          </tr>
        </thead>
        <tbody>${deptRows}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px 28px;border-top:1px solid #f1f5f9;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">This report is automatically generated by HB Execution OS every Monday at 08:00 Vietnam time.</p>
    </div>
  </div>
</body>
</html>`;
}
