import Link from "next/link";

import { signIn } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-panel backdrop-blur">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
          HB Execution OS
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-3 text-sm text-slate-500">
          Use your Supabase email and password to access the Phase 1 workspace.
        </p>
      </div>

      <form action={signIn} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Input id="password" name="password" type="password" required />
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Create your first user from the Supabase Auth dashboard, then come back here.
        {" "}
        <Link href="https://supabase.com/dashboard" className="font-medium text-brand-700">
          Open Supabase
        </Link>
      </p>
    </div>
  );
}
