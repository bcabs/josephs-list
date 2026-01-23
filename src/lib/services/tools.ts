import { supabase } from '@/lib/supabase';

export interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  owner_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const createTool = async (
  tool: Omit<Tool, 'id' | 'created_at' | 'owner_id' | 'profiles'>,
  ownerId: string
) => {
  const { data, error } = await supabase
    .from('tools')
    .insert({ ...tool, owner_id: ownerId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGroupTools = async (groupId: string) => {
  // This function might be less relevant now if we don't filter by group in the DB,
  // but we could still filter by users who are in that group.
  const { data: members, error: memberError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  if (memberError) throw memberError;
  const userIds = members.map(m => m.user_id);

  const { data, error } = await supabase
    .from('tools')
    .select('*, profiles(full_name, email)')
    .in('owner_id', userIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Tool[];
};

export const getAllUserTools = async (userId: string) => {
  // With the new RLS, we can just fetch all tools. 
  // RLS will automatically filter to only those the user is allowed to see.
  const { data: tools, error: toolError } = await supabase
    .from('tools')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (toolError) throw toolError;

  return tools as Tool[];
};

export const getToolsByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('tools')
    .select('*, profiles(full_name, email)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Tool[];
};

export const getToolDetails = async (id: string) => {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Tool;
};

export const updateTool = async (
  id: string,
  updates: Partial<Omit<Tool, 'id' | 'created_at' | 'owner_id'>>
) => {
  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTool = async (id: string) => {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const uploadToolImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('tool-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('tool-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
