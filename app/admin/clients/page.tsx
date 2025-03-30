import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/utils/auth";

export default async function AdminClientsPage() {
  // Check if user is admin
  if (!(await isAdmin())) return redirect("/sign-in");

  const supabase = await createClient();

  // Get all clients with user info
  const { data: clients } = await supabase
    .from("clients")
    .select("*, user:user_id(email)")
    .order("name", { ascending: true });

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button asChild size="sm">
          <Link href="/admin/clients/new">Add New Client</Link>
        </Button>
      </div>

      {clients?.length ? (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Projects</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.user?.email}</td>
                  <td className="p-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/clients/${client.id}/projects`}>
                        View Projects
                      </Link>
                    </Button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="default">
                        <Link href={`/admin/clients/${client.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p>No clients found. Add your first client.</p>
        </div>
      )}
    </div>
  );
}
