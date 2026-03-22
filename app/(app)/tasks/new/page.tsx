import Link from "next/link";

import { TaskForm } from "@/components/tasks/task-form";

export default async function NewTaskPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/tasks" className="text-sm font-medium text-brand-700">
          Back to tasks
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create task</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add a new execution item for your team.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <TaskForm />
    </div>
  );
}
