"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createWriteClient } from "@/lib/supabase/write";

function normalizeSkuCode(value: FormDataEntryValue | null, fallback: string) {
  const raw = String(value ?? "").trim().toUpperCase();

  if (!raw) {
    return fallback;
  }

  if (/^\d{1,3}$/.test(raw)) {
    return `HB${raw.padStart(3, "0")}`;
  }

  const digits = raw.replace(/^HB/i, "").replace(/\D/g, "");

  if (!digits) {
    return fallback;
  }

  const clamped = Math.max(1, Math.min(999, Number(digits)));
  return `HB${String(clamped).padStart(3, "0")}`;
}

function getErrorKey(message: string | null | undefined) {
  const normalized = String(message ?? "").toLowerCase();

  if (normalized.includes("schema cache") || normalized.includes("column")) {
    return "missing-columns";
  }

  if (normalized.includes("row-level security")) {
    return "rls-blocked";
  }

  return "save-failed";
}

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
      key_sku_code_1: normalizeSkuCode(formData.get("key_sku_code_1"), "HB031"),
      key_sku_code_2: normalizeSkuCode(formData.get("key_sku_code_2"), "HB035"),
      clearstock_code_1: normalizeSkuCode(formData.get("clearstock_code_1"), "HB006"),
      clearstock_code_2: normalizeSkuCode(formData.get("clearstock_code_2"), "HB034"),
      hb006_target: Number(formData.get("hb006_target") ?? 229),
      hb034_target: Number(formData.get("hb034_target") ?? 161),
      hb031_target: Number(formData.get("hb031_target") ?? 243),
      hb035_target: Number(formData.get("hb035_target") ?? 203),
    },
    { onConflict: "asm_id,month" }
  );

  if (error) {
    redirect(`/sales-performance/targets?period=${period}&error=${getErrorKey(error.message)}`);
  }

  revalidatePath("/sales-performance");
  revalidatePath("/sales-performance/targets");
  redirect(`/sales-performance/targets?period=${period}&saved=${asmId}`);
}
