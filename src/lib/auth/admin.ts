import type { SupabaseClient, User } from '@supabase/supabase-js';

type RoleProfile = { role?: string | null };

export function hasAdminMetadata(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

export async function isAdminUser(
  supabase: SupabaseClient,
  user: User | null | undefined
): Promise<boolean> {
  if (!user) return false;
  if (hasAdminMetadata(user)) return true;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<RoleProfile>();

  if (error) {
    console.error('Admin role lookup failed:', error);
    return false;
  }

  return data?.role === 'admin';
}
