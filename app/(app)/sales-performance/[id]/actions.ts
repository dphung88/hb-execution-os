"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createWriteClient } from "@/lib/supabase/write";

export async function saveSalesTargetsAction(formData: FormData) {
  const asmId = String(formData.get("asm_id") ?? "");
  const period = String(formData.get("period") ?? "");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/sales-performance/${asmId}?period=${period}&error=save-not-configured`);
  }

  const { error: targetError } = await client.from("sales_monthly_targets").upsert(
    {
      asm_id: asmId,
      month: period,
      revenue_target: Number(formData.get("revenue_target") ?? 0),
      new_customers_target: Number(formData.get("new_customers_target") ?? 0),
      hb006_target: Number(formData.get("hb006_target") ?? 229),
      hb034_target: Number(formData.get("hb034_target") ?? 161),
      hb031_target: Number(formData.get("hb031_target") ?? 243),
      hb035_target: Number(formData.get("hb035_target") ?? 203),
    },
    { onConflict: "asm_id,month" }
  );

  if (targetError) {
    redirect(`/sales-performance/${asmId}?period=${period}&error=target-save-failed`);
  }

  await client
    .from("sales_manager_reviews")
    .upsert(
      {
        asm_id: asmId,
        month: period,
        discipline_score: 0,
        reporting_score: 0,
        manager_note: "",
        reviewed_by: "vp.edisonyang.store",
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "asm_id,month", ignoreDuplicates: true }
    );

  revalidatePath(`/sales-performance/${asmId}`);
  revalidatePath("/sales-performance");
  redirect(`/sales-performance/${asmId}?period=${period}&saved=targets`);
}

export async function saveSalesReviewAction(formData: FormData) {
  const asmId = String(formData.get("asm_id") ?? "");
  const period = String(formData.get("period") ?? "");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/sales-performance/${asmId}?period=${period}&error=save-not-configured`);
  }

  const { error } = await client.from("sales_manager_reviews").upsert(
    {
      asm_id: asmId,
      month: period,
      discipline_score: Number(formData.get("discipline_score") ?? 0),
      reporting_score: Number(formData.get("reporting_score") ?? 0),
      manager_note: String(formData.get("manager_note") ?? ""),
      reviewed_by: "vp.edisonyang.store",
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "asm_id,month" }
  );

  if (error) {
    redirect(`/sales-performance/${asmId}?period=${period}&error=review-save-failed`);
  }

  revalidatePath(`/sales-performance/${asmId}`);
  revalidatePath("/sales-performance");
  redirect(`/sales-performance/${asmId}?period=${period}&saved=review`);
}
