"use client";

import { useState } from "react";
import CreateNote from "./CreateNote";
import NotesList from "./NotesList";

export default function NotesManager() {
  // Use a simple counter to trigger refreshes
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to increment the counter and trigger a refresh
  const handleNoteCreated = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-secondary/30 p-4 rounded-lg">
        <CreateNote onNoteCreated={handleNoteCreated} />
      </div>

      <div className="mt-6">
        <NotesList refreshTrigger={refreshCounter} />
      </div>
    </div>
  );
}
