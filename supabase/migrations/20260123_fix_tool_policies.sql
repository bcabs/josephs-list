-- Explicitly set all tool policies to ensure they are correct and use helper functions
DROP POLICY IF EXISTS "Users can view tools in their groups." ON tools;
DROP POLICY IF EXISTS "Users can insert their own tools." ON tools;
DROP POLICY IF EXISTS "Users can update their own tools." ON tools;
DROP POLICY IF EXISTS "Users can delete their own tools." ON tools;

-- Select: View tools in groups you are a member of
CREATE POLICY "Users can view tools in their groups." ON tools
  FOR SELECT USING (
    is_group_member(group_id)
  );

-- Insert: Must be the owner AND a member of the group
CREATE POLICY "Users can insert their own tools." ON tools
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND is_group_member(group_id)
  );

-- Update: Must be the owner
CREATE POLICY "Users can update their own tools." ON tools
  FOR UPDATE USING (
    auth.uid() = owner_id
  );

-- Delete: Must be the owner
CREATE POLICY "Users can delete their own tools." ON tools
  FOR DELETE USING (
    auth.uid() = owner_id
  );
