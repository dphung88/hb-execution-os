import { demoSalesAsms } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
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
  source: "supabase" | "demo";
  sourceSyncedAt: string | null;
  fromDate: string | null;
  toDate: string | null;
};

function normalizeRevenueActual(actual: number | null, target: number) {
  if (actual == null) return target;

  // If ERP writes raw VND while targets are still stored in millions, normalize for scoring/display.
  if (target <= 10000 && actual >= 1000000) {
    return Number((actual / 1000000).toFixed(2));
  }

  return Number(actual);
}

function toResolvedAsm(baseAsm: SalesAsm, row: KpiDataRow): SalesAsmResolved {
  const revenueTarget = Number(row.dt_target ?? baseAsm.revenueTarget);
  const disciplineScore =
    row.noiquy == null ? baseAsm.disciplineScore : Math.max(0, Math.min(5, Number(row.noiquy)));

  return {
    ...baseAsm,
    periodKey: row.month ?? baseAsm.periodKey,
    revenueTarget,
    revenueActual: normalizeRevenueActual(row.dt_thuc_dat, revenueTarget),
    newCustomersActual: Number(row.kh_moi ?? baseAsm.newCustomersActual),
    hb006: Number(row.hb006 ?? baseAsm.hb006),
    hb034: Number(row.hb034 ?? baseAsm.hb034),
    hb031: Number(row.hb031 ?? baseAsm.hb031),
    hb035: Number(row.hb035 ?? baseAsm.hb035),
    disciplineScore,
    source: "supabase",
    sourceSyncedAt: row.source_synced_at ?? row.updated_at,
    fromDate: row.from_date,
    toDate: row.to_date,
  };
}

function getDemoResolvedAsms(): SalesAsmResolved[] {
  return demoSalesAsms.map((asm) => ({
    ...asm,
    source: "demo" as const,
    sourceSyncedAt: null,
    fromDate: null,
    toDate: null,
  }));
}

export async function getSalesAsms(): Promise<SalesAsmResolved[]> {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseEnv) {
    return getDemoResolvedAsms();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_data")
    .select(
      "asm_id, month, dt_target, dt_thuc_dat, kh_moi, hb006, hb034, hb031, hb035, noiquy, total_kpi, luong, from_date, to_date, source_synced_at, updated_at"
    )
    .order("month", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return getDemoResolvedAsms();
  }

  const latestMonth = data.find((row) => row.month)?.month ?? null;
  const monthRows = latestMonth ? data.filter((row) => row.month === latestMonth) : data;
  const latestByAsm = new Map<string, KpiDataRow>();

  monthRows.forEach((row) => {
    if (!latestByAsm.has(row.asm_id)) {
      latestByAsm.set(row.asm_id, row);
    }
  });

  const resolved = demoSalesAsms.map((asm) => {
    const liveRow = latestByAsm.get(asm.id);
    return liveRow ? toResolvedAsm(asm, liveRow) : { ...asm, source: "demo" as const, sourceSyncedAt: null, fromDate: null, toDate: null };
  });

  const hasAnyLiveRows = resolved.some((asm) => asm.source === "supabase");
  return hasAnyLiveRows ? resolved : getDemoResolvedAsms();
}

export async function getSalesScorecardsData() {
  const asms = await getSalesAsms();
  const scorecards = getSalesScorecards(asms);
  const liveCount = asms.filter((asm) => asm.source === "supabase").length;

  return {
    asms,
    scorecards,
    liveCount,
    seededCount: asms.length - liveCount,
  };
}

export async function getSalesAsmByIdResolved(id: string) {
  const asms = await getSalesAsms();
  return asms.find((asm) => asm.id === id) ?? null;
}
