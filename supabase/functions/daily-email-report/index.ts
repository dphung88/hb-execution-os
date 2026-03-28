// Supabase Edge Function (Deno runtime)
// Cron: "0 0 * * *"  →  00:00 UTC = 07:00 Vietnam time
//
// Deploy:
//   supabase functions deploy daily-email-report
//
// Set secrets:
//   supabase secrets set RESEND_API_KEY=re_xxx
//   supabase secrets set EMAIL_FROM=noreply@edisonyang.store
//   supabase secrets set EMAIL_TO=dphung@my.ggu.edu
//   supabase secrets set APP_URL=https://vp.edisonyang.store

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY    = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM    = Deno.env.get("EMAIL_FROM")    ?? "noreply@edisonyang.store";
const EMAIL_TO      = Deno.env.get("EMAIL_TO")      ?? "dphung@my.ggu.edu";
const APP_URL       = Deno.env.get("APP_URL")       ?? "https://vp.edisonyang.store";

// ─── Types ─────────────────────────────────────────────────────────────────

type TaskRow  = Record<string, string>;
type DeptStat = {
  dept: string; total: number; critical: number; blocked: number;
  onTrack: number; done: number; overdue: number;
  topOverdue: { title: string; owner: string; due: string; priority: string }[];
};

const TASK_TABLES: { dept: string; table: string; isCeo?: boolean }[] = [
  { dept: "CEO Office",   table: "tasks",          isCeo: true },
  { dept: "Marketing",    table: "marketing_tasks" },
  { dept: "Finance",      table: "finance_tasks" },
  { dept: "HR",           table: "hr_tasks" },
  { dept: "Medical",      table: "medical_tasks" },
  { dept: "IT",           table: "it_tasks" },
  { dept: "Supply Chain", table: "sc_tasks" },
];

// ─── Data ──────────────────────────────────────────────────────────────────

async function buildStats(): Promise<DeptStat[]> {
  const sb    = createClient(SUPABASE_URL, SERVICE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const stats: DeptStat[] = [];

  for (const { dept, table, isCeo } of TASK_TABLES) {
    const select = isCeo
      ? "id,title,status,priority,due_date,owner"
      : "id,task_name,status,priority,due_date,owner_name";
    const { data } = await sb.from(table).select(select);
    if (!data?.length) continue;

    const rows = data as TaskRow[];
    const s: DeptStat = { dept, total: rows.length, critical: 0, blocked: 0, onTrack: 0, done: 0, overdue: 0, topOverdue: [] };
    const overdueRows: TaskRow[] = [];

    for (const r of rows) {
      const st = (r.status   ?? "").toLowerCase();
      const pr = (r.priority ?? "").toLowerCase();
      const isDone = ["completed","done","closed"].includes(st);
      if (isDone)                           s.done++;
      else if (["blocked","on hold"].includes(st)) s.blocked++;
      else if (pr === "critical")           s.critical++;
      else                                  s.onTrack++;

      if (!isDone && r.due_date && r.due_date < today) {
        s.overdue++;
        overdueRows.push(r);
      }
    }

    const pri = ["Critical","High","Medium","Low"];
    s.topOverdue = overdueRows
      .sort((a, b) => pri.indexOf(a.priority) - pri.indexOf(b.priority))
      .slice(0, 3)
      .map((r) => ({
        title:    r.task_name ?? r.title   ?? "—",
        owner:    r.owner_name ?? r.owner  ?? "—",
        due:      r.due_date  ?? "—",
        priority: r.priority  ?? "—",
      }));

    stats.push(s);
  }
  return stats;
}

// ─── Template ──────────────────────────────────────────────────────────────

function badge(label: string, count: number, color: string, bg: string) {
  if (count === 0) return "";
  return `<span style="display:inline-block;background:${bg};color:${color};border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;margin:2px;">${label} ${count}</span>`;
}

function buildHtml(depts: DeptStat[], reportDate: string): string {
  const total    = depts.reduce((s, d) => s + d.total,    0);
  const done     = depts.reduce((s, d) => s + d.done,     0);
  const critical = depts.reduce((s, d) => s + d.critical, 0);
  const blocked  = depts.reduce((s, d) => s + d.blocked,  0);
  const overdue  = depts.reduce((s, d) => s + d.overdue,  0);
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

  const cards = depts.map((s) => {
    const cp = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
    const barColor = cp >= 80 ? "#16a34a" : cp >= 50 ? "#f59e0b" : "#ef4444";
    const overdueHtml = s.topOverdue.map((t) => {
      const pc = t.priority === "Critical" ? "#dc2626" : t.priority === "High" ? "#ea580c" : "#64748b";
      return `<div style="margin-top:4px;font-size:11px;color:#475569;">
        <span style="background:${pc};color:#fff;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700;">${t.priority}</span>
        &nbsp;<strong>${t.title}</strong> — ${t.owner} <span style="color:#94a3b8;">(due ${t.due})</span>
      </div>`;
    }).join("");
    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
      <tr><td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${s.dept}</p>
              <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${s.total} tasks</p></td>
          <td style="text-align:right;vertical-align:top;"><p style="margin:0;font-size:20px;font-weight:800;color:#0f172a;">${cp}%</p></td>
        </tr></table>
        <div style="margin-top:7px;height:5px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
          <div style="height:5px;width:${cp}%;background:${barColor};border-radius:999px;"></div>
        </div>
      </td></tr>
      <tr><td style="padding:9px 14px;">
        ${badge("Critical", s.critical, "#dc2626", "#fef2f2")}
        ${badge("Blocked",  s.blocked,  "#ea580c", "#fff7ed")}
        ${badge("On Track", s.onTrack,  "#16a34a", "#f0fdf4")}
        ${badge("Done",     s.done,     "#64748b", "#f8fafc")}
        ${s.overdue > 0 ? badge("Overdue", s.overdue, "#dc2626", "#fef2f2") : ""}
        ${overdueHtml}
      </td></tr>
    </table>`;
  }).join("");

  const kpis = [
    { label: "Total",    value: String(total),    color: "#fff" },
    { label: "Done",     value: String(done),     color: "#4ade80" },
    { label: "Critical", value: String(critical), color: critical > 0 ? "#f87171" : "#4ade80" },
    { label: "Blocked",  value: String(blocked),  color: blocked  > 0 ? "#fb923c" : "#4ade80" },
    { label: "Overdue",  value: String(overdue),  color: overdue  > 0 ? "#f87171" : "#4ade80" },
  ].map(({ label, value, color }) => `
    <td style="text-align:center;padding:10px 6px;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#475569;">${label}</p>
      <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:${color};line-height:1;">${value}</p>
    </td>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 8px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#0f172a;padding:26px 26px 20px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#7dd3fc;">Execution OS</p>
    <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#fff;">Daily Task Report</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">${reportDate} · 07:00 Vietnam time</p>
  </td></tr>
  <tr><td style="background:#0f172a;border-top:1px solid #1e293b;padding:6px 20px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>${kpis}</tr></table>
    <div style="margin-top:4px;background:#1e293b;border-radius:999px;height:5px;overflow:hidden;">
      <div style="height:5px;width:${pct}%;background:#38bdf8;border-radius:999px;"></div>
    </div>
    <p style="margin:5px 0 0;font-size:11px;color:#475569;text-align:right;">${pct}% overall completion</p>
  </td></tr>
  <tr><td style="padding:20px 22px 26px;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">✅ Department Breakdown</p>
    <hr style="margin:0 0 14px;border:none;border-top:2px solid #e2e8f0;">
    ${cards}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      <tr><td align="center">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 30px;border-radius:999px;">Open Dashboard →</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:13px 22px 16px;border-top:1px solid #f1f5f9;background:#f8fafc;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">Auto-generated by <strong style="color:#64748b;">Execution OS</strong> · Daily 07:00 Vietnam time</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ─── Handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Allow Supabase cron scheduler + manual POST
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const depts = await buildStats();
    if (depts.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "No data" }), { status: 500 });
    }

    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const totalCritical = depts.reduce((s, d) => s + d.critical, 0);
    const totalOverdue  = depts.reduce((s, d) => s + d.overdue,  0);
    const flag = totalCritical > 0 ? "🔴 " : totalOverdue > 0 ? "⚠️ " : "✅ ";

    const html = buildHtml(depts, reportDate);

    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    EMAIL_FROM,
        to:      EMAIL_TO,
        subject: `${flag}HB Daily Report — ${reportDate}`,
        html,
      }),
    });

    const payload = await res.json();
    if (!res.ok) throw new Error(payload.message ?? JSON.stringify(payload));

    return new Response(JSON.stringify({ ok: true, id: payload.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
