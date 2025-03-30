-- Create admin_users table if it doesn't exist
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
DROP POLICY IF EXISTS "Allow individual read access" ON admin_users;
CREATE POLICY "Allow individual read access" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow admin management" ON admin_users;
CREATE POLICY "Allow admin management" ON admin_users
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Create RPC function to check and create admin user
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
BEGIN
  -- Find the user's ID from their email
  SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
  
  -- If user not found, return false
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is already an admin
  SELECT COUNT(*) INTO v_count FROM admin_users WHERE user_id = v_user_id;
  
  -- If not already admin, make them admin
  IF v_count = 0 THEN
    INSERT INTO admin_users (user_id) VALUES (v_user_id);
  END IF;
  
  RETURN TRUE;
END;
$$; 