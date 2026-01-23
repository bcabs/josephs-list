import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  updated_at: string;
}

export const getProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (id: string, updates: Partial<Profile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};
