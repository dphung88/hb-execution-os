"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

export async function upsertSkuLotDateAction(formData: FormData) {
  const code = (formData.get("code") as string ?? "").trim().toUpperCase();
  const name = (formData.get("name") as string ?? "").trim();
  const lotDate = (formData.get("lot_date") as string ?? "").trim() || null;
  const stockOnHand = Number(formData.get("stock_on_hand") ?? 0);
  const weeklySellOut = Number(formData.get("weekly_sell_out") ?? 0);

  if (!code || !hasSupabaseAdminEnv()) return;

  const admin = createAdminClient();
  await admin.from("sku_lot_dates").upsert(
    { code, name: name || null, lot_date: lotDate, stock_on_hand: stockOnHand, weekly_sell_out: weeklySellOut, updated_at: new Date().toISOString() },
    { onConflict: "code" }
  );

  revalidatePath("/settings/skus");
}

export async function deleteSkuLotDateAction(formData: FormData) {
  const code = (formData.get("code") as string ?? "").trim();
  if (!code || !hasSupabaseAdminEnv()) return;

  const admin = createAdminClient();
  await admin.from("sku_lot_dates").delete().eq("code", code);
  revalidatePath("/settings/skus");
}
