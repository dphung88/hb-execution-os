"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";

export type SkuForecastRow = {
  code: string;
  name: string;
  lotDate: string;
  stockOnHand: number;
  totalActual: number;
  averageDailySell: number;
  requiredDailySell: number;
  dailySellGap: number;
  daysUntilExpiry: number;
  monthlyPushNeeded: number;
  coverageMonths: number;
  risk: "Healthy" | "Watch" | "At risk" | "No date";
};

type Props = {
  rows: SkuForecastRow[];
  selectedPeriod: string;
  periods: Array<{ key: string; label: string }>;
  elapsedDays: number;
  totalDays: number;
  remainingDays: number;
  periodLabel: string;
};

function fmt(n: number, decimals = 1) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

function riskConfig(risk: SkuForecastRow["risk"]) {
  if (risk === "Healthy") return { card: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="h-3.5 w-3.5" /> };
  if (risk === "Watch")   return { card: "border-amber-200 bg-amber-50",   badge: "bg-amber-100 text-amber-700",   icon: <AlertTriangle className="h-3.5 w-3.5" /> };
  if (risk === "At risk") return { card: "border-rose-200 bg-rose-50",     badge: "bg-rose-100 text-rose-700",     icon: <AlertTriangle className="h-3.5 w-3.5" /> };
  return                         { card: "border-slate-200 bg-slate-50",   badge: "bg-slate-100 text-slate-600",   icon: <Clock className="h-3.5 w-3.5" /> };
}

export function SkuForecastWorkspace({ rows, selectedPeriod, periods, elapsedDays, totalDays, remainingDays, periodLabel }: Props) {
  const [filter, setFilter] = useState<"All" | "At risk" | "Watch" | "Healthy" | "No date">("All");
  const [showZeroStock, setShowZeroStock] = useState(false);

  const atRisk  = rows.filter((r) => r.risk === "At risk").length;
  const watch   = rows.filter((r) => r.risk === "Watch").length;
  const healthy = rows.filter((r) => r.risk === "Healthy").length;
  const totalStock = rows.reduce((s, r) => s + r.stockOnHand, 0);

  const visible = rows.filter((r) => {
    if (!showZeroStock && r.stockOnHand === 0) return false;
    if (filter !== "All" && r.risk !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">SKU Forecast</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Clearstock forecast for all SKUs.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Based on actual monthly sell-through, computes daily sell rate per SKU and compares against required pace to clear stock before lot expiry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <form method="get" className="flex items-center gap-2">
              <select
                name="period"
                defaultValue={selectedPeriod}
                className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer"
              >
                {periods.map((p) => (
                  <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>
                ))}
              </select>
              <button type="submit" className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                Apply
              </button>
            </form>
            <div className="h-6 w-px bg-white/15 hidden sm:block" />
            <Link
              href={`/sales-performance/forecast?period=${selectedPeriod}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              KPI Forecast
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Total SKUs", value: rows.length },
            { label: "At Risk",    value: atRisk,  highlight: atRisk > 0 },
            { label: "Watch",      value: watch },
            { label: "Stock on Hand", value: totalStock.toLocaleString("en-US") },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl p-4 ${item.highlight ? "bg-rose-500/20" : "bg-white/10"}`}>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
              <p className={`mt-3 text-[1.9rem] font-semibold leading-tight ${item.highlight ? "text-rose-300" : "text-white"}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Period info bar */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
          <span className="text-slate-400">Period: </span>
          <span className="font-semibold text-white">{periodLabel}</span>
          <span className="mx-4 text-slate-500">·</span>
          <span className="text-slate-400">Elapsed: </span>
          <span className="font-semibold text-white">{elapsedDays}/{totalDays} days</span>
          <span className="mx-4 text-slate-500">·</span>
          <span className="text-slate-400">Remaining: </span>
          <span className="font-semibold text-white">{remainingDays} days</span>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["All", "At risk", "Watch", "Healthy", "No date"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                filter === f
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {f} {f !== "All" && <span className="ml-1 opacity-60">{rows.filter(r => r.risk === f).length}</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowZeroStock((v) => !v)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
        >
          {showZeroStock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showZeroStock ? "Hide zero stock" : "Show zero stock"}
        </button>
      </div>

      {/* ── SKU Grid ── */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-12 text-center shadow-panel">
          <p className="text-slate-500">No SKUs match the current filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => {
            const { card, badge, icon } = riskConfig(row.risk);
            return (
              <div key={row.code} className={`rounded-3xl border p-4 ${card}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-base font-semibold text-slate-900">{row.code}</span>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{row.name}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge}`}>
                    {icon}{row.risk}
                  </span>
                </div>

                {/* Lot date & expiry */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Lot date</span>
                  <span className="font-semibold text-slate-800">
                    {row.lotDate || <span className="text-slate-400 italic">Pending</span>}
                    {row.daysUntilExpiry > 0 && (
                      <span className="ml-1.5 font-normal text-slate-400">({row.daysUntilExpiry}d)</span>
                    )}
                  </span>
                </div>

                {/* Metrics grid */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/70 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-500">Stock on Hand</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{row.stockOnHand.toLocaleString("en-US")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-500">Sold This Period</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{row.totalActual.toLocaleString("en-US")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-500">Current Pace</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{fmt(row.averageDailySell)}/day</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-500">Required Pace</p>
                    <p className={`mt-1 text-sm font-semibold ${row.requiredDailySell > row.averageDailySell ? "text-rose-700" : "text-emerald-700"}`}>
                      {row.requiredDailySell > 0 ? `${fmt(row.requiredDailySell)}/day` : "—"}
                    </p>
                  </div>
                </div>

                {/* Gap & push */}
                {row.requiredDailySell > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.dailySellGap >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {row.dailySellGap >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {row.dailySellGap >= 0 ? "+" : ""}{fmt(row.dailySellGap)}/day
                    </span>
                    <span className="text-xs text-slate-600">
                      → push <strong>{row.monthlyPushNeeded.toLocaleString("en-US")}</strong>/mo
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        * Current Pace = total sold ÷ elapsed days. Required Pace = stock on hand ÷ days until lot expiry.
      </p>
    </div>
  );
}
