"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { demoSalesAsms } from "@/lib/demo-data";
import { createWriteClient } from "@/lib/supabase/write";

function num(val: FormDataEntryValue | null): number {
  return parseFloat(String(val ?? "0").replace(/\./g, "").replace(",", ".")) || 0;
}

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

  const normDate = (val: FormDataEntryValue | null) => {
    const s = String(val ?? "").trim();
    return s || null;
  };

  const { error } = await client.from("sales_monthly_targets").upsert(
    {
      asm_id: asmId,
      month: period,
      is_probation: formData.getAll("is_probation").includes("1"),
      revenue_target: num(formData.get("revenue_target")),
      new_customers_target: Number(formData.get("new_customers_target") ?? 0),
      key_sku_code_1: normalizeSkuCode(formData.get("key_sku_code_1"), "HB031"),
      key_sku_code_2: normalizeSkuCode(formData.get("key_sku_code_2"), "HB035"),
      clearstock_code_1: normalizeSkuCode(formData.get("clearstock_code_1"), "HB006"),
      clearstock_code_2: normalizeSkuCode(formData.get("clearstock_code_2"), "HB034"),
      hb006_target: Number(formData.get("hb006_target") ?? 229),
      hb034_target: Number(formData.get("hb034_target") ?? 161),
      hb031_target: Number(formData.get("hb031_target") ?? 243),
      hb035_target: Number(formData.get("hb035_target") ?? 203),
      key_sku_lot_date_1: normDate(formData.get("key_sku_lot_date_1")),
      key_sku_lot_date_2: normDate(formData.get("key_sku_lot_date_2")),
      clearstock_lot_date_1: normDate(formData.get("clearstock_lot_date_1")),
      clearstock_lot_date_2: normDate(formData.get("clearstock_lot_date_2")),
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

export async function saveSalesTargetDefaultsAction(formData: FormData) {
  const period = String(formData.get("period") ?? "");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/sales-performance/targets?period=${period}&error=save-not-configured`);
  }

  const revenueTarget = num(formData.get("revenue_target"));
  const newCustomersTarget = Number(formData.get("new_customers_target") ?? 0);
  const keySkuCode1 = normalizeSkuCode(formData.get("key_sku_code_1"), "HB031");
  const keySkuCode2 = normalizeSkuCode(formData.get("key_sku_code_2"), "HB035");
  const clearstockCode1 = normalizeSkuCode(formData.get("clearstock_code_1"), "HB006");
  const clearstockCode2 = normalizeSkuCode(formData.get("clearstock_code_2"), "HB034");
  const hb031Target = Number(formData.get("hb031_target") ?? 243);
  const hb035Target = Number(formData.get("hb035_target") ?? 203);
  const hb006Target = Number(formData.get("hb006_target") ?? 229);
  const hb034Target = Number(formData.get("hb034_target") ?? 161);

  const normDate = (val: FormDataEntryValue | null) => {
    const s = String(val ?? "").trim();
    return s || null;
  };
  const keySkuLotDate1 = normDate(formData.get("key_sku_lot_date_1"));
  const keySkuLotDate2 = normDate(formData.get("key_sku_lot_date_2"));
  const clearstockLotDate1 = normDate(formData.get("clearstock_lot_date_1"));
  const clearstockLotDate2 = normDate(formData.get("clearstock_lot_date_2"));

  const isProbation = formData.getAll("is_probation").includes("1");

  const rows = demoSalesAsms.map((asm) => ({
    asm_id: asm.id,
    month: period,
    is_probation: isProbation,
    revenue_target: asm.id === "NV0001" ? 4000 : revenueTarget,
    new_customers_target: newCustomersTarget,
    key_sku_code_1: keySkuCode1,
    key_sku_code_2: keySkuCode2,
    clearstock_code_1: clearstockCode1,
    clearstock_code_2: clearstockCode2,
    hb031_target: hb031Target,
    hb035_target: hb035Target,
    hb006_target: hb006Target,
    hb034_target: hb034Target,
    key_sku_lot_date_1: keySkuLotDate1,
    key_sku_lot_date_2: keySkuLotDate2,
    clearstock_lot_date_1: clearstockLotDate1,
    clearstock_lot_date_2: clearstockLotDate2,
  }));

  const { error } = await client.from("sales_monthly_targets").upsert(rows, {
    onConflict: "asm_id,month",
  });

  if (error) {
    redirect(`/sales-performance/targets?period=${period}&error=${getErrorKey(error.message)}`);
  }

  revalidatePath("/sales-performance");
  revalidatePath("/sales-performance/targets");
  redirect(`/sales-performance/targets?period=${period}&saved=all`);
}
