import Link from "next/link";
import { BriefcaseBusiness, BarChart3, CheckSquare, Megaphone, Sparkles } from "lucide-react";

import {
  marketingChannelSetup,
  marketingReportSummary,
} from "@/lib/demo-data";
import type { PeriodConfig } from "@/lib/config/periods";
import { PeriodSelector } from "@/components/ui/period-selector";

type MarketingTeamHubProps = {
  periods?: PeriodConfig[];
  selectedPeriod?: string;
};

export function MarketingTeamHub({ periods = [], selectedPeriod = "" }: MarketingTeamHubProps) {
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";
  const darkCardLabelClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300";
  const darkCardValueClass = "mt-3 text-[1.9rem] font-semibold leading-tight text-white";

  return (
    <div className="space-y-6">
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
                { href: "/marketing-performance/tasks",   icon: CheckSquare,      label: "Tasks" },
                { href: "/marketing-performance/results", icon: BarChart3,        label: "Results" },
                { href: "/marketing-performance/targets", icon: BriefcaseBusiness, label: "Targets" },
                { href: "/marketing-performance/kpis",    icon: Sparkles,         label: "KPI Structure" },
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
              { label: "Sales revenue", value: `${marketingReportSummary.actualOnlineSales}M / ${marketingReportSummary.salesRevenueTarget}M` },
              { label: "Actual AOV", value: `${marketingReportSummary.averageOrderValue.toFixed(2)}M` },
              { label: "Total ad spend", value: `${marketingReportSummary.totalAdSpend}M` },
              { label: "Total PO", value: `${marketingReportSummary.totalPurchaseOrders}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className={darkCardLabelClass}>{item.label}</p>
                <p className={darkCardValueClass}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Channel Setup</p>
            <h2 className="text-2xl font-semibold text-slate-900">Budget Mix By Channel</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {marketingChannelSetup.map((channel) => (
            <div key={channel.channel} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{channel.channel}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {(channel.actualRatio * 100).toFixed(1)}% actual ratio
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Actual spend {channel.actualBudget}M
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
