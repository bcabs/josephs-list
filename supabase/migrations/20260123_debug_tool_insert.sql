-- DROP all insert policies on tools to be safe
DROP POLICY IF EXISTS "Users can insert their own tools." ON tools;

-- Create a permissive policy for debugging
-- This allows ANY authenticated user to insert ANY row into tools
CREATE POLICY "Allow authenticated insert" ON tools
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
