import type { PeriodConfig } from "@/lib/config/periods";

type PeriodSelectorProps = {
  periods: PeriodConfig[];
  selectedPeriod: string;
  /** Base path to redirect to, e.g. "/marketing-performance/tasks" */
  basePath?: string;
};

/**
 * A reusable period selector form that submits a GET request with ?period=<key>.
 * Uses dark (hero) styling — white/glass on dark background.
 */
export function PeriodSelector({ periods, selectedPeriod, basePath }: PeriodSelectorProps) {
  return (
    <form method="get" action={basePath} className="flex items-center gap-2">
      <select
        name="period"
        defaultValue={selectedPeriod}
        className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer"
      >
        {periods.map((p) => (
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
  );
}
