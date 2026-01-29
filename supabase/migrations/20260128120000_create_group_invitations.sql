-- Create group_invitations table
CREATE TABLE group_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, email)
);

-- Enable RLS
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins of the group can view/insert/delete invitations
CREATE POLICY "Group admins can manage invitations" ON group_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_invitations.group_id
      AND groups.admin_id = auth.uid()
    )
  );

-- Function to handle new user signup -> convert invitations to memberships
CREATE OR REPLACE FUNCTION public.handle_new_user_invitations()
RETURNS trigger AS $$
BEGIN
  -- Find pending invitations for this email
  -- Insert into group_members
  INSERT INTO public.group_members (group_id, user_id, role)
  SELECT group_id, new.id, 'member'
  FROM public.group_invitations
  WHERE email = new.email
  AND status = 'pending';

  -- Update invitations to accepted
  UPDATE public.group_invitations
  SET status = 'accepted'
  WHERE email = new.email
  AND status = 'pending';

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after profile creation (which happens after auth.users creation)
CREATE TRIGGER on_profile_created_check_invites
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_invitations();
