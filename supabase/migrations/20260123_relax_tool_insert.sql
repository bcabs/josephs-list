-- Grant permissions to be sure
GRANT EXECUTE ON FUNCTION is_group_member TO authenticated;
GRANT EXECUTE ON FUNCTION is_group_member TO service_role;
GRANT EXECUTE ON FUNCTION is_group_member TO public;

GRANT EXECUTE ON FUNCTION is_group_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_group_admin TO service_role;
GRANT EXECUTE ON FUNCTION is_group_admin TO public;

-- Drop the strict insert policy
DROP POLICY IF EXISTS "Users can insert their own tools." ON tools;

-- Create a slightly more relaxed insert policy (checks ownership only)
-- The visibility (SELECT) policy still enforces group membership
CREATE POLICY "Users can insert their own tools." ON tools
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );
