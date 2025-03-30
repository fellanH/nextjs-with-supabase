import { createClient } from "@/utils/supabase/server";
import { createClient as createClientBrowser } from "@/utils/supabase/client";

export async function isAdmin() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user is in admin_users table
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return !!adminUser && !error;
}

// For client-side admin checks
export function useAdminStatus() {
  const supabase = createClientBrowser();

  // This function is meant to be used with React hooks
  const checkAdminStatus = async () => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user is in admin_users table
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    return !!adminUser && !error;
  };

  return checkAdminStatus;
}
