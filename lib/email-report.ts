import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderDailyReportEmail, type DeptStats } from "./email-template";

const DEPT_TABLES: { dept: string; table: string; isCeo?: boolean }[] = [
  { dept: "CEO Office",   table: "tasks",          isCeo: true },
  { dept: "Marketing",    table: "marketing_tasks" },
  { dept: "Finance",      table: "finance_tasks" },
  { dept: "HR",           table: "hr_tasks" },
  { dept: "Medical",      table: "medical_tasks" },
  { dept: "IT",           table: "it_tasks" },
  { dept: "Supply Chain", table: "sc_tasks" },
];

const DONE_STATUSES     = ["completed", "done", "closed"];
const CRITICAL_STATUSES = ["critical"];
const BLOCKED_STATUSES  = ["blocked", "on hold"];

function classifyStatus(status: string, priority: string) {
  const s = (status   ?? "").toLowerCase().trim();
  const p = (priority ?? "").toLowerCase().trim();
  if (DONE_STATUSES.includes(s))                         return "done";
  if (BLOCKED_STATUSES.includes(s))                      return "blocked";
  if (p === "critical" || CRITICAL_STATUSES.includes(s)) return "critical";
  return "onTrack";
}

async function buildDeptStats(): Promise<DeptStats[]> {
  const admin  = createAdminClient();
  const today  = new Date().toISOString().slice(0, 10);
  const result: DeptStats[] = [];

  for (const { dept, table, isCeo } of DEPT_TABLES) {
    try {
      const select = isCeo
        ? "id, title, status, priority, due_date, owner"
        : "id, task_name, status, priority, due_date, owner_name";

      const { data, error } = await admin.from(table).select(select);
      if (error || !data) continue;

      const rows = data as Record<string, string>[];
      const stats: DeptStats = {
        dept,
        total:    rows.length,
        critical: 0,
        blocked:  0,
        onTrack:  0,
        done:     0,
        overdue:  0,
        topOverdue: [],
      };

      const overdueRows: typeof rows = [];

      for (const r of rows) {
        const cls = classifyStatus(r.status, r.priority);
        stats[cls]++;
        const isActive = !DONE_STATUSES.includes((r.status ?? "").toLowerCase());
        if (isActive && r.due_date && r.due_date < today) {
          stats.overdue++;
          overdueRows.push(r);
        }
      }

      const priorityOrder = ["Critical", "High", "Medium", "Low"];
      stats.topOverdue = overdueRows
        .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority))
        .slice(0, 3)
        .map((r) => ({
          title:    r.task_name ?? r.title  ?? "—",
          owner:    r.owner_name ?? r.owner ?? "—",
          due:      r.due_date  ?? "—",
          priority: r.priority  ?? "—",
        }));

      result.push(stats);
    } catch { /* skip tables that don't exist yet */ }
  }

  return result;
}

export async function sendDailyReport(): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.EMAIL_FROM  ?? "noreply@edisonyang.store";
  const to     = process.env.EMAIL_TO    ?? "dphung@my.ggu.edu";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vp.edisonyang.store";

  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  const resend = new Resend(apiKey);
  const depts  = await buildDeptStats();

  if (depts.length === 0) return { ok: false, error: "No department data found" };

  const reportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const totalOverdue  = depts.reduce((s, d) => s + d.overdue,  0);
  const totalCritical = depts.reduce((s, d) => s + d.critical, 0);
  const subjectFlag   = totalCritical > 0 ? "🔴 " : totalOverdue > 0 ? "⚠️ " : "✅ ";
  const subject       = `${subjectFlag}HB Daily Report — ${reportDate}`;

  const html = renderDailyReportEmail(depts, reportDate, appUrl);

  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}
