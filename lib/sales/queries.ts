import { demoSalesAsms, lookupSkuName, salesKpiProducts, salesPeriods } from "@/lib/demo-data";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { hasSupabaseClientEnv, hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSalesScorecards, type SalesAsm } from "@/lib/sales/scorecards";

type KpiDataRow = {
  asm_id: string;
  month: string | null;
  dt_target: number | null;
  dt_thuc_dat: number | null;
  kh_moi: number | null;
  hb006: number | null;
  hb034: number | null;
  hb031: number | null;
  hb035: number | null;
  noiquy: number | null;
  total_kpi: number | null;
  luong: number | null;
  from_date: string | null;
  to_date: string | null;
  source_synced_at: string | null;
  updated_at: string | null;
};

export type SalesAsmResolved = SalesAsm & {
  sourceSyncedAt: string | null;
  fromDate: string | null;
  toDate: string | null;
  isProbation: boolean;
  dealersCodeOverride: number | null;
  keySkuTargets: Array<{
    code: string;
    target: number;
    actual: number;
    minPct: number;
    name: string;
    lotDate: string;
  }>;
  clearstockTargets: Array<{
    code: string;
    target: number;
    actual: number;
    minPct: number;
    name: string;
    lotDate: string;
  }>;
};

type SalesTargetRow = {
  [key: string]: unknown;
  asm_id: string;
  month: string;
  revenue_target: number;
  new_customers_target: number;
  key_sku_code_1?: string | null;
  key_sku_code_2?: string | null;
  clearstock_code_1?: string | null;
  clearstock_code_2?: string | null;
  hb006_target: number;
  hb034_target: number;
  hb031_target: number;
  hb035_target: number;
  key_sku_lot_date_1?: string | null;
  key_sku_lot_date_2?: string | null;
  clearstock_lot_date_1?: string | null;
  clearstock_lot_date_2?: string | null;
  is_probation?: boolean;
};

type SalesReviewRow = {
  asm_id: string;
  month: string;
  discipline_score: number;
  reporting_score: number;
  manager_note: string | null;
  reviewed_at: string | null;
  dealers_code_override: number | null;
};

type BreakdownRow = {
  asm_id: string;
  month: string;
  item_code: string;
  quantity: number | null;
};

export type SalesPeriodOption = {
  key: string;
  label: string;
};

// Convert a raw-VND value to millions if it looks like raw VND (>= 1,000,000).
function toMillions(v: number): number {
  return v >= 1_000_000 ? Number((v / 1_000_000).toFixed(2)) : v;
}

function normalizeRevenueActual(actual: number | null, targetM: number) {
  if (actual == null) return 0;
  // targetM is already in millions at this point.
  // If actual looks like raw VND (>= 1,000,000) while target is in millions, convert.
  if (targetM <= 10_000 && actual >= 1_000_000) {
    return Number((actual / 1_000_000).toFixed(2));
  }
  // Both in same unit (either both millions or both raw VND already normalised).
  return Number(actual);
}

function toResolvedAsm(
  baseAsm: SalesAsm,
  row: KpiDataRow,
  breakdownsByCode: Map<string, number>,
  target?: SalesTargetRow,
  review?: SalesReviewRow
): SalesAsmResolved {
  // Normalise target to millions regardless of how it was stored in DB.
  const rawTarget = Number(target?.revenue_target ?? row.dt_target ?? baseAsm.revenueTarget);
  const revenueTarget = toMillions(rawTarget);
  const disciplineScore = Math.max(
    0,
    Math.min(5, Number(review?.discipline_score ?? row.noiquy ?? 0))
  );
  const reportingScore = Math.max(0, Math.min(5, Number(review?.reporting_score ?? 0)));

  const keySkuTargets = [
    {
      code: String(target?.key_sku_code_1 ?? "HB031").toUpperCase(),
      target: Number(target?.hb031_target ?? salesKpiProducts.HB031.target),
      minPct: salesKpiProducts.HB031.minPct,
      lotDate: String(target?.key_sku_lot_date_1 ?? ""),
    },
    {
      code: String(target?.key_sku_code_2 ?? "HB035").toUpperCase(),
      target: Number(target?.hb035_target ?? salesKpiProducts.HB035.target),
      minPct: salesKpiProducts.HB035.minPct,
      lotDate: String(target?.key_sku_lot_date_2 ?? ""),
    },
  ].map((item) => ({
    ...item,
    actual:
      breakdownsByCode.get(item.code) ??
      (item.code === "HB031"
        ? Number(row.hb031 ?? 0)
        : item.code === "HB035"
          ? Number(row.hb035 ?? 0)
          : 0),
    name:
      Object.values(salesKpiProducts).find((product) => product.code === item.code)?.name ??
      lookupSkuName(item.code),
  }));

  const clearstockTargets = [
    {
      code: String(target?.clearstock_code_1 ?? "HB006").toUpperCase(),
      target: Number(target?.hb006_target ?? salesKpiProducts.HB006.target),
      minPct: salesKpiProducts.HB006.minPct,
      lotDate: String(target?.clearstock_lot_date_1 ?? ""),
    },
    {
      code: String(target?.clearstock_code_2 ?? "HB034").toUpperCase(),
      target: Number(target?.hb034_target ?? salesKpiProducts.HB034.target),
      minPct: salesKpiProducts.HB034.minPct,
      lotDate: String(target?.clearstock_lot_date_2 ?? ""),
    },
  ].map((item) => ({
    ...item,
    actual:
      breakdownsByCode.get(item.code) ??
      (item.code === "HB006"
        ? Number(row.hb006 ?? 0)
        : item.code === "HB034"
          ? Number(row.hb034 ?? 0)
          : 0),
    name:
      Object.values(salesKpiProducts).find((product) => product.code === item.code)?.name ??
      lookupSkuName(item.code),
  }));

  return {
    ...baseAsm,
    periodKey: row.month ?? baseAsm.periodKey,
    revenueTarget,
    revenueActual: normalizeRevenueActual(row.dt_thuc_dat, revenueTarget),
    newCustomersTarget: Number(target?.new_customers_target ?? baseAsm.newCustomersTarget),
    newCustomersActual: Number(row.kh_moi ?? 0),
    hb006: Number(row.hb006 ?? baseAsm.hb006),
    hb034: Number(row.hb034 ?? baseAsm.hb034),
    hb031: Number(row.hb031 ?? baseAsm.hb031),
    hb035: Number(row.hb035 ?? baseAsm.hb035),
    disciplineScore,
    reportingScore,
    managerNote: review?.manager_note ?? "",
    sourceSyncedAt: row.source_synced_at ?? row.updated_at,
    fromDate: row.from_date,
    toDate: row.to_date,
    keySkuTargets,
    clearstockTargets,
    isProbation: target?.is_probation ?? false,
    dealersCodeOverride: review?.dealers_code_override ?? null,
  };
}

function formatPeriodLabel(periodKey: string) {
  const [year, month] = periodKey.split("-");
  const monthNumber = Number(month);

  if (!year || Number.isNaN(monthNumber)) {
    return periodKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), monthNumber - 1, 1));
}

export async function getAvailableSalesPeriods(): Promise<SalesPeriodOption[]> {
  if (!hasSupabaseClientEnv()) {
    const configPeriods = await getPeriods();
    return [...configPeriods]
      .map((p) => ({ key: p.key, label: p.label }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }

  // Period list is driven solely by app_periods config — do NOT merge in raw
  // kpi_data months, which would cause deleted periods to reappear.
  const configPeriods = await getPeriods();
  return [...configPeriods]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((p) => ({ key: p.key, label: p.label }));
}

export async function getSalesAsms(periodKey?: string | null): Promise<SalesAsmResolved[]> {
  if (!hasSupabaseClientEnv()) {
    return demoSalesAsms.map((asm) => ({
      ...asm,
      periodKey: periodKey ?? asm.periodKey,
      sourceSyncedAt: null,
      fromDate: null,
      toDate: null,
      keySkuTargets: [
        { code: "HB031", target: salesKpiProducts.HB031.target, actual: asm.hb031, minPct: salesKpiProducts.HB031.minPct, name: salesKpiProducts.HB031.name, lotDate: "" },
        { code: "HB035", target: salesKpiProducts.HB035.target, actual: asm.hb035, minPct: salesKpiProducts.HB035.minPct, name: salesKpiProducts.HB035.name, lotDate: "" },
      ],
      clearstockTargets: [
        { code: "HB006", target: salesKpiProducts.HB006.target, actual: asm.hb006, minPct: salesKpiProducts.HB006.minPct, name: salesKpiProducts.HB006.name, lotDate: "" },
        { code: "HB034", target: salesKpiProducts.HB034.target, actual: asm.hb034, minPct: salesKpiProducts.HB034.minPct, name: salesKpiProducts.HB034.name, lotDate: "" },
      ],
      isProbation: false,
      dealersCodeOverride: null,
    }));
  }

  const supabase = hasSupabaseAdminEnv() ? createAdminClient() : await createClient();
  const [kpiResult, targetResult, reviewResult] = await Promise.all([
    supabase
      .from("kpi_data")
      .select(
        "asm_id, month, dt_target, dt_thuc_dat, kh_moi, hb006, hb034, hb031, hb035, noiquy, total_kpi, luong, from_date, to_date, source_synced_at, updated_at"
      )
      .order("month", { ascending: false })
      .order("updated_at", { ascending: false }),
    supabase
      .from("sales_monthly_targets")
      .select("*"),
    supabase
      .from("sales_manager_reviews")
      .select("asm_id, month, discipline_score, reporting_score, manager_note, reviewed_at, dealers_code_override"),
  ]);

  const { data, error } = kpiResult;

  // Determine effective period (requested or latest available in DB)
  const latestMonth = (!error && data?.length)
    ? data.find((row) => row.month)?.month ?? null
    : null;
  const effectivePeriod = periodKey ?? latestMonth;

  const monthRows = (!error && data?.length && effectivePeriod)
    ? data.filter((row) => row.month === effectivePeriod)
    : [];

  const { data: breakdowns, error: breakdownsError } = effectivePeriod
    ? await supabase
        .from("kpi_item_breakdowns")
        .select("asm_id, month, item_code, quantity")
        .eq("month", effectivePeriod)
    : { data: null, error: null };

  const latestByAsm = new Map<string, KpiDataRow>();
  monthRows.forEach((row) => {
    if (!latestByAsm.has(row.asm_id)) {
      latestByAsm.set(row.asm_id, row);
    }
  });

  const targetsByAsm = new Map<string, SalesTargetRow>();
  (!targetResult.error ? targetResult.data : [])
    .filter((row) => row.month === effectivePeriod)
    .forEach((row) => targetsByAsm.set(row.asm_id, row));

  const reviewsByAsm = new Map<string, SalesReviewRow>();
  (!reviewResult.error ? reviewResult.data : [])
    .filter((row) => row.month === effectivePeriod)
    .forEach((row) => reviewsByAsm.set(row.asm_id, row));

  const breakdownsByAsm = new Map<string, Map<string, number>>();
  (!breakdownsError ? (breakdowns as BreakdownRow[] | null) ?? [] : []).forEach((row) => {
    const asmBreakdowns = breakdownsByAsm.get(row.asm_id) ?? new Map<string, number>();
    asmBreakdowns.set(String(row.item_code).toUpperCase(), Number(row.quantity ?? 0));
    breakdownsByAsm.set(row.asm_id, asmBreakdowns);
  });

  // Only show ASMs that have ERP data OR targets configured for this period.
  // If neither exists (e.g. April not yet synced) return empty so the dashboard
  // shows "no data" instead of zero-filled stubs for every demo ASM.
  const asmIdsWithData = new Set([...latestByAsm.keys(), ...targetsByAsm.keys()]);

  const emptyKpiRow = (asmId: string): KpiDataRow => ({
    asm_id: asmId,
    month: effectivePeriod,
    dt_target: null,
    dt_thuc_dat: 0,
    kh_moi: 0,
    hb006: 0,
    hb034: 0,
    hb031: 0,
    hb035: 0,
    noiquy: 0,
    total_kpi: null,
    luong: null,
    from_date: null,
    to_date: null,
    source_synced_at: null,
    updated_at: null,
  });

  const resolved = demoSalesAsms
    .filter((asm) => asmIdsWithData.has(asm.id))
    .map((asm) => {
      const liveRow = latestByAsm.get(asm.id) ?? emptyKpiRow(asm.id);
      return toResolvedAsm(
        asm,
        liveRow,
        breakdownsByAsm.get(asm.id) ?? new Map<string, number>(),
        targetsByAsm.get(asm.id),
        reviewsByAsm.get(asm.id),
      );
    });

  return resolved;
}

export async function getSalesScorecardsData(periodKey?: string | null) {
  const configPeriods = await getPeriods();
  const defaultPeriod = periodKey ?? getCurrentPeriod(configPeriods);
  const [asms, periods] = await Promise.all([getSalesAsms(defaultPeriod), getAvailableSalesPeriods()]);
  const scorecards = await getSalesScorecards(asms);
  const selectedPeriod = defaultPeriod;

  // isProbation is now embedded in each asm via sales_monthly_targets
  const probationMap: Record<string, boolean> = {};
  for (const asm of asms) {
    probationMap[asm.id] = asm.isProbation;
  }

  return {
    asms,
    scorecards,
    liveCount: asms.length,
    periods,
    selectedPeriod,
    probationMap,
  };
}

export async function getSalesAsmByIdResolved(id: string, periodKey?: string | null) {
  const asms = await getSalesAsms(periodKey);
  const resolved = asms.find((asm) => asm.id === id);

  if (resolved) {
    return resolved;
  }

  const baseAsm = demoSalesAsms.find((asm) => asm.id === id);

  if (!baseAsm) {
    return null;
  }

  const effectivePeriod = periodKey ?? baseAsm.periodKey;

  if (!hasSupabaseClientEnv()) {
    return {
      ...baseAsm,
      periodKey: effectivePeriod,
      revenueActual: 0,
      newCustomersActual: 0,
      hb006: 0,
      hb034: 0,
      hb031: 0,
      hb035: 0,
      sourceSyncedAt: null,
      fromDate: null,
      toDate: null,
      keySkuTargets: [
        {
          code: salesKpiProducts.HB031.code,
          target: salesKpiProducts.HB031.target,
          actual: 0,
          minPct: salesKpiProducts.HB031.minPct,
          name: salesKpiProducts.HB031.name,
          lotDate: "",
        },
        {
          code: salesKpiProducts.HB035.code,
          target: salesKpiProducts.HB035.target,
          actual: 0,
          minPct: salesKpiProducts.HB035.minPct,
          name: salesKpiProducts.HB035.name,
          lotDate: "",
        },
      ],
      clearstockTargets: [
        {
          code: salesKpiProducts.HB006.code,
          target: salesKpiProducts.HB006.target,
          actual: 0,
          minPct: salesKpiProducts.HB006.minPct,
          name: salesKpiProducts.HB006.name,
          lotDate: "",
        },
        {
          code: salesKpiProducts.HB034.code,
          target: salesKpiProducts.HB034.target,
          actual: 0,
          minPct: salesKpiProducts.HB034.minPct,
          name: salesKpiProducts.HB034.name,
          lotDate: "",
        },
      ],
      isProbation: false,
      dealersCodeOverride: null,
    };
  }

  const supabase = hasSupabaseAdminEnv() ? createAdminClient() : await createClient();
  const [{ data: target }, { data: review }, { data: breakdowns }] = await Promise.all([
    supabase
      .from("sales_monthly_targets")
      .select("*")
      .eq("asm_id", id)
      .eq("month", effectivePeriod)
      .maybeSingle(),
    supabase
      .from("sales_manager_reviews")
      .select("asm_id, month, discipline_score, reporting_score, manager_note, reviewed_at, dealers_code_override")
      .eq("asm_id", id)
      .eq("month", effectivePeriod)
      .maybeSingle(),
    supabase
      .from("kpi_item_breakdowns")
      .select("item_code, quantity")
      .eq("asm_id", id)
      .eq("month", effectivePeriod),
  ]);

  const breakdownsByCode = new Map<string, number>();
  ((breakdowns as Pick<BreakdownRow, "item_code" | "quantity">[] | null) ?? []).forEach((row) => {
    breakdownsByCode.set(String(row.item_code).toUpperCase(), Number(row.quantity ?? 0));
  });

  return toResolvedAsm(
    { ...baseAsm, periodKey: effectivePeriod },
    {
      asm_id: id,
      month: effectivePeriod,
      dt_target: target?.revenue_target ?? baseAsm.revenueTarget,
      dt_thuc_dat: 0,
      kh_moi: 0,
      hb006: 0,
      hb034: 0,
      hb031: 0,
      hb035: 0,
      noiquy: review?.discipline_score ?? 0,
      total_kpi: null,
      luong: null,
      from_date: null,
      to_date: null,
      source_synced_at: null,
      updated_at: null,
    },
    breakdownsByCode,
    (target as SalesTargetRow | null) ?? undefined,
    (review as SalesReviewRow | null) ?? undefined
  );
}

export async function getSalesManagementFormData(asmId: string, periodKey: string) {
  if (!hasSupabaseClientEnv()) {
    return { target: null, review: null };
  }

  const supabase = hasSupabaseAdminEnv() ? createAdminClient() : await createClient();
  const [{ data: target }, { data: review }] = await Promise.all([
    supabase
      .from("sales_monthly_targets")
      .select("*")
      .eq("asm_id", asmId)
      .eq("month", periodKey)
      .maybeSingle(),
    supabase
      .from("sales_manager_reviews")
      .select("discipline_score, reporting_score, manager_note, is_probation")
      .eq("asm_id", asmId)
      .eq("month", periodKey)
      .maybeSingle(),
  ]);

  return { target, review };
}
