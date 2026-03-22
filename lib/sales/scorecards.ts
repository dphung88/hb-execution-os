import { demoSalesAsms, salesKpiProducts, salesPeriods } from "@/lib/demo-data";

export type SalesAsm = (typeof demoSalesAsms)[number];

export function getSalesPeriodLabel(periodKey: string) {
  return salesPeriods.find((period) => period.key === periodKey)?.label ?? periodKey;
}

export function calculateRevenueScore(revenuePct: number) {
  if (revenuePct >= 100) return 65;
  if (revenuePct >= 90) return 62;
  if (revenuePct >= 80) return 55;
  if (revenuePct >= 70) return 49;
  if (revenuePct >= 60) return 39;
  if (revenuePct >= 50) return 33;
  return 0;
}

export function calculateRevenuePayout(revenuePct: number, revenueTarget: number) {
  const factor =
    revenuePct >= 100
      ? 1
      : revenuePct >= 90
        ? 0.95
        : revenuePct >= 80
          ? 0.85
          : revenuePct >= 70
            ? 0.75
            : revenuePct >= 60
              ? 0.6
              : revenuePct >= 50
                ? 0.5
                : 0;

  return Number((0.041 * revenueTarget * factor).toFixed(2));
}

export function calculateCustomerScore(newCustomersActual: number) {
  if (newCustomersActual >= 10) return 15;
  if (newCustomersActual >= 7) return 10;
  if (newCustomersActual >= 4) return 5;
  return 0;
}

export function calculateKeySkuScore(hb031: number, hb035: number) {
  const hb031Pass = hb031 >= salesKpiProducts.HB031.target * salesKpiProducts.HB031.minPct;
  const hb035Pass = hb035 >= salesKpiProducts.HB035.target * salesKpiProducts.HB035.minPct;

  return hb031Pass && hb035Pass ? 5 : 0;
}

export function calculateClearstockScore(hb006: number, hb034: number) {
  const hb006Pass = hb006 >= salesKpiProducts.HB006.target * salesKpiProducts.HB006.minPct;
  const hb034Pass = hb034 >= salesKpiProducts.HB034.target * salesKpiProducts.HB034.minPct;

  if (hb006Pass && hb034Pass) return 10;
  if (hb006Pass || hb034Pass) return 5;
  return 0;
}

export function getAsmScorecard(asm: SalesAsm) {
  const revenuePct = Math.round((asm.revenueActual / asm.revenueTarget) * 100);
  const revenueScore = calculateRevenueScore(revenuePct);
  const customerScore = calculateCustomerScore(asm.newCustomersActual);
  const keySkuScore = calculateKeySkuScore(asm.hb031, asm.hb035);
  const clearstockScore = calculateClearstockScore(asm.hb006, asm.hb034);
  const manualScore = asm.disciplineScore;
  const total = revenueScore + customerScore + keySkuScore + clearstockScore + manualScore;
  const payout = calculateRevenuePayout(revenuePct, asm.revenueTarget);

  return {
    revenuePct,
    revenueScore,
    customerScore,
    keySkuScore,
    clearstockScore,
    manualScore,
    reportingScore: asm.reportingScore,
    total,
    payout
  };
}

export function getSalesAsmById(id: string) {
  return demoSalesAsms.find((asm) => asm.id === id) ?? null;
}

export function getSalesScorecards() {
  return demoSalesAsms.map((asm) => ({
    ...asm,
    periodLabel: getSalesPeriodLabel(asm.periodKey),
    scorecard: getAsmScorecard(asm)
  }));
}
