// app/client-portal/projects/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LinkCard from "@/components/client-portal/LinkCard";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  // Get project details (RLS will ensure it's visible to this user)
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) return notFound();

  // Get all links for this project
  const { data: links } = await supabase
    .from("project_links")
    .select("*")
    .eq("project_id", id)
    .order("type");

  // Format dates with explicit locale and format options
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const startDate = new Date(project.start_date).toLocaleDateString(
    "en-US",
    dateFormatOptions
  );
  const endDate = project.end_date
    ? new Date(project.end_date).toLocaleDateString("en-US", dateFormatOptions)
    : null;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            {project.status}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">{project.description}</p>

        <div className="flex gap-4 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Start Date:</span>{" "}
            {startDate}
          </div>
          {endDate && (
            <div>
              <span className="text-muted-foreground">End Date:</span> {endDate}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Project Links</h2>
        {links?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p>No links have been added to this project yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
