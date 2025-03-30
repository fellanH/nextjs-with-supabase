// app/client-portal/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProjectCard from "@/components/client-portal/ProjectCard";
import { UserProfile } from "@/components/auth/user-profile";

export default async function ClientDashboard() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  // Get client info
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!client) {
    // No client profile yet - could redirect to an onboarding page
    // For MVP we'll just show a message
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            You don't have a client profile set up yet. Please contact your
            project manager for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Get all projects for this client
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", client.id)
    .order("start_date", { ascending: false });

  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <UserProfile />
      <div>
        <h1 className="text-2xl font-bold pt-8">Welcome, {client.name}</h1>
        <p className="text-muted-foreground pt-4 pb-4">
          Here are your current projects
        </p>
        {projects?.length ? (
          <div className="">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p>No projects yet. We'll add your first project soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
