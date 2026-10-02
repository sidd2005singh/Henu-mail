import { createClient } from "@supabase/supabase-js";

// STRICT SERVER-ONLY SUPABASE ADMIN CLIENT (Bypasses RLS for system operations)
// NEVER EXPOSE OR IMPORT IN CLIENT COMPONENTS
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: createAdminClient called from client-side execution context!");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
