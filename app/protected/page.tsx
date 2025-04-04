import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { UserProfile } from "@/components/auth/user-profile";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import NotesManager from "@/components/notes/NotesManager";
import TrelloBoardWrapper from "@/components/trello/TrelloBoardWrapper";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-8 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>

        {/* Client-side user profile with Google data support */}
        <UserProfile />

        {/* Server-side raw user data for debugging */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Raw user data
          </summary>
          <pre className="text-xs font-mono p-3 mt-2 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>

      {/* Trello Board with client-side rendering */}
      <div className="w-full">
        <h2 className="font-bold text-2xl mb-4">Trello Board</h2>
        <TrelloBoardWrapper url="https://trello.com/b/TAeHfdYF/stormfors-template" />
      </div>

      <div>
        <h2 className="font-bold text-2xl mb-4">Your Notes</h2>
        <div className="mb-8">
          <NotesManager />
        </div>

        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
