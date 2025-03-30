import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/utils/auth";

export default async function AdminDashboard() {
  // Check if user is admin
  if (!(await isAdmin())) return redirect("/sign-in");

  const supabase = await createClient();

  // Get counts for dashboard
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: linkCount } = await supabase
    .from("project_links")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage clients, projects and links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Clients</h2>
          <p className="text-3xl font-bold">{clientCount || 0}</p>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/admin/clients">Manage Clients</Link>
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-3xl font-bold">{projectCount || 0}</p>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href="/admin/projects">Manage Projects</Link>
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Links</h2>
          <p className="text-3xl font-bold">{linkCount || 0}</p>
          <div className="mt-4">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/projects">View Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
