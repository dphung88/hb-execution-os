import { MarketingTasksWorkspace } from "@/components/marketing/marketing-tasks-workspace";
import { MarketingSheetPanel } from "@/components/marketing/marketing-sheet-panel";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { loadMarketingTasks } from "@/lib/marketing/tasks";
import {
  fetchMarketingSheetTasks,
  isSheetConfigured,
  sheetTaskToMarketingRecord,
} from "@/lib/marketing/google-sheets";
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
  const sheetConfigured = isSheetConfigured();

  // Load both sources in parallel
  const [dbResult, sheetResult] = await Promise.all([
    loadMarketingTasks(selectedPeriod),
    sheetConfigured
      ? fetchMarketingSheetTasks()
      : Promise.resolve({ tasks: [], sheetTitle: "", lastSync: "", totalRows: 0, mode: "none" as const, error: "no-config" }),
  ]);

  // Task Workspace source logic:
  // 1. DB has tasks → show DB tasks (source: "live")
  // 2. DB empty + Sheet has tasks → show Sheet tasks (source: "sheet")
  // 3. DB empty + no Sheet → show demo (source: "demo")
  let workspaceTasks = dbResult.tasks;
  let workspaceSource = dbResult.source;

  if (dbResult.source === "empty" && sheetResult.tasks.length > 0) {
    workspaceTasks = sheetResult.tasks.map((t) => sheetTaskToMarketingRecord(t, selectedPeriod));
    workspaceSource = "sheet";
  } else if (dbResult.source === "empty" && !sheetConfigured) {
    // No DB data, no Sheet → fall back to demo for reference
    const { getMarketingDemoTasks } = await import("@/lib/marketing/tasks");
    workspaceTasks = getMarketingDemoTasks();
    workspaceSource = "demo";
  }

  const sheetId  = process.env.MARKETING_SHEET_ID;
  const sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : undefined;

  const totalSheetTasks = sheetResult.tasks.length;

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
            {workspaceTasks.length}
          </span>
          {/* Source indicator */}
          {workspaceSource === "sheet" && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              SHEET
            </span>
          )}
          {workspaceSource === "demo" && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
              DEMO
            </span>
          )}
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
              activeTab === "sheet"
                ? "bg-white/20 text-white"
                : totalSheetTasks > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
            }`}>
              {totalSheetTasks > 0 ? totalSheetTasks : "●"}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
              Setup
            </span>
          )}
        </Link>
      </div>

      {/* ── Source banner (when workspace is showing sheet or demo data) ── */}
      {activeTab !== "sheet" && workspaceSource === "sheet" && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm">
          <Table2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-700">
            Đang hiển thị <strong>{workspaceTasks.length} tasks</strong> từ Google Sheet.
            Khi team tạo task trực tiếp trên web, data từ DB sẽ được ưu tiên.
          </span>
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto shrink-0 text-xs font-semibold text-emerald-700 underline underline-offset-2">
              Mở Sheet ↗
            </a>
          )}
        </div>
      )}
      {activeTab !== "sheet" && workspaceSource === "demo" && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="text-amber-700">
            ⚠ Đang hiển thị <strong>demo data</strong> — chưa có task thật trong DB và chưa kết nối Google Sheet.
          </span>
        </div>
      )}

      {/* ── Tab content ── */}
      {activeTab === "sheet" ? (
        <MarketingSheetPanel
          result={sheetResult}
          sheetUrl={sheetUrl}
          monthKey={selectedPeriod}
        />
      ) : (
        <MarketingTasksWorkspace
          tasks={workspaceTasks}
          source={workspaceSource === "live" ? "live" : "demo"}
          searchParams={resolvedSearchParams}
          periods={periods}
          selectedPeriod={selectedPeriod}
        />
      )}
    </div>
  );
}
