import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeptSummary = {
  dept: string;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueThisWeek: number;
  criticalOverdue: { task: string; owner: string; due: string; priority: string }[];
};

export type SalesData = {
  totalRevenue: number;
  totalTarget: number;
  achievementPct: number;
  forecastPct: number; // projected month-end % based on days elapsed
  newCustomers: number;
  topAsms: { name: string; revenue: number; target: number; pct: number }[];
  skus: { code: string; name: string; actual: number; target: number; pct: number }[];
};

export type MarketingData = {
  totalRevenue: number;
  totalTarget: number;
  totalSpend: number;
  overallRoas: number | null;
  channels: { name: string; revenue: number; target: number; spend: number; roas: number | null; pct: number }[];
};

// ─── Data fetchers ────────────────────────────────────────────────────────────

const TASK_TABLES: { dept: string; table: string; isCeo?: boolean }[] = [
  { dept: "CEO Office",   table: "tasks",            isCeo: true },
  { dept: "Marketing",    table: "marketing_tasks" },
  { dept: "Finance",      table: "finance_tasks" },
  { dept: "HR",           table: "hr_tasks" },
  { dept: "Medical",      table: "medical_tasks" },
  { dept: "IT",           table: "it_tasks" },
  { dept: "Supply Chain", table: "sc_tasks" },
];

export async function buildTaskSummaries(periodKey: string): Promise<DeptSummary[]> {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const summaries: DeptSummary[] = [];

  for (const { dept, table, isCeo } of TASK_TABLES) {
    try {
      const select = isCeo
        ? "id, title, owner, status, due_date, priority"
        : "id, task_name, owner_name, status, due_date, priority";

      let q = admin.from(table).select(select);
      if (!isCeo) q = q.eq("month_key", periodKey) as typeof q;

      const { data, error } = await q;
      if (error || !data) continue;

      const rows = data as Record<string, string>[];
      const completed  = rows.filter((r) => r.status?.toLowerCase() === "completed").length;
      const inProgress = rows.filter((r) => r.status?.toLowerCase() === "in progress").length;

      const overdueRows = rows.filter((r) =>
        r.due_date && r.due_date < today && !["Completed", "Failed"].includes(r.status ?? "")
      );
      const dueThisWeek = rows.filter((r) =>
        r.due_date && r.due_date >= today && r.due_date <= nextWeek &&
        !["Completed", "Failed"].includes(r.status ?? "")
      ).length;

      summaries.push({
        dept,
        total: rows.length,
        completed,
        inProgress,
        overdue: overdueRows.length,
        dueThisWeek,
        criticalOverdue: overdueRows
          .sort((a, b) => {
            const pri = ["Critical", "High", "Medium", "Low"];
            return pri.indexOf(a.priority) - pri.indexOf(b.priority);
          })
          .slice(0, 4)
          .map((r) => ({
            task:     r.task_name ?? r.title ?? "—",
            owner:    r.owner_name ?? r.owner ?? "—",
            due:      r.due_date ?? "—",
            priority: r.priority ?? "—",
          })),
      });
    } catch { /* skip missing tables */ }
  }

  return summaries;
}

export async function buildSalesData(periodKey: string): Promise<SalesData | null> {
  try {
    const admin = createAdminClient();

    const [kpiRes, targetRes] = await Promise.all([
      admin.from("kpi_data")
        .select("asm_id, dt_target, dt_thuc_dat, kh_moi, hb006, hb034, hb031, hb035, from_date, to_date")
        .eq("month", periodKey),
      admin.from("sales_monthly_targets")
        .select("asm_id, dt_target")
        .eq("month", periodKey),
    ]);

    const kpiRows = kpiRes.data ?? [];
    if (kpiRows.length === 0) return null;

    const targetMap = new Map((targetRes.data ?? []).map((r: Record<string, unknown>) => [r.asm_id, Number(r.dt_target ?? 0)]));

    const totalRevenue = kpiRows.reduce((s, r) => s + Number(r.dt_thuc_dat ?? 0), 0);
    const totalTarget  = kpiRows.reduce((s, r) => s + (targetMap.get(r.asm_id) ?? Number(r.dt_target ?? 0)), 0);
    const newCustomers = kpiRows.reduce((s, r) => s + Number(r.kh_moi ?? 0), 0);
    const achievementPct = totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0;

    // Quick forecast: project to month-end based on days elapsed
    const fromDate = kpiRows[0]?.from_date;
    const toDate   = kpiRows[0]?.to_date;
    let forecastPct = achievementPct;
    if (fromDate && toDate) {
      const start    = new Date(fromDate).getTime();
      const end      = new Date(toDate).getTime();
      const today    = Date.now();
      const elapsed  = Math.max(1, (today - start) / 86400000);
      const total    = Math.max(1, (end - start) / 86400000);
      const dayPct   = elapsed / total;
      if (dayPct > 0 && totalTarget > 0) {
        const projected = (totalRevenue / dayPct);
        forecastPct = Math.round((projected / totalTarget) * 100);
      }
    }

    const topAsms = kpiRows
      .map((r) => {
        const target = targetMap.get(r.asm_id) ?? Number(r.dt_target ?? 0);
        return {
          name:    String(r.asm_id),
          revenue: Number(r.dt_thuc_dat ?? 0),
          target,
          pct:     target > 0 ? Math.round((Number(r.dt_thuc_dat ?? 0) / target) * 100) : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Aggregate SKU actuals across all ASMs
    const hb031 = kpiRows.reduce((s, r) => s + Number(r.hb031 ?? 0), 0);
    const hb035 = kpiRows.reduce((s, r) => s + Number(r.hb035 ?? 0), 0);
    const hb006 = kpiRows.reduce((s, r) => s + Number(r.hb006 ?? 0), 0);
    const hb034 = kpiRows.reduce((s, r) => s + Number(r.hb034 ?? 0), 0);

    // Get targets from sales_monthly_targets for SKUs if available
    const skuTargetRes = await admin.from("sales_monthly_targets")
      .select("hb031_target, hb035_target, hb006_target, hb034_target")
      .eq("month", periodKey);

    const skuTargets = (skuTargetRes.data ?? []).reduce(
      (acc, r: Record<string, unknown>) => ({
        hb031: acc.hb031 + Number(r.hb031_target ?? 0),
        hb035: acc.hb035 + Number(r.hb035_target ?? 0),
        hb006: acc.hb006 + Number(r.hb006_target ?? 0),
        hb034: acc.hb034 + Number(r.hb034_target ?? 0),
      }),
      { hb031: 0, hb035: 0, hb006: 0, hb034: 0 }
    );

    const skus = [
      { code: "HB031", name: "HB031",       actual: hb031, target: skuTargets.hb031, pct: skuTargets.hb031 > 0 ? Math.round((hb031 / skuTargets.hb031) * 100) : 0 },
      { code: "HB035", name: "HB035",       actual: hb035, target: skuTargets.hb035, pct: skuTargets.hb035 > 0 ? Math.round((hb035 / skuTargets.hb035) * 100) : 0 },
      { code: "HB006", name: "HB006 (CS)",  actual: hb006, target: skuTargets.hb006, pct: skuTargets.hb006 > 0 ? Math.round((hb006 / skuTargets.hb006) * 100) : 0 },
      { code: "HB034", name: "HB034 (CS)",  actual: hb034, target: skuTargets.hb034, pct: skuTargets.hb034 > 0 ? Math.round((hb034 / skuTargets.hb034) * 100) : 0 },
    ];

    return { totalRevenue, totalTarget, achievementPct, forecastPct, newCustomers, topAsms, skus };
  } catch {
    return null;
  }
}

export async function buildMarketingData(periodKey: string): Promise<MarketingData | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("marketing_revenue_results")
      .select("channel_name, revenue_target, revenue_actual, budget_actual")
      .eq("month_key", periodKey);

    if (error || !data || data.length === 0) return null;

    const channels = (data as Record<string, unknown>[]).map((r) => {
      const revenue = Number(r.revenue_actual ?? 0);
      const target  = Number(r.revenue_target ?? 0);
      const spend   = Number(r.budget_actual  ?? 0);
      const roas    = spend > 0 ? Math.round((revenue / spend) * 10) / 10 : null;
      const pct     = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;
      return { name: String(r.channel_name), revenue, target, spend, roas, pct };
    });

    const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
    const totalTarget  = channels.reduce((s, c) => s + c.target,  0);
    const totalSpend   = channels.reduce((s, c) => s + c.spend,   0);
    const overallRoas  = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 10) / 10 : null;

    return { totalRevenue, totalTarget, totalSpend, overallRoas, channels };
  } catch {
    return null;
  }
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function pctBadge(pct: number) {
  const bg = pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  return `<span style="background:${bg};color:#fff;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;">${pct}%</span>`;
}

function sectionHeader(icon: string, title: string) {
  return `<tr><td colspan="10" style="padding:24px 0 10px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">${icon} ${title}</p>
    <hr style="margin:8px 0 0;border:none;border-top:2px solid #e2e8f0;">
  </td></tr>`;
}

export function buildReportHtml(
  taskSummaries: DeptSummary[],
  sales: SalesData | null,
  marketing: MarketingData | null,
  periodKey: string,
  generatedAt: string,
): string {
  const totalTasks     = taskSummaries.reduce((s, d) => s + d.total, 0);
  const totalCompleted = taskSummaries.reduce((s, d) => s + d.completed, 0);
  const totalOverdue   = taskSummaries.reduce((s, d) => s + d.overdue, 0);
  const totalThisWeek  = taskSummaries.reduce((s, d) => s + d.dueThisWeek, 0);

  // ── Sales section ──────────────────────────────────────────────────────────
  const salesHtml = sales ? `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${sectionHeader("📊", "Sales Performance")}

      <!-- Revenue KPI -->
      <tr>
        <td style="padding:4px 0 16px;" colspan="10">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              ${[
                { label: "Revenue Actual",  value: `${sales.totalRevenue.toFixed(1)}M` },
                { label: "Revenue Target",  value: `${sales.totalTarget.toFixed(1)}M` },
                { label: "Achievement",     value: pctBadge(sales.achievementPct) },
                { label: "Month-end Forecast", value: pctBadge(Math.min(150, sales.forecastPct)) },
                { label: "New Customers",   value: String(sales.newCustomers) },
              ].map(({ label, value }) => `
                <td style="width:20%;padding:12px;background:#f8fafc;border-radius:10px;text-align:center;margin:4px;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">${label}</p>
                  <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#0f172a;">${value}</p>
                </td>
              `).join('<td style="width:8px;"></td>')}
            </tr>
          </table>
        </td>
      </tr>

      <!-- SKU progress -->
      <tr><td colspan="10" style="padding-bottom:8px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;">Key SKU Progress</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8fafc;border-radius:10px;overflow:hidden;">
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">SKU</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Actual</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Target</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">%</th>
          </tr>
          ${sales.skus.map((sku) => `
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:8px 12px;font-weight:600;color:#0f172a;">${sku.name}</td>
            <td style="padding:8px 12px;text-align:right;color:#0f172a;">${sku.actual}</td>
            <td style="padding:8px 12px;text-align:right;color:#64748b;">${sku.target > 0 ? sku.target : "—"}</td>
            <td style="padding:8px 12px;text-align:center;">${sku.target > 0 ? pctBadge(sku.pct) : "—"}</td>
          </tr>`).join("")}
        </table>
      </td></tr>

      <!-- Top ASMs -->
      <tr><td colspan="10" style="padding-bottom:4px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;">Top ASMs</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8fafc;border-radius:10px;overflow:hidden;">
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">ASM</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Revenue</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Target</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">%</th>
          </tr>
          ${sales.topAsms.map((asm) => `
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:8px 12px;font-weight:600;color:#0f172a;">${asm.name}</td>
            <td style="padding:8px 12px;text-align:right;color:#0f172a;">${asm.revenue.toFixed(1)}M</td>
            <td style="padding:8px 12px;text-align:right;color:#64748b;">${asm.target > 0 ? `${asm.target.toFixed(1)}M` : "—"}</td>
            <td style="padding:8px 12px;text-align:center;">${asm.target > 0 ? pctBadge(asm.pct) : "—"}</td>
          </tr>`).join("")}
        </table>
      </td></tr>
    </table>` : "";

  // ── Marketing section ──────────────────────────────────────────────────────
  const marketingHtml = marketing ? `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
      ${sectionHeader("📣", "Marketing Performance")}
      <tr><td colspan="10" style="padding-bottom:4px;">
        <!-- Summary KPIs -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
          <tr>
            ${[
              { label: "Total Revenue",  value: `${marketing.totalRevenue.toFixed(1)}M` },
              { label: "Revenue Target", value: `${marketing.totalTarget.toFixed(1)}M` },
              { label: "Achievement",    value: pctBadge(marketing.totalTarget > 0 ? Math.round((marketing.totalRevenue / marketing.totalTarget) * 100) : 0) },
              { label: "Total Ad Spend", value: `${marketing.totalSpend.toFixed(1)}M` },
              { label: "Overall ROAS",   value: marketing.overallRoas !== null ? `${marketing.overallRoas}x` : "—" },
            ].map(({ label, value }) => `
              <td style="width:18%;padding:12px;background:#f8fafc;border-radius:10px;text-align:center;">
                <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">${label}</p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#0f172a;">${value}</p>
              </td>
            `).join('<td style="width:8px;"></td>')}
          </tr>
        </table>

        <!-- Channel table -->
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8fafc;border-radius:10px;overflow:hidden;">
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Channel</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Revenue</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Target</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">%</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">Ad Spend</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">ROAS</th>
          </tr>
          ${marketing.channels.map((ch) => {
            const roasColor = ch.roas === null ? "#64748b" : ch.roas >= 5 ? "#16a34a" : ch.roas >= 2 ? "#d97706" : "#dc2626";
            return `
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:8px 12px;font-weight:600;color:#0f172a;">${ch.name}</td>
            <td style="padding:8px 12px;text-align:right;color:#0f172a;">${ch.revenue.toFixed(1)}M</td>
            <td style="padding:8px 12px;text-align:right;color:#64748b;">${ch.target > 0 ? `${ch.target.toFixed(1)}M` : "—"}</td>
            <td style="padding:8px 12px;text-align:center;">${ch.target > 0 ? pctBadge(ch.pct) : "—"}</td>
            <td style="padding:8px 12px;text-align:right;color:#64748b;">${ch.spend > 0 ? `${ch.spend.toFixed(2)}M` : "—"}</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700;color:${roasColor};">${ch.roas !== null ? `${ch.roas}x` : "—"}</td>
          </tr>`;
          }).join("")}
        </table>
      </td></tr>
    </table>` : "";

  // ── Task section ───────────────────────────────────────────────────────────
  const taskRows = taskSummaries.map((s) => {
    const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    const criticalHtml = s.criticalOverdue.length
      ? s.criticalOverdue.map((o) => {
          const priColor = o.priority === "Critical" ? "#dc2626" : o.priority === "High" ? "#d97706" : "#64748b";
          return `<div style="margin-top:4px;font-size:11px;color:#991b1b;">
            <span style="background:${priColor};color:#fff;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;">${o.priority}</span>
            &nbsp;${o.task} — <em>${o.owner}</em> (due ${o.due})
          </div>`;
        }).join("")
      : "";

    return `<tr>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;vertical-align:top;">${s.dept}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;vertical-align:top;">${s.total}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;color:#16a34a;font-weight:600;vertical-align:top;">${s.completed}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;color:#2563eb;vertical-align:top;">${s.inProgress}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;color:#d97706;font-weight:600;vertical-align:top;">${s.dueThisWeek > 0 ? `⚠ ${s.dueThisWeek}` : "—"}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;vertical-align:top;">${pctBadge(pct)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        ${s.overdue > 0
          ? `<span style="color:#dc2626;font-weight:700;">${s.overdue} overdue</span>${criticalHtml}`
          : `<span style="color:#16a34a;font-size:12px;">✓ All clear</span>`}
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:740px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.10);">

  <!-- Header -->
  <div style="background:#0f172a;padding:32px 32px 24px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:#7dd3fc;">HB Execution OS</p>
    <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">Weekly Business Report</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Period: <strong style="color:#e2e8f0;">${periodKey}</strong> &nbsp;·&nbsp; Generated: ${generatedAt}</p>
  </div>

  <!-- Executive summary strip -->
  <div style="background:#0f172a;border-top:1px solid #1e293b;padding:0 32px 24px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        ${[
          { label: "Total Tasks",  value: String(totalTasks),    color: "#fff" },
          { label: "Completed",    value: String(totalCompleted), color: "#4ade80" },
          { label: "In Progress",  value: String(taskSummaries.reduce((s,d)=>s+d.inProgress,0)), color: "#60a5fa" },
          { label: "Due This Week",value: String(totalThisWeek), color: "#fbbf24" },
          { label: "Overdue",      value: String(totalOverdue),  color: totalOverdue > 0 ? "#f87171" : "#4ade80" },
        ].map(({ label, value, color }) => `
          <td style="padding:16px 12px;text-align:center;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b;">${label}</p>
            <p style="margin:4px 0 0;font-size:26px;font-weight:800;color:${color};">${value}</p>
          </td>
        `).join("")}
      </tr>
    </table>
  </div>

  <div style="padding:24px 32px 32px;">

    <!-- Sales -->
    ${salesHtml}

    <!-- Marketing -->
    ${marketingHtml}

    <!-- Tasks -->
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
      ${sectionHeader("✅", "Department Task Tracker")}
      <tr><td colspan="10">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 14px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Department</th>
              <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Total</th>
              <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Done</th>
              <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">In Progress</th>
              <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Due 7 Days</th>
              <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Completion</th>
              <th style="padding:10px 14px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Overdue Detail</th>
            </tr>
          </thead>
          <tbody>${taskRows}</tbody>
        </table>
      </td></tr>
    </table>

  </div>

  <!-- Footer -->
  <div style="padding:18px 32px 24px;border-top:1px solid #f1f5f9;background:#f8fafc;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">Auto-generated by <strong>HB Execution OS</strong> · Every Monday 08:00 Vietnam time · Reply to this email to contact the system admin.</p>
  </div>
</div>
</body>
</html>`;
}
