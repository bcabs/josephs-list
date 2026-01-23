import { supabase } from '@/lib/supabase';

export interface Group {
  id: string;
  name: string;
  description?: string;
  admin_id: string;
  created_at: string;
}

export interface GroupMember {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export const createGroup = async (name: string, userId: string) => {
  // 1. Create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, admin_id: userId })
    .select()
    .single();

  if (groupError) throw groupError;

  // 2. Add the creator as an admin member of the group
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: userId,
      role: 'admin',
    });

  if (memberError) {
    // Cleanup: If adding member fails, try to delete the group to avoid orphans
    await supabase.from('groups').delete().eq('id', group.id);
    throw memberError;
  }

  return group;
};

export const getUserGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members!inner (
        user_id,
        role
      )
    `)
    .eq('group_members.user_id', userId);

  if (error) throw error;
  return data;
};

export const getGroupDetails = async (groupId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) throw error;
  return data as Group;
};

export const updateGroup = async (groupId: string, updates: Partial<Pick<Group, 'name' | 'description'>>) => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data as Group;
};

export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      role,
      joined_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq('group_id', groupId);

  if (error) throw error;
  // Type assertion or data transformation might be needed depending on strictness
  return data as unknown as GroupMember[];
};

export const inviteUserByEmail = async (groupId: string, email: string) => {
  // 1. Find user by email
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !user) {
    throw new Error('User not found. Please ask them to sign up first.');
  }

  // 2. Add to group
  const { error: insertError } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
    });

  if (insertError) {
    if (insertError.code === '23505') { // Unique violation
      throw new Error('User is already a member of this group.');
    }
    throw insertError;
  }
};
