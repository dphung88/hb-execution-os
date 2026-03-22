import Link from "next/link";

import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { getTaskList } from "@/lib/tasks/queries";

export default async function TasksPage() {
  const tasks = await getTaskList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-brand-700">Task management</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Tasks</h1>
        </div>

        <Link href="/tasks/new">
          <Button>Create task</Button>
        </Link>
      </div>

      <TaskList tasks={tasks} />
    </div>
  );
}
