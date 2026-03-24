"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { marketingWorkbookContext } from "@/lib/demo-data";
import { createWriteClient } from "@/lib/supabase/write";

function getErrorKey(message: string | null | undefined) {
  const normalized = String(message ?? "").toLowerCase();

  if (normalized.includes("relation") || normalized.includes("column") || normalized.includes("schema cache")) {
    return "missing-table";
  }

  if (normalized.includes("row-level security")) {
    return "rls-blocked";
  }

  return "save-failed";
}

export async function createMarketingTaskAction(formData: FormData) {
  const monthKey = String(formData.get("month_key") ?? marketingWorkbookContext.monthKey);
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/marketing-performance/tasks?error=save-not-configured`);
  }

  const payload = {
    month_key: monthKey,
    task_name: String(formData.get("task_name") ?? "").trim(),
    owner_name: String(formData.get("owner_name") ?? "").trim(),
    request_source: String(formData.get("request_source") ?? "").trim(),
    priority: String(formData.get("priority") ?? "Low"),
    status: String(formData.get("status") ?? "Planned"),
    due_date: String(formData.get("due_date") ?? "") || null,
    result_note: String(formData.get("result_note") ?? "").trim(),
    progress_percent: Number(formData.get("progress_percent") ?? 0),
    file_link: String(formData.get("file_link") ?? "").trim() || null,
  };

  const { error } = await client.from("marketing_tasks").insert(payload);

  if (error) {
    redirect(`/marketing-performance/tasks?error=${getErrorKey(error.message)}`);
  }

  revalidatePath("/marketing-performance");
  revalidatePath("/marketing-performance/tasks");
  revalidatePath("/marketing-performance/kpis");
  redirect(`/marketing-performance/tasks?saved=create`);
}

export async function updateMarketingTaskAction(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "");
  let client;

  try {
    client = createWriteClient();
  } catch {
    redirect(`/marketing-performance/tasks?error=save-not-configured`);
  }

  const { error } = await client
    .from("marketing_tasks")
    .update({
      status: String(formData.get("status") ?? "Planned"),
      progress_percent: Number(formData.get("progress_percent") ?? 0),
      result_note: String(formData.get("result_note") ?? "").trim(),
      file_link: String(formData.get("file_link") ?? "").trim() || null,
    })
    .eq("id", taskId);

  if (error) {
    redirect(`/marketing-performance/tasks?error=${getErrorKey(error.message)}`);
  }

  revalidatePath("/marketing-performance");
  revalidatePath("/marketing-performance/tasks");
  revalidatePath("/marketing-performance/kpis");
  redirect(`/marketing-performance/tasks?saved=${taskId}`);
}
