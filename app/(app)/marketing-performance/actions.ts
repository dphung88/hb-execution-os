"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { marketingChannelSetup } from "@/lib/demo-data";

export async function upsertChannelSpendAction(formData: FormData) {
  const periodKey = formData.get("period_key") as string;
  if (!periodKey) return;

  if (!hasSupabaseAdminEnv()) return; // demo mode — no-op

  const admin = createAdminClient();

  const rows = marketingChannelSetup.map((ch) => {
    const spend = parseFloat((formData.get(`spend_${ch.channel}`) as string) ?? "0") || 0;
    const revenueTarget = parseFloat((formData.get(`rev_target_${ch.channel}`) as string) ?? "0") || 0;
    return {
      month_key:      periodKey,
      channel_name:   ch.channel,
      revenue_target: revenueTarget,
      budget_actual:  spend,
      updated_at:     new Date().toISOString(),
    };
  });

  await admin
    .from("marketing_revenue_results")
    .upsert(rows, { onConflict: "month_key,channel_name" });

  revalidatePath("/marketing-performance");
}
