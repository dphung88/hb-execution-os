"use server";

import { sendDailyReport } from "@/lib/email-report";

export async function triggerReport(): Promise<{ ok: boolean; error?: string }> {
  try {
    return await sendDailyReport();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
