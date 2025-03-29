"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateNote({
  onNoteCreated,
}: {
  onNoteCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Get the current user first
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        console.error("User not authenticated");
        alert("You must be logged in to create notes");
        return;
      }

      // Insert note with explicit user_id
      const { data, error } = await supabase
        .from("notes")
        .insert({
          title: title.trim(),
          user_id: userData.user.id,
        })
        .select();

      if (error) {
        console.error("Error creating note:", error);
        alert("Failed to create note: " + error.message);
      } else {
        console.log("Note created successfully:", data);
        setTitle("");
        // Notify parent component to refresh notes list
        if (onNoteCreated) onNoteCreated();
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Add a new note
        </label>
        <div className="flex space-x-2">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </div>
    </form>
  );
}
