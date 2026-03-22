import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { TaskWithOwner } from "@/types/database";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user: user! };
}

export async function getTaskList() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("task_overview")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaskWithOwner[];
}

export async function getTaskById(taskId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("task_overview")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TaskWithOwner;
}

export async function getDashboardStats() {
  const tasks = await getTaskList();

  return {
    totalTasks: tasks.length,
    openTasks: tasks.filter((task) => task.status !== "done").length,
    blockedTasks: tasks.filter((task) => task.status === "blocked").length,
    criticalTasks: tasks.filter((task) => task.priority === "critical").length
  };
}
