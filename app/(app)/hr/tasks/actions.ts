"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWriteClient } from "@/lib/supabase/write";

function getErrorKey(message: string | null | undefined) {
  const m = String(message ?? "").toLowerCase();
  if (m.includes("relation") || m.includes("column") || m.includes("schema cache")) return "missing-table";
  if (m.includes("row-level security")) return "rls-blocked";
  return "save-failed";
}

export async function createHrTaskAction(formData: FormData) {
  let client;
  try { client = createWriteClient(); }
  catch { redirect("/hr/tasks?error=save-not-configured"); }

  const payload = {
    month_key:        String(formData.get("month_key") ?? ""),
    task_name:        String(formData.get("task_name") ?? "").trim(),
    owner_name:       String(formData.get("owner_name") ?? "").trim(),
    request_source:   String(formData.get("request_source") ?? "").trim(),
    priority:         String(formData.get("priority") ?? "Medium"),
    status:           String(formData.get("status") ?? "Planned"),
    due_date:         String(formData.get("due_date") ?? "") || null,
    result_note:      String(formData.get("result_note") ?? "").trim(),
    progress_percent: Number(formData.get("progress_percent") ?? 0),
    file_link:        String(formData.get("file_link") ?? "").trim() || null,
  };

  const { error } = await client.from("hr_tasks").insert(payload);
  if (error) redirect(`/hr/tasks?error=${getErrorKey(error.message)}`);

  revalidatePath("/hr");
  revalidatePath("/hr/tasks");
  redirect("/hr/tasks?saved=create");
}

export async function updateHrTaskAction(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "");
  let client;
  try { client = createWriteClient(); }
  catch { redirect("/hr/tasks?error=save-not-configured"); }

  const { error } = await client
    .from("hr_tasks")
    .update({
      status:           String(formData.get("status") ?? "Planned"),
      progress_percent: Number(formData.get("progress_percent") ?? 0),
      result_note:      String(formData.get("result_note") ?? "").trim(),
      file_link:        String(formData.get("file_link") ?? "").trim() || null,
    })
    .eq("id", taskId);

  if (error) redirect(`/hr/tasks?error=${getErrorKey(error.message)}`);

  revalidatePath("/hr");
  revalidatePath("/hr/tasks");
  redirect(`/hr/tasks?saved=${taskId}`);
}
