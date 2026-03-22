import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";

    const serverClient = await createClient();
    await serverClient.auth.signOut();
    redirect("/login");
  }

  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-panel backdrop-blur">
      <div>
        <p className="text-sm text-slate-500">
          {user ? "Welcome back" : "Preview mode"}
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          {user?.email ?? "Public executive demo"}
        </h2>
      </div>

      {user ? (
        <form action={signOut}>
          <Button variant="secondary" className="gap-2">
            Sign out
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      )}
    </header>
  );
}
