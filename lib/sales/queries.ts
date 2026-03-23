import { demoSalesAsms, salesPeriods } from "@/lib/demo-data";
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
};

type SalesTargetRow = {
  asm_id: string;
  month: string;
  revenue_target: number;
  new_customers_target: number;
  hb006_target: number;
  hb034_target: number;
  hb031_target: number;
  hb035_target: number;
};

type SalesReviewRow = {
  asm_id: string;
  month: string;
  discipline_score: number;
  reporting_score: number;
  manager_note: string | null;
  reviewed_at: string | null;
};

export type SalesPeriodOption = {
  key: string;
  label: string;
};

function normalizeRevenueActual(actual: number | null, target: number) {
  if (actual == null) return target;

  // If ERP writes raw VND while targets are still stored in millions, normalize for scoring/display.
  if (target <= 10000 && actual >= 1000000) {
    return Number((actual / 1000000).toFixed(2));
  }

  return Number(actual);
}

function toResolvedAsm(
  baseAsm: SalesAsm,
  row: KpiDataRow,
  target?: SalesTargetRow,
  review?: SalesReviewRow
): SalesAsmResolved {
  const revenueTarget = Number(target?.revenue_target ?? row.dt_target ?? baseAsm.revenueTarget);
  const disciplineScore = Math.max(
    0,
    Math.min(5, Number(review?.discipline_score ?? row.noiquy ?? 0))
  );
  const reportingScore = Math.max(0, Math.min(5, Number(review?.reporting_score ?? 0)));

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
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseEnv) {
    return [...salesPeriods]
      .map((period) => ({ key: period.key, label: formatPeriodLabel(period.key) }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_data")
    .select("month")
    .not("month", "is", null)
    .order("month", { ascending: false });

  const monthSet = new Set<string>(salesPeriods.map((period) => period.key));

  if (!error && data?.length) {
    data.forEach((row) => {
      if (row.month) {
        monthSet.add(row.month);
      }
    });
  }

  return Array.from(monthSet)
    .sort((a, b) => b.localeCompare(a))
    .map((periodKey) => ({
      key: periodKey,
      label: formatPeriodLabel(periodKey),
    }));
}

export async function getSalesAsms(periodKey?: string | null): Promise<SalesAsmResolved[]> {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasSupabaseEnv) {
    return [];
  }

  const supabase = createAdminClient();
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
      .select(
        "asm_id, month, revenue_target, new_customers_target, hb006_target, hb034_target, hb031_target, hb035_target"
      ),
    supabase
      .from("sales_manager_reviews")
      .select("asm_id, month, discipline_score, reporting_score, manager_note, reviewed_at"),
  ]);

  const { data, error } = kpiResult;

  if (error || !data?.length) {
    return [];
  }

  const latestMonth = data.find((row) => row.month)?.month ?? null;
  const effectivePeriod = periodKey ?? latestMonth;
  const monthRows = effectivePeriod ? data.filter((row) => row.month === effectivePeriod) : data;
  const latestByAsm = new Map<string, KpiDataRow>();

  monthRows.forEach((row) => {
    if (!latestByAsm.has(row.asm_id)) {
      latestByAsm.set(row.asm_id, row);
    }
  });

  const targetsByAsm = new Map<string, SalesTargetRow>();
  (targetResult.data ?? [])
    .filter((row) => row.month === effectivePeriod)
    .forEach((row) => targetsByAsm.set(row.asm_id, row));

  const reviewsByAsm = new Map<string, SalesReviewRow>();
  (reviewResult.data ?? [])
    .filter((row) => row.month === effectivePeriod)
    .forEach((row) => reviewsByAsm.set(row.asm_id, row));

  const resolved = demoSalesAsms
    .map((asm) => {
    const liveRow = latestByAsm.get(asm.id);
    return liveRow ? toResolvedAsm(asm, liveRow, targetsByAsm.get(asm.id), reviewsByAsm.get(asm.id)) : null;
  })
    .filter((asm): asm is SalesAsmResolved => asm !== null);

  return resolved;
}

export async function getSalesScorecardsData(periodKey?: string | null) {
  const [asms, periods] = await Promise.all([getSalesAsms(periodKey), getAvailableSalesPeriods()]);
  const scorecards = getSalesScorecards(asms);
  const selectedPeriod = periodKey ?? asms[0]?.periodKey ?? periods[0]?.key ?? salesPeriods[0]?.key ?? "";

  return {
    asms,
    scorecards,
    liveCount: asms.length,
    periods,
    selectedPeriod,
  };
}

export async function getSalesAsmByIdResolved(id: string, periodKey?: string | null) {
  const asms = await getSalesAsms(periodKey);
  return asms.find((asm) => asm.id === id) ?? null;
}

export async function getSalesManagementFormData(asmId: string, periodKey: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { target: null, review: null };
  }

  const supabase = createAdminClient();
  const [{ data: target }, { data: review }] = await Promise.all([
    supabase
      .from("sales_monthly_targets")
      .select("revenue_target, new_customers_target, hb006_target, hb034_target, hb031_target, hb035_target")
      .eq("asm_id", asmId)
      .eq("month", periodKey)
      .maybeSingle(),
    supabase
      .from("sales_manager_reviews")
      .select("discipline_score, reporting_score, manager_note")
      .eq("asm_id", asmId)
      .eq("month", periodKey)
      .maybeSingle(),
  ]);

  return { target, review };
}
