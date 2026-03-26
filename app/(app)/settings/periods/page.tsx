import { getPeriods } from "@/lib/config/periods";
import { deletePeriodAction, upsertPeriodAction } from "./actions";

export default async function SettingsPeriodsPage() {
  const periods = await getPeriods();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">Settings</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
          Period Management
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Define tracking periods with custom start and end dates. These periods are used across
          all Sales and Marketing filters. Add, edit, or remove periods as your business cycle requires.
        </p>
      </section>

      {/* Existing periods */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Current Periods</h2>
        <p className="mt-1 text-sm text-slate-500">
          {periods.length} period{periods.length !== 1 ? "s" : ""} configured. Edit any row directly.
        </p>

        <div className="mt-5 space-y-3">
          {/* Header row — desktop only */}
          <div className="hidden grid-cols-[1fr,1.4fr,1fr,1fr,auto,auto] gap-3 px-4 sm:grid">
            {["Period key", "Label", "Start date", "End date", "", ""].map((h, i) => (
              <p key={i} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{h}</p>
            ))}
          </div>

          {periods.map((period) => (
            <div key={period.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {/* Hidden delete form (referenced by delete button via form= attribute) */}
              <form id={`del-${period.key}`} action={deletePeriodAction}>
                <input type="hidden" name="key" value={period.key} />
              </form>

              {/* Save form */}
              <form
                action={upsertPeriodAction}
                className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr,1.4fr,1fr,1fr,auto,auto] sm:items-center"
              >
                <input type="hidden" name="original_key" value={period.key} />

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Period key</p>
                  <input
                    name="key"
                    defaultValue={period.key}
                    placeholder="2026-03"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-mono text-slate-900 outline-none transition focus:border-sky-400"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Label</p>
                  <input
                    name="label"
                    defaultValue={period.label}
                    placeholder="March 2026"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Start date</p>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={period.startDate}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">End date</p>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={period.endDate}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                  />
                </div>

                {/* Save button */}
                <div className="col-span-1">
                  <button
                    type="submit"
                    className="h-9 w-full rounded-xl bg-sky-400 px-4 text-xs font-semibold text-slate-950 transition hover:bg-sky-300 sm:w-auto"
                  >
                    Save
                  </button>
                </div>

                {/* Delete button — linked to the hidden delete form */}
                <div className="col-span-1">
                  <button
                    type="submit"
                    form={`del-${period.key}`}
                    className="h-9 w-full rounded-xl border border-rose-200 px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Add new period */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Add New Period</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define the period key (YYYY-MM format), a display label, and the exact start/end dates.
        </p>

        <form action={upsertPeriodAction} className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Period key</span>
              <input
                name="key"
                placeholder="2026-06"
                required
                pattern="\d{4}-\d{2}"
                className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-sky-400"
              />
              <span className="mt-1 block text-[10px] text-slate-400">Format: YYYY-MM</span>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Display label</span>
              <input
                name="label"
                placeholder="June 2026"
                required
                className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
              />
              <span className="mt-1 block text-[10px] text-slate-400">Shown in all selectors</span>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Start date</span>
              <input
                type="date"
                name="start_date"
                required
                className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">End date</span>
              <input
                type="date"
                name="end_date"
                required
                className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Add Period
          </button>
        </form>
      </section>

      {/* Info note */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-700">How periods work</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-500">
          <li>• <strong>Period key</strong> is used in URL params (<code>?period=2026-03</code>) and as database keys</li>
          <li>• <strong>Start / End date</strong> defines the exact window for revenue pace calculations in Sales Forecast</li>
          <li>• <strong>Label</strong> is the display text shown in all period selectors across Sales and Marketing</li>
          <li>• Changes are saved to your browser and take effect immediately on all pages</li>
        </ul>
      </section>
    </div>
  );
}
