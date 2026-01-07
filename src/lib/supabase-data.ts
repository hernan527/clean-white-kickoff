import { supabase } from "@/integrations/supabase/client";

// Use the project's configured backend client (Lovable Cloud)
export const supabaseData = supabase;

// Types based on expected schema
export interface Empresa {
  id: string;
  nombre: string;
  slogans?: string[]; // La columna de la base de datos como array de strings
  imagenes?: {
    logo?: string;
  } | { logo?: string }[];
}

export interface Clinica {
  id: string;
  nombre: string;
  nombre_abreviado?: string; // <--- AGREGÁ ESTA LÍNEA
  ubicaciones?: {
    REGIONS?: string[];
    region?: string;
    direccion?: string;
    barrio?:string;
  };
}

export interface Atributo {
  id: string;
  nombre: string;
  valor: string;
  categoria?: string;
  icono?: string;
}

export interface PlanClinica {
  id: string;
  plan_id: string;
  clinica_id: string;
  clinicas?: Clinica;
}

export interface PlanAtributo {
  id: string;
  plan_id: string;
  atributo_id: string;
  valor?: string;
  atributos?: Atributo;
}

export interface Plan {
  id: string;
  nombre?: string;
  nombre_plan?: string;
  name?: string;
  titulo?: string;
  title?: string;
  precio?: number;
  price?: number;
  descripcion?: string;
  description?: string;
  empresa_id?: string;
  empresas?: Empresa;
  plan_clinica?: PlanClinica[];
  plan_atributo?: PlanAtributo[];
  plan_clinicas?: PlanClinica[];
  plan_atributos?: PlanAtributo[];
}

// Helper to get plan display name
export function getPlanName(plan: Plan): string {
  return plan.nombre_plan || plan.nombre || plan.name || plan.titulo || plan.title || 'Plan sin nombre';
}

// Helper to get plan description
export function getPlanDescription(plan: Plan): string | undefined {
  return plan.descripcion || plan.description;
}

// Helper to get plan price
export function getPlanPrice(plan: Plan): number | undefined {
  return plan.precio || plan.price;
}

export function getCompanyLogo(empresa?: Empresa): string | null {
  if (!empresa?.imagenes) return null;

  // Si 'imagenes' es directamente el objeto { logo: "..." }
  const path = empresa.imagenes[0]?.logo;

  if (!path) return null;

  // Si la ruta ya empieza con /assets, la devolvemos tal cual
  return path; 
}

// Helper to get clinic region
export function getClinicRegion(clinic?: Clinica): string | null {
  if (!clinic?.ubicaciones) return null;
  return clinic.ubicaciones.region || clinic.ubicaciones.REGIONS?.[0] || null;
}

// NUEVO: Helper para obtener el Barrio/Localidad
export function getClinicBarrio(clinic?: Clinica): string | null {
  if (!clinic?.ubicaciones) return null;
  // Priorizamos localidad o barrio si existen en el JSON de ubicaciones
  return clinic.ubicaciones.barrio || clinic.ubicaciones.direccion || null;
}