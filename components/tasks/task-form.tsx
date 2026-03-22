import { createTask } from "@/app/(app)/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TaskForm() {
  return (
    <form
      action={createTask}
      className="space-y-5 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-panel"
    >
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Title
        </label>
        <Input id="title" name="title" placeholder="Prepare weekly GTM review" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Capture context, expected outcome, and any dependencies."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue="todo"
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue="medium"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="due_date" className="text-sm font-medium text-slate-700">
            Due date
          </label>
          <Input id="due_date" name="due_date" type="date" />
        </div>
      </div>

      <Button type="submit">Create task</Button>
    </form>
  );
}
