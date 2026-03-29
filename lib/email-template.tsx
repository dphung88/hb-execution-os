// HTML email template — Business Report
// Combines Sales Performance + Marketing Performance + Finance Summary + Department Breakdown
//
// Mobile-safe rules observed throughout:
//  - max 3 columns per KPI row (nested table, width="33%")
//  - all wide tables wrapped in scrollWrap (overflow-x:auto)
//  - no media queries needed for KPI grids
//  - header overview strip uses the same 3-col grid (no 5-col single row)
//  - channel breakdown: 5 cols max to fit 360px screens without horizontal scroll

import type { SalesData, MarketingData } from "@/lib/email/task-report";

export type DeptStats = {
  dept: string;
  total: number;
  critical: number;
  blocked: number;
  onTrack: number;
  done: number;
  overdue: number;
  topOverdue: { title: string; owner: string; due: string; priority: string }[];
};

export type FinanceData = {
  totalExpense: number | null;   // total expenses this period (M VND)
  grossProfitPct: number | null; // gross profit % if computable
  budgetUtilized: number | null; // % of monthly budget consumed
  source: "live" | "derived" | "pending";
};

// ─── Shared helpers ────────────────────────────────────────────────────────

function pctBadge(pct: number) {
  const bg = pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  return `<span style="background:${bg};color:#fff;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;">${pct}%</span>`;
}

function sectionHeader(icon: string, title: string) {
  return `<p style="margin:20px 0 6px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">${icon} ${title}</p>
  <hr style="margin:0 0 12px;border:none;border-top:2px solid #e2e8f0;">`;
}

// 3-per-row KPI card grid — works on all email clients without media queries
function kpiGrid(items: { label: string; value: string }[]) {
  const rows: { label: string; value: string }[][] = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;table-layout:fixed;">
    ${rows.map((row) => `
    <tr>
      ${row.map(({ label, value }) => `
        <td width="33%" style="padding:4px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;">
            <tr><td style="padding:11px 8px;text-align:center;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">${label}</p>
              <p style="margin:5px 0 0;font-size:17px;font-weight:700;color:#0f172a;">${value}</p>
            </td></tr>
          </table>
        </td>
      `).join("")}
      ${row.length < 3 ? Array(3 - row.length).fill('<td width="33%"></td>').join("") : ""}
    </tr>`).join("")}
  </table>`;
}

// Scroll wrapper for wide tables — set as block on a div for Android + iOS
function scrollWrap(tableHtml: string) {
  return `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;display:block;">${tableHtml}</div>`;
}

// ─── Sales section ─────────────────────────────────────────────────────────

function salesSection(sales: SalesData) {
  return `
  ${sectionHeader("📊", "Sales Performance")}
  ${kpiGrid([
    { label: "Revenue Actual",     value: `${sales.totalRevenue.toFixed(1)}M` },
    { label: "Revenue Target",     value: `${sales.totalTarget.toFixed(1)}M` },
    { label: "Achievement",        value: pctBadge(sales.achievementPct) },
    { label: "Month-end Forecast", value: pctBadge(Math.min(150, sales.forecastPct)) },
    { label: "New Customers",      value: String(sales.newCustomers) },
  ])}

  <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;">Key SKU Progress</p>
  ${scrollWrap(`
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:340px;border-collapse:collapse;background:#f8fafc;font-size:13px;">
    <tr style="background:#f1f5f9;">
      <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Product</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Actual</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Target</th>
      <th style="padding:7px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">%</th>
    </tr>
    ${sales.skus.map((sku) => `
    <tr style="border-top:1px solid #e2e8f0;">
      <td style="padding:7px 10px;font-weight:600;color:#0f172a;white-space:nowrap;">${sku.name}</td>
      <td style="padding:7px 10px;text-align:right;color:#0f172a;">${sku.actual}</td>
      <td style="padding:7px 10px;text-align:right;color:#64748b;">${sku.target > 0 ? sku.target : "—"}</td>
      <td style="padding:7px 10px;text-align:center;">${sku.target > 0 ? pctBadge(sku.pct) : "—"}</td>
    </tr>`).join("")}
  </table>`)}

  <p style="margin:10px 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;">Top ASMs</p>
  ${scrollWrap(`
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:300px;border-collapse:collapse;background:#f8fafc;font-size:13px;">
    <tr style="background:#f1f5f9;">
      <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">ASM</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Revenue</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Target</th>
      <th style="padding:7px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">%</th>
    </tr>
    ${sales.topAsms.map((asm) => `
    <tr style="border-top:1px solid #e2e8f0;">
      <td style="padding:7px 10px;font-weight:600;color:#0f172a;white-space:nowrap;">${asm.name}</td>
      <td style="padding:7px 10px;text-align:right;color:#0f172a;">${asm.revenue.toFixed(1)}M</td>
      <td style="padding:7px 10px;text-align:right;color:#64748b;">${asm.target > 0 ? `${asm.target.toFixed(1)}M` : "—"}</td>
      <td style="padding:7px 10px;text-align:center;">${asm.target > 0 ? pctBadge(asm.pct) : "—"}</td>
    </tr>`).join("")}
  </table>`)}`;
}

// ─── Marketing section ─────────────────────────────────────────────────────
// Channel table uses 5 cols (Revenue, %, Spend, ROAS — Target dropped) to fit
// 360px screens without requiring horizontal scroll.

function marketingSection(marketing: MarketingData) {
  const achievePct = marketing.totalTarget > 0
    ? Math.round((marketing.totalRevenue / marketing.totalTarget) * 100) : 0;

  return `
  ${sectionHeader("📣", "Marketing Performance")}
  ${kpiGrid([
    { label: "Total Revenue",  value: `${marketing.totalRevenue.toFixed(1)}M` },
    { label: "Revenue Target", value: `${marketing.totalTarget.toFixed(1)}M` },
    { label: "Achievement",    value: pctBadge(achievePct) },
    { label: "Total Ad Spend", value: `${marketing.totalSpend.toFixed(2)}M` },
    { label: "Overall ROAS",   value: marketing.overallRoas !== null ? `${marketing.overallRoas}x` : "—" },
    { label: "AOV",            value: marketing.aov !== null ? `${marketing.aov.toFixed(2)}M` : "—" },
    { label: "Total Orders",   value: marketing.totalPO !== null ? String(marketing.totalPO) : "—" },
  ])}

  <p style="margin:0 0 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;">Channel Breakdown</p>
  ${scrollWrap(`
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:320px;border-collapse:collapse;background:#f8fafc;font-size:13px;">
    <tr style="background:#f1f5f9;">
      <th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Channel</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Revenue</th>
      <th style="padding:7px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Achieve</th>
      <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Spend</th>
      <th style="padding:7px 10px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">ROAS</th>
    </tr>
    ${marketing.channels.map((ch) => {
      const roasColor = ch.roas === null ? "#64748b" : ch.roas >= 5 ? "#16a34a" : ch.roas >= 2 ? "#d97706" : "#dc2626";
      return `
    <tr style="border-top:1px solid #e2e8f0;">
      <td style="padding:7px 10px;font-weight:600;color:#0f172a;white-space:nowrap;">${ch.name}</td>
      <td style="padding:7px 10px;text-align:right;color:#0f172a;">${ch.revenue.toFixed(1)}M</td>
      <td style="padding:7px 10px;text-align:center;">${ch.target > 0 ? pctBadge(ch.pct) : "—"}</td>
      <td style="padding:7px 10px;text-align:right;color:#64748b;">${ch.spend > 0 ? `${ch.spend.toFixed(2)}M` : "—"}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;color:${roasColor};">${ch.roas !== null ? `${ch.roas}x` : "—"}</td>
    </tr>`;
    }).join("")}
  </table>`)}`;
}

// ─── Finance section ────────────────────────────────────────────────────────

function financeSection(finance: FinanceData, sales: SalesData | null, marketing: MarketingData | null) {
  // Derive best-effort values
  const revenue   = sales?.totalRevenue ?? null;
  const adSpend   = marketing?.totalSpend ?? null;
  const expense   = finance.totalExpense ?? adSpend;
  const gpPct     = finance.grossProfitPct;
  const budgetPct = finance.budgetUtilized;

  const kpiItems: { label: string; value: string }[] = [
    { label: "Revenue (Sales)",    value: revenue   !== null ? `${revenue.toFixed(1)}M`  : "—" },
    { label: "Total Expense",      value: expense   !== null ? `${expense.toFixed(2)}M`  : "—" },
    { label: "Gross Profit %",     value: gpPct     !== null ? `${gpPct.toFixed(1)}%`    : "—" },
    { label: "Budget Utilized",    value: budgetPct !== null ? `${budgetPct.toFixed(0)}%` : "—" },
    { label: "Ad Spend (Mktg)",    value: adSpend   !== null ? `${adSpend.toFixed(2)}M`  : "—" },
  ];

  const pendingNote = finance.source === "pending"
    ? `<p style="margin:4px 0 10px;font-size:11px;color:#94a3b8;font-style:italic;">P&L data integration pending — expense &amp; GP% shown when available.</p>`
    : "";

  return `
  ${sectionHeader("💰", "Finance Summary")}
  ${pendingNote}
  ${kpiGrid(kpiItems)}`;
}

// ─── Dept card (2-col grid) ────────────────────────────────────────────────

const STATUS_COLORS = {
  critical: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  blocked:  { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c" },
  onTrack:  { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
  done:     { bg: "#f8fafc", border: "#e2e8f0", text: "#64748b" },
  overdue:  { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
};

function statusBadge(label: string, type: keyof typeof STATUS_COLORS, count: number) {
  if (count === 0) return "";
  const c = STATUS_COLORS[type];
  return `<span style="display:inline-block;background:${c.bg};border:1px solid ${c.border};color:${c.text};border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;margin:2px;">${label} ${count}</span>`;
}

function deptCard(s: DeptStats) {
  const pct      = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
  const barColor = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";

  const overdueHtml = s.topOverdue.map((t) => {
    const pc = t.priority === "Critical" ? "#dc2626" : t.priority === "High" ? "#ea580c" : "#64748b";
    return `<div style="margin-top:5px;font-size:11px;color:#475569;line-height:1.5;">
      <span style="background:${pc};color:#fff;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700;">${t.priority}</span>
      &nbsp;<strong>${t.title}</strong> — ${t.owner} <span style="color:#94a3b8;">(due ${t.due})</span>
    </div>`;
  }).join("");

  const badges = [
    statusBadge("Critical", "critical", s.critical),
    statusBadge("Blocked",  "blocked",  s.blocked),
    statusBadge("On Track", "onTrack",  s.onTrack),
    statusBadge("Done",     "done",     s.done),
    s.overdue > 0 ? statusBadge("Overdue", "overdue", s.overdue) : "",
  ].join("");
  const bottomContent = badges || overdueHtml
    ? badges + overdueHtml
    : `<span style="font-size:11px;color:#94a3b8;">No active tasks</span>`;

  // Use <div> outer wrapper — Gmail iOS (WebKit WebView) renders divs to full
  // width reliably; nested <table width="100%"> is often ignored by Gmail.
  return `
  <div style="display:block;width:100%;margin-bottom:12px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;">
    <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${s.dept}</p>
          <p style="margin:3px 0 0;font-size:11px;color:#94a3b8;">${s.total} task${s.total !== 1 ? "s" : ""} total</p>
        </td>
        <td style="text-align:right;vertical-align:top;white-space:nowrap;">
          <p style="margin:0;font-size:20px;font-weight:800;color:#0f172a;">${pct}%</p>
          <p style="margin:0;font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.1em;">complete</p>
        </td>
      </tr></table>
      <div style="margin-top:8px;height:5px;background:#f1f5f9;border-radius:999px;">
        <div style="height:5px;width:${pct}%;background:${barColor};border-radius:999px;min-height:5px;"></div>
      </div>
    </div>
    <div style="padding:10px 16px;">
      ${bottomContent}
    </div>
  </div>`;
}

// ─── Main render ───────────────────────────────────────────────────────────

export function renderDailyReportEmail(
  depts: DeptStats[],
  sales: SalesData | null,
  marketing: MarketingData | null,
  reportDate: string,
  appUrl: string,
  finance?: FinanceData,
): string {
  const totalTasks    = depts.reduce((s, d) => s + d.total,    0);
  const totalDone     = depts.reduce((s, d) => s + d.done,     0);
  const totalCritical = depts.reduce((s, d) => s + d.critical, 0);
  const totalBlocked  = depts.reduce((s, d) => s + d.blocked,  0);
  const totalOverdue  = depts.reduce((s, d) => s + d.overdue,  0);
  const overallPct    = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  // Header overview: 3-col rows (mobile-safe, max 3 per row)
  const overviewItems = [
    { label: "Total Tasks", value: String(totalTasks),    color: "#fff" },
    { label: "Done",        value: String(totalDone),     color: "#4ade80" },
    { label: "Critical",    value: String(totalCritical), color: totalCritical > 0 ? "#f87171" : "#4ade80" },
    { label: "Blocked",     value: String(totalBlocked),  color: totalBlocked  > 0 ? "#fb923c" : "#4ade80" },
    { label: "Overdue",     value: String(totalOverdue),  color: totalOverdue  > 0 ? "#f87171" : "#4ade80" },
  ];
  // Build rows of 3 for the dark header strip
  const overviewRows: typeof overviewItems[] = [];
  for (let i = 0; i < overviewItems.length; i += 3) overviewRows.push(overviewItems.slice(i, i + 3));
  const overviewHtml = overviewRows.map((row) => `
    <tr>
      ${row.map(({ label, value, color }) => `
        <td width="33%" style="text-align:center;padding:10px 6px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#475569;">${label}</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:${color};line-height:1;">${value}</p>
        </td>`).join("")}
      ${row.length < 3 ? Array(3 - row.length).fill('<td width="33%"></td>').join("") : ""}
    </tr>`).join("");

  // Dept cards rendered as a single column — 2-col layouts break on Android Gmail
  // because media queries are stripped. Single-column is universally safe.

  // Finance fallback: "pending" section if no finance data passed
  const financeData: FinanceData = finance ?? {
    totalExpense: null,
    grossProfitPct: null,
    budgetUtilized: null,
    source: "pending",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    @media screen and (max-width:480px) {
      .email-body { padding:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 8px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;background:#fff;border-radius:16px;overflow:hidden;">

  <!-- Header -->
  <tr><td style="background:#0f172a;padding:26px 26px 20px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#7dd3fc;">Execution OS</p>
    <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">Business Report</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">${reportDate}</p>
  </td></tr>

  <!-- Overview strip (3-col rows, mobile-safe) -->
  <tr><td style="background:#0f172a;border-top:1px solid #1e293b;padding:6px 20px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${overviewHtml}
    </table>
    <div style="margin-top:4px;background:#1e293b;border-radius:999px;height:5px;overflow:hidden;">
      <div style="height:5px;width:${overallPct}%;background:#38bdf8;border-radius:999px;"></div>
    </div>
    <p style="margin:5px 0 0;font-size:11px;color:#475569;text-align:right;">${overallPct}% overall completion</p>
  </td></tr>

  <!-- Body -->
  <tr><td class="email-body" style="padding:20px 24px 28px;">

    <!-- Sales Performance -->
    ${sales ? salesSection(sales) : ""}

    <!-- Marketing Performance -->
    ${marketing ? marketingSection(marketing) : ""}

    <!-- Finance Summary -->
    ${financeSection(financeData, sales, marketing)}

    <!-- Department Breakdown — single column, works on all email clients -->
    ${sectionHeader("✅", "Department Breakdown")}
    ${depts.map(deptCard).join("")}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr><td align="center">
        <a href="${appUrl}/dashboard"
          style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 30px;border-radius:999px;">
          Open Dashboard →
        </a>
      </td></tr>
    </table>

  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
