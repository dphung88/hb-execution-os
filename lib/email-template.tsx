// HTML email template for daily task report
// Uses template literals (no React runtime needed — .tsx for editor support only)

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

const STATUS_COLORS = {
  critical: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444" },
  blocked:  { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", dot: "#f97316" },
  onTrack:  { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", dot: "#22c55e" },
  done:     { bg: "#f8fafc", border: "#e2e8f0", text: "#64748b", dot: "#94a3b8" },
  overdue:  { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444" },
};

function badge(label: string, type: keyof typeof STATUS_COLORS, count: number) {
  if (count === 0) return "";
  const c = STATUS_COLORS[type];
  return `<span style="display:inline-block;background:${c.bg};border:1px solid ${c.border};color:${c.text};border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;margin:2px;">${label} ${count}</span>`;
}

function deptCard(s: DeptStats) {
  const completionPct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
  const barColor = completionPct >= 80 ? "#16a34a" : completionPct >= 50 ? "#f59e0b" : "#ef4444";

  const overdueHtml = s.topOverdue.length > 0
    ? s.topOverdue.map((t) => {
        const priColor = t.priority === "Critical" ? "#dc2626" : t.priority === "High" ? "#ea580c" : "#64748b";
        return `<div style="margin-top:5px;font-size:11px;color:#475569;line-height:1.5;">
          <span style="background:${priColor};color:#fff;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700;">${t.priority}</span>
          &nbsp;<strong>${t.title}</strong> — ${t.owner} <span style="color:#94a3b8;">(due ${t.due})</span>
        </div>`;
      }).join("")
    : "";

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;">
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${s.dept}</p>
              <p style="margin:3px 0 0;font-size:11px;color:#94a3b8;">${s.total} task${s.total !== 1 ? "s" : ""} total</p>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#0f172a;">${completionPct}%</p>
              <p style="margin:0;font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.1em;">complete</p>
            </td>
          </tr>
        </table>
        <!-- Progress bar -->
        <div style="margin-top:8px;height:5px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
          <div style="height:5px;width:${completionPct}%;background:${barColor};border-radius:999px;"></div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 16px;">
        ${badge("Critical", "critical", s.critical)}
        ${badge("Blocked", "blocked", s.blocked)}
        ${badge("On Track", "onTrack", s.onTrack)}
        ${badge("Done", "done", s.done)}
        ${s.overdue > 0 ? badge("Overdue", "overdue", s.overdue) : ""}
        ${overdueHtml}
      </td>
    </tr>
  </table>`;
}

export function renderDailyReportEmail(
  depts: DeptStats[],
  reportDate: string,
  appUrl: string,
): string {
  const totalTasks     = depts.reduce((s, d) => s + d.total, 0);
  const totalDone      = depts.reduce((s, d) => s + d.done, 0);
  const totalCritical  = depts.reduce((s, d) => s + d.critical, 0);
  const totalBlocked   = depts.reduce((s, d) => s + d.blocked, 0);
  const totalOverdue   = depts.reduce((s, d) => s + d.overdue, 0);
  const overallPct     = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const overviewItems = [
    { label: "Total",    value: String(totalTasks),   color: "#fff" },
    { label: "Done",     value: String(totalDone),    color: "#4ade80" },
    { label: "Critical", value: String(totalCritical), color: totalCritical > 0 ? "#f87171" : "#4ade80" },
    { label: "Blocked",  value: String(totalBlocked),  color: totalBlocked  > 0 ? "#fb923c" : "#4ade80" },
    { label: "Overdue",  value: String(totalOverdue),  color: totalOverdue  > 0 ? "#f87171" : "#4ade80" },
  ];

  // Split departments into two columns
  const col1 = depts.filter((_, i) => i % 2 === 0);
  const col2 = depts.filter((_, i) => i % 2 === 1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    @media screen and (max-width:600px) {
      .two-col td { display:block !important; width:100% !important; }
      .email-body { padding:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;background:#fff;border-radius:16px;overflow:hidden;">

  <!-- ── Header ─────────────────────────────────────────────── -->
  <tr><td style="background:#0f172a;padding:28px 28px 22px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#7dd3fc;">HB Execution OS</p>
    <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">Daily Task Report</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">${reportDate} &nbsp;·&nbsp; Auto-generated 07:00 Vietnam time</p>
  </td></tr>

  <!-- ── Overview strip ────────────────────────────────────── -->
  <tr><td style="background:#0f172a;border-top:1px solid #1e293b;padding:6px 20px 22px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${overviewItems.map(({ label, value, color }) => `
          <td style="text-align:center;padding:10px 6px;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#475569;">${label}</p>
            <p style="margin:4px 0 0;font-size:26px;font-weight:800;color:${color};line-height:1;">${value}</p>
          </td>
        `).join("")}
      </tr>
    </table>
    <!-- Overall progress bar -->
    <div style="margin-top:4px;background:#1e293b;border-radius:999px;height:6px;overflow:hidden;">
      <div style="height:6px;width:${overallPct}%;background:#38bdf8;border-radius:999px;transition:width .3s;"></div>
    </div>
    <p style="margin:6px 0 0;font-size:11px;color:#475569;text-align:right;">${overallPct}% overall completion</p>
  </td></tr>

  <!-- ── Body ──────────────────────────────────────────────── -->
  <tr><td class="email-body" style="padding:20px 24px 28px;">

    <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">
      ✅ Department Breakdown
    </p>
    <hr style="margin:0 0 16px;border:none;border-top:2px solid #e2e8f0;">

    <!-- Two-column dept grid -->
    <table class="two-col" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:6px;">
          ${col1.map(deptCard).join("")}
        </td>
        <td width="50%" style="vertical-align:top;padding-left:6px;">
          ${col2.map(deptCard).join("")}
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td align="center">
          <a href="${appUrl}/dashboard"
            style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:999px;letter-spacing:.02em;">
            Open Dashboard →
          </a>
        </td>
      </tr>
    </table>

  </td></tr>

  <!-- ── Footer ────────────────────────────────────────────── -->
  <tr><td style="padding:14px 24px 18px;border-top:1px solid #f1f5f9;background:#f8fafc;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">
      Auto-generated by <strong style="color:#64748b;">HB Execution OS</strong> ·
      Sent daily at 07:00 Vietnam time ·
      <a href="${appUrl}" style="color:#38bdf8;text-decoration:none;">${appUrl}</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
