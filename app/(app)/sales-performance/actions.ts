"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { syncAllAsmsInMonth } from "@/lib/sales/sync";
import { createClient } from "@/lib/supabase/server";

export async function syncSalesPeriodAction(formData: FormData) {
  const period = String(formData.get("period") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Please sign in to run ERP sync.")}`);
  }

  if (!period) {
    redirect("/sales-performance?sync=missing-period");
  }

  try {
    const result = await syncAllAsmsInMonth(period);

    revalidatePath("/sales-performance");
    revalidatePath(`/sales-performance?period=${period}`);

    redirect(
      `/sales-performance?period=${period}&sync=success&synced=${result.syncedCount}&failed=${result.failedCount}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    redirect(`/sales-performance?period=${period}&sync=error&message=${encodeURIComponent(message)}`);
  }
}
