import { NextRequest, NextResponse } from "next/server";
import { buildTaskReportSummaries, buildReportHtml } from "@/lib/email/task-report";
import { sendEmail } from "@/lib/email/mailer";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

// Called by Vercel Cron every Monday at 01:00 UTC (08:00 Vietnam time)
// Also callable manually: GET /api/cron/send-task-report?secret=<CRON_SECRET>

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  const authorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && secretParam === cronSecret);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.REPORT_TO_EMAIL ?? "dphung@my.ggu.edu";

  try {
    const periods = await getPeriods();
    const periodKey = getCurrentPeriod(periods);
    const now = new Date();
    const generatedAt = now.toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const summaries = await buildTaskReportSummaries(periodKey);
    const html = buildReportHtml(summaries, periodKey, generatedAt);

    const totalTasks   = summaries.reduce((s, d) => s + d.total, 0);
    const totalOverdue = summaries.reduce((s, d) => s + d.overdue, 0);
    const subject = `[HB Execution OS] Weekly Task Report — ${periodKey} · ${totalTasks} tasks · ${totalOverdue} overdue`;

    await sendEmail({ to, subject, html });

    console.log(`[send-task-report] sent to ${to}, period=${periodKey}`);
    return NextResponse.json({
      ok: true,
      sentTo: to,
      periodKey,
      departments: summaries.length,
      totalTasks,
      totalOverdue,
    });
  } catch (err) {
    console.error("[send-task-report] failed:", err);
    return NextResponse.json(
      { error: "Failed to send report", detail: String(err) },
      { status: 500 }
    );
  }
}
