import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function Topbar() {
  const supabase = hasSupabaseClientEnv() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  async function signOut() {
    "use server";

    if (hasSupabaseClientEnv()) {
      const serverClient = await createClient();
      await serverClient.auth.signOut();
    }
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      {user ? (
        <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-panel backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="text-base font-semibold text-slate-900">{user.email}</h2>
          </div>

          <form action={signOut} className="hidden md:block">
            <Button variant="secondary" className="gap-2">
              Sign out
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
      ) : null}

      <div className="flex items-center justify-between gap-3 md:hidden">
        <MobileNav />
        {user ? (
          <form action={signOut}>
            <Button variant="secondary" className="gap-2">
              Sign out
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
