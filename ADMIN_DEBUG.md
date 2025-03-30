# Admin Functionality Debugging Guide

This guide helps troubleshoot issues with the admin functionality in the NextJS with Supabase application.

## Common Issues

1. **Missing `admin_users` table**: The table doesn't exist in your Supabase instance
2. **No admin privileges**: You're authenticated but not marked as an admin
3. **Authentication problems**: Issues with Supabase authentication
4. **Permission issues**: Row Level Security preventing access

## Debugging Steps

### 1. Visit the Debug Page

Go to `/debug` in your application to access the debugging tool. This page will tell you:

- If you're authenticated
- Your user ID
- If you have admin status
- Any errors encountered

### 2. Check If the admin_users Table Exists

Use the "Check admin_users Table" button on the debug page. If it shows an error like "relation 'admin_users' does not exist", you need to create the table.

### 3. Create the admin_users Table

#### Option A: Using the Migration Script

1. Navigate to your Supabase dashboard (https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of `supabase/migrations/20240329_admin_users.sql`
5. Run the SQL to create the table and setup permissions

#### Option B: Using the Helper Script

1. Install dependencies for the helper script:

   ```bash
   npm install -g dotenv
   npm install -g @supabase/supabase-js
   ```

2. Run the check-admin-table.js script:

   ```bash
   node check-admin-table.js
   ```

3. To make a specific user an admin, edit the script and uncomment the `addAdmin` line, replacing the email with your user's email.

### 4. Make Yourself an Admin

Once the table exists, you can make yourself an admin in several ways:

1. **Through Debug Page**: Use the "Make Current User Admin" button
2. **Through SQL**:

   ```sql
   -- Replace with your auth user ID
   INSERT INTO admin_users (user_id) VALUES ('your-auth-user-id');
   ```

3. **Using the RPC Function**:
   ```sql
   -- Replace with your email
   SELECT make_user_admin('your-email@example.com');
   ```

### 5. Verify Authentication Flow

If you're still having issues, check these components:

1. **middleware.ts**: Ensures admin routes are protected
2. **utils/auth.ts**: Contains the `isAdmin` function
3. **components/header-auth.tsx**: Shows/hides the admin portal link

## Troubleshooting Row Level Security (RLS)

If your admin_users table exists and you've added yourself as an admin, but still can't access admin features, check RLS policies:

1. Go to your Supabase Dashboard > Table Editor
2. Select the `admin_users` table
3. Go to "Authentication" tab
4. Verify these policies exist:
   - "Allow individual read access" for SELECT operations
   - "Allow admin management" for all operations

## Additional Info

- The admin status is checked in middleware.ts before accessing admin routes
- When a user is marked as admin in the admin_users table, they can access all admin routes
- If you need to completely reset, you can drop the table and recreate it:
  ```sql
  DROP TABLE IF EXISTS admin_users;
  ```
  Then follow steps to recreate it again.
