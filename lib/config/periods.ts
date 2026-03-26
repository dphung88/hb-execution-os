import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

export type PeriodConfig = {
  key: string;        // "2026-03"
  label: string;      // "March 2026"
  startDate: string;  // "2026-03-01"
  endDate: string;    // "2026-03-31"
};

const COOKIE_NAME = "periods-config";
const DATA_PATH = path.join(process.cwd(), "lib/config/periods-data.json");

export const DEFAULT_PERIODS: PeriodConfig[] = [
  { key: "2026-03", label: "March 2026",    startDate: "2026-03-01", endDate: "2026-03-31" },
  { key: "2026-04", label: "April 2026",    startDate: "2026-04-01", endDate: "2026-04-30" },
  { key: "2026-05", label: "May 2026",      startDate: "2026-05-01", endDate: "2026-05-31" },
];

/** Read periods from Supabase app_periods table */
async function readFromSupabase(): Promise<PeriodConfig[] | null> {
  if (!hasSupabaseAdminEnv()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_periods")
      .select("key, label, start_date, end_date")
      .order("key", { ascending: false });
    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      key: row.key as string,
      label: row.label as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
    }));
  } catch {
    return null;
  }
}

/** Write periods to Supabase app_periods table */
async function writeToSupabase(periods: PeriodConfig[]): Promise<boolean> {
  if (!hasSupabaseAdminEnv()) return false;
  try {
    const admin = createAdminClient();
    const rows = periods.map((p) => ({
      key: p.key,
      label: p.label,
      start_date: p.startDate,
      end_date: p.endDate,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await admin.from("app_periods").upsert(rows, { onConflict: "key" });
    return !error;
  } catch {
    return false;
  }
}

export async function getPeriods(): Promise<PeriodConfig[]> {
  // 1. Try Supabase first (works everywhere, persistent across devices)
  const fromDb = await readFromSupabase();
  if (fromDb) return fromDb;

  // 2. Try cookie (Vercel fallback when Supabase table not yet created)
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (raw) {
      const parsed = JSON.parse(raw) as PeriodConfig[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fall through */ }

  // 3. Try local JSON file (local dev fallback)
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, "utf-8");
      const parsed = JSON.parse(raw) as PeriodConfig[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fall through */ }

  return [...DEFAULT_PERIODS];
}

export async function savePeriods(periods: PeriodConfig[]): Promise<void> {
  // 1. Save to Supabase (preferred — works everywhere, persists across devices)
  await writeToSupabase(periods);

  // 2. Also save to cookie as backup
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(periods), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
  } catch { /* ignore */ }

  // 3. Also try local file (works in dev)
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(periods, null, 2), "utf-8");
  } catch { /* ignore on Vercel */ }
}

/** Format a period key "YYYY-MM" → readable label using stored config */
export async function getPeriodLabel(key: string): Promise<string> {
  const periods = await getPeriods();
  const found = periods.find((p) => p.key === key);
  if (found) return found.label;
  const [year, month] = key.split("-");
  if (year && month) {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
      new Date(Number(year), Number(month) - 1, 1)
    );
  }
  return key;
}
