"use client";

import { useState, useMemo } from "react";
import type { SheetTask, SheetSyncResult } from "@/lib/marketing/google-sheets";
import { ExternalLink, RefreshCw, Table2, AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  result:     SheetSyncResult;
  sheetUrl?:  string;  // link to open the sheet
  monthKey:   string;
};

// ── Status/Priority helpers ───────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; icon: React.ComponentType<{className?: string}>; cls: string }> = {
  "Completed":    { label: "Completed",    icon: CheckCircle2,   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "In Progress":  { label: "In Progress",  icon: RefreshCw,      cls: "bg-blue-50 text-blue-700 border-blue-200" },
  "Under Review": { label: "Under Review", icon: Clock,          cls: "bg-amber-50 text-amber-700 border-amber-200" },
  "Planned":      { label: "Planned",      icon: Clock,          cls: "bg-slate-50 text-slate-600 border-slate-200" },
  "Blocked":      { label: "Blocked",      icon: AlertTriangle,  cls: "bg-orange-50 text-orange-700 border-orange-200" },
  "Failed":       { label: "Failed",       icon: XCircle,        cls: "bg-red-50 text-red-700 border-red-200" },
};

const PRIORITY_CLS: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META["Planned"];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_CLS[priority] ?? PRIORITY_CLS.Low}`}>
      {priority}
    </span>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 20 ? "bg-amber-500" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-500">{pct}%</span>
    </div>
  );
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCards({ tasks }: { tasks: SheetTask[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const total      = tasks.length;
  const done       = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue    = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "Completed" && t.status !== "Failed").length;
  const avgPct     = total ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / total) : 0;

  const cards = [
    { label: "Total Tasks",  value: total,      cls: "text-slate-900" },
    { label: "Completed",    value: done,        cls: "text-emerald-600" },
    { label: "In Progress",  value: inProgress,  cls: "text-blue-600" },
    { label: "Overdue",      value: overdue,     cls: overdue > 0 ? "text-red-600" : "text-slate-400" },
    { label: "Avg Progress", value: `${avgPct}%`, cls: "text-slate-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {cards.map(({ label, value, cls }) => (
        <div key={label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${cls}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Owner breakdown ───────────────────────────────────────────────────────────

function OwnerBreakdown({ tasks }: { tasks: SheetTask[] }) {
  const byOwner = useMemo(() => {
    const map = new Map<string, SheetTask[]>();
    tasks.forEach((t) => {
      const arr = map.get(t.owner) ?? [];
      arr.push(t);
      map.set(t.owner, arr);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [tasks]);

  if (!byOwner.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Workload by Owner</p>
      <div className="flex flex-wrap gap-2">
        {byOwner.map(([owner, ownerTasks]) => {
          const done = ownerTasks.filter((t) => t.status === "Completed").length;
          const pct  = Math.round((done / ownerTasks.length) * 100);
          return (
            <div key={owner} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
              <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                {owner.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-slate-700">{owner}</span>
              <span className="text-slate-400">{ownerTasks.length} tasks</span>
              <span className={`text-xs font-semibold ${pct === 100 ? "text-emerald-600" : "text-slate-500"}`}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MarketingSheetPanel({ result, sheetUrl, monthKey }: Props) {
  const [filter, setFilter]     = useState<string>("all");
  const [ownerFilter, setOwner] = useState<string>("all");
  const [search, setSearch]     = useState("");

  const { tasks, sheetTitle, lastSync, mode, error } = result;

  // Not configured
  if (mode === "none") {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <Table2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-700">Google Sheet chưa được kết nối</p>
        <p className="mt-1 text-sm text-slate-400">Thêm env vars vào Vercel để bật tính năng này.</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left text-xs font-mono text-slate-600 space-y-1">
          <p><span className="text-sky-600">GOOGLE_SHEETS_API_KEY</span>=your_api_key</p>
          <p><span className="text-sky-600">MARKETING_SHEET_ID</span>=spreadsheet_id_from_url</p>
          <p className="text-slate-400 pt-1">-- hoặc dùng CSV (sheet phải publish) --</p>
          <p><span className="text-sky-600">MARKETING_SHEET_CSV_URL</span>=published_csv_url</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !tasks.length) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-red-700">Không thể đọc Google Sheet</p>
          <p className="text-sm text-red-500 mt-1 font-mono">{error}</p>
          <p className="text-xs text-red-400 mt-2">Kiểm tra lại API key, Sheet ID, và quyền truy cập của sheet.</p>
        </div>
      </div>
    );
  }

  // Filters
  const owners    = [...new Set(tasks.map((t) => t.owner))].sort();
  const statuses  = ["all", "Planned", "In Progress", "Under Review", "Completed", "Failed", "Blocked"];
  const today     = new Date().toISOString().slice(0, 10);

  const filtered = tasks.filter((t) => {
    if (ownerFilter !== "all" && t.owner !== ownerFilter) return false;
    if (filter === "overdue") return t.dueDate && t.dueDate < today && t.status !== "Completed" && t.status !== "Failed";
    if (filter !== "all"     && t.status !== filter) return false;
    if (search && !t.taskName.toLowerCase().includes(search.toLowerCase()) &&
        !t.owner.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const syncAgo = lastSync
    ? (() => {
        const mins = Math.round((Date.now() - new Date(lastSync).getTime()) / 60000);
        return mins < 1 ? "vừa xong" : `${mins} phút trước`;
      })()
    : "—";

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-brand-500" />
            <h2 className="font-semibold text-slate-800">{sheetTitle || "Marketing Tasks"}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              mode === "api" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {mode === "api" ? "Google Sheets API" : "CSV"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {tasks.length} tasks · Sync {syncAgo}
            {error && <span className="ml-2 text-amber-500">⚠ {error}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Mở Sheet
            </a>
          )}
          <form method="GET">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </form>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <SummaryCards tasks={tasks} />

      {/* ── Owner breakdown ── */}
      <OwnerBreakdown tasks={tasks} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Tìm task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400 w-40"
        />
        {/* Status filter */}
        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
              }`}
            >
              {s === "all" ? "Tất cả" : s === "overdue" ? "⚠ Overdue" : s}
            </button>
          ))}
          <button
            onClick={() => setFilter("overdue")}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              filter === "overdue"
                ? "bg-red-600 text-white"
                : "bg-white border border-slate-200 text-red-500 hover:border-red-300"
            }`}
          >
            ⚠ Overdue
          </button>
        </div>
        {/* Owner filter */}
        <select
          value={ownerFilter}
          onChange={(e) => setOwner(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand-400"
        >
          <option value="all">Tất cả owner</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* ── Task table ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Không có task nào phù hợp với bộ lọc
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Task Name", "Owner", "Requester", "Status", "Priority", "Due Date", "Progress", "Notes"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const isOverdue = task.dueDate && task.dueDate < today && task.status !== "Completed" && task.status !== "Failed";
                  return (
                    <tr
                      key={`${task.row}-${task.taskName}`}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${isOverdue ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="flex items-start gap-1.5">
                          {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />}
                          <span className="font-medium text-slate-800 leading-snug">
                            {task.taskName}
                          </span>
                        </div>
                        {task.fileLink && (
                          <a href={task.fileLink} target="_blank" rel="noopener noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-brand-500 hover:underline">
                            <ExternalLink className="h-3 w-3" /> File
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {task.owner.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-slate-700 text-xs">{task.owner}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{task.requester}</td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                      <td className={`px-4 py-3 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                        {task.dueDate || "—"}
                      </td>
                      <td className="px-4 py-3"><ProgressBar pct={task.progress} /></td>
                      <td className="px-4 py-3 max-w-[180px] text-xs text-slate-500 leading-snug">
                        {task.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 flex justify-between">
          <span>Hiển thị {filtered.length} / {tasks.length} tasks</span>
          <span>Nguồn: Google Sheets row {tasks[0]?.row ?? "—"} – {tasks[tasks.length - 1]?.row ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
