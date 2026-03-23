"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createWriteClient } from "@/lib/supabase/write";

export async function saveSalesTargetRowAction(formData: FormData) {
  const asmId = String(formData.get("asm_id") ?? "");
  const period = String(formData.get("period") ?? "");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/sales-performance/targets?period=${period}&error=save-not-configured`);
  }

  const { error } = await client.from("sales_monthly_targets").upsert(
    {
      asm_id: asmId,
      month: period,
      revenue_target: Number(formData.get("revenue_target") ?? 0),
      new_customers_target: Number(formData.get("new_customers_target") ?? 0),
      key_sku_code_1: String(formData.get("key_sku_code_1") ?? "HB031").toUpperCase(),
      key_sku_code_2: String(formData.get("key_sku_code_2") ?? "HB035").toUpperCase(),
      clearstock_code_1: String(formData.get("clearstock_code_1") ?? "HB006").toUpperCase(),
      clearstock_code_2: String(formData.get("clearstock_code_2") ?? "HB034").toUpperCase(),
      hb006_target: Number(formData.get("hb006_target") ?? 229),
      hb034_target: Number(formData.get("hb034_target") ?? 161),
      hb031_target: Number(formData.get("hb031_target") ?? 243),
      hb035_target: Number(formData.get("hb035_target") ?? 203),
    },
    { onConflict: "asm_id,month" }
  );

  if (error) {
    redirect(`/sales-performance/targets?period=${period}&error=save-failed`);
  }

  revalidatePath("/sales-performance");
  revalidatePath("/sales-performance/targets");
  redirect(`/sales-performance/targets?period=${period}&saved=${asmId}`);
}
