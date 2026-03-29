import { NextRequest, NextResponse } from "next/server";
import { sendDailyReport } from "@/lib/email-report";

// Called by Azure Functions cron every 2h (or Quick Report button in the UI).
// If CRON_SECRET env is set, the caller must pass it via x-cron-secret header.
// The UI Quick Report button passes the secret via the same header.

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await sendDailyReport();
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
