import { createClient } from "@supabase/supabase-js";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createWriteClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? getSupabasePublishableKey();

  if (!url || !key) {
    throw new Error("Missing Supabase write environment variables.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
