import { createClient } from "@/lib/supabase/server";
import { demoTasks } from "@/lib/demo-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import type { TaskWithOwner } from "@/types/database";

export async function getViewerContext() {
  if (!hasSupabaseClientEnv()) {
    return {
      supabase: null,
      user: null,
      isPreviewMode: true
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
    isPreviewMode: !user
  };
}

export async function getTaskList() {
  const { supabase, isPreviewMode } = await getViewerContext();

  if (isPreviewMode || !supabase) {
    return demoTasks;
  }

  const { data, error } = await supabase
    .from("task_overview")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return demoTasks;
  }

  return (data ?? []) as TaskWithOwner[];
}

export async function getTaskById(taskId: string) {
  const { supabase, isPreviewMode } = await getViewerContext();

  if (isPreviewMode || !supabase) {
    const demoTask = demoTasks.find((task) => task.id === taskId) ?? demoTasks[0];
    return demoTask;
  }

  const { data, error } = await supabase
    .from("task_overview")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    const demoTask = demoTasks.find((task) => task.id === taskId) ?? demoTasks[0];
    return demoTask;
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
