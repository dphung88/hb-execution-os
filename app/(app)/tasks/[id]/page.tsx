import Link from "next/link";

import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { getTaskById } from "@/lib/tasks/queries";
import { formatDate } from "@/lib/utils";

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/tasks" className="text-sm font-medium text-brand-700">
          Back to tasks
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">{task.title}</h1>
          <TaskStatusBadge value={task.status} kind="status" />
          <TaskStatusBadge value={task.priority} kind="priority" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-900">Description</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {task.description || "No description provided for this task."}
          </p>
        </section>

        <aside className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-900">Details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Owner</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {task.owner_name || task.owner_email || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Due date</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatDate(task.due_date)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatDate(task.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Last updated</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatDate(task.updated_at)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
