import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, ChartColumnBig, Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

import type { SalesForecastData } from "@/lib/sales/forecast";

function formatMillion(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}M`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function toneClass(status: string) {
  if (status === "On track" || status === "Healthy") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Watch") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function PaceGapBadge({ gap }: { gap: number }) {
  if (gap >= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <TrendingUp className="h-3 w-3" />
        +{formatMillion(gap)}/day
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
      <TrendingDown className="h-3 w-3" />
      {formatMillion(gap)}/day
    </span>
  );
}

function SellGapBadge({ gap }: { gap: number }) {
  if (gap >= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <TrendingUp className="h-3 w-3" />
        +{formatNumber(gap)}/day surplus
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
      <TrendingDown className="h-3 w-3" />
      {formatNumber(gap)}/day shortfall
    </span>
  );
}

type Props = {
  forecast: SalesForecastData;
};

export function SalesForecastWorkspace({ forecast }: Props) {
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <p className={heroLabelClass}>Sales Forecast</p>
            <h1 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Revenue pace and clearstock risk in one forecast view.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              Revenue forecast compares current daily pace against the required daily pace to hit target.
              Clearstock forecast shows required sell-through rate vs actual to clear before expiry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {/* Period selector */}
            <form method="get" className="flex items-center gap-2">
              <select
                name="period"
                defaultValue={forecast.selectedPeriod}
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer"
              >
                {forecast.periods.map((p) => (
                  <option key={p.key} value={p.key} className="text-slate-900">
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Apply
              </button>
            </form>

            <div className="h-6 w-px bg-white/15 hidden sm:block" />

            <Link
              href={`/sales-performance?period=${forecast.selectedPeriod}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sales Dashboard
            </Link>
            <Link
              href={`/sales-performance/targets?period=${forecast.selectedPeriod}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sales Targets
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Revenue Forecast", value: formatMillion(forecast.teamProjectedRevenue) },
            { label: "Revenue Gap", value: formatMillion(forecast.revenueGap) },
            { label: "Clear Before Date", value: `${forecast.clearBeforeLotCount}/${forecast.clearstockRows.length}` },
            { label: "At-risk Clearstock", value: `${forecast.atRiskClearstockCount}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4">
              <p className={darkCardLabelClass}>{item.label}</p>
              <p className={darkCardValueClass}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Team pace summary bar */}
        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-slate-400">Current pace </span>
              <span className="font-semibold text-white">{formatMillion(forecast.teamCurrentDailyPace)}/day</span>
            </div>
            <div>
              <span className="text-slate-400">Required pace </span>
              <span className="font-semibold text-white">{formatMillion(forecast.teamRequiredDailyPace)}/day</span>
            </div>
            <div>
              <span className="text-slate-400">Days remaining </span>
              <span className="font-semibold text-white">{forecast.remainingDays} days</span>
            </div>
            <div>
              {forecast.teamCurrentDailyPace >= forecast.teamRequiredDailyPace ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> Team on pace
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-300">
                  <TrendingDown className="h-3 w-3" /> Needs to accelerate {formatMillion(forecast.teamRequiredDailyPace - forecast.teamCurrentDailyPace)}/day
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        {/* ── Revenue Forecast ── */}
        <div className="min-w-0 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Revenue Forecast</p>
              <h2 className="text-2xl font-semibold text-slate-900">Run-Rate Revenue Projection</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Period window</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{forecast.windowLabel}</p>
              <p className="mt-1 text-sm text-slate-500">
                {forecast.elapsedDays}/{forecast.totalDays} days elapsed · {forecast.remainingDays} remaining
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Team pace</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{forecast.teamProjectedPct}% of target</p>
              <p className="mt-1 text-sm text-slate-500">
                Actual {formatMillion(forecast.teamRevenueActual)} vs target {formatMillion(forecast.teamRevenueTarget)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {/* Header row — desktop only */}
            <div className="hidden md:grid md:grid-cols-4 gap-2 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">ASM</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Actual / Target</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Pace (current / needed)</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Gap &amp; Status</p>
            </div>
            {forecast.revenueRows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3">
                {/* Desktop: 4-col grid */}
                <div className="hidden md:grid md:grid-cols-4 gap-2 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{row.name}</p>
                    <p className="text-[11px] text-slate-400">{row.region}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{formatMillion(row.actualRevenue)}</p>
                    <p className="text-[11px] text-slate-400">of {formatMillion(row.targetRevenue)} · {row.projectedPct}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{formatMillion(row.currentDailyPace)}/d</p>
                    <p className="text-[11px] text-slate-400">need {formatMillion(row.requiredDailyPace)}/d</p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-start">
                    <PaceGapBadge gap={row.dailyPaceGap} />
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClass(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                </div>
                {/* Mobile: 2-row layout */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{row.name}</p>
                      <p className="text-[11px] text-slate-400">{row.region}</p>
                    </div>
                    <span className={`shrink-0 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClass(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Actual</p>
                      <p className="text-xs font-semibold text-slate-900">{formatMillion(row.actualRevenue)}</p>
                      <p className="text-[10px] text-slate-400">of {formatMillion(row.targetRevenue)} · {row.projectedPct}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Pace now</p>
                      <p className="text-xs font-semibold text-slate-900">{formatMillion(row.currentDailyPace)}/d</p>
                      <p className="text-[10px] text-slate-400">need {formatMillion(row.requiredDailyPace)}/d</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Gap</p>
                      <PaceGapBadge gap={row.dailyPaceGap} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            * Required pace = (Target − Actual) ÷ remaining days. Current pace = Actual ÷ elapsed days.
          </p>
        </div>

        {/* ── Clearstock Forecast ── */}
        <div className="min-w-0 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Clearstock Forecast</p>
              <h2 className="text-2xl font-semibold text-slate-900">Projected Sell-Through By SKU</h2>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Stock on hand</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{formatNumber(forecast.totalStockOnHand)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Avg daily sell</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{formatNumber(forecast.averageDailySellThrough)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Snapshot date</p>
              <p className="mt-2 text-base font-semibold text-slate-900">08/03/2025</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {forecast.clearstockRows.map((row) => (
              <div key={row.code} className={`rounded-3xl border p-4 ${toneClass(row.risk)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{row.code}</span>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {row.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">{row.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold text-slate-500">Expires</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{row.lotDate}</p>
                    <p className="text-[10px] text-slate-500">{row.daysUntilExpiry} days left</p>
                  </div>
                </div>

                {/* Key metrics: 2x2 */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-500">Stock on hand</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatNumber(row.stockOnHand)} units</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-500">Coverage at current pace</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatNumber(row.coverageMonths)} months</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-500">Current daily sell</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatNumber(row.averageDailySell)} / day</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-500">Required daily to clear</p>
                    <p className={`mt-1 font-semibold ${row.dailySellGap < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                      {formatNumber(row.requiredDailySell)} / day
                    </p>
                  </div>
                </div>

                {/* Gap & monthly push */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SellGapBadge gap={row.dailySellGap} />
                    <span className="text-xs text-slate-600">
                      → push <strong>{formatNumber(row.monthlyPushNeeded)}</strong> units/month
                    </span>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(row.risk)}`}>
                    {row.willClearBeforeLotDate ? "Will clear before date" : "Date risk"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            * Required daily = Stock on hand ÷ days until expiry. Shortfall = how much more per day is needed.
          </p>
        </div>
      </section>

      {/* ── Full SKU Forecast CTA ── */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <ChartColumnBig className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Full SKU Analysis</p>
              <h2 className="text-lg font-semibold text-slate-900">Sales Volume — All SKUs</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Xem breakdown doanh số theo từng SKU cho toàn bộ danh mục, theo từng ASM.
              </p>
            </div>
          </div>
          <Link
            href={`/sales-performance/volume?period=${forecast.selectedPeriod}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Xem toàn bộ SKU
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
