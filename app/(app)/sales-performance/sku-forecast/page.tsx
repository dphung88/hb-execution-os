import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { getPeriods } from "@/lib/config/periods";
import { getAvailableSalesPeriods } from "@/lib/sales/queries";
import { SkuForecastWorkspace, type SkuForecastRow } from "@/components/sales/sku-forecast-workspace";

type Props = {
  searchParams?: Promise<{ period?: string }>;
};

export default async function SkuForecastPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const [availPeriods, configPeriods] = await Promise.all([
    getAvailableSalesPeriods(),
    getPeriods(),
  ]);
  const periods = availPeriods.length ? availPeriods : configPeriods.map((p) => ({ key: p.key, label: p.label }));
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "2026-03";

  // Resolve period window
  const periodConfig = configPeriods.find((p) => p.key === selectedPeriod);
  const TODAY = new Date();
  const start = periodConfig ? new Date(`${periodConfig.startDate}T00:00:00`) : TODAY;
  const end = periodConfig ? new Date(`${periodConfig.endDate}T00:00:00`) : TODAY;
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const elapsedRaw = Math.floor((TODAY.getTime() - start.getTime()) / 86400000) + 1;
  const elapsedDays = Math.max(0, Math.min(elapsedRaw, totalDays));
  const remainingDays = totalDays - elapsedDays;

  let rows: SkuForecastRow[] = [];

  if (hasSupabaseAdminEnv()) {
    const admin = createAdminClient();

    const [{ data: salesData }, { data: lotData }] = await Promise.all([
      admin
        .from("kpi_item_breakdowns")
        .select("item_code, item_name, quantity")
        .eq("month", selectedPeriod),
      admin
        .from("sku_lot_dates")
        .select("code, name, lot_date, stock_on_hand, weekly_sell_out"),
    ]);

    // Aggregate actual sales by SKU
    const salesByCode = new Map<string, { name: string; totalQty: number }>();
    for (const row of (salesData ?? []) as Array<{ item_code: string; item_name: string; quantity: number }>) {
      const code = String(row.item_code).toUpperCase();
      const prev = salesByCode.get(code) ?? { name: row.item_name ?? code, totalQty: 0 };
      prev.totalQty += Number(row.quantity ?? 0);
      salesByCode.set(code, prev);
    }

    // Build lot map
    const lotMap = new Map<string, { name: string | null; lot_date: string | null; stock_on_hand: number; weekly_sell_out: number }>();
    for (const row of (lotData ?? []) as Array<{ code: string; name: string | null; lot_date: string | null; stock_on_hand: number; weekly_sell_out: number }>) {
      lotMap.set(row.code.toUpperCase(), row);
    }

    // Union of all codes
    const allCodes = new Set([...salesByCode.keys(), ...lotMap.keys()]);

    for (const code of allCodes) {
      const sales = salesByCode.get(code);
      const lot = lotMap.get(code);

      const totalActual = sales?.totalQty ?? 0;
      const weeklySellOut = lot?.weekly_sell_out ?? 0;
      const averageDailySell =
        elapsedDays > 0
          ? Math.round((totalActual / elapsedDays) * 100) / 100
          : weeklySellOut > 0 ? Math.round((weeklySellOut / 7) * 100) / 100 : 0;

      const stockOnHand = lot?.stock_on_hand ?? 0;
      const lotDate = lot?.lot_date ?? "";
      const name = sales?.name ?? lot?.name ?? code;

      const daysUntilExpiry = lotDate
        ? Math.max(Math.floor((new Date(`${lotDate}T00:00:00`).getTime() - TODAY.getTime()) / 86400000), 1)
        : 9999;

      const requiredDailySell = stockOnHand > 0 && daysUntilExpiry < 9999
        ? Math.round((stockOnHand / daysUntilExpiry) * 100) / 100
        : 0;

      const dailySellGap = Math.round((averageDailySell - requiredDailySell) * 100) / 100;
      const monthlyPushNeeded = requiredDailySell > 0 ? Math.ceil(requiredDailySell * 30) : 0;
      const coverageMonths =
        averageDailySell > 0
          ? Math.round((stockOnHand / (averageDailySell * 30)) * 100) / 100
          : stockOnHand > 0 ? 9999 : 0;

      const risk: SkuForecastRow["risk"] =
        !lotDate ? "No date"
        : dailySellGap >= 0 ? "Healthy"
        : dailySellGap >= -requiredDailySell * 0.3 ? "Watch"
        : "At risk";

      rows.push({
        code,
        name,
        lotDate,
        stockOnHand,
        totalActual,
        averageDailySell,
        requiredDailySell,
        dailySellGap,
        daysUntilExpiry: daysUntilExpiry === 9999 ? 0 : daysUntilExpiry,
        monthlyPushNeeded,
        coverageMonths,
        risk,
      });
    }

    // Sort: At risk → Watch → Healthy → No date; within group by dailySellGap asc
    const riskOrder = { "At risk": 0, Watch: 1, Healthy: 2, "No date": 3 };
    rows.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || a.dailySellGap - b.dailySellGap);
  }

  return (
    <SkuForecastWorkspace
      rows={rows}
      selectedPeriod={selectedPeriod}
      periods={periods}
      elapsedDays={elapsedDays}
      totalDays={totalDays}
      remainingDays={remainingDays}
      periodLabel={periodConfig?.label ?? selectedPeriod}
    />
  );
}
