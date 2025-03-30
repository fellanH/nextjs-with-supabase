"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function CreateClientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // First check if the user exists by email (using auth.getUser() would require being signed in as that user)
      const { data: existingUsers, error: userError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", formData.email);

      let userId;

      if (!existingUsers || existingUsers.length === 0) {
        // Create a new user (in a production app, you would send an invite)
        // Note: This requires admin privileges on the API key
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: formData.email,
            email_confirm: true,
            user_metadata: { full_name: formData.name },
          });

        if (createError) throw createError;
        userId = newUser.user.id;
      } else {
        userId = existingUsers[0].id;
      }

      // Create client record
      const { error: clientError } = await supabase.from("clients").insert({
        name: formData.name,
        user_id: userId,
        phone: formData.phone || null,
        company: formData.company || null,
      });

      if (clientError) throw clientError;

      // Redirect back to clients list
      router.push("/admin/clients");
      router.refresh();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Failed to create client: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="client@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company (optional)</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company Name"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Client"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/clients")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
