"use server";

import { revalidatePath } from "next/cache";
import { getPeriods, savePeriods, type PeriodConfig } from "@/lib/config/periods";

export async function upsertPeriodAction(formData: FormData) {
  const originalKey = formData.get("original_key") as string | null;
  const key = (formData.get("key") as string).trim();
  const label = (formData.get("label") as string).trim();
  const startDate = (formData.get("start_date") as string).trim();
  const endDate = (formData.get("end_date") as string).trim();

  if (!key || !label || !startDate || !endDate) return;

  const periods = await getPeriods();
  const entry: PeriodConfig = { key, label, startDate, endDate };

  if (originalKey && originalKey !== key) {
    // Key changed — replace old entry
    const idx = periods.findIndex((p) => p.key === originalKey);
    if (idx !== -1) {
      periods[idx] = entry;
    } else {
      periods.push(entry);
    }
  } else {
    const idx = periods.findIndex((p) => p.key === key);
    if (idx !== -1) {
      periods[idx] = entry;
    } else {
      periods.push(entry);
    }
  }

  // Sort by key descending
  periods.sort((a, b) => b.key.localeCompare(a.key));
  await savePeriods(periods);
  revalidatePath("/settings/periods");
}

export async function deletePeriodAction(formData: FormData) {
  const key = formData.get("key") as string;
  if (!key) return;
  const periods = (await getPeriods()).filter((p) => p.key !== key);
  await savePeriods(periods);
  revalidatePath("/settings/periods");
}
