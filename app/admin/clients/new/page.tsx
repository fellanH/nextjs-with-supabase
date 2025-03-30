import { redirect } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import CreateClientForm from "@/components/admin/CreateClientForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewClientPage() {
  // Check if user is admin
  if (!(await isAdmin())) return redirect("/sign-in");

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Client</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/clients">Back to Clients</Link>
        </Button>
      </div>

      <div className="border rounded-md p-6">
        <CreateClientForm />
      </div>
    </div>
  );
}
