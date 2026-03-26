"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { syncAllAsmsInMonth } from "@/lib/sales/sync";

export async function syncSalesPeriodAction(formData: FormData) {
  const period = String(formData.get("period") ?? "").trim();

  if (!period) {
    redirect("/sales-performance?sync=missing-period");
  }

  // Run sync — capture result or error message WITHOUT calling redirect inside try/catch
  // (Next.js redirect() throws internally; catching it causes NEXT_REDIRECT error)
  let successRedirect: string | null = null;
  let errorRedirect: string | null = null;

  try {
    const result = await syncAllAsmsInMonth(period);
    revalidatePath("/sales-performance");
    revalidatePath(`/sales-performance?period=${period}`);
    const msg = result.syncedCount === 0 && result.firstError
      ? `0 ASM synced. Error: ${result.firstError}`
      : `Synced ${result.syncedCount} ASM for ${result.fromDate} → ${result.toDate}${result.failedCount > 0 ? ` (${result.failedCount} failed)` : ""}`;
    const syncParam = result.syncedCount === 0 ? "error" : "success";
    successRedirect = `/sales-performance?period=${period}&sync=${syncParam}&synced=${result.syncedCount}&failed=${result.failedCount}&message=${encodeURIComponent(msg)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    errorRedirect = `/sales-performance?period=${period}&sync=error&message=${encodeURIComponent(message)}`;
  }

  // Redirect outside try/catch so Next.js handles it correctly
  if (successRedirect) redirect(successRedirect);
  if (errorRedirect) redirect(errorRedirect);
}
