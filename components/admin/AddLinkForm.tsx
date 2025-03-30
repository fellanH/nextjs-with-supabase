"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AddLinkFormProps {
  projectId: string;
}

export default function AddLinkForm({ projectId }: AddLinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    type: "document",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from("project_links").insert({
        project_id: projectId,
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        type: formData.type,
      });

      if (error) {
        console.error("Error adding link:", error);
        alert("Failed to add link: " + error.message);
      } else {
        // Clear form
        setFormData({
          title: "",
          url: "",
          description: "",
          type: "document",
        });

        // Could trigger a refresh here or use React Query for auto-refresh
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Link title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option value="design">Design</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
          <option value="document">Document</option>
        </select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Link"}
      </Button>
    </form>
  );
}
