-- 1. Remove group_id from tools
-- We'll first drop the policies that depend on it
DROP POLICY IF EXISTS "tools_select_policy" ON tools;
DROP POLICY IF EXISTS "tools_insert_policy" ON tools;

ALTER TABLE tools DROP COLUMN group_id;

-- 2. Update RLS policies for tools
-- A tool is viewable if the viewer and the owner share at least one group.

CREATE OR REPLACE FUNCTION shared_group_exists(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = user_a
    AND gm2.user_id = user_b
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT policy: Viewer shares a group with the owner
CREATE POLICY "tools_select_policy" ON tools
  FOR SELECT TO authenticated
  USING (
    shared_group_exists(auth.uid(), owner_id)
    OR auth.uid() = owner_id
  );

-- INSERT policy: Owner is current user
CREATE POLICY "tools_insert_policy" ON tools
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
  );

-- UPDATE/DELETE policies remain the same as they use owner_id
