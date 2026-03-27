import Link from "next/link";
import { PenSquare } from "lucide-react";

import { marketingWorkbookContext } from "@/lib/demo-data";
import type { MarketingManualInputs } from "@/lib/marketing/kpi-templates";
import type { MarketingTaskRecord } from "@/lib/marketing/tasks";
import { MarketingManualKpiResults } from "@/components/marketing/marketing-manual-kpi-results";

type MarketingTargetsWorkspaceProps = {
  tasks?: MarketingTaskRecord[];
  manualInputs?: MarketingManualInputs;
  manualSource?: "supabase" | "local";
  periods?: import("@/lib/config/periods").PeriodConfig[];
  selectedPeriod?: string;
};

export function MarketingTargetsWorkspace({
  tasks = [],
  manualInputs,
  manualSource = "local",
  periods = [],
  selectedPeriod = "",
}: MarketingTargetsWorkspaceProps) {
  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className={heroLabelClass}>Marketing Targets</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Set target values for each Marketing role before confirming monthly outcomes.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {periods.length > 0 && (
              <>
                <form method="get" action="/marketing-performance/targets" className="flex items-center gap-2">
                  <select name="period" defaultValue={selectedPeriod} className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer">
                    {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
                  </select>
                  <button type="submit" className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Apply</button>
                </form>
                <div className="h-6 w-px bg-white/15 hidden sm:block" />
              </>
            )}
            <Link href="/marketing-performance" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15">
              Dashboard
            </Link>
            <Link href="/marketing-performance/results" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/15">
              Results
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <PenSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Target setup</p>
            <h2 className="text-2xl font-semibold text-slate-900">Monthly Role Target Plan</h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Use this page only for target setup. Outcome confirmation and payout calculation are handled separately in Marketing Results.
        </p>
      </section>

      <MarketingManualKpiResults
        tasks={tasks}
        monthKey={marketingWorkbookContext.monthKey}
        initialInputs={manualInputs}
        source={manualSource}
        mode="targets"
      />
    </div>
  );
}
