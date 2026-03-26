import { demoSalesAsms, salesKpiProducts } from "@/lib/demo-data";
import { getPeriods } from "@/lib/config/periods";

export type SalesAsm = (typeof demoSalesAsms)[number] & {
  keySkuTargets?: Array<{
    code: string;
    target: number;
    actual: number;
    minPct: number;
    name: string;
  }>;
  clearstockTargets?: Array<{
    code: string;
    target: number;
    actual: number;
    minPct: number;
    name: string;
  }>;
};
export type SalesAsmScorecard = ReturnType<typeof getAsmScorecard>;

export async function getSalesPeriodLabel(periodKey: string): Promise<string> {
  const periods = await getPeriods();
  return periods.find((p) => p.key === periodKey)?.label ?? periodKey;
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

export function calculateKeySkuScore(targets: SalesAsm["keySkuTargets"], hb031: number, hb035: number) {
  const configuredTargets = targets?.length
    ? targets
    : [
        {
          code: salesKpiProducts.HB031.code,
          target: salesKpiProducts.HB031.target,
          actual: hb031,
          minPct: salesKpiProducts.HB031.minPct,
          name: salesKpiProducts.HB031.name,
        },
        {
          code: salesKpiProducts.HB035.code,
          target: salesKpiProducts.HB035.target,
          actual: hb035,
          minPct: salesKpiProducts.HB035.minPct,
          name: salesKpiProducts.HB035.name,
        },
      ];

  return configuredTargets.every((item) => item.actual >= item.target * item.minPct) ? 5 : 0;
}

export function calculateClearstockScore(targets: SalesAsm["clearstockTargets"], hb006: number, hb034: number) {
  const configuredTargets = targets?.length
    ? targets
    : [
        {
          code: salesKpiProducts.HB006.code,
          target: salesKpiProducts.HB006.target,
          actual: hb006,
          minPct: salesKpiProducts.HB006.minPct,
          name: salesKpiProducts.HB006.name,
        },
        {
          code: salesKpiProducts.HB034.code,
          target: salesKpiProducts.HB034.target,
          actual: hb034,
          minPct: salesKpiProducts.HB034.minPct,
          name: salesKpiProducts.HB034.name,
        },
      ];

  const [first, second] = configuredTargets;
  const firstPass = first ? first.actual >= first.target * first.minPct : false;
  const secondPass = second ? second.actual >= second.target * second.minPct : false;

  if (firstPass && secondPass) return 10;
  if (firstPass || secondPass) return 5;
  return 0;
}

export function getAsmScorecard(asm: SalesAsm) {
  const revenuePct = Math.round((asm.revenueActual / asm.revenueTarget) * 100);
  const revenueScore = calculateRevenueScore(revenuePct);
  const customerScore = calculateCustomerScore(asm.newCustomersActual);
  const keySkuScore = calculateKeySkuScore(asm.keySkuTargets, asm.hb031, asm.hb035);
  const clearstockScore = calculateClearstockScore(asm.clearstockTargets, asm.hb006, asm.hb034);
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

export function getSalesAsmById(id: string, asms: SalesAsm[] = demoSalesAsms) {
  return asms.find((asm) => asm.id === id) ?? null;
}

export async function getSalesScorecards<T extends SalesAsm>(asms: T[] = demoSalesAsms as T[]) {
  const periods = await getPeriods();
  return asms.map((asm) => ({
    ...asm,
    periodLabel: periods.find((p) => p.key === asm.periodKey)?.label ?? asm.periodKey,
    scorecard: getAsmScorecard(asm),
  }));
}
