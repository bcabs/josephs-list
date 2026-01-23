-- Re-enable RLS on tools
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Drop all old tool policies
DROP POLICY IF EXISTS "Users can view tools in their groups." ON tools;
DROP POLICY IF EXISTS "Users can insert their own tools." ON tools;
DROP POLICY IF EXISTS "Users can update their own tools." ON tools;
DROP POLICY IF EXISTS "Users can delete their own tools." ON tools;
DROP POLICY IF EXISTS "Allow authenticated insert" ON tools;

-- 1. SELECT: View tools if you are a member of the group
CREATE POLICY "tools_select_policy" ON tools
  FOR SELECT TO authenticated
  USING (is_group_member(group_id));

-- 2. INSERT: Allow if you are authenticated and setting yourself as owner
-- We also check if you are a member of the group here.
CREATE POLICY "tools_insert_policy" ON tools
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id 
    AND is_group_member(group_id)
  );

-- 3. UPDATE: Allow if you are the owner
CREATE POLICY "tools_update_policy" ON tools
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 4. DELETE: Allow if you are the owner
CREATE POLICY "tools_delete_policy" ON tools
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);
