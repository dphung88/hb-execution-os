import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, ChartColumnBig, Gauge, TrendingUp } from "lucide-react";

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
              Revenue forecast is based on current actual pace in the selected period. Clearstock
              forecast is based on the latest stock snapshot, average daily sell-through, projected
              clear date, and lot-date risk.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Link
              href={`/sales-performance?period=${forecast.selectedPeriod}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Back to Sales Dashboard
            </Link>
            <Link
              href={`/sales-performance/targets?period=${forecast.selectedPeriod}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open Sales Targets
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Revenue Forecast", value: formatMillion(forecast.teamProjectedRevenue) },
            { label: "Revenue Gap", value: formatMillion(forecast.revenueGap) },
            { label: "Clear Before Lot Date", value: `${forecast.clearBeforeLotCount}/${forecast.clearstockRows.length}` },
            { label: "At-risk Clearstock", value: `${forecast.atRiskClearstockCount}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4">
              <p className={darkCardLabelClass}>{item.label}</p>
              <p className={darkCardValueClass}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-700">Revenue Forecast</p>
              <h2 className="text-2xl font-semibold text-slate-900">Run-rate revenue projection</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Period window</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{forecast.windowLabel}</p>
              <p className="mt-1 text-sm text-slate-500">
                {forecast.elapsedDays}/{forecast.totalDays} days elapsed
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

          <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
            <div className="min-w-[760px]">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-medium">ASM</th>
                    <th className="px-4 py-4 font-medium">Region</th>
                    <th className="px-4 py-4 font-medium">Actual</th>
                    <th className="px-4 py-4 font-medium">Target</th>
                    <th className="px-4 py-4 font-medium">Projected</th>
                    <th className="px-4 py-4 font-medium">Projected %</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {forecast.revenueRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 text-slate-600">{row.region}</td>
                      <td className="px-4 py-4 text-slate-700">{formatMillion(row.actualRevenue)}</td>
                      <td className="px-4 py-4 text-slate-700">{formatMillion(row.targetRevenue)}</td>
                      <td className="px-4 py-4 text-slate-900 font-medium">{formatMillion(row.projectedRevenue)}</td>
                      <td className="px-4 py-4 text-slate-700">{row.projectedPct}%</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-700">Clearstock Forecast</p>
              <h2 className="text-2xl font-semibold text-slate-900">Projected sell-through by SKU</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Stock on hand</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(forecast.totalStockOnHand)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Avg daily sell-through</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatNumber(forecast.averageDailySellThrough)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Snapshot date</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">08/03/2025</p>
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
                    <p className="mt-1 text-base font-medium text-slate-900">{row.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">Lot date</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{row.lotDate}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white/70 px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Stock on hand</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatNumber(row.stockOnHand)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Weekly sell-out</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatNumber(row.weeklySellOut)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Days to clear</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatNumber(row.daysToClear)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-3">
                    <p className="text-xs font-semibold text-slate-500">Projected clear date</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.projectedClearDate}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Gauge className="h-4 w-4" />
                    Daily sell-through {formatNumber(row.averageDailySell)} / day
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(row.risk)}`}>
                    {row.willClearBeforeLotDate ? "Will clear before lot date" : "Lot-date risk"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
