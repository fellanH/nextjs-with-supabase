"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import Image from "next/image";

export function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (data?.user) {
        setUser(data.user);
      }

      setLoading(false);
    }

    getUser();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>Not signed in</div>;
  }

  // Check if user has Google auth data
  const isGoogleUser = user.app_metadata?.provider === "google";
  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {avatarUrl && (
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={fullName || "Profile"}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{fullName || user.email}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {isGoogleUser && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
              Google Account
            </span>
          )}
        </div>
      </div>

      <form action={signOutAction}>
        <Button variant="outline" className="w-full" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
