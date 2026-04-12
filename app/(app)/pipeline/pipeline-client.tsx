"use client";

import { useState } from "react";
import type { ForecastConfig, ForecastPipeline, ForecastActuals, SkuOption } from "./page";
import type { PeriodConfig } from "@/lib/config/periods";
import { Trash2, Plus, TrendingUp, Store, Activity, PackageOpen } from "lucide-react";

type Tab = "config" | "pipeline" | "actuals";

const CHANNELS = ["OTC", "ETC", "Online"] as const;

type Props = {
  configs:         ForecastConfig[];
  pipeline:        ForecastPipeline[];
  actuals:         ForecastActuals[];
  periods:         PeriodConfig[];
  currentPeriod:   string;
  provinces:       string[];
  skus:            SkuOption[];
  isDemo:          boolean;
  upsertConfig:    (fd: FormData) => Promise<void>;
  deleteConfig:    (fd: FormData) => Promise<void>;
  upsertPipeline:  (fd: FormData) => Promise<void>;
  deletePipeline:  (fd: FormData) => Promise<void>;
  upsertActuals:   (fd: FormData) => Promise<void>;
  deleteActuals:   (fd: FormData) => Promise<void>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, decimals = 0) {
  if (n == null) return "—";
  return n.toLocaleString("vi-VN", { maximumFractionDigits: decimals });
}

function fmtB(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0) + "M";
  return fmt(n);
}

const STAGES = ["Qualify", "Develop", "Propose", "Close"] as const;

// ── Formatted number input (vi-VN thousand separators) ───────────────────────

function NumInput({
  name,
  placeholder,
  defaultValue,
  required,
}: {
  name: string;
  placeholder?: number;
  defaultValue?: number;
  required?: boolean;
}) {
  const [value, setValue] = useState(
    defaultValue != null ? defaultValue.toLocaleString("vi-VN") : ""
  );

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(raw);
    if (!isNaN(n)) setValue(n.toLocaleString("vi-VN"));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      value={value}
      placeholder={placeholder != null ? placeholder.toLocaleString("vi-VN") : ""}
      required={required}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      className={inputCls}
    />
  );
}

const inputCls =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400";
const labelCls =
  "block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1";
const btnPrimary =
  "inline-flex h-9 items-center gap-1.5 rounded-xl bg-sky-400 px-4 text-xs font-semibold text-slate-950 transition hover:bg-sky-300";
const btnDanger =
  "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600";

// ── Province / Channel / SKU selects ─────────────────────────────────────────

function ProvinceSelect({ provinces }: { provinces: string[] }) {
  return (
    <select name="province" required className={inputCls}>
      <option value="">— select province —</option>
      {provinces.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}

function ChannelSelect() {
  return (
    <select name="channel" required className={inputCls}>
      <option value="">— select channel —</option>
      {CHANNELS.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}

function SkuSelect({ skus }: { skus: SkuOption[] }) {
  return (
    <select name="sku" required className={inputCls}>
      <option value="">— select SKU —</option>
      {skus.map((s) => (
        <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
      ))}
    </select>
  );
}

// ── Summary KPI bar ──────────────────────────────────────────────────────────

function SummaryBar({ configs, actuals }: { configs: ForecastConfig[]; actuals: ForecastActuals[] }) {
  const totalTarget  = configs.reduce((s, c) => s + (c.target_revenue ?? 0), 0);
  const totalRevenue = actuals.reduce((s, a) => s + (a.revenue_actual ?? 0), 0);
  const totalUniverse = configs.reduce((s, c) => s + (c.universe ?? 0), 0);
  const totalListed   = actuals.reduce((s, a) => s + (a.listed_outlets ?? 0), 0);
  const totalOrdering = actuals.reduce((s, a) => s + (a.ordering_outlets ?? 0), 0);
  const pctTarget     = totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0;
  const nd            = totalUniverse > 0 ? Math.round((totalListed / totalUniverse) * 100) : 0;
  const ar            = totalListed > 0 ? Math.round((totalOrdering / totalListed) * 100) : 0;

  const kpis = [
    { label: "Revenue Actual",   value: fmtB(totalRevenue),       icon: TrendingUp,   accent: true  },
    { label: "vs Target",        value: totalTarget ? `${pctTarget}%` : "—", icon: Activity, accent: pctTarget >= 80 },
    { label: "ND% (avg)",        value: nd ? `${nd}%` : "—",      icon: Store,        accent: false },
    { label: "AR% (avg)",        value: ar ? `${ar}%` : "—",      icon: PackageOpen,  accent: false },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {kpis.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <div className={`rounded-xl p-2 ${accent ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-400"}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className={`mt-4 text-3xl font-semibold leading-none ${accent ? "text-sky-600" : "text-slate-900"}`}>
            {value}
          </p>
        </div>
      ))}
    </section>
  );
}

// ── Config Tab ────────────────────────────────────────────────────────────────

function ConfigTab({
  configs, periods, currentPeriod, provinces, skus, upsertConfig, deleteConfig,
}: {
  configs: ForecastConfig[];
  periods: PeriodConfig[];
  currentPeriod: string;
  provinces: string[];
  skus: SkuOption[];
  upsertConfig: (fd: FormData) => Promise<void>;
  deleteConfig:  (fd: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {/* Existing entries */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-900">Existing Setup</h2>
        <p className="mt-0.5 text-sm text-slate-500">{configs.length} entr{configs.length === 1 ? "y" : "ies"} configured</p>

        <div className="mt-4 space-y-3">
          {configs.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {c.sku} · {c.province} · {c.channel}
                    <span className="ml-2 rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">{c.period}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span>Universe <b className="text-slate-700">{fmt(c.universe)}</b></span>
                    <span>F <b className="text-slate-700">{c.frequency ?? "—"}</b></span>
                    <span>UPO <b className="text-slate-700">{c.upo ?? "—"}</b></span>
                    <span>Growth <b className="text-slate-700">{c.growth_factor ? `${((c.growth_factor - 1) * 100).toFixed(0)}%` : "—"}</b></span>
                    <span>Promo <b className="text-slate-700">{c.promo_uplift ? `+${((c.promo_uplift - 1) * 100).toFixed(0)}%` : "—"}</b></span>
                    <span>ASP <b className="text-slate-700">{fmtB(c.asp)}</b></span>
                    <span>Discount <b className="text-slate-700">{c.discount_pct ? `${(c.discount_pct * 100).toFixed(0)}%` : "0%"}</b></span>
                    <span>Target <b className="text-sky-600">{fmtB(c.target_revenue)}</b></span>
                    <span>COGS <b className="text-slate-700">{fmtB(c.cogs)}</b></span>
                    <span>Baseline qty <b className="text-slate-700">{fmt(c.baseline_qty)}</b></span>
                  </div>
                </div>
                <form action={deleteConfig}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className={btnDanger} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              No entries yet — add one below.
            </p>
          )}
        </div>
      </section>

      {/* Add new */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Plus className="h-4 w-4 text-sky-500" /> Add Forecast Setup
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Velocity inputs, pricing, and targets per SKU / province / channel.
        </p>

        <form action={upsertConfig} className="mt-5 space-y-4">
          {/* Row 1 — Identity */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className={labelCls}>Period</span>
              <select name="period" defaultValue={currentPeriod} className={inputCls} required>
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Province</span>
              <ProvinceSelect provinces={provinces} />
            </label>
            <label className="block">
              <span className={labelCls}>Channel</span>
              <ChannelSelect />
            </label>
            <label className="block">
              <span className={labelCls}>SKU</span>
              <SkuSelect skus={skus} />
            </label>
          </div>

          {/* Row 2 — Outlet & velocity */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Outlet & Velocity
            </p>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              <label className="block">
                <span className={labelCls}>Universe</span>
                <NumInput name="universe" placeholder={4000} />
              </label>
              <label className="block">
                <span className={labelCls}>F (orders/mo)</span>
                <input name="frequency" type="number" step="0.1" placeholder="1.2" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>UPO (units/order)</span>
                <input name="upo" type="number" step="0.5" placeholder="6" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Growth G (×)</span>
                <input name="growth_factor" type="number" step="0.01" placeholder="1.10" defaultValue="1.0" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Promo Uplift P (×)</span>
                <input name="promo_uplift" type="number" step="0.01" placeholder="1.15" defaultValue="1.0" className={inputCls} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className={labelCls}>Ramp M1 (0–1)</span>
                <input name="ramp_m1" type="number" step="0.05" placeholder="0.40" defaultValue="0.4" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Ramp M2 (0–1)</span>
                <input name="ramp_m2" type="number" step="0.05" placeholder="0.70" defaultValue="0.7" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Ramp M3 (0–1)</span>
                <input name="ramp_m3" type="number" step="0.05" placeholder="1.00" defaultValue="1.0" className={inputCls} />
              </label>
            </div>
          </div>

          {/* Row 3 — Pricing & baseline */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Price, Cost & Baseline
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <label className="block">
                <span className={labelCls}>ASP (VND)</span>
                <NumInput name="asp" placeholder={1375000} />
              </label>
              <label className="block">
                <span className={labelCls}>Discount (0–1)</span>
                <input name="discount_pct" type="number" step="0.01" placeholder="0.20" defaultValue="0" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>COGS (VND)</span>
                <NumInput name="cogs" placeholder={825000} />
              </label>
              <label className="block">
                <span className={labelCls}>Baseline Qty (units)</span>
                <NumInput name="baseline_qty" placeholder={5276} />
              </label>
              <label className="block">
                <span className={labelCls}>Target Revenue (VND)</span>
                <NumInput name="target_revenue" placeholder={3500000000} />
              </label>
            </div>
          </div>

          <button type="submit" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" /> Save Setup
          </button>
        </form>
      </section>
    </div>
  );
}

// ── Pipeline Tab ──────────────────────────────────────────────────────────────

function PipelineTab({
  pipeline, periods, currentPeriod, provinces, skus, upsertPipeline, deletePipeline,
}: {
  pipeline:        ForecastPipeline[];
  periods:         PeriodConfig[];
  currentPeriod:   string;
  provinces:       string[];
  skus:            SkuOption[];
  upsertPipeline:  (fd: FormData) => Promise<void>;
  deletePipeline:  (fd: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {/* Existing */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-900">Outlet Pipeline</h2>
        <p className="mt-0.5 text-sm text-slate-500">New outlets planned to be listed this period</p>

        <div className="mt-4 space-y-3">
          {pipeline.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {p.sku || "All SKUs"} · {p.province || "All"} · {p.channel || "All"}
                    <span className="ml-2 rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">{p.period}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span>New Listings <b className="text-slate-700">{fmt(p.new_listings)} outlets</b></span>
                    <span>Stage <b className="text-slate-700">{p.stage ?? "—"}</b></span>
                    <span>Prob <b className="text-slate-700">{p.prob != null ? `${(p.prob * 100).toFixed(0)}%` : "—"}</b></span>
                    <span>On-shelf <b className="text-slate-700">{`${(p.on_shelf_rate * 100).toFixed(0)}%`}</b></span>
                    <span>AR expected <b className="text-slate-700">{p.ar_expected != null ? `${(p.ar_expected * 100).toFixed(0)}%` : "—"}</b></span>
                  </div>
                </div>
                <form action={deletePipeline}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className={btnDanger} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pipeline.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              No pipeline entries yet.
            </p>
          )}
        </div>
      </section>

      {/* Add new */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Plus className="h-4 w-4 text-sky-500" /> Add Pipeline Entry
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Track new outlet listings per province / channel / SKU.
        </p>

        <form action={upsertPipeline} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className={labelCls}>Period</span>
              <select name="period" defaultValue={currentPeriod} className={inputCls} required>
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Province</span>
              <ProvinceSelect provinces={provinces} />
            </label>
            <label className="block">
              <span className={labelCls}>Channel</span>
              <ChannelSelect />
            </label>
            <label className="block">
              <span className={labelCls}>SKU</span>
              <SkuSelect skus={skus} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className={labelCls}>New Listings (outlets)</span>
              <NumInput name="new_listings" placeholder={120} />
            </label>
            <label className="block">
              <span className={labelCls}>CRM Stage</span>
              <select name="stage" className={inputCls}>
                <option value="">— select —</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Prob by Stage (0–1)</span>
              <input name="prob" type="number" step="0.05" placeholder="0.70" className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>On-shelf Rate (0–1)</span>
              <input name="on_shelf_rate" type="number" step="0.05" placeholder="0.90" defaultValue="0.9" className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>AR Expected (0–1)</span>
              <input name="ar_expected" type="number" step="0.05" placeholder="0.65" className={inputCls} />
            </label>
          </div>

          <button type="submit" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" /> Save Pipeline
          </button>
        </form>
      </section>
    </div>
  );
}

// ── Actuals Tab ───────────────────────────────────────────────────────────────

function ActualsTab({
  actuals, periods, currentPeriod, provinces, skus, upsertActuals, deleteActuals,
}: {
  actuals:       ForecastActuals[];
  periods:       PeriodConfig[];
  currentPeriod: string;
  provinces:     string[];
  skus:          SkuOption[];
  upsertActuals: (fd: FormData) => Promise<void>;
  deleteActuals: (fd: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {/* Existing */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-900">Monthly Actuals</h2>
        <p className="mt-0.5 text-sm text-slate-500">Data from ERP / invoice systems</p>

        <div className="mt-4 space-y-3">
          {actuals.map((a) => {
            const nd = a.listed_outlets && a.listed_outlets > 0 && a.ordering_outlets != null
              ? `${Math.round((a.ordering_outlets / a.listed_outlets) * 100)}%` : "—";
            return (
              <div key={a.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {a.sku || "All SKUs"} · {a.province || "All"} · {a.channel || "All"}
                      <span className="ml-2 rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">{a.period}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span>Revenue <b className="text-sky-600">{fmtB(a.revenue_actual)}</b></span>
                      <span>Volume <b className="text-slate-700">{fmt(a.volume_sold)} units</b></span>
                      <span>Listed <b className="text-slate-700">{fmt(a.listed_outlets)}</b></span>
                      <span>AR% <b className="text-slate-700">{nd}</b></span>
                      <span>Opening inv <b className="text-slate-700">{fmt(a.opening_inventory)}</b></span>
                      <span>Inflow <b className="text-slate-700">{fmt(a.inflow)}</b></span>
                      <span>Risk inv <b className="text-rose-600">{fmt(a.risk_inventory)}</b></span>
                      <span>Baseline sold <b className="text-slate-700">{fmt(a.baseline_sold)}</b></span>
                    </div>
                  </div>
                  <form action={deleteActuals}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className={btnDanger} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          {actuals.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              No actuals entered yet.
            </p>
          )}
        </div>
      </section>

      {/* Add new */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Plus className="h-4 w-4 text-sky-500" /> Add Monthly Actuals
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Enter data from ERP / invoices each month.
        </p>

        <form action={upsertActuals} className="mt-5 space-y-4">
          {/* Identity */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className={labelCls}>Period</span>
              <select name="period" defaultValue={currentPeriod} className={inputCls} required>
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Province</span>
              <ProvinceSelect provinces={provinces} />
            </label>
            <label className="block">
              <span className={labelCls}>Channel</span>
              <ChannelSelect />
            </label>
            <label className="block">
              <span className={labelCls}>SKU</span>
              <SkuSelect skus={skus} />
            </label>
          </div>

          {/* Outlet & Revenue */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Outlet Coverage & Revenue
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className={labelCls}>Listed Outlets</span>
                <NumInput name="listed_outlets" placeholder={3000} />
              </label>
              <label className="block">
                <span className={labelCls}>Ordering Outlets</span>
                <NumInput name="ordering_outlets" placeholder={2100} />
              </label>
              <label className="block">
                <span className={labelCls}>Volume Sold (units)</span>
                <NumInput name="volume_sold" placeholder={2000} />
              </label>
              <label className="block">
                <span className={labelCls}>Revenue Actual (VND)</span>
                <NumInput name="revenue_actual" placeholder={2800000000} />
              </label>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Inventory
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className={labelCls}>Opening Inventory</span>
                <NumInput name="opening_inventory" placeholder={4000} />
              </label>
              <label className="block">
                <span className={labelCls}>Inflow (Purchases)</span>
                <NumInput name="inflow" placeholder={2000} />
              </label>
              <label className="block">
                <span className={labelCls}>Risk Inventory</span>
                <NumInput name="risk_inventory" placeholder={4524} />
              </label>
              <label className="block">
                <span className={labelCls}>Risk Sold</span>
                <NumInput name="risk_sold" placeholder={500} />
              </label>
            </div>
          </div>

          {/* Baseline & Promo */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Baseline & Promotion
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <span className={labelCls}>Baseline Sold (units)</span>
                <NumInput name="baseline_sold" placeholder={2000} />
              </label>
              <label className="block">
                <span className={labelCls}>Promo Sell (units/day)</span>
                <NumInput name="promo_sell" placeholder={20} />
              </label>
            </div>
          </div>

          <button type="submit" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" /> Save Actuals
          </button>
        </form>
      </section>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function PipelineClient({
  configs, pipeline, actuals, periods, currentPeriod, provinces, skus, isDemo,
  upsertConfig, deleteConfig, upsertPipeline, deletePipeline,
  upsertActuals, deleteActuals,
}: Props) {
  const [tab, setTab] = useState<Tab>("config");

  const tabs: { id: Tab; label: string }[] = [
    { id: "config",   label: "Forecast Setup" },
    { id: "pipeline", label: "Outlet Pipeline" },
    { id: "actuals",  label: "Monthly Actuals" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Sales Pipeline</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
          Pipeline & Forecast Input
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Enter planning assumptions, outlet pipeline targets, and monthly ERP actuals.
          All inputs feed directly into the Revenue Forecast calculation.
        </p>
        {isDemo && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-300">
            Demo data — connect Supabase to save real entries
          </div>
        )}
      </section>

      {/* ── KPI Summary ── */}
      <SummaryBar configs={configs} actuals={actuals} />

      {/* ── Tab Bar ── */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`h-10 rounded-2xl px-5 text-sm font-semibold transition ${
              tab === id
                ? "bg-sky-400 text-slate-950 shadow-sm"
                : "border border-slate-200 bg-white/85 text-slate-600 hover:border-sky-300 hover:text-sky-700"
            }`}
          >
            {label}
            <span className={`ml-2 rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
              tab === id ? "bg-slate-950/20 text-slate-950" : "bg-slate-100 text-slate-500"
            }`}>
              {id === "config" ? configs.length : id === "pipeline" ? pipeline.length : actuals.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {tab === "config" && (
        <ConfigTab
          configs={configs}
          periods={periods}
          currentPeriod={currentPeriod}
          provinces={provinces}
          skus={skus}
          upsertConfig={upsertConfig}
          deleteConfig={deleteConfig}
        />
      )}
      {tab === "pipeline" && (
        <PipelineTab
          pipeline={pipeline}
          periods={periods}
          currentPeriod={currentPeriod}
          provinces={provinces}
          skus={skus}
          upsertPipeline={upsertPipeline}
          deletePipeline={deletePipeline}
        />
      )}
      {tab === "actuals" && (
        <ActualsTab
          actuals={actuals}
          periods={periods}
          currentPeriod={currentPeriod}
          provinces={provinces}
          skus={skus}
          upsertActuals={upsertActuals}
          deleteActuals={deleteActuals}
        />
      )}

      {/* ── Legend ── */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-700">How it works</p>
        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
          <div>
            <span className="font-semibold text-slate-700">1. Forecast Setup</span>
            <p className="mt-1">Define universe, velocity (F × UPO × G × P × Ramp), pricing (ASP, discount, COGS), and monthly target per SKU/province.</p>
          </div>
          <div>
            <span className="font-semibold text-slate-700">2. Outlet Pipeline</span>
            <p className="mt-1">Track new outlet listings with CRM stage, closing probability, and on-shelf rate. Used to calculate ΔRevenue from pipeline.</p>
          </div>
          <div>
            <span className="font-semibold text-slate-700">3. Monthly Actuals</span>
            <p className="mt-1">Enter ERP data: listed outlets, ordering outlets, revenue, inventory. System auto-calculates ND%, AR%, GM%, DOI, and forecast gap.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
