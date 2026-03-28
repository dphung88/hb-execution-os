import { NextResponse } from "next/server";
import { sendDailyReport } from "@/lib/email-report";

export async function POST() {
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
