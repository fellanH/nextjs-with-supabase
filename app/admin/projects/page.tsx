import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/utils/auth";

export default async function AdminProjectsPage() {
  // Check if user is admin
  if (!(await isAdmin())) return redirect("/sign-in");

  const supabase = await createClient();

  // Get all projects with client info
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });

  // Format dates with explicit locale and format options
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button size="sm">Add New Project</Button>
      </div>

      {projects?.length ? (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Client</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Start Date</th>
                <th className="text-left p-3 font-medium">End Date</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="p-3">{project.name}</td>
                  <td className="p-3">{project.clients?.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                      {project.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(project.start_date).toLocaleDateString(
                      "en-US",
                      dateFormatOptions
                    )}
                  </td>
                  <td className="p-3">
                    {project.end_date
                      ? new Date(project.end_date).toLocaleDateString(
                          "en-US",
                          dateFormatOptions
                        )
                      : "Ongoing"}
                  </td>
                  <td className="p-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/projects/${project.id}`}>
                        Manage Links
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p>No projects found. Add your first project.</p>
        </div>
      )}
    </div>
  );
}
