import Link from "next/link";
import { AlertCircle, ArrowRight, BarChart3, Calculator, ChartColumnBig, RefreshCw, Star, Users } from "lucide-react";

import { syncSalesPeriodAction } from "@/app/(app)/sales-performance/actions";

import { MobileSalesScorecardSelector } from "@/components/sales/mobile-sales-scorecard-selector";

import { salesKpiProducts, salesScoringRules } from "@/lib/demo-data";
import type { SalesAsmResolved, SalesPeriodOption } from "@/lib/sales/queries";
import { calculateIncome, type SalesAsmScorecard } from "@/lib/sales/scorecards";

function getHealthTone(total: number) {
  if (total >= 80) return "text-emerald-700 bg-emerald-50";
  if (total >= 60) return "text-amber-700 bg-amber-50";
  return "text-rose-700 bg-rose-50";
}

const skuLotDates: Record<string, string> = {
  HB006: "2026-08-23",
  HB034: "2027-12-29",
  HB031: "2027-01-28",
  HB035: "2027-08-16",
};

function formatLotDate(value?: string) {
  if (!value) return "Lot date pending";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function getSkuProgressTone(progressPct: number, tone: "key" | "clear") {
  if (tone === "key") {
    return {
      card: "border-sky-200 bg-sky-50/55",
      badge: "bg-amber-100 text-amber-700",
      track: "bg-sky-100",
      fill: progressPct >= 50 ? "bg-sky-500" : "bg-sky-300",
      percent: progressPct >= 50 ? "text-sky-700" : "text-rose-500",
    };
  }

  return {
    card: "border-rose-200 bg-rose-50/55",
    badge: "bg-rose-100 text-rose-600",
    track: "bg-rose-100",
    fill: progressPct >= 80 ? "bg-rose-500" : "bg-rose-300",
    percent: progressPct >= 80 ? "text-rose-700" : "text-rose-500",
  };
}

type SalesPerformanceHubProps = {
  scorecards: Array<SalesAsmResolved & { periodLabel: string; scorecard: SalesAsmScorecard }>;
  liveCount: number;
  periods: SalesPeriodOption[];
  selectedPeriod: string;
  syncStatus?: string;
  syncMessage?: string;
  probationMap?: Record<string, boolean>;
};

export function SalesPerformanceHub({
  scorecards,
  liveCount,
  periods,
  selectedPeriod,
  syncStatus,
  syncMessage,
  probationMap = {},
}: SalesPerformanceHubProps) {
  const totalRevenue = scorecards.reduce((sum, asm) => sum + asm.revenueActual, 0);
  const aboveEighty = scorecards.filter((asm) => asm.scorecard.revenuePct >= 80).length;
  const asmKpiSeventy = scorecards.filter((asm) => asm.scorecard.total >= 70).length;
  const totalCustomers = scorecards.reduce((sum, asm) => sum + asm.newCustomersActual, 0);
  const skuQualified = scorecards.filter((asm) => asm.scorecard.keySkuScore > 0).length;
  const clearstockQualified = scorecards.filter((asm) => asm.scorecard.clearstockScore > 0).length;
  // Income aggregates
  const allIncomes = scorecards.map((asm) =>
    calculateIncome(asm.scorecard.revenuePct, asm.scorecard.payout, probationMap[asm.id] ?? false)
  );
  const totalBaseSalaryM = (allIncomes.reduce((s, i) => s + i.baseSalary, 0) / 1_000_000).toFixed(1);
  const totalAllowanceM  = (allIncomes.reduce((s, i) => s + i.allowance, 0) / 1_000_000).toFixed(1);
  const totalKpiSalaryM  = allIncomes.reduce((s, i) => s + i.kpiSalary / 1_000_000, 0).toFixed(2);
  const reportingAvg = scorecards.length
    ? (scorecards.reduce((s, a) => s + a.scorecard.reportingScore, 0) / scorecards.length).toFixed(1)
    : "0";
  const summaryKeySkuTargets = scorecards[0]?.keySkuTargets ?? Object.values(salesKpiProducts)
    .filter((product) => product.category === "key")
    .map((product) => ({
      code: product.code,
      name: product.name,
      target: product.target,
      minPct: product.minPct,
      actual: 0,
    }));
  const summaryClearstockTargets = scorecards[0]?.clearstockTargets ?? Object.values(salesKpiProducts)
    .filter((product) => product.category === "clearstock")
    .map((product) => ({
      code: product.code,
      name: product.name,
      target: product.target,
      minPct: product.minPct,
      actual: 0,
    }));
  const aggregateSkuTargets = (
    items: typeof summaryKeySkuTargets,
    category: "keySkuTargets" | "clearstockTargets",
  ) =>
    items.map((product) => {
      const teamActual = scorecards.reduce((sum, asm) => {
        const matched = asm[category].find((item) => item.code === product.code);
        return sum + (matched?.actual ?? 0);
      }, 0);

      const teamTarget = scorecards.reduce((sum, asm) => {
        const matched = asm[category].find((item) => item.code === product.code);
        return sum + (matched?.target ?? product.target);
      }, 0);

      const progressPct = teamTarget > 0 ? Math.round((teamActual / teamTarget) * 100) : 0;

      // Prefer lot date from actual ASM target data; fall back to hardcoded map
      const lotDateFromData = scorecards
        .map((asm) => {
          const item = asm[category].find((i) => i.code === product.code);
          return (item as { lotDate?: string } | undefined)?.lotDate;
        })
        .find((d) => d && d.trim() !== "");

      return {
        ...product,
        teamActual,
        teamTarget,
        progressPct,
        lotDate: lotDateFromData ?? skuLotDates[product.code],
      };
    });
  const keySkuProgressCards = aggregateSkuTargets(summaryKeySkuTargets, "keySkuTargets");
  const clearstockProgressCards = aggregateSkuTargets(summaryClearstockTargets, "clearstockTargets");
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),auto] xl:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={heroLabelClass}>Sales Dashboard</p>
              {syncStatus ? (
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    syncStatus === "success"
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-rose-400/20 text-rose-200"
                  }`}
                >
                  {syncStatus === "success" ? syncMessage ?? "Sync completed." : syncMessage ?? "Sync failed."}
                </div>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Sales execution, ASM scorecards, and payout visibility in one place.
            </h1>

            {/* Period selector + Sync ERP — same row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <form method="get" className="flex items-center gap-2">
                <select
                  name="period"
                  defaultValue={selectedPeriod}
                  className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer"
                >
                  {periods.map((period) => (
                    <option key={period.key} value={period.key} className="text-slate-900">
                      {period.label}
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

              <form action={syncSalesPeriodAction}>
                <input type="hidden" name="period" value={selectedPeriod} />
                <button
                  type="submit"
                  className="flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  Sync ERP
                </button>
              </form>
            </div>

            {/* 2×2 nav buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { href: `/sales-performance/forecast?period=${selectedPeriod}`, icon: ChartColumnBig, label: "Forecast" },
                { href: `/sales-performance/targets?period=${selectedPeriod}`,  icon: Calculator,    label: "Targets" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-300" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "SALES REVENUE", value: `${totalRevenue.toLocaleString("en-US")}M` },
            { label: "REVENUE >= 80%", value: `${aboveEighty}/${scorecards.length}` },
            { label: "TOTAL DEALERS CODE", value: `${totalCustomers}` },
            { label: "QUALIFIED ON KEY SKU", value: `${skuQualified}/${scorecards.length}` },
            { label: "QUALIFIED ON CLEARSTOCK", value: `${clearstockQualified}/${scorecards.length}` },
            { label: "ASM KPI SCORE >= 70%", value: `${asmKpiSeventy}/${scorecards.length}` },
            { label: "TOTAL KPI SALARY", value: `${totalKpiSalaryM}M` },
            { label: "TOTAL BASE SALARY", value: `${totalBaseSalaryM}M` },
            { label: "TOTAL ALLOWANCE", value: `${totalAllowanceM}M` },
            { label: "REPORTING (AVG)", value: `${reportingAvg}/5` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4">
              <p className={darkCardLabelClass}>{item.label}</p>
              <p className={darkCardValueClass}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">ASM Scorecards</p>
            <h2 className="text-2xl font-semibold text-slate-900">Built Around The Real ASM Roster</h2>
          </div>
        </div>

        {scorecards.length ? (
          <>
            <MobileSalesScorecardSelector
              scorecards={scorecards}
              selectedPeriod={selectedPeriod}
            />

            <div className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
              <table className="min-w-full table-fixed divide-y divide-slate-200 text-[13px]">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[11%]" />
                </colgroup>
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">ASM</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">SALES REVENUE</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">DEALERS CODE</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">KEY SKU</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">CLEARSTOCK</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">DISCIPLINE</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">BASE + ALLOW</th>
                    <th className="px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">KPI</th>
                    <th className="px-3 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em]">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {scorecards.map((asm) => {
                    const isProbation = probationMap[asm.id] ?? false;
                    const income = calculateIncome(asm.scorecard.revenuePct, asm.scorecard.payout, isProbation);
                    const totalM = (income.total / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
                    return (
                      <tr key={asm.id}>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{asm.name}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.id}</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">
                            {asm.revenueActual}/{asm.revenueTarget}M
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {asm.scorecard.revenueScore}/65 · {asm.scorecard.revenuePct}% target
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">
                            {asm.newCustomersActual}/{asm.newCustomersTarget}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.customerScore}/15</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 font-medium leading-6 text-slate-900">
                            {asm.keySkuTargets.map((item) => (
                              <div key={item.code} className="whitespace-nowrap">
                                {item.code} {item.actual}/{item.target}
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.keySkuScore}/5</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 font-medium leading-6 text-slate-900">
                            {asm.clearstockTargets.map((item) => (
                              <div key={item.code} className="whitespace-nowrap">
                                {item.code} {item.actual}/{item.target}
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{asm.scorecard.clearstockScore}/10</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{asm.scorecard.manualScore}/5</div>
                          <div className="mt-1 text-[11px] text-slate-500">Manager review</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{(income.baseSalary/1_000_000).toFixed(1)}M</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Base</div>
                          <div className="mt-2 font-medium text-slate-900">{(income.allowance/1_000_000).toFixed(1)}M</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Allowance</div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="font-medium text-slate-900">{asm.scorecard.payout}M</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">KPI</div>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${getHealthTone(asm.scorecard.total)}`}>
                            {asm.scorecard.total} pts
                          </span>
                          <span className="mt-1 inline-flex whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">{totalM}M</span>
                          <div className="mt-2">
                            <Link
                              href={`/sales-performance/${asm.id}?period=${selectedPeriod}`}
                              className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                            >
                              View detail
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          {isProbation && (
                            <div className="mt-1.5">
                              <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Probation
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="px-6 py-14 text-center">
              <p className="text-base font-semibold text-slate-900">No Sales KPI data for this month yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Select another period with live data, then review targets and scoring from there.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">SKU KPI Detail</p>
            <h2 className="text-2xl font-semibold text-slate-900">SKU Progress Tracking By Team</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Key SKU Progress</p>
                <p className="mt-1 text-sm text-slate-500">Both SKUs need to reach at least 50% to unlock the full 5-point KPI.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {keySkuProgressCards.map((product) => {
                const tone = getSkuProgressTone(product.progressPct, "key");
                return (
                  <div key={product.code} className={`rounded-2xl border px-4 py-4 ${tone.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          <span className="font-semibold text-sky-600">{product.code}</span>
                          {product.name !== product.code && <span className="ml-1.5">{product.name}</span>}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                        Date: {formatLotDate(product.lotDate)}
                      </span>
                    </div>
                    <div className={`mt-4 h-3 rounded-full ${tone.track}`}>
                      <div
                        className={`h-3 rounded-full transition-all ${tone.fill}`}
                        style={{ width: `${Math.min(product.progressPct, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <p className="text-slate-500">
                        Team: <span className="font-semibold text-slate-900">{product.teamActual.toLocaleString("en-US")}/{product.teamTarget.toLocaleString("en-US")}</span>
                      </p>
                      <span className={`text-lg font-semibold ${tone.percent}`}>{product.progressPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Clearstock Clear Date</p>
                <p className="mt-1 text-sm text-slate-500">Both SKUs need to reach at least 80% to unlock 10 points. One SKU cleared still earns 5 points.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {clearstockProgressCards.map((product) => {
                const tone = getSkuProgressTone(product.progressPct, "clear");
                return (
                  <div key={product.code} className={`rounded-2xl border px-4 py-4 ${tone.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          <span className="font-semibold text-rose-500">{product.code}</span>
                          {product.name !== product.code && <span className="ml-1.5">{product.name}</span>}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                        Date: {formatLotDate(product.lotDate)}
                      </span>
                    </div>
                    <div className={`mt-4 h-3 rounded-full ${tone.track}`}>
                      <div
                        className={`h-3 rounded-full transition-all ${tone.fill}`}
                        style={{ width: `${Math.min(product.progressPct, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <p className="text-slate-500">
                        Team: <span className="font-semibold text-slate-900">{product.teamActual.toLocaleString("en-US")}/{product.teamTarget.toLocaleString("en-US")}</span>
                      </p>
                      <span className={`text-lg font-semibold ${tone.percent}`}>{product.progressPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Calculator className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Scoring Logic</p>
            <h2 className="text-2xl font-semibold text-slate-900">Scoring Logic By KPI</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          {salesScoringRules.map((rule, i) => {
            const palette = [
              { card: "border-sky-100 bg-sky-50",     badge: "bg-sky-100 text-sky-700",     source: "text-sky-600" },
              { card: "border-violet-100 bg-violet-50", badge: "bg-violet-100 text-violet-700", source: "text-violet-600" },
              { card: "border-sky-100 bg-sky-50",     badge: "bg-sky-100 text-sky-700",     source: "text-sky-600" },
              { card: "border-rose-100 bg-rose-50",   badge: "bg-rose-100 text-rose-700",   source: "text-rose-600" },
              { card: "border-amber-100 bg-amber-50", badge: "bg-amber-100 text-amber-700", source: "text-amber-600" },
            ][i] ?? { card: "border-slate-200 bg-slate-50", badge: "bg-white text-slate-600", source: "text-brand-700" };
            return (
              <div key={rule.name} className={`rounded-2xl border px-4 py-4 ${palette.card}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{rule.name}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${palette.badge}`}>
                    {rule.score}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{rule.description}</p>
                <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${palette.source}`}>
                  Source: {rule.source}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
