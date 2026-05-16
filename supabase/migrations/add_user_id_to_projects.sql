-- Add user_id column to projects table for direct auth user association
-- This links projects directly to Supabase Auth users (auth.users.id)
-- The homeowner_id column remains for backward compatibility but user_id is the primary link

-- Add the column (nullable so existing projects aren't broken)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create an index for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Update RLS policy to also allow users to see their own projects by user_id
-- First drop the old select policy if it exists, then recreate
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (
  user_id = auth.uid()
  OR homeowner_id IN (SELECT id FROM homeowners WHERE auth_user_id = auth.uid())
  OR session_id = current_setting('app.session_id', true)
);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (
  user_id = auth.uid()
  OR homeowner_id IN (SELECT id FROM homeowners WHERE auth_user_id = auth.uid())
  OR session_id = current_setting('app.session_id', true)
);

-- Keep the service role policy
DROP POLICY IF EXISTS "Service role can manage projects" ON projects;
CREATE POLICY "Service role can manage projects" ON projects USING (auth.role() = 'service_role');

-- Keep the insert policy open (projects can be created by anyone)
DROP POLICY IF EXISTS "Users can insert projects" ON projects;
CREATE POLICY "Users can insert projects" ON projects FOR INSERT WITH CHECK (true);
