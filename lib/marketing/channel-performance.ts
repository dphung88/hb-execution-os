import { marketingChannelSetup } from "@/lib/demo-data";
import { hasSupabaseAdminEnv, hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ChannelPerformanceRow = {
  channel: string;
  revenueTarget: number;
  revenueActual: number;
  budgetActual: number;   // ad spend entered manually
  /** ROAS = revenueActual / budgetActual, null if no spend */
  roas: number | null;
  achievementPct: number; // revenueActual / revenueTarget * 100
};

/** Demo fallback — built from marketingChannelSetup */
function getDemoChannelPerformance(periodKey: string): ChannelPerformanceRow[] {
  return marketingChannelSetup.map((ch) => {
    const roas = ch.actualBudget > 0 ? Math.round((ch.revenueActual / ch.actualBudget) * 10) / 10 : null;
    const achievementPct = ch.revenueTarget > 0
      ? Math.min(100, Math.round((ch.revenueActual / ch.revenueTarget) * 100))
      : 0;
    return {
      channel: ch.channel,
      revenueTarget: ch.revenueTarget,
      revenueActual: ch.revenueActual,
      budgetActual: ch.actualBudget,
      roas,
      achievementPct,
    };
  });
}

export async function getChannelPerformance(periodKey: string): Promise<{
  rows: ChannelPerformanceRow[];
  source: "live" | "demo";
}> {
  if (!hasSupabaseClientEnv()) {
    return { rows: getDemoChannelPerformance(periodKey), source: "demo" };
  }

  try {
    const supabase = hasSupabaseAdminEnv() ? createAdminClient() : await createClient();
    const { data, error } = await supabase
      .from("marketing_revenue_results")
      .select("channel_name, revenue_target, revenue_actual, budget_actual")
      .eq("month_key", periodKey);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { rows: getDemoChannelPerformance(periodKey), source: "demo" };
    }

    // Merge live DB rows with the channel list — channels not yet saved keep zeros
    const dbByChannel = new Map(data.map((r) => [r.channel_name as string, r]));
    const rows: ChannelPerformanceRow[] = marketingChannelSetup.map((ch) => {
      const db = dbByChannel.get(ch.channel);
      const revenueTarget = Number(db?.revenue_target  ?? ch.revenueTarget);
      const revenueActual = Number(db?.revenue_actual  ?? ch.revenueActual);
      const budgetActual  = Number(db?.budget_actual   ?? ch.actualBudget);
      const roas = budgetActual > 0 ? Math.round((revenueActual / budgetActual) * 10) / 10 : null;
      const achievementPct = revenueTarget > 0
        ? Math.min(100, Math.round((revenueActual / revenueTarget) * 100))
        : 0;
      return { channel: ch.channel, revenueTarget, revenueActual, budgetActual, roas, achievementPct };
    });

    return { rows, source: "live" };
  } catch {
    return { rows: getDemoChannelPerformance(periodKey), source: "demo" };
  }
}
