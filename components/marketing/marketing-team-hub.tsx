import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckSquare, DollarSign, Megaphone, Sparkles, TrendingUp } from "lucide-react";

import { marketingReportSummary } from "@/lib/demo-data";
import { upsertChannelSpendAction } from "@/app/(app)/marketing-performance/actions";
import type { ChannelPerformanceRow } from "@/lib/marketing/channel-performance";
import type { PeriodConfig } from "@/lib/config/periods";
import { PeriodSelector } from "@/components/ui/period-selector";

type MarketingTeamHubProps = {
  periods?: PeriodConfig[];
  selectedPeriod?: string;
  channelRows?: ChannelPerformanceRow[];
  channelSource?: "live" | "demo";
};

function roasColor(roas: number | null) {
  if (roas === null) return "text-slate-400";
  if (roas >= 5) return "text-emerald-700";
  if (roas >= 2) return "text-amber-700";
  return "text-rose-700";
}

function roasBg(roas: number | null) {
  if (roas === null) return "bg-slate-100";
  if (roas >= 5) return "bg-emerald-100";
  if (roas >= 2) return "bg-amber-100";
  return "bg-rose-100";
}

export function MarketingTeamHub({
  periods = [],
  selectedPeriod = "",
  channelRows = [],
  channelSource = "demo",
}: MarketingTeamHubProps) {
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";

  // Aggregate totals from channel rows
  const totalRevenueActual = channelRows.reduce((s, r) => s + r.revenueActual, 0);
  const totalRevenueTarget = channelRows.reduce((s, r) => s + r.revenueTarget, 0);
  const totalSpend = channelRows.reduce((s, r) => s + r.budgetActual, 0);
  const overallRoas = totalSpend > 0 ? Math.round((totalRevenueActual / totalSpend) * 10) / 10 : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr] xl:items-end">
          <div>
            <p className={heroLabelClass}>Marketing Team</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Marketing execution, KPI ownership, and department results.
            </h1>
            {periods.length > 0 && (
              <div className="mt-5">
                <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} basePath="/marketing-performance" />
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { href: "/marketing-performance/tasks",   icon: CheckSquare,       label: "Tasks" },
                { href: "/marketing-performance/results", icon: BarChart3,         label: "Results" },
                { href: "/marketing-performance/targets", icon: BriefcaseBusiness, label: "Targets" },
                { href: "/marketing-performance/kpis",    icon: Sparkles,          label: "KPI Structure" },
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

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Sales revenue", value: `${totalRevenueActual > 0 ? totalRevenueActual.toFixed(1) : marketingReportSummary.actualOnlineSales}M / ${totalRevenueTarget > 0 ? totalRevenueTarget.toFixed(0) : marketingReportSummary.salesRevenueTarget}M` },
              { label: "Actual AOV",    value: `${marketingReportSummary.averageOrderValue.toFixed(2)}M` },
              { label: "Total ad spend", value: totalSpend > 0 ? `${totalSpend.toFixed(1)}M` : `${marketingReportSummary.totalAdSpend}M` },
              { label: "Overall ROAS",  value: overallRoas !== null ? `${overallRoas}x` : "—" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className={darkCardLabelClass}>{item.label}</p>
                <p className={darkCardValueClass}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channel performance cards */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Channel Performance</p>
              <h2 className="text-2xl font-semibold text-slate-900">Revenue, Budget & ROAS By Channel</h2>
            </div>
          </div>
          {channelSource === "demo" && (
            <span className="mt-1 shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Demo data</span>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {channelRows.map((ch) => {
            const barColor = ch.achievementPct >= 80 ? "bg-emerald-400" : ch.achievementPct >= 50 ? "bg-amber-400" : "bg-rose-400";
            return (
              <div key={ch.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{ch.channel}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ch.achievementPct >= 80 ? "bg-emerald-100 text-emerald-700" : ch.achievementPct >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {ch.achievementPct}%
                  </span>
                </div>

                {/* Revenue */}
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Revenue</p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <p className="text-xl font-semibold text-slate-900">{ch.revenueActual.toFixed(1)}M</p>
                    <p className="text-xs text-slate-400">/ {ch.revenueTarget.toFixed(1)}M target</p>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${ch.achievementPct}%` }} />
                  </div>
                </div>

                {/* Budget + ROAS */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ad Spend</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {ch.budgetActual > 0 ? `${ch.budgetActual.toFixed(2)}M` : "—"}
                    </p>
                  </div>
                  <div className={`flex-1 rounded-xl border border-slate-200 px-3 py-2 ${ch.roas !== null ? roasBg(ch.roas) : "bg-white"}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ROAS</p>
                    <p className={`mt-1 text-sm font-semibold ${roasColor(ch.roas)}`}>
                      {ch.roas !== null ? `${ch.roas}x` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ad Spend Input */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Ad Spend Input</p>
            <h2 className="text-2xl font-semibold text-slate-900">Enter Channel Spend &amp; Revenue Target</h2>
            <p className="mt-1 text-sm text-slate-500">Saved to Supabase — revenue actual is synced from ERP.</p>
          </div>
        </div>

        <form action={upsertChannelSpendAction} className="mt-6">
          <input type="hidden" name="period_key" value={selectedPeriod} />

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {channelRows.map((ch) => (
              <div key={ch.channel} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{ch.channel}</p>
                  <span className={`text-sm font-semibold ${roasColor(ch.roas)}`}>
                    ROAS {ch.roas !== null ? `${ch.roas}x` : "—"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ad Spend (M)</span>
                    <input
                      type="number"
                      name={`spend_${ch.channel}`}
                      defaultValue={ch.budgetActual || ""}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Rev. Target (M)</span>
                    <input
                      type="number"
                      name={`rev_target_${ch.channel}`}
                      defaultValue={ch.revenueTarget || ""}
                      min={0}
                      step={0.1}
                      placeholder="0.0"
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
            <div className="grid grid-cols-[1fr_140px_140px_100px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <div>Channel</div>
              <div>Ad Spend (M)</div>
              <div>Rev. Target (M)</div>
              <div>ROAS</div>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {channelRows.map((ch) => (
                <div key={ch.channel} className="grid grid-cols-[1fr_140px_140px_100px] items-center px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{ch.channel}</p>
                  <div className="pr-3">
                    <input
                      type="number"
                      name={`spend_${ch.channel}`}
                      defaultValue={ch.budgetActual || ""}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </div>
                  <div className="pr-3">
                    <input
                      type="number"
                      name={`rev_target_${ch.channel}`}
                      defaultValue={ch.revenueTarget || ""}
                      min={0}
                      step={0.1}
                      placeholder="0.0"
                      className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </div>
                  <p className={`text-sm font-semibold ${roasColor(ch.roas)}`}>
                    {ch.roas !== null ? `${ch.roas}x` : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ROAS = Revenue ÷ Ad Spend · Good ≥ 5x · OK ≥ 2x · Low &lt; 2x
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save Spend
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
