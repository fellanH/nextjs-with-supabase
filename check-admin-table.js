// check-admin-table.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key - check your .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkAdminTable() {
  console.log("Checking for admin_users table...");

  try {
    // Check if table exists
    const { error } = await supabase.from("admin_users").select("id").limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist - create it
      console.log("admin_users table does not exist. Creating...");

      const { error: createError } = await supabase.rpc("create_admin_table");

      if (createError) {
        console.error("Error creating admin_users table:", createError);

        // Try direct SQL approach as fallback
        console.log("Attempting direct table creation...");
        const { error: sqlError } = await supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS admin_users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
            
            -- Create index for faster lookups
            CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
            
            -- Row level security
            ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
            
            -- Policies for admin_users table
            CREATE POLICY "Allow individual read access" ON admin_users
              FOR SELECT USING (auth.uid() = user_id);
            
            -- Only allow administrators to insert/update/delete
            CREATE POLICY "Allow admin management" ON admin_users
              USING (auth.uid() IN (SELECT user_id FROM admin_users));
          `,
        });

        if (sqlError) {
          console.error("Failed to create admin_users table:", sqlError);
        } else {
          console.log("Successfully created admin_users table through SQL");
        }
      } else {
        console.log("Successfully created admin_users table");
      }
    } else if (error) {
      console.error("Error checking admin_users table:", error);
    } else {
      console.log("admin_users table exists");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Add current user as admin if specified
async function addAdmin(email) {
  if (!email) return;

  console.log(`Attempting to make ${email} an admin...`);

  try {
    // First get the user ID from the email
    const { data: user, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error(`User not found with email ${email}:`, userError);
      return;
    }

    // Check if user is already an admin
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingAdmin) {
      console.log(`User ${email} is already an admin`);
      return;
    }

    // Add user to admin_users table
    const { error: insertError } = await supabase
      .from("admin_users")
      .insert({ user_id: user.id });

    if (insertError) {
      console.error("Error adding admin:", insertError);
    } else {
      console.log(`Successfully made ${email} an admin`);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Run the check
await checkAdminTable();

// If you want to add an admin user, call this with the email
// Uncomment and replace with desired admin email
// await addAdmin('admin@example.com')

console.log("Done");
