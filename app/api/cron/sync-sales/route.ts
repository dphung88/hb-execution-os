import { NextRequest, NextResponse } from "next/server";
import { syncAllAsmsInMonth } from "@/lib/sales/sync";
import { revalidatePath } from "next/cache";

// This route is called by Vercel Cron every day at 06:00 UTC (13:00 Vietnam time)
// Protected by CRON_SECRET so only Vercel can trigger it

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Sync current month and previous month (for late ERP updates)
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonth = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;

  const results: Record<string, { syncedCount: number; failedCount: number }> = {};

  for (const period of [currentMonth, prevMonth]) {
    try {
      const result = await syncAllAsmsInMonth(period);
      results[period] = { syncedCount: result.syncedCount, failedCount: result.failedCount };
    } catch (err) {
      results[period] = { syncedCount: 0, failedCount: -1 };
      console.error(`[cron] sync failed for ${period}:`, err);
    }
  }

  // Revalidate dashboard pages so next visit shows fresh data
  revalidatePath("/sales-performance");
  revalidatePath("/sales-performance/forecast");

  console.log("[cron] sync-sales completed", results);

  return NextResponse.json({
    ok: true,
    triggeredAt: now.toISOString(),
    results,
  });
}
