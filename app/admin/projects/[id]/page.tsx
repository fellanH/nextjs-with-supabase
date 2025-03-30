import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import AddLinkForm from "@/components/admin/AddLinkForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isAdmin } from "@/utils/auth";

export default async function AdminProjectPage({
  params,
}: {
  params: { id: string };
}) {
  // Check if user is admin
  if (!(await isAdmin())) return redirect("/sign-in");

  const supabase = await createClient();
  const { id } = params;

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(name)")
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

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            Client: {project.clients?.name}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Start Date:</span>{" "}
              {new Date(project.start_date).toLocaleDateString(
                "en-US",
                dateFormatOptions
              )}
            </div>
            {project.end_date && (
              <div>
                <span className="text-muted-foreground">End Date:</span>{" "}
                {new Date(project.end_date).toLocaleDateString(
                  "en-US",
                  dateFormatOptions
                )}
              </div>
            )}
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/admin/projects">Back to Projects</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Project Links</h2>
          {links?.length ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">URL</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-t">
                      <td className="p-3">{link.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                          {link.type}
                        </span>
                      </td>
                      <td className="p-3 truncate max-w-[200px]">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline">
                          {link.url}
                        </a>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <p>No links added yet.</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
          <AddLinkForm projectId={id} />
        </div>
      </div>
    </div>
  );
}
