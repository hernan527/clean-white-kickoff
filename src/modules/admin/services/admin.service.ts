import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, AdminUser, UserActivity } from '../types';

const API_BASE = 'https://servidorplus.saludok.com.ar';

// ============= Dashboard Stats =============
export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  try {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) throw error;
    return data as unknown as DashboardStats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

// ============= Users Management =============
export const getAdminUsersList = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase.rpc('get_admin_users_list');
    if (error) throw error;
    return (data || []) as AdminUser[];
  } catch (error) {
    console.error('Error fetching users list:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'vendor' | 'admin'): Promise<boolean> => {
  try {
    // First check if user has a role entry
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// ============= Activity Tracking =============
export const getUserActivity = async (
  limit = 100,
  offset = 0,
  userId?: string
): Promise<UserActivity[]> => {
  try {
    const { data, error } = await supabase.rpc('get_admin_user_activity', {
      p_limit: limit,
      p_offset: offset,
      p_user_id: userId || null
    });
    if (error) throw error;
    return (data || []) as UserActivity[];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
};

// ============= External API CRUD =============

// Generic fetch helper
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T | null> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    return null;
  }
};

// Empresas CRUD
export const getEmpresas = () => apiRequest<unknown[]>('/empresas');
export const getEmpresaById = (id: string) => apiRequest<unknown>(`/empresas/${id}`);
export const createEmpresa = (data: unknown) => apiRequest<unknown>('/empresas', 'POST', data);
export const updateEmpresa = (id: string, data: unknown) => apiRequest<unknown>(`/empresas/${id}`, 'PUT', data);
export const deleteEmpresa = (id: string) => apiRequest<unknown>(`/empresas/${id}`, 'DELETE');

// Clinicas CRUD
export const getClinicas = () => apiRequest<unknown[]>('/clinicas');
export const getClinicaById = (id: string) => apiRequest<unknown>(`/clinicas/${id}`);
export const createClinica = (data: unknown) => apiRequest<unknown>('/clinicas', 'POST', data);
export const updateClinica = (id: string, data: unknown) => apiRequest<unknown>(`/clinicas/${id}`, 'PUT', data);
export const deleteClinica = (id: string) => apiRequest<unknown>(`/clinicas/${id}`, 'DELETE');

// Planes CRUD
export const getPlanes = () => apiRequest<unknown[]>('/planes');
export const getPlanById = (id: string) => apiRequest<unknown>(`/planes/${id}`);
export const createPlan = (data: unknown) => apiRequest<unknown>('/planes', 'POST', data);
export const updatePlan = (id: string, data: unknown) => apiRequest<unknown>(`/planes/${id}`, 'PUT', data);
export const deletePlan = (id: string) => apiRequest<unknown>(`/planes/${id}`, 'DELETE');

// Quotes from Supabase
export const getSavedQuotes = async () => {
  try {
    const { data, error } = await supabase
      .from('saved_quotes')
      .select('*, profiles:user_id(first_name, last_name, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
};

const AdminService = {
  getDashboardStats,
  getAdminUsersList,
  updateUserRole,
  getUserActivity,
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getClinicas,
  getClinicaById,
  createClinica,
  updateClinica,
  deleteClinica,
  getPlanes,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getSavedQuotes,
};

export default AdminService;
