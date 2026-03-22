"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/tasks/queries";
import type { TaskPriority, TaskStatus } from "@/types/database";

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "todo") as TaskStatus;
  const priority = String(formData.get("priority") ?? "medium") as TaskPriority;
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;

  if (!title) {
    redirect("/tasks/new?error=Title%20is%20required");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description,
      status,
      priority,
      due_date: dueDate,
      owner_user_id: user.id,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/tasks/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  redirect(`/tasks/${data!.id}`);
}
