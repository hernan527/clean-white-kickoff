/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, AdminUser } from '../types';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200'; // CORRECTO

// --- Función base de peticiones (Usa FETCH) ---
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T | null> => {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // 1. Si la respuesta es 204 (No Content) o está vacía, no parsear JSON
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // 2. Intentar parsear solo si hay contenido
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    return null;
  }
};

// ============= Dashboard & Users (Supabase Directo) =============
export const getDashboardStats = async () => {
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
  return error ? null : (data as any);
};

export const getAdminUsersList = async () => {
  const { data, error } = await supabase.rpc('get_admin_users_list');
  return error ? [] : (data as any[]);
};

// ============= API EXTERNA (Planes, Clínicas, Atributos) =============


// --- JERARQUÍA Y MAESTROS ---
export const getJerarquiaPlanes = () => apiRequest<any[]>('/plans/jerarquia-planes');

// En lugar de llamar a la API, devolvemos un array vacío para que no explote
export const getAtributosMaestros = async () => {
  console.warn("⚠️ Ruta /clinic/atributos pendiente en backend. Devolviendo lista vacía.");
  return []; 
};

// Esta es la que te falta declarar para que no tire ReferenceError
// --- PRESTACIONES ---
export const getPrestacionesMaestras = () => apiRequest<any[]>('/plans/prestaciones-maestras');

// CORREGIDO: quitamos los ":" y usamos "="
export const createPrestacionMaestra = async (payload: { nombre: string, emoji: string }) => {
  return apiRequest('/plans/prestaciones-maestras', 'POST', {
      nombre: payload.nombre,
      icono_emoji: payload.emoji,
      categoria: 'Beneficios',
      icono: "Activity"
  });
};

export const getPlanes = () => apiRequest<any[]>('/plans');

// Estas son las funciones que te faltaban:
export const createPlan = (data: any) => apiRequest('/plans', 'POST', data);
export const updatePlan = (id: string, data: any) => apiRequest(`/plans/${id}`, 'PUT', data);
// Actualización de beneficios del folleto (listar, valor, etc)
export const updatePrestacionesPlan = (planId: string, prestaciones: any[]) => 
  apiRequest(`/plans/${planId}/prestaciones`, 'PUT', { prestaciones });

// --- EMPRESAS ---
export const getEmpresas = () => apiRequest<any[]>('/company');

export const updateEmpresa = (id: string, data: any) => apiRequest(`/company/${id}`, 'PUT', data);

// --- CLÍNICAS (OPERACIONES FULL) ---
export const getClinicas = () => apiRequest<any[]>('/clinic');
export const getClinicaById = (id: string) => apiRequest<any>(`/clinic/${id}`);

// EL CLÍMAX: Sincroniza Datos, Planes y Atributos (La colita)
// admin.service.ts
export const updateClinicaFull = async (id: any, clinicaData: any, planIds: any[], atributoIds: any[]) => {
  // 1. Validar el ID
  if (!id || id === "NaN") {
    throw new Error("ID inválido detectado en el Service");
  }

  // 2. IMPORTANTE: Enviar los argumentos por separado a apiRequest
  // Según tu apiRequest(endpoint, method, body)
  // El 'body' debe contener la estructura que espera tu backend de Node/Supabase
  
  const payload = {
    clinicaData, // El objeto con nombre, descripcion, imagenes, etc.
    planIds,     // El array de IDs de planes
    atributoIds  // El array de IDs de atributos
  };

  console.log("🚀 Enviando actualización completa:", payload);

  // Enviamos al endpoint de tu backend que ejecuta la lógica de Supabase que pasaste
  return apiRequest(`/clinic/${id}`, 'PUT', payload);
};

// En admin.service.ts
export const createClinicaFull = (clinicaData: any, planIds: (string | number)[]) => 
  apiRequest('/clinic', 'POST', { clinicaData, planIds });

export const deleteClinicaFull = (id: string) => 
  apiRequest(`/clinic/${id}`, 'DELETE');

// --- EXPORTACIÓN UNIFICADA ---
const AdminService = {
  getDashboardStats,
  getAdminUsersList,
  getJerarquiaPlanes,
  getAtributosMaestros, // <--- Agregado
  getPrestacionesMaestras, // <--- Agregado
  getPlanes,            // <--- Agregado (Esto soluciona tu TypeError)
  updatePrestacionesPlan, // <--- Agregado para el editor de folletos
  getEmpresas, 
  getClinicas,
  getClinicaById,
  updateClinicaFull,    // Versión unificada con FETCH
  createClinicaFull,
  deleteClinicaFull,
  createPlan,
  updatePlan,
  createPrestacionMaestra
};

export default AdminService;