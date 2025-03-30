"use client";

import { useState } from "react";
import { useDebugAdmin } from "@/utils/debug-admin";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function DebugPage() {
  const {
    isAuthenticated,
    userId,
    isAdmin,
    adminUserId,
    error,
    loading,
    refresh,
    makeUserAdmin,
  } = useDebugAdmin();

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleMakeAdmin = async () => {
    setActionMessage(null);
    setActionError(null);

    const result = await makeUserAdmin();
    if (result.success) {
      setActionMessage("Successfully made user an admin!");
    } else {
      setActionError(`Failed to make user admin: ${result.error}`);
    }
  };

  const handleCheckTableExists = async () => {
    setActionMessage(null);
    setActionError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("admin_users")
        .select("id")
        .limit(1);

      if (error) {
        if (error.code === "42P01") {
          setActionError(`Table doesn't exist: ${error.message}`);
        } else {
          setActionError(`Error checking table: ${error.message}`);
        }
      } else {
        setActionMessage("admin_users table exists!");
      }
    } catch (error) {
      setActionError(`Unexpected error: ${(error as Error).message}`);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Force a refresh
    window.location.href = "/debug";
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Debugging</h1>
        <p className="text-muted-foreground">
          Debug and fix admin functionality issues
        </p>
      </div>

      <div className="border rounded-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Authenticated:</span>{" "}
                {isAuthenticated ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </p>
              {userId && (
                <p>
                  <span className="font-semibold">User ID:</span> {userId}
                </p>
              )}
              <p>
                <span className="font-semibold">Admin Status:</span>{" "}
                {isAdmin ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </p>
              {adminUserId && (
                <p>
                  <span className="font-semibold">Admin Record ID:</span>{" "}
                  {adminUserId}
                </p>
              )}
              {error && (
                <p className="text-red-600">
                  <span className="font-semibold">Error:</span> {error}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={refresh} variant="outline">
            Refresh Status
          </Button>

          <Button onClick={handleCheckTableExists} variant="outline">
            Check admin_users Table
          </Button>

          {isAuthenticated && !isAdmin && (
            <Button onClick={handleMakeAdmin} variant="default">
              Make Current User Admin
            </Button>
          )}

          {isAuthenticated && (
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          )}
        </div>

        {(actionMessage || actionError) && (
          <div className="mt-4">
            {actionMessage && <p className="text-green-600">{actionMessage}</p>}
            {actionError && <p className="text-red-600">{actionError}</p>}
          </div>
        )}
      </div>

      <div className="border rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">Debugging Instructions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Common Issues:</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                Missing <code>admin_users</code> table in Supabase
              </li>
              <li>Incorrect permissions on the admin_users table</li>
              <li>No admin record for your user</li>
              <li>Authentication issues</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">How to Fix:</h3>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                Check if the admin_users table exists using the button above
              </li>
              <li>
                If you're authenticated but not an admin, use the "Make Current
                User Admin" button
              </li>
              <li>
                If the table doesn't exist, run the check-admin-table.js script
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
