-- Fix infinite recursion by introducing Security Definer functions
-- These functions bypass RLS when checking permissions, breaking the loop

-- Function to check if the current user is a member of a group
CREATE OR REPLACE FUNCTION is_group_member(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user is an admin of a group
CREATE OR REPLACE FUNCTION is_group_admin(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM groups
    WHERE id = _group_id
    AND admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they are members of." ON groups;
DROP POLICY IF EXISTS "Admins can update their groups." ON groups;
DROP POLICY IF EXISTS "Members can view other members in their groups." ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members." ON group_members;
DROP POLICY IF EXISTS "Users can view tools in their groups." ON tools;

-- Re-create Groups Policies
CREATE POLICY "Users can view groups they are members of." ON groups
  FOR SELECT USING (
    is_group_member(id) OR admin_id = auth.uid()
  );

CREATE POLICY "Admins can update their groups." ON groups
  FOR UPDATE USING (admin_id = auth.uid());

-- Re-create Group Members Policies
CREATE POLICY "Members can view other members in their groups." ON group_members
  FOR SELECT USING (
    is_group_member(group_id)
  );

CREATE POLICY "Admins can manage group members." ON group_members
  FOR ALL USING (
    is_group_admin(group_id)
  );

-- Re-create Tools Policies (Safe update to use function)
CREATE POLICY "Users can view tools in their groups." ON tools
  FOR SELECT USING (
    is_group_member(group_id)
  );
