import { NextRequest, NextResponse } from "next/server";
import { sendDailyReport } from "@/lib/email-report";

// Called by Vercel Cron at 01:00 UTC (08:00 Vietnam time) daily.
// Uses Resend + the new Business Report template (Sales + Marketing + Finance + Dept Breakdown).

export async function GET(req: NextRequest) {
  const authHeader  = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const cronSecret  = process.env.CRON_SECRET;

  const authorized =
    !cronSecret || // allow if no secret configured (local dev)
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && secretParam === cronSecret);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDailyReport();
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    console.error("[send-task-report] failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
