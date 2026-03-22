export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  owner_user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TaskWithOwner = TaskRow & {
  owner_name: string | null;
  owner_email: string | null;
};
