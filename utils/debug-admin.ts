"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

interface AdminCheckResults {
  isAuthenticated: boolean;
  userId: string | null;
  isAdmin: boolean;
  adminUserId: string | null;
  error: string | null;
}

export function useDebugAdmin() {
  const [results, setResults] = useState<AdminCheckResults>({
    isAuthenticated: false,
    userId: null,
    isAdmin: false,
    adminUserId: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get current auth status
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        setResults({
          isAuthenticated: false,
          userId: null,
          isAdmin: false,
          adminUserId: null,
          error: `Auth error: ${authError.message}`,
        });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setResults({
          isAuthenticated: false,
          userId: null,
          isAdmin: false,
          adminUserId: null,
          error: null,
        });
        setLoading(false);
        return;
      }

      // Now check admin status
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError && adminError.code !== "PGRST116") {
        // Not found error is okay
        setResults({
          isAuthenticated: true,
          userId: authData.user.id,
          isAdmin: false,
          adminUserId: null,
          error: `Admin check error: ${adminError.message} (${adminError.code})`,
        });
      } else {
        setResults({
          isAuthenticated: true,
          userId: authData.user.id,
          isAdmin: !!adminUser,
          adminUserId: adminUser?.id || null,
          error: null,
        });
      }
    } catch (error) {
      setResults({
        isAuthenticated: false,
        userId: null,
        isAdmin: false,
        adminUserId: null,
        error: `Unexpected error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!results.isAuthenticated || !results.userId) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("admin_users")
        .insert({ user_id: results.userId });

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh the status
      await checkAdminStatus();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error: ${(error as Error).message}`,
      };
    }
  };

  useEffect(() => {
    checkAdminStatus();
    // We only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...results,
    loading,
    refresh: checkAdminStatus,
    makeUserAdmin,
  };
}
