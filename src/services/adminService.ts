import { supabase } from '../utils/supabaseClient';

export interface AdminRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin' || data?.role === 'editor';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getCurrentUserRole(): Promise<AdminRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

async function requireAdminCaller(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return checkIsAdmin(user.id);
}

export async function addAdminRole(userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<boolean> {
  try {
    const isCallerAdmin = await requireAdminCaller();
    if (!isCallerAdmin) {
      console.error('Unauthorized: caller is not an admin');
      return false;
    }

    const { error } = await supabase
      .from('admin_roles')
      .insert({
        user_id: userId,
        role,
        permissions: {}
      });

    if (error) {
      console.error('Error adding admin role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding admin role:', error);
    return false;
  }
}

export async function removeAdminRole(userId: string): Promise<boolean> {
  try {
    const isCallerAdmin = await requireAdminCaller();
    if (!isCallerAdmin) {
      console.error('Unauthorized: caller is not an admin');
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === userId) {
      console.error('Cannot remove own admin role');
      return false;
    }

    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing admin role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
}

export async function getAllAdminUsers(): Promise<AdminRole[]> {
  try {
    const isCallerAdmin = await requireAdminCaller();
    if (!isCallerAdmin) return [];

    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}
