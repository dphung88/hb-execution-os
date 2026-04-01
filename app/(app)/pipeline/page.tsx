import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { demoSalesAsms, erpSkuNames } from "@/lib/demo-data";
import { PipelineClient } from "./pipeline-client";
import {
  upsertForecastConfigAction,
  deleteForecastConfigAction,
  upsertPipelineAction,
  deletePipelineAction,
  upsertActualsAction,
  deleteActualsAction,
} from "./actions";

export type SkuOption = { code: string; name: string };

export type ForecastConfig = {
  id: string;
  period: string;
  province: string;
  channel: string;
  sku: string;
  universe: number | null;
  frequency: number | null;
  upo: number | null;
  growth_factor: number;
  promo_uplift: number;
  ramp_m1: number;
  ramp_m2: number;
  ramp_m3: number;
  asp: number | null;
  discount_pct: number;
  baseline_qty: number | null;
  cogs: number | null;
  target_revenue: number | null;
};

export type ForecastPipeline = {
  id: string;
  period: string;
  province: string | null;
  channel: string | null;
  sku: string | null;
  new_listings: number | null;
  stage: string | null;
  prob: number | null;
  on_shelf_rate: number;
  ar_expected: number | null;
};

export type ForecastActuals = {
  id: string;
  period: string;
  province: string | null;
  channel: string | null;
  sku: string | null;
  listed_outlets: number | null;
  ordering_outlets: number | null;
  volume_sold: number | null;
  revenue_actual: number | null;
  promo_sell: number | null;
  baseline_sold: number | null;
  risk_inventory: number | null;
  risk_sold: number | null;
  opening_inventory: number | null;
  inflow: number | null;
};

// ── Demo data (shown when Supabase is not connected) ─────────────────────────

const demoConfigs: ForecastConfig[] = [
  {
    id: "demo-cfg-1",
    period: "2026-03",
    province: "HCM",
    channel: "OTC",
    sku: "Collagen 1375",
    universe: 4000,
    frequency: 1.2,
    upo: 6,
    growth_factor: 1.1,
    promo_uplift: 1.15,
    ramp_m1: 0.4,
    ramp_m2: 0.7,
    ramp_m3: 1.0,
    asp: 1375000,
    discount_pct: 0.2,
    baseline_qty: 5276,
    cogs: 825000,
    target_revenue: 3500000000,
  },
  {
    id: "demo-cfg-2",
    period: "2026-03",
    province: "HAN",
    channel: "OTC",
    sku: "Collagen 1375",
    universe: 2800,
    frequency: 1.0,
    upo: 5,
    growth_factor: 1.08,
    promo_uplift: 1.1,
    ramp_m1: 0.4,
    ramp_m2: 0.7,
    ramp_m3: 1.0,
    asp: 1375000,
    discount_pct: 0.18,
    baseline_qty: 3200,
    cogs: 825000,
    target_revenue: 2000000000,
  },
];

const demoPipeline: ForecastPipeline[] = [
  {
    id: "demo-pl-1",
    period: "2026-03",
    province: "HCM",
    channel: "OTC",
    sku: "Collagen 1375",
    new_listings: 120,
    stage: "Develop",
    prob: 0.7,
    on_shelf_rate: 0.9,
    ar_expected: 0.65,
  },
  {
    id: "demo-pl-2",
    period: "2026-03",
    province: "HAN",
    channel: "OTC",
    sku: "Collagen 1375",
    new_listings: 80,
    stage: "Propose",
    prob: 0.6,
    on_shelf_rate: 0.85,
    ar_expected: 0.6,
  },
];

const demoActuals: ForecastActuals[] = [
  {
    id: "demo-act-1",
    period: "2026-03",
    province: "HCM",
    channel: "OTC",
    sku: "Collagen 1375",
    listed_outlets: 3000,
    ordering_outlets: 2100,
    volume_sold: 2000,
    revenue_actual: 2800000000,
    promo_sell: 20,
    baseline_sold: 2000,
    risk_inventory: 4524,
    risk_sold: 500,
    opening_inventory: 4000,
    inflow: 2000,
  },
];

// ── Build province list from ASM territories ─────────────────────────────────

function buildProvinceList(): string[] {
  const set = new Set<string>();
  demoSalesAsms.forEach((asm) => {
    if (asm.region === "Nationwide") return;
    asm.region.split(" - ").forEach((p) => set.add(p.trim()));
  });
  return [...set].sort((a, b) => a.localeCompare(b, "vi"));
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PipelinePage() {
  const periods = await getPeriods();
  const currentPeriod = getCurrentPeriod(periods);

  let configs: ForecastConfig[] = [];
  let pipeline: ForecastPipeline[] = [];
  let actuals: ForecastActuals[] = [];
  let isDemo = true;

  // Province list (from ASM territory config)
  const provinces = buildProvinceList();

  // SKU list: try Supabase sku_lot_dates first, fallback to erpSkuNames
  let skus: SkuOption[] = [];
  if (hasSupabaseAdminEnv()) {
    try {
      const admin = createAdminClient();
      const [cfgRes, plRes, actRes, skuRes] = await Promise.all([
        admin.from("forecast_config").select("*").order("period", { ascending: false }),
        admin.from("forecast_pipeline").select("*").order("period", { ascending: false }),
        admin.from("forecast_actuals").select("*").order("period", { ascending: false }),
        admin.from("sku_lot_dates").select("code, name").order("code"),
      ]);
      configs  = (cfgRes.data  ?? []) as ForecastConfig[];
      pipeline = (plRes.data   ?? []) as ForecastPipeline[];
      actuals  = (actRes.data  ?? []) as ForecastActuals[];
      if (skuRes.data && skuRes.data.length > 0) {
        skus = skuRes.data as SkuOption[];
      }
      isDemo = false;
    } catch {
      // fall through to demo
    }
  }

  // SKU fallback: use erpSkuNames from demo-data
  if (skus.length === 0) {
    skus = Object.entries(erpSkuNames).map(([code, name]) => ({ code, name }));
  }

  if (configs.length  === 0) configs  = demoConfigs;
  if (pipeline.length === 0) pipeline = demoPipeline;
  if (actuals.length  === 0) actuals  = demoActuals;

  return (
    <PipelineClient
      configs={configs}
      pipeline={pipeline}
      actuals={actuals}
      periods={periods}
      currentPeriod={currentPeriod}
      provinces={provinces}
      skus={skus}
      isDemo={isDemo}
      upsertConfig={upsertForecastConfigAction}
      deleteConfig={deleteForecastConfigAction}
      upsertPipeline={upsertPipelineAction}
      deletePipeline={deletePipelineAction}
      upsertActuals={upsertActualsAction}
      deleteActuals={deleteActualsAction}
    />
  );
}
