"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { marketingWorkbookContext } from "@/lib/demo-data";
import { buildMarketingRoleResults } from "@/lib/marketing/scoring";
import { loadMarketingTasks } from "@/lib/marketing/tasks";
import type { MarketingManualInputs } from "@/lib/marketing/kpi-templates";
import { createWriteClient } from "@/lib/supabase/write";

function getErrorKey(message: string | null | undefined) {
  const normalized = String(message ?? "").toLowerCase();

  if (normalized.includes("relation") || normalized.includes("column") || normalized.includes("schema cache")) {
    return "missing-table";
  }

  if (normalized.includes("row-level security")) {
    return "rls-blocked";
  }

  return "save-failed";
}

export async function saveMarketingManualInputsAction(formData: FormData) {
  const monthKey = String(formData.get("month_key") ?? marketingWorkbookContext.monthKey);
  const rawPayload = String(formData.get("payload") ?? "{}");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/marketing-performance/results?error=save-not-configured`);
  }

  let inputs: MarketingManualInputs;
  try {
    inputs = JSON.parse(rawPayload) as MarketingManualInputs;
  } catch {
    redirect(`/marketing-performance/results?error=invalid-payload`);
  }

  const inputRows = Object.entries(inputs).map(([compositeKey, entry]) => {
    const [roleId, metricId] = compositeKey.split(":");
    return {
      month_key: monthKey,
      role_id: roleId,
      metric_id: metricId,
      target_value: Number(entry.target ?? 0),
      actual_value: Number(entry.actual ?? 0),
    };
  });

  const { tasks } = await loadMarketingTasks(monthKey);
  const roleResults = buildMarketingRoleResults(inputs, tasks);
  const resultRows = roleResults.map((role) => ({
    month_key: monthKey,
    role_id: role.id,
    role_name: role.role,
    workbook_score: role.workbookScore,
    execution_score: role.executionScore,
    total_score: role.totalWithExecution,
    payout_base: role.payoutBase,
    payout_percent: role.payoutPercent,
    payout_amount: role.payoutAmount,
  }));

  const { error: inputError } = await client
    .from("marketing_manual_inputs")
    .upsert(inputRows, { onConflict: "month_key,role_id,metric_id" });

  if (inputError) {
    redirect(`/marketing-performance/results?error=${getErrorKey(inputError.message)}`);
  }

  const { error: resultError } = await client
    .from("marketing_role_results")
    .upsert(resultRows, { onConflict: "month_key,role_id" });

  if (resultError) {
    redirect(`/marketing-performance/results?error=${getErrorKey(resultError.message)}`);
  }

  revalidatePath("/marketing-performance");
  revalidatePath("/marketing-performance/results");
  redirect(`/marketing-performance/results?saved=manual-kpis`);
}
