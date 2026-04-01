import { MarketingTasksWorkspace } from "@/components/marketing/marketing-tasks-workspace";
import { MarketingSheetPanel } from "@/components/marketing/marketing-sheet-panel";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { loadMarketingTasks } from "@/lib/marketing/tasks";
import { fetchMarketingSheetTasks, isSheetConfigured } from "@/lib/marketing/google-sheets";
import { Table2, ClipboardList } from "lucide-react";
import Link from "next/link";

type MarketingTasksPageProps = {
  searchParams?: Promise<{
    period?: string;
    owner?: string;
    status?: string;
    saved?: string;
    error?: string;
    tab?: string;
  }>;
};

export default async function MarketingTasksPage({ searchParams }: MarketingTasksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const periods        = await getPeriods();
  const selectedPeriod = resolvedSearchParams?.period ?? getCurrentPeriod(periods);
  const activeTab      = resolvedSearchParams?.tab ?? "tasks";

  // Load both sources in parallel
  const [{ tasks, source }, sheetResult] = await Promise.all([
    loadMarketingTasks(selectedPeriod),
    activeTab === "sheet" || isSheetConfigured() ? fetchMarketingSheetTasks() : Promise.resolve({
      tasks: [], sheetTitle: "", lastSync: "", totalRows: 0, mode: "none" as const, error: "no-config",
    }),
  ]);

  const sheetConfigured = isSheetConfigured();

  // Build Google Sheet URL for "Open Sheet" button
  const sheetId  = process.env.MARKETING_SHEET_ID;
  const sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : undefined;

  return (
    <div className="space-y-5">
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-white p-1 shadow-sm w-fit">
        <Link
          href={`/marketing-performance/tasks?period=${selectedPeriod}&tab=tasks`}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab !== "sheet"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Task Workspace
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            activeTab !== "sheet" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {tasks.length}
          </span>
        </Link>
        <Link
          href={`/marketing-performance/tasks?period=${selectedPeriod}&tab=sheet`}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "sheet"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Table2 className="h-4 w-4" />
          Google Sheet
          {sheetConfigured ? (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeTab === "sheet" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              {sheetResult.tasks.length > 0 ? sheetResult.tasks.length : "●"}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
              Setup
            </span>
          )}
        </Link>
      </div>

      {/* ── Tab content ── */}
      {activeTab === "sheet" ? (
        <MarketingSheetPanel
          result={sheetResult}
          sheetUrl={sheetUrl}
          monthKey={selectedPeriod}
        />
      ) : (
        <MarketingTasksWorkspace
          tasks={tasks}
          source={source}
          searchParams={resolvedSearchParams}
          periods={periods}
          selectedPeriod={selectedPeriod}
        />
      )}
    </div>
  );
}
