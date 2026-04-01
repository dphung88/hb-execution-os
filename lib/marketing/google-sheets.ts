/**
 * Google Sheets integration for Marketing Task Control
 *
 * Two connection modes (auto-detected from env vars):
 *   1. API Key mode:  GOOGLE_SHEETS_API_KEY + MARKETING_SHEET_ID
 *      → Works for any sheet set to "Anyone with link can view"
 *   2. CSV mode:      MARKETING_SHEET_CSV_URL
 *      → Works for sheets published via File → Share → Publish to web → CSV
 *
 * Expected Google Sheet columns (Row 1 = headers, data starts Row 2):
 *   A  Task Name
 *   B  Owner
 *   C  Requester
 *   D  Status      (Planned | In Progress | Under Review | Completed | Failed)
 *   E  Priority    (Low | Medium | High | Critical)
 *   F  Due Date    (YYYY-MM-DD or DD/MM/YYYY)
 *   G  Progress %  (0–100)
 *   H  Notes
 *   I  File Link   (optional)
 */

export type SheetTask = {
  row: number;
  taskName: string;
  owner: string;
  requester: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  notes: string;
  fileLink: string;
};

export type SheetSyncResult = {
  tasks: SheetTask[];
  sheetTitle: string;
  lastSync: string;
  totalRows: number;
  mode: "api" | "csv" | "none";
  error?: string;
};

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
// Always fetch fresh — Google Sheets data changes frequently
// Use Next.js revalidation at the page level instead of fetch cache
const FETCH_OPTIONS: RequestInit = { cache: "no-store" };

// ── Main fetch function ───────────────────────────────────────────────────────

export async function fetchMarketingSheetTasks(): Promise<SheetSyncResult> {
  const apiKey  = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.MARKETING_SHEET_ID;
  const csvUrl  = process.env.MARKETING_SHEET_CSV_URL;

  // Mode 1: Google Sheets API v4
  if (apiKey && sheetId) {
    return fetchViaApi(sheetId, apiKey);
  }

  // Mode 2: Published CSV
  if (csvUrl) {
    return fetchViaCsv(csvUrl);
  }

  return {
    tasks: [],
    sheetTitle: "",
    lastSync: "",
    totalRows: 0,
    mode: "none",
    error: "no-config",
  };
}

export function isSheetConfigured(): boolean {
  return !!(
    (process.env.GOOGLE_SHEETS_API_KEY && process.env.MARKETING_SHEET_ID) ||
    process.env.MARKETING_SHEET_CSV_URL
  );
}

// ── API Key mode ──────────────────────────────────────────────────────────────

async function fetchViaApi(sheetId: string, apiKey: string): Promise<SheetSyncResult> {
  try {
    // Fetch spreadsheet metadata (title) + values in parallel
    const [metaRes, valuesRes] = await Promise.all([
      fetch(`${SHEETS_API}/${sheetId}?fields=properties.title&key=${apiKey}`, {
        ...FETCH_OPTIONS,
      }),
      fetch(`${SHEETS_API}/${sheetId}/values/A2:I?key=${apiKey}`, {
        ...FETCH_OPTIONS,
      }),
    ]);

    if (!metaRes.ok || !valuesRes.ok) {
      const status = !metaRes.ok ? metaRes.status : valuesRes.status;
      return empty("api", `google-api-error-${status}`);
    }

    const meta   = await metaRes.json();
    const values = await valuesRes.json();
    const rows: string[][] = values.values ?? [];

    return {
      tasks:      parseRows(rows),
      sheetTitle: meta.properties?.title ?? "Marketing Tasks",
      lastSync:   new Date().toISOString(),
      totalRows:  rows.length,
      mode:       "api",
    };
  } catch (e) {
    return empty("api", e instanceof Error ? e.message : "fetch-error");
  }
}

// ── CSV mode ──────────────────────────────────────────────────────────────────

async function fetchViaCsv(csvUrl: string): Promise<SheetSyncResult> {
  try {
    const res = await fetch(csvUrl, { ...FETCH_OPTIONS });

    if (!res.ok) return empty("csv", `csv-fetch-error-${res.status}`);

    const text = await res.text();
    const rows = parseCsvToRows(text).slice(1); // skip header row

    return {
      tasks:      parseRows(rows),
      sheetTitle: "Marketing Tasks",
      lastSync:   new Date().toISOString(),
      totalRows:  rows.length,
      mode:       "csv",
    };
  } catch (e) {
    return empty("csv", e instanceof Error ? e.message : "csv-error");
  }
}

// ── Row parsers ───────────────────────────────────────────────────────────────

function parseRows(rows: string[][]): SheetTask[] {
  return rows
    .map((cols, idx) => {
      const get = (i: number) => (cols[i] ?? "").trim();
      const taskName = get(0);
      if (!taskName) return null; // skip empty rows

      return {
        row:       idx + 2, // 1-indexed, +1 for header row
        taskName,
        owner:     get(1) || "Unassigned",
        requester: get(2) || "—",
        status:    normalizeStatus(get(3)),
        priority:  normalizePriority(get(4)),
        dueDate:   normalizeDate(get(5)),
        progress:  Math.min(100, Math.max(0, parseInt(get(6)) || 0)),
        notes:     get(7),
        fileLink:  get(8),
      } satisfies SheetTask;
    })
    .filter((r): r is SheetTask => r !== null);
}

function parseCsvToRows(csv: string): string[][] {
  return csv
    .replace(/\r\n/g, "\n") // normalize Windows line endings
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => {
      const cols: string[] = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === "," && !inQuote) { cols.push(cur); cur = ""; }
        else { cur += ch; }
      }
      cols.push(cur);
      return cols;
    })
    .filter((row) => row.some((c) => c.trim()));
}

// ── Normalisers ───────────────────────────────────────────────────────────────

function normalizeStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("complet") || s === "done") return "Completed";
  if (s.includes("progress") || s === "wip") return "In Progress";
  if (s.includes("review"))                  return "Under Review";
  if (s.includes("fail") || s === "cancel")  return "Failed";
  if (s.includes("block"))                   return "Blocked";
  return "Planned";
}

function normalizePriority(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("critical") || s.includes("urgent")) return "Critical";
  if (s.includes("high"))   return "High";
  if (s.includes("medium") || s.includes("mid")) return "Medium";
  return "Low";
}

function normalizeDate(raw: string): string {
  if (!raw) return "";
  // DD/MM/YYYY → YYYY-MM-DD
  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function empty(mode: "api" | "csv" | "none", error: string): SheetSyncResult {
  return { tasks: [], sheetTitle: "", lastSync: "", totalRows: 0, mode, error };
}

export function sheetTaskToMarketingRecord(t: SheetTask, monthKey: string) {
  return {
    id:              `sheet-row-${t.row}`,
    monthKey,
    title:           t.taskName,
    owner:           t.owner,
    requester:       t.requester,
    status:          t.status,
    dueDate:         t.dueDate,
    notes:           t.notes,
    progressPercent: t.progress,
    priority:        t.priority,
    fileLink:        t.fileLink,
  };
}
