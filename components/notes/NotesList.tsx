"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Note = {
  id: number;
  title: string;
  user_id: string;
};

export default function NotesList({
  refreshTrigger = 0,
}: {
  refreshTrigger?: number;
}) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Get the current user first
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Authentication error. Please sign in again.");
          setLoading(false);
          return;
        }

        if (!userData?.user) {
          setError("Not authenticated. Please sign in.");
          setLoading(false);
          return;
        }

        console.log("Fetching notes for user:", userData.user.id);

        // With RLS enabled, this will only fetch the user's notes
        // But let's explicitly filter by user_id to be sure
        const { data, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("id", { ascending: false });

        if (notesError) {
          console.error("Error fetching notes:", notesError);
          setError("Failed to load notes: " + notesError.message);
        } else {
          console.log("Notes fetched:", data);
          setNotes(data);
        }
      } catch (err) {
        console.error("Error in fetch notes:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  if (loading) {
    return <div className="text-sm">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No notes found. Create your first note above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Your Notes</h3>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="p-3 bg-secondary/40 rounded-md">
            {note.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
