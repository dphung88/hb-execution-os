import { getPeriods } from "@/lib/config/periods";
import type { SalesAsmResolved, SalesPeriodOption } from "@/lib/sales/queries";

type RevenueForecastRow = {
  id: string;
  name: string;
  region: string;
  actualRevenue: number;
  targetRevenue: number;
  projectedRevenue: number;
  achievementPct: number;
  projectedPct: number;
  // New: pace analysis
  currentDailyPace: number;      // actual / elapsed days (M/day)
  requiredDailyPace: number;     // (target - actual) / remaining days (M/day)
  dailyPaceGap: number;          // current - required (negative = needs to accelerate)
  remainingDays: number;
  revenueRemaining: number;      // target - actual
  status: "On track" | "Watch" | "At risk" | "Pending";
};

type ClearstockForecastRow = {
  code: string;
  name: string;
  category: "Key SKU" | "Clearstock";
  snapshotDate: string;
  lotDate: string;
  stockOnHand: number;
  weeklySellOut: number;
  averageDailySell: number;
  daysToClear: number;
  projectedClearDate: string;
  willClearBeforeLotDate: boolean;
  risk: "Healthy" | "Watch" | "At risk";
  // New: required pace vs actual
  daysUntilExpiry: number;         // from today to lotDate
  requiredDailySell: number;       // stockOnHand / daysUntilExpiry
  dailySellGap: number;            // averageDailySell - requiredDailySell (negative = at risk)
  monthlyPushNeeded: number;       // requiredDailySell * 30 (units/month needed)
  coverageMonths: number;          // months of stock at current sell pace
};

export type SalesForecastData = {
  selectedPeriod: string;
  periods: SalesPeriodOption[];
  windowLabel: string;
  elapsedDays: number;
  totalDays: number;
  remainingDays: number;
  teamRevenueTarget: number;
  teamRevenueActual: number;
  teamProjectedRevenue: number;
  teamProjectedPct: number;
  revenueGap: number;
  teamCurrentDailyPace: number;    // M/day currently
  teamRequiredDailyPace: number;   // M/day needed to close gap
  aboveTargetAsmCount: number;
  revenueRows: RevenueForecastRow[];
  clearstockRows: ClearstockForecastRow[];
  clearBeforeLotCount: number;
  atRiskClearstockCount: number;
  totalStockOnHand: number;
  averageDailySellThrough: number;
};

async function getPeriodWindows(): Promise<Record<string, { start: string; end: string; label: string }>> {
  const map: Record<string, { start: string; end: string; label: string }> = {};
  for (const p of await getPeriods()) {
    map[p.key] = { start: p.startDate, end: p.endDate, label: p.label };
  }
  return map;
}

// Snapshot extracted from the stock workbook:
// /Users/edisonyang/Documents/Zalo Received Files/TỔNG TỒN KHO TPBVSK CHO ĐẾN HẾT NGÀY  08032025.xlsx
const CLEARSTOCK_SNAPSHOT_BASE = [
  {
    code: "HB031",
    name: "HB CoQ10 150mg C/30V",
    category: "Key SKU" as const,
    snapshotDate: "2025-03-08",
    lotDate: "2027-01-28",
    stockOnHand: 15633,
    weeklySellOut: 2,
    averageDailySell: 5.317808219178082,
    daysToClear: 2939.744976816074,
    projectedClearDate: "2033-03-27",
    willClearBeforeLotDate: false,
    risk: "At risk" as const,
  },
  {
    code: "HB035",
    name: "HB Collagen 1,2&3 C/120V",
    category: "Key SKU" as const,
    snapshotDate: "2025-03-08",
    lotDate: "2027-08-16",
    stockOnHand: 4368,
    weeklySellOut: 18,
    averageDailySell: 2.5714285714,
    daysToClear: 1698.6666666893332,
    projectedClearDate: "2029-10-31",
    willClearBeforeLotDate: false,
    risk: "Watch" as const,
  },
  {
    code: "HB006",
    name: "Gluta White C/30V",
    category: "Clearstock" as const,
    snapshotDate: "2025-03-08",
    lotDate: "2026-08-23",
    stockOnHand: 11959,
    weeklySellOut: 89,
    averageDailySell: 10.372602739726027,
    daysToClear: 1152.9410987849974,
    projectedClearDate: "2028-05-05",
    willClearBeforeLotDate: false,
    risk: "At risk" as const,
  },
  {
    code: "HB034",
    name: "HB Prenatal Support H/60V",
    category: "Clearstock" as const,
    snapshotDate: "2025-03-08",
    lotDate: "2027-12-29",
    stockOnHand: 13322,
    weeklySellOut: 6,
    averageDailySell: 0.8301369863013699,
    daysToClear: 16047.333333333332,
    projectedClearDate: "2069-02-18",
    willClearBeforeLotDate: false,
    risk: "At risk" as const,
  },
];

const TODAY = new Date("2026-03-26T00:00:00");

function differenceInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

async function clampElapsedDays(periodKey: string) {
  const window = (await getPeriodWindows())[periodKey];
  if (!window) return { elapsedDays: 15, remainingDays: 16, totalDays: 31, label: periodKey };

  const start = new Date(`${window.start}T00:00:00`);
  const end = new Date(`${window.end}T00:00:00`);
  const totalDays = differenceInDays(start, end) + 1;

  if (TODAY < start) {
    return { elapsedDays: 0, remainingDays: totalDays, totalDays, label: window.label };
  }

  if (TODAY > end) {
    return { elapsedDays: totalDays, remainingDays: 0, totalDays, label: window.label };
  }

  const elapsed = differenceInDays(start, TODAY) + 1;
  return {
    elapsedDays: elapsed,
    remainingDays: totalDays - elapsed,
    totalDays,
    label: window.label,
  };
}

function getRevenueStatus(projectedPct: number): RevenueForecastRow["status"] {
  if (projectedPct === 0) return "Pending";
  if (projectedPct >= 100) return "On track";
  if (projectedPct >= 80) return "Watch";
  return "At risk";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function enrichClearstockRow(base: typeof CLEARSTOCK_SNAPSHOT_BASE[number]): ClearstockForecastRow {
  const expiryDate = new Date(`${base.lotDate}T00:00:00`);
  const daysUntilExpiry = Math.max(differenceInDays(TODAY, expiryDate), 1);
  const requiredDailySell = round2(base.stockOnHand / daysUntilExpiry);
  const dailySellGap = round2(base.averageDailySell - requiredDailySell); // negative = shortfall
  const monthlyPushNeeded = Math.ceil(requiredDailySell * 30);
  const coverageMonths = round2(base.stockOnHand / (base.averageDailySell * 30));

  return {
    ...base,
    daysUntilExpiry,
    requiredDailySell,
    dailySellGap,
    monthlyPushNeeded,
    coverageMonths,
  };
}

const CLEARSTOCK_SNAPSHOT: ClearstockForecastRow[] = CLEARSTOCK_SNAPSHOT_BASE.map(enrichClearstockRow);

export async function getSalesForecastData(
  scorecards: Array<SalesAsmResolved & { scorecard: { total: number } }>,
  selectedPeriod: string,
  periods: SalesPeriodOption[] = []
): Promise<SalesForecastData> {
  const { elapsedDays, remainingDays, totalDays, label } = await clampElapsedDays(selectedPeriod);

  const revenueRows: RevenueForecastRow[] = scorecards.map((asm) => {
    const projectedRevenue =
      elapsedDays > 0 ? round2((asm.revenueActual / elapsedDays) * totalDays) : 0;
    const achievementPct =
      asm.revenueTarget > 0 ? Math.round((asm.revenueActual / asm.revenueTarget) * 100) : 0;
    const projectedPct =
      asm.revenueTarget > 0 ? Math.round((projectedRevenue / asm.revenueTarget) * 100) : 0;

    const currentDailyPace = elapsedDays > 0 ? round2(asm.revenueActual / elapsedDays) : 0;
    const revenueRemaining = round2(asm.revenueTarget - asm.revenueActual);
    const requiredDailyPace =
      remainingDays > 0 ? round2(Math.max(revenueRemaining, 0) / remainingDays) : 0;
    const dailyPaceGap = round2(currentDailyPace - requiredDailyPace);

    return {
      id: asm.id,
      name: asm.name,
      region: asm.region,
      actualRevenue: asm.revenueActual,
      targetRevenue: asm.revenueTarget,
      projectedRevenue,
      achievementPct,
      projectedPct,
      currentDailyPace,
      requiredDailyPace,
      dailyPaceGap,
      remainingDays,
      revenueRemaining,
      status: getRevenueStatus(projectedPct),
    };
  });

  const teamRevenueTarget = revenueRows.reduce((sum, row) => sum + row.targetRevenue, 0);
  const teamRevenueActual = revenueRows.reduce((sum, row) => sum + row.actualRevenue, 0);
  const teamProjectedRevenue = revenueRows.reduce((sum, row) => sum + row.projectedRevenue, 0);
  const teamProjectedPct =
    teamRevenueTarget > 0 ? Math.round((teamProjectedRevenue / teamRevenueTarget) * 100) : 0;
  const teamCurrentDailyPace = elapsedDays > 0 ? round2(teamRevenueActual / elapsedDays) : 0;
  const teamRevenueRemaining = Math.max(teamRevenueTarget - teamRevenueActual, 0);
  const teamRequiredDailyPace = remainingDays > 0 ? round2(teamRevenueRemaining / remainingDays) : 0;

  // Build dynamic clearstock rows from configured SKU targets in scorecards
  const clearstockRowsFromTargets = buildSkuForecastRows(scorecards, "clearstockTargets", "Clearstock", elapsedDays, remainingDays);
  const keySkuRowsFromTargets = buildSkuForecastRows(scorecards, "keySkuTargets", "Key SKU", elapsedDays, remainingDays);
  const dynamicClearstockRows = [...keySkuRowsFromTargets, ...clearstockRowsFromTargets];

  // Use dynamic rows if available, else fall back to hardcoded snapshot
  const clearstockRows = dynamicClearstockRows.length > 0 ? dynamicClearstockRows : CLEARSTOCK_SNAPSHOT;

  return {
    selectedPeriod,
    periods,
    windowLabel: label,
    elapsedDays,
    remainingDays,
    totalDays,
    teamRevenueTarget,
    teamRevenueActual,
    teamProjectedRevenue,
    teamProjectedPct,
    revenueGap: round2(teamProjectedRevenue - teamRevenueTarget),
    teamCurrentDailyPace,
    teamRequiredDailyPace,
    aboveTargetAsmCount: revenueRows.filter((row) => row.projectedPct >= 100).length,
    revenueRows,
    clearstockRows,
    clearBeforeLotCount: clearstockRows.filter((row) => row.willClearBeforeLotDate).length,
    atRiskClearstockCount: clearstockRows.filter((row) => row.risk === "At risk").length,
    totalStockOnHand: clearstockRows.reduce((sum, row) => sum + row.stockOnHand, 0),
    averageDailySellThrough: round2(
      clearstockRows.reduce((sum, row) => sum + row.averageDailySell, 0)
    ),
  };
}

/** Build clearstock/key-SKU forecast rows dynamically from configured targets in scorecards */
function buildSkuForecastRows(
  scorecards: Array<SalesAsmResolved & { scorecard: { total: number } }>,
  category: "clearstockTargets" | "keySkuTargets",
  label: "Key SKU" | "Clearstock",
  elapsedDays: number,
  remainingDays: number,
): ClearstockForecastRow[] {
  if (scorecards.length === 0) return [];

  // Collect unique SKU codes from all ASMs
  const skuMap = new Map<string, { name: string; totalActual: number; totalTarget: number; lotDate: string }>();
  for (const asm of scorecards) {
    for (const item of asm[category]) {
      const existing = skuMap.get(item.code) ?? { name: item.name, totalActual: 0, totalTarget: 0, lotDate: item.lotDate ?? "" };
      existing.totalActual += item.actual;
      existing.totalTarget += item.target;
      // Keep the most specific lot date (prefer non-empty)
      if (!existing.lotDate && item.lotDate) existing.lotDate = item.lotDate;
      skuMap.set(item.code, existing);
    }
  }

  return Array.from(skuMap.entries()).map(([code, { name, totalActual, totalTarget, lotDate: targetLotDate }]) => {
    // Use static snapshot data if available for this code (as fallback for stock/sell data)
    const snapshot = CLEARSTOCK_SNAPSHOT_BASE.find((s) => s.code === code);
    const averageDailySell = elapsedDays > 0 ? round2(totalActual / elapsedDays) : (snapshot?.averageDailySell ?? 0);
    const stockOnHand = snapshot?.stockOnHand ?? 0;
    // Prefer lot date from targets (user-entered), fall back to snapshot
    const lotDate = targetLotDate || snapshot?.lotDate || "";
    const snapshotDate = snapshot?.snapshotDate ?? new Date().toISOString().slice(0, 10);

    const riskValue = (totalTarget > 0 && totalActual / totalTarget < 0.5 ? "At risk" : "Watch") as "At risk";
    const base = {
      code,
      name,
      category: label as "Key SKU",
      snapshotDate,
      lotDate,
      stockOnHand,
      weeklySellOut: snapshot?.weeklySellOut ?? Math.round(averageDailySell * 7),
      averageDailySell,
      daysToClear: averageDailySell > 0 ? round2(stockOnHand / averageDailySell) : 9999,
      projectedClearDate: "",
      willClearBeforeLotDate: false,
      risk: riskValue,
    };

    return enrichClearstockRow(base);
  });
}
