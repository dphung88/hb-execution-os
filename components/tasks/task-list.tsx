import Link from "next/link";

import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { formatDate } from "@/lib/utils";
import type { TaskWithOwner } from "@/types/database";

export function TaskList({ tasks }: { tasks: TaskWithOwner[] }) {
  if (!tasks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
        No tasks yet. Create the first task to start tracking execution.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-panel">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Task</th>
            <th className="px-5 py-4 font-medium">Owner</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Priority</th>
            <th className="px-5 py-4 font-medium">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <tr key={task.id} className="text-slate-700 transition hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-medium text-slate-900 hover:text-brand-700"
                >
                  {task.title}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {task.description || "No description provided"}
                </p>
              </td>
              <td className="px-5 py-4">{task.owner_name || task.owner_email || "Unknown"}</td>
              <td className="px-5 py-4">
                <TaskStatusBadge value={task.status} kind="status" />
              </td>
              <td className="px-5 py-4">
                <TaskStatusBadge value={task.priority} kind="priority" />
              </td>
              <td className="px-5 py-4">{formatDate(task.due_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
