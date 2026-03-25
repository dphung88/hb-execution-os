import type { SalesAsmResolved } from "@/lib/sales/queries";

type RevenueForecastRow = {
  id: string;
  name: string;
  region: string;
  actualRevenue: number;
  targetRevenue: number;
  projectedRevenue: number;
  achievementPct: number;
  projectedPct: number;
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
};

export type SalesForecastData = {
  selectedPeriod: string;
  windowLabel: string;
  elapsedDays: number;
  totalDays: number;
  teamRevenueTarget: number;
  teamRevenueActual: number;
  teamProjectedRevenue: number;
  teamProjectedPct: number;
  revenueGap: number;
  aboveTargetAsmCount: number;
  revenueRows: RevenueForecastRow[];
  clearstockRows: ClearstockForecastRow[];
  clearBeforeLotCount: number;
  atRiskClearstockCount: number;
  totalStockOnHand: number;
  averageDailySellThrough: number;
};

const PERIOD_WINDOWS: Record<string, { start: string; end: string; label: string }> = {
  "2026-03": { start: "2026-03-15", end: "2026-04-14", label: "Mar 15 - Apr 14" },
  "2026-04": { start: "2026-04-15", end: "2026-05-14", label: "Apr 15 - May 14" },
  "2026-05": { start: "2026-05-15", end: "2026-06-14", label: "May 15 - Jun 14" },
};

// Snapshot extracted from the stock workbook:
// /Users/edisonyang/Documents/Zalo Received Files/TỔNG TỒN KHO TPBVSK CHO ĐẾN HẾT NGÀY  08032025.xlsx
const CLEARSTOCK_SNAPSHOT: ClearstockForecastRow[] = [
  {
    code: "HB031",
    name: "HB CoQ10 150mg C/30V",
    category: "Key SKU",
    snapshotDate: "2025-03-08",
    lotDate: "2027-01-28",
    stockOnHand: 15633,
    weeklySellOut: 2,
    averageDailySell: 5.317808219178082,
    daysToClear: 2939.744976816074,
    projectedClearDate: "2033-03-27",
    willClearBeforeLotDate: false,
    risk: "At risk",
  },
  {
    code: "HB035",
    name: "HB Collagen 1,2&3 C/120V",
    category: "Key SKU",
    snapshotDate: "2025-03-08",
    lotDate: "2027-08-16",
    stockOnHand: 4368,
    weeklySellOut: 18,
    averageDailySell: 2.5714285714,
    daysToClear: 1698.6666666893332,
    projectedClearDate: "2029-10-31",
    willClearBeforeLotDate: false,
    risk: "Watch",
  },
  {
    code: "HB006",
    name: "Gluta White C/30V",
    category: "Clearstock",
    snapshotDate: "2025-03-08",
    lotDate: "2026-08-23",
    stockOnHand: 11959,
    weeklySellOut: 89,
    averageDailySell: 10.372602739726027,
    daysToClear: 1152.9410987849974,
    projectedClearDate: "2028-05-05",
    willClearBeforeLotDate: false,
    risk: "At risk",
  },
  {
    code: "HB034",
    name: "HB Prenatal Support H/60V",
    category: "Clearstock",
    snapshotDate: "2025-03-08",
    lotDate: "2027-12-29",
    stockOnHand: 13322,
    weeklySellOut: 6,
    averageDailySell: 0.8301369863013699,
    daysToClear: 16047.333333333332,
    projectedClearDate: "2069-02-18",
    willClearBeforeLotDate: false,
    risk: "At risk",
  },
];

function differenceInDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function clampElapsedDays(periodKey: string) {
  const window = PERIOD_WINDOWS[periodKey];
  if (!window) return { elapsedDays: 15, totalDays: 31, label: periodKey };

  const start = new Date(`${window.start}T00:00:00`);
  const end = new Date(`${window.end}T00:00:00`);
  const today = new Date("2026-03-26T00:00:00");
  const totalDays = differenceInDays(start, end) + 1;

  if (today < start) {
    return { elapsedDays: 0, totalDays, label: window.label };
  }

  if (today > end) {
    return { elapsedDays: totalDays, totalDays, label: window.label };
  }

  return {
    elapsedDays: differenceInDays(start, today) + 1,
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

export function getSalesForecastData(
  scorecards: Array<SalesAsmResolved & { scorecard: { total: number } }>,
  selectedPeriod: string
): SalesForecastData {
  const { elapsedDays, totalDays, label } = clampElapsedDays(selectedPeriod);

  const revenueRows: RevenueForecastRow[] = scorecards.map((asm) => {
    const projectedRevenue =
      elapsedDays > 0 ? Number(((asm.revenueActual / elapsedDays) * totalDays).toFixed(2)) : 0;
    const achievementPct =
      asm.revenueTarget > 0 ? Math.round((asm.revenueActual / asm.revenueTarget) * 100) : 0;
    const projectedPct =
      asm.revenueTarget > 0 ? Math.round((projectedRevenue / asm.revenueTarget) * 100) : 0;

    return {
      id: asm.id,
      name: asm.name,
      region: asm.region,
      actualRevenue: asm.revenueActual,
      targetRevenue: asm.revenueTarget,
      projectedRevenue,
      achievementPct,
      projectedPct,
      status: getRevenueStatus(projectedPct),
    };
  });

  const teamRevenueTarget = revenueRows.reduce((sum, row) => sum + row.targetRevenue, 0);
  const teamRevenueActual = revenueRows.reduce((sum, row) => sum + row.actualRevenue, 0);
  const teamProjectedRevenue = revenueRows.reduce((sum, row) => sum + row.projectedRevenue, 0);
  const teamProjectedPct =
    teamRevenueTarget > 0 ? Math.round((teamProjectedRevenue / teamRevenueTarget) * 100) : 0;

  return {
    selectedPeriod,
    windowLabel: label,
    elapsedDays,
    totalDays,
    teamRevenueTarget,
    teamRevenueActual,
    teamProjectedRevenue,
    teamProjectedPct,
    revenueGap: Number((teamProjectedRevenue - teamRevenueTarget).toFixed(2)),
    aboveTargetAsmCount: revenueRows.filter((row) => row.projectedPct >= 100).length,
    revenueRows,
    clearstockRows: CLEARSTOCK_SNAPSHOT,
    clearBeforeLotCount: CLEARSTOCK_SNAPSHOT.filter((row) => row.willClearBeforeLotDate).length,
    atRiskClearstockCount: CLEARSTOCK_SNAPSHOT.filter((row) => row.risk === "At risk").length,
    totalStockOnHand: CLEARSTOCK_SNAPSHOT.reduce((sum, row) => sum + row.stockOnHand, 0),
    averageDailySellThrough: Number(
      CLEARSTOCK_SNAPSHOT.reduce((sum, row) => sum + row.averageDailySell, 0).toFixed(1)
    ),
  };
}
