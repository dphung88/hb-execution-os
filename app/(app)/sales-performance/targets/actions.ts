"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Please sign in to manage monthly sales targets.")}`);
  }

  return user;
}

export async function saveSalesTargetRowAction(formData: FormData) {
  await requireUser();

  const asmId = String(formData.get("asm_id") ?? "");
  const period = String(formData.get("period") ?? "");
  const admin = createAdminClient();

  await admin.from("sales_monthly_targets").upsert(
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

  revalidatePath("/sales-performance");
  revalidatePath("/sales-performance/targets");
  redirect(`/sales-performance/targets?period=${period}&saved=${asmId}`);
}
