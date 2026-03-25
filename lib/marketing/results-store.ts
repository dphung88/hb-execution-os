import { marketingWorkbookContext } from "@/lib/demo-data";
import { type MarketingManualInputs, getDefaultMarketingManualInputs } from "@/lib/marketing/kpi-templates";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function loadMarketingManualInputs(monthKey = marketingWorkbookContext.monthKey) {
  const defaults = getDefaultMarketingManualInputs();

  if (!hasSupabaseClientEnv()) {
    return { inputs: defaults, source: "local" as const };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("marketing_manual_inputs")
      .select("role_id, metric_id, target_value, actual_value")
      .eq("month_key", monthKey);

    if (error || !data?.length) {
      return { inputs: defaults, source: "local" as const };
    }

    const merged: MarketingManualInputs = { ...defaults };

    for (const row of data) {
      merged[`${row.role_id}:${row.metric_id}`] = {
        target: Number(row.target_value ?? 0),
        actual: Number(row.actual_value ?? 0),
      };
    }

    return { inputs: merged, source: "supabase" as const };
  } catch {
    return { inputs: defaults, source: "local" as const };
  }
}
