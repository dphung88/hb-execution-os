import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function FinanceTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const period = params?.period ?? "";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Finance</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">Finance Tasks</h1>
        <p className="mt-3 max-w-xl text-sm text-slate-400">
          Track monthly finance deliverables — closing, reporting, budget reviews, and compliance tasks.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/finance"
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Finance Dashboard
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Task List</h2>
          <button className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-2xl bg-slate-100 p-4">
            <Plus className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">No finance tasks yet</p>
          <p className="mt-1 text-xs text-slate-500">Finance task management coming soon.</p>
        </div>
      </section>
    </div>
  );
}
