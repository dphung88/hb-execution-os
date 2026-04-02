// Generic Google Sheet task fetcher — shared by all departments
// Each department uses its own env var prefix, e.g.:
//   FINANCE_SHEET_CSV_URL, HR_SHEET_CSV_URL, SC_SHEET_CSV_URL, etc.
//
// CSV column order (same template for all departments):
//   Task Name | Owner | Requester | Status | Priority | Due Date | Progress % | Notes | File Link

const FETCH_OPTIONS: RequestInit = { cache: "no-store" };

export type DeptSheetTask = {
  row:             number;
  taskName:        string;
  owner:           string;
  requester:       string;
  status:          string;
  priority:        string;
  dueDate:         string;
  progress:        number;
  notes:           string;
  fileLink:        string;
};

export type DeptSheetResult = {
  tasks:      DeptSheetTask[];
  source:     "sheet" | "none";
  mode:       "csv" | "none";
  error?:     string;
  lastSync?:  string;
  totalRows:  number;
};

// ── CSV parser (RFC 4180 compliant — handles multiline quoted fields) ─────────

function parseCsvToRows(csv: string): string[][] {
  const text = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let cols: string[] = [];
  let cur = "";
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = false; }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        cols.push(cur); cur = "";
      } else if (ch === "\n") {
        cols.push(cur); cur = "";
        if (cols.some((c) => c.trim())) rows.push(cols);
        cols = [];
      } else {
        cur += ch;
      }
    }
  }
  if (cur || cols.length > 0) {
    cols.push(cur);
    if (cols.some((c) => c.trim())) rows.push(cols);
  }
  return rows;
}

// ── Normalisers ───────────────────────────────────────────────────────────────

function normalizeStatus(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes("complet") || s === "done")   return "Completed";
  if (s.includes("progress") || s === "wip")   return "In Progress";
  if (s.includes("review"))                    return "Under Review";
  if (s.includes("fail") || s === "cancel")    return "Failed";
  if (s.includes("block") || s === "on hold")  return "Blocked";
  if (s === "" || s.includes("plan") || s === "todo" || s === "open") return "Planned";
  return raw.trim() || "Planned";
}

function normalizePriority(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes("critical") || s === "urgent") return "Critical";
  if (s.includes("high"))   return "High";
  if (s.includes("medium") || s === "normal" || s === "med") return "Medium";
  if (s.includes("low"))    return "Low";
  return "Medium";
}

function normalizeDate(raw: string): string {
  if (!raw.trim()) return "";
  const d = new Date(raw.trim());
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function parseRows(rows: string[][]): DeptSheetTask[] {
  return rows.map((cols, idx) => {
    const get = (i: number) => (cols[i] ?? "").trim();
    const taskName = get(0);
    if (!taskName) return null;
    return {
      row:       idx + 2, // +2 because row 1 is header
      taskName,
      owner:     get(1),
      requester: get(2),
      status:    normalizeStatus(get(3)),
      priority:  normalizePriority(get(4)),
      dueDate:   normalizeDate(get(5)),
      progress:  Math.min(100, Math.max(0, parseInt(get(6)) || 0)),
      notes:     get(7),
      fileLink:  get(8),
    } satisfies DeptSheetTask;
  }).filter((r): r is DeptSheetTask => r !== null);
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchViaCsv(csvUrl: string): Promise<DeptSheetResult> {
  const resp = await fetch(csvUrl, FETCH_OPTIONS);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  const text = await resp.text();
  const allRows = parseCsvToRows(text);
  const dataRows = allRows.slice(1); // skip header
  const tasks = parseRows(dataRows);
  return {
    tasks,
    source: "sheet",
    mode: "csv",
    lastSync: new Date().toISOString(),
    totalRows: dataRows.length,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch tasks for a department from its Google Sheet.
 * envPrefix: e.g. "FINANCE", "HR", "SC", "SALES", "IT", "MEDICAL"
 * Reads: process.env[`${envPrefix}_SHEET_CSV_URL`]
 */
export async function fetchDeptSheetTasks(envPrefix: string): Promise<DeptSheetResult> {
  const csvUrl = process.env[`${envPrefix}_SHEET_CSV_URL`];

  if (!csvUrl) {
    return { tasks: [], source: "none", mode: "none", totalRows: 0 };
  }

  try {
    return await fetchViaCsv(csvUrl);
  } catch (err) {
    return {
      tasks: [],
      source: "none",
      mode: "none",
      error: err instanceof Error ? err.message : String(err),
      totalRows: 0,
    };
  }
}

/** Returns true if the department has a sheet configured */
export function isDeptSheetConfigured(envPrefix: string): boolean {
  return !!process.env[`${envPrefix}_SHEET_CSV_URL`];
}
