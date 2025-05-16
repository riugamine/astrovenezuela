'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserData, User } from './types';

export async function getUsers(): Promise<User[]> {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  const { data: authUsers, error: authError } = await supabaseAdmin
    .auth.admin.listUsers();

  if (authError) throw authError;

  return profiles.map(profile => {
    const authUser = authUsers.users.find(u => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || '',
      last_sign_in_at: authUser?.last_sign_in_at || null,
    };
  }) as User[];
}

export async function createUser(userData: UserData): Promise<User> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      full_name: userData.full_name,
      role: userData.role || 'admin',
    },
  });

  if (error) throw error;
  return data.user as unknown as User;
}

export async function toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: !isActive })
    .eq('id', userId);

  if (error) throw error;
}