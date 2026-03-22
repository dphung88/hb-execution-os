import Link from "next/link";

import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { getTaskList, getViewerContext } from "@/lib/tasks/queries";

export default async function TasksPage() {
  const [tasks, viewer] = await Promise.all([getTaskList(), getViewerContext()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-brand-700">Task management</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Tasks</h1>
        </div>

        {viewer.user ? (
          <Link href="/tasks/new">
            <Button>Create task</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="secondary">Sign in to create</Button>
          </Link>
        )}
      </div>

      {!viewer.user ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          You are viewing the public demo dataset. Sign in to work with live tasks.
        </div>
      ) : null}

      <TaskList tasks={tasks} />
    </div>
  );
}
