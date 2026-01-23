import { supabase } from '@/lib/supabase';

export interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  owner_id: string;
  group_id: string;
  created_at: string;
}

export const createTool = async (
  tool: Omit<Tool, 'id' | 'created_at' | 'owner_id'>,
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
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllUserTools = async (userId: string) => {
  // complex query to get tools from all groups the user is in
  // For MVP: We fetch all tools where group_id matches groups the user is in.
  // This might be better done with a Postgres function or view for performance later.
  
  // First get user's groups
  const { data: groups, error: groupError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (groupError) throw groupError;

  const groupIds = groups.map(g => g.group_id);

  if (groupIds.length === 0) return [];

  const { data: tools, error: toolError } = await supabase
    .from('tools')
    .select('*')
    .in('group_id', groupIds)
    .order('created_at', { ascending: false });

  if (toolError) throw toolError;

  return tools;
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
